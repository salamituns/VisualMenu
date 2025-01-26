"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Pencil, Trash2, Save, Search, Filter, SlidersHorizontal, Loader2, Check, X, LayoutGrid, List } from 'lucide-react'
import { usePermissions } from '@/lib/context/permission-context'
import { PERMISSIONS } from '@/lib/types/auth'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableMenuItem } from '@/components/menu/sortable-menu-item'

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image_url: string | null;
  dietary_info: string[];
  is_available: boolean;
  special_offer: Record<string, any> | null;
  order: number;
}

interface DatabaseMenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  dietary_info: string[] | null;
  is_available: boolean;
  special_offer: Record<string, any> | null;
  order: number;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  image_url: string | null;
  dietary_info: string[];
  is_available: boolean;
  special_offer: Record<string, any> | null;
}

interface ImageLoadingState {
  [key: string]: boolean;
}

interface Filters {
  categories: string[];
  dietary: string[];
  availability: 'all' | 'available' | 'unavailable';
  priceRange: {
    min: number | null;
    max: number | null;
  };
}

interface BatchUpdateData extends Record<string, unknown> {
  is_available?: boolean;
  category?: string;
  dietary_info?: string[];
}

export default function MenuManagementPage() {
  const { hasPermission, loading: permissionLoading } = usePermissions()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newItem, setNewItem] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: null,
    dietary_info: [],
    is_available: true,
    special_offer: null
  })
  const [imageLoading, setImageLoading] = useState<ImageLoadingState>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    dietary: [],
    availability: 'all',
    priceRange: {
      min: null,
      max: null
    }
  })
  const [filtersLoading, setFiltersLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [batchUpdating, setBatchUpdating] = useState(false)
  const [batchDeleting, setBatchDeleting] = useState(false)
  const [showBatchUpdateForm, setShowBatchUpdateForm] = useState(false)
  const [batchUpdateData, setBatchUpdateData] = useState<BatchUpdateData>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const supabase = createClient()

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  )

  useEffect(() => {
    loadMenuItems()
  }, [])

  useEffect(() => {
    // Extract unique categories when menu items change
    const uniqueCategories = Array.from(new Set(menuItems.map(item => item.category)))
    setCategories(uniqueCategories)
  }, [menuItems])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.getElementById('menu-search')
        if (searchInput) searchInput.focus()
      }
      // Ctrl/Cmd + N to add new item
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        setNewItem(true)
        setEditingId(null)
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          image_url: null,
          dietary_info: [],
          is_available: true,
          special_offer: null
        })
        setSelectedImage(null)
        setImagePreview('')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  useEffect(() => {
    return () => {
      setSelectedItems(new Set())
      setBatchUpdateData({})
    }
  }, [])

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading menu items...');

      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading menu items:', error);
        throw error;
      }

      if (!data) {
        console.log('No menu items found');
        setMenuItems([]);
        return;
      }

      console.log('Menu items loaded:', data);

      const dbItems = data as unknown as DatabaseMenuItem[];
      const validatedData: MenuItem[] = dbItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        category: item.category,
        image_url: item.image_url,
        dietary_info: item.dietary_info || [],
        is_available: item.is_available,
        special_offer: item.special_offer,
        order: item.order || 0
      }));

      console.log('Validated menu items:', validatedData);
      setMenuItems(validatedData);
    } catch (err: any) {
      console.error('Error loading menu items:', err);
      setError(err.message || 'Failed to load menu items');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const BUCKET_NAME = 'menu-uploads';

  const handleImageUpload = async (file: File) => {
    try {
      console.log('Starting image upload process...');
      const uniqueId = Math.random().toString(36).substring(2);
      const timestamp = Date.now();
      const fileName = `${uniqueId}-${timestamp}-${file.name}`;
      const filePath = `menu-items/${fileName}`;
      
      console.log(`Uploading file to ${BUCKET_NAME}/${filePath}`);
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);
      const { data: urlData } = await supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      console.log('Generated public URL:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (err: any) {
      console.error('Image upload failed:', err.message);
      throw new Error(`Failed to upload image: ${err.message}`);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setFormData(prev => ({ ...prev, image_url: null })); // Clear the previous image URL
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let imageUrl = formData.image_url;
      if (selectedImage) {
        imageUrl = await handleImageUpload(selectedImage);
        console.log('New image URL after upload:', imageUrl);
      }

      const validatedData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: imageUrl,
        dietary_info: formData.dietary_info || [],
        is_available: formData.is_available ?? true,
        special_offer: formData.special_offer || null
      };

      console.log('Saving menu item with data:', validatedData);
      const { data: savedData, error } = editingId
        ? await supabase
            .from('menu_items')
            .update(validatedData)
            .eq('id', editingId)
            .select()
        : await supabase
            .from('menu_items')
            .insert([validatedData])
            .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Menu item saved successfully. Response data:', savedData);
      
      // Refresh the menu items list to get the latest data
      await loadMenuItems();
      
      handleClose();
    } catch (err: any) {
      console.error('Save failed:', err);
      setError(`Failed to save menu item: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      loadMenuItems()
    } catch (err) {
      console.error('Error deleting menu item:', err)
      setError('Failed to delete menu item')
    }
  }

  function handleEdit(item: MenuItem) {
    setEditingId(item.id);
    setNewItem(false);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image_url: item.image_url,
      dietary_info: [...item.dietary_info],
      is_available: item.is_available,
      special_offer: item.special_offer
    });
    setImagePreview('');
  }

  const handleClose = () => {
    setSelectedImage(null);
    setImagePreview('');
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image_url: null,
      dietary_info: [],
      is_available: true,
      special_offer: null
    });
    setEditingId(null);
  };

  const filteredMenuItems = menuItems.filter(item => {
    // Search query filter
    const matchesSearch = 
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())

    // Category filter
    const matchesCategory = 
      filters.categories.length === 0 ||
      filters.categories.includes(item.category)

    // Dietary filter
    const matchesDietary = 
      filters.dietary.length === 0 ||
      filters.dietary.some(diet => item.dietary_info.includes(diet))

    // Availability filter
    const matchesAvailability = 
      filters.availability === 'all' ||
      (filters.availability === 'available' && item.is_available) ||
      (filters.availability === 'unavailable' && !item.is_available)

    // Price range filter
    const price = parseFloat(item.price)
    const matchesPriceRange = 
      (filters.priceRange.min === null || price >= filters.priceRange.min) &&
      (filters.priceRange.max === null || price <= filters.priceRange.max)

    return matchesSearch && matchesCategory && matchesDietary && matchesAvailability && matchesPriceRange
  })

  // Get all unique dietary options from menu items
  const allDietaryOptions = Array.from(
    new Set(menuItems.flatMap(item => item.dietary_info))
  ).sort()

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredMenuItems.map(item => item.id)
      setSelectedItems(new Set(allIds))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedItems(newSelected)
  }

  const handleBatchDelete = async () => {
    if (!selectedItems.size) return
    
    try {
      setBatchDeleting(true)
      console.log('Deleting items:', Array.from(selectedItems))
      
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .in('id', Array.from(selectedItems))

      if (error) throw error

      // Refresh the menu items
      await loadMenuItems()
      setSelectedItems(new Set())
      
    } catch (err: any) {
      console.error('Failed to delete items:', err)
      setError(`Failed to delete items: ${err.message}`)
    } finally {
      setBatchDeleting(false)
    }
  }

  const handleBatchUpdate = async () => {
    if (!selectedItems.size || !Object.keys(batchUpdateData).length) return
    
    try {
      setBatchUpdating(true)
      console.log('Updating items:', Array.from(selectedItems), 'with data:', batchUpdateData)
      
      const { error } = await supabase
        .from('menu_items')
        .update(batchUpdateData)
        .in('id', Array.from(selectedItems))

      if (error) throw error

      // Refresh the menu items
      await loadMenuItems()
      setSelectedItems(new Set())
      setShowBatchUpdateForm(false)
      setBatchUpdateData({})
      
    } catch (err: any) {
      console.error('Failed to update items:', err)
      setError(`Failed to update items: ${err.message}`)
    } finally {
      setBatchUpdating(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = filteredMenuItems.findIndex(item => item.id === active.id);
    const newIndex = filteredMenuItems.findIndex(item => item.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(filteredMenuItems, oldIndex, newIndex);
    
    // Update the order in the database
    try {
      console.log('Updating item order...');
      
      // Create updates with required fields
      const updates = newItems.map((item, index) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: parseFloat(item.price),
        category: item.category,
        order: index + 1 // Start from 1 to avoid 0
      }));

      console.log('Updates to be applied:', updates);

      const { data, error } = await supabase
        .from('menu_items')
        .upsert(
          updates,
          {
            onConflict: 'id',
            ignoreDuplicates: false
          }
        );

      if (error) {
        console.error('Error updating item order:', error);
        throw error;
      }

      console.log('Order update successful:', data);

      // Update the local state with the new order
      setMenuItems(prevItems => {
        const updatedItems = [...prevItems];
        newItems.forEach((item, index) => {
          const itemIndex = updatedItems.findIndex(i => i.id === item.id);
          if (itemIndex !== -1) {
            updatedItems[itemIndex] = { ...updatedItems[itemIndex], order: index + 1 };
          }
        });
        return updatedItems.sort((a, b) => (a.order || 0) - (b.order || 0));
      });
    } catch (err) {
      console.error('Failed to update item order:', err);
      setError('Failed to update item order');
      // Revert the local state to match the server
      loadMenuItems();
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setError('');
                loadMenuItems();
              }}
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading menu items...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <div className="flex items-center gap-2">
          <div className="border rounded-md p-1 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "px-2 py-1",
                viewMode === 'grid' && "bg-muted"
              )}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "px-2 py-1",
                viewMode === 'list' && "bg-muted"
              )}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => {
            setNewItem(true);
            setEditingId(null);
            setFormData({
              name: '',
              description: '',
              price: '',
              category: '',
              image_url: null,
              dietary_info: [],
              is_available: true,
              special_offer: null
            });
            setSelectedImage(null);
            setImagePreview('');
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="menu-search"
              placeholder="Search menu items... (Ctrl + K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6"
                onClick={() => setSearchQuery('')}
              >
                Clear
              </Button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {(filters.categories.length > 0 || filters.dietary.length > 0 || filters.availability !== 'all' || filters.priceRange.min !== null || filters.priceRange.max !== null) && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                    {filters.categories.length + filters.dietary.length + (filters.availability !== 'all' ? 1 : 0) + ((filters.priceRange.min !== null || filters.priceRange.max !== null) ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72">
              <DropdownMenuLabel className="flex items-center justify-between">
                Categories
                {filtersLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </DropdownMenuLabel>
              <div className="max-h-48 overflow-y-auto">
                {categories.map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={(checked: boolean) => {
                      setFilters(prev => ({
                        ...prev,
                        categories: checked
                          ? [...prev.categories, category]
                          : prev.categories.filter(c => c !== category)
                      }))
                    }}
                  >
                    <span className="flex items-center justify-between w-full">
                      {category}
                      <Badge variant="secondary" className="ml-2">
                        {menuItems.filter(item => item.category === category).length}
                      </Badge>
                    </span>
                  </DropdownMenuCheckboxItem>
                ))}
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Dietary Options</DropdownMenuLabel>
              <div className="max-h-48 overflow-y-auto">
                {allDietaryOptions.map((diet) => (
                  <DropdownMenuCheckboxItem
                    key={diet}
                    checked={filters.dietary.includes(diet)}
                    onCheckedChange={(checked: boolean) => {
                      setFilters(prev => ({
                        ...prev,
                        dietary: checked
                          ? [...prev.dietary, diet]
                          : prev.dietary.filter(d => d !== diet)
                      }))
                    }}
                  >
                    {diet}
                  </DropdownMenuCheckboxItem>
                ))}
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Availability</DropdownMenuLabel>
              <div className="p-2">
                <select
                  value={filters.availability}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    availability: e.target.value as 'all' | 'available' | 'unavailable'
                  }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="all">All Items</option>
                  <option value="available">Available Only</option>
                  <option value="unavailable">Unavailable Only</option>
                </select>
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Price Range</DropdownMenuLabel>
              <div className="p-2 space-y-2">
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min ?? ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: {
                        ...prev.priceRange,
                        min: e.target.value ? parseFloat(e.target.value) : null
                      }
                    }))}
                    className="w-24"
                  />
                  <span>to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max ?? ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: {
                        ...prev.priceRange,
                        max: e.target.value ? parseFloat(e.target.value) : null
                      }
                    }))}
                    className="w-24"
                  />
                </div>
              </div>

              <DropdownMenuSeparator />
              <div className="p-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setFilters({
                    categories: [],
                    dietary: [],
                    availability: 'all',
                    priceRange: { min: null, max: null }
                  })}
                >
                  Reset All Filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Active Filters Display */}
        {(filters.categories.length > 0 || filters.dietary.length > 0 || filters.availability !== 'all' || filters.priceRange.min !== null || filters.priceRange.max !== null) && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.categories.map(category => (
              <Badge
                key={category}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => setFilters(prev => ({
                  ...prev,
                  categories: prev.categories.filter(c => c !== category)
                }))}
              >
                {category} ×
              </Badge>
            ))}
            {filters.dietary.map(diet => (
              <Badge
                key={diet}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => setFilters(prev => ({
                  ...prev,
                  dietary: prev.dietary.filter(d => d !== diet)
                }))}
              >
                {diet} ×
              </Badge>
            ))}
            {filters.availability !== 'all' && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => setFilters(prev => ({ ...prev, availability: 'all' }))}
              >
                {filters.availability === 'available' ? 'Available' : 'Unavailable'} ×
              </Badge>
            )}
            {(filters.priceRange.min !== null || filters.priceRange.max !== null) && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => setFilters(prev => ({
                  ...prev,
                  priceRange: { min: null, max: null }
                }))}
              >
                ${filters.priceRange.min ?? '0'} - ${filters.priceRange.max ?? '∞'} ×
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setFilters({
                categories: [],
                dietary: [],
                availability: 'all',
                priceRange: { min: null, max: null }
              })}
            >
              Clear all
            </Button>
          </div>
        )}

        {/* No Results Message */}
        {filteredMenuItems.length === 0 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No menu items found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setFilters({
                  categories: [],
                  dietary: [],
                  availability: 'all',
                  priceRange: { min: null, max: null }
                })
              }}
            >
              Reset all filters
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {(newItem || editingId) && (
        <Card className="mb-6">
            <CardHeader>
            <CardTitle>{editingId ? 'Edit Item' : 'New Item'}</CardTitle>
            </CardHeader>
            <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="new">+ Add new category</option>
                  </select>
                </div>

                {formData.category === 'new' && (
                  <div>
                    <Label htmlFor="newCategory">New Category Name</Label>
                    <Input
                      id="newCategory"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Enter new category name"
                    />
                  </div>
                )}

                <div>
                    <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="available">Availability</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="available"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span>Item is available</span>
                  </div>
                </div>
              </div>

              <div>
                  <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="image">Image</Label>
                <div className="mt-1 flex items-center space-x-4">
                  {(imagePreview || formData.image_url) && (
                    <div className="relative w-24 h-24">
                      <img
                        src={imagePreview || (formData.image_url || '')}
                        alt="Preview"
                        className="rounded-md object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dietary">Dietary Information</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
                  {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Halal', 'Kosher', 'Nut-Free'].map((diet) => (
                    <label key={diet} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.dietary_info?.includes(diet)}
                        onChange={(e) => {
                          const newDietary = e.target.checked
                            ? [...(formData.dietary_info || []), diet]
                            : (formData.dietary_info || []).filter(d => d !== diet)
                          setFormData({ ...formData, dietary_info: newDietary })
                        }}
                        className="rounded border-gray-300"
                      />
                      <span>{diet}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Special Offer</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
                  <div>
                    <Label htmlFor="discountPrice">Discount Price</Label>
                    <Input
                      id="discountPrice"
                      type="number"
                      step="0.01"
                      value={formData.special_offer?.discount_price || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        special_offer: {
                          ...formData.special_offer,
                          discount_price: parseFloat(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.special_offer?.start_date || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        special_offer: {
                          ...formData.special_offer,
                          start_date: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.special_offer?.end_date || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        special_offer: {
                          ...formData.special_offer,
                          end_date: e.target.value
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewItem(false);
                    setEditingId(null);
                    setSelectedImage(null);
                    setImagePreview('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
              </form>
            </CardContent>
          </Card>
      )}

      {/* Batch Actions Toolbar */}
      {selectedItems.size > 0 && (
        <div className="sticky top-0 z-10 bg-background border-b mb-6 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedItems.size === filteredMenuItems.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">
              {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
            </span>
                        </div>
          <div className="flex items-center gap-2">
            {showBatchUpdateForm ? (
              <>
                <select
                  value={batchUpdateData.category || ''}
                  onChange={(e) => setBatchUpdateData(prev => ({
                    ...prev,
                    category: e.target.value || undefined
                  }))}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Update Category...</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={batchUpdateData.is_available === undefined ? '' : String(batchUpdateData.is_available)}
                  onChange={(e) => setBatchUpdateData(prev => ({
                    ...prev,
                    is_available: e.target.value === '' ? undefined : e.target.value === 'true'
                  }))}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Update Availability...</option>
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowBatchUpdateForm(false)
                    setBatchUpdateData({})
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleBatchUpdate}
                  disabled={!Object.keys(batchUpdateData).length || batchUpdating}
                >
                  {batchUpdating ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  Update {selectedItems.size} items
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBatchUpdateForm(true)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Batch Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBatchDelete}
                  disabled={batchDeleting}
                >
                  {batchDeleting ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  Delete {selectedItems.size} items
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Menu Items Section */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredMenuItems}
          strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
        >
          <div className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          )}>
            {loading ? (
              viewMode === 'grid' ? (
                Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="relative aspect-video">
                      <Skeleton className="absolute inset-0" />
                    </div>
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
                ))
              ) : (
                Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-1/4 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
              </div>
              </div>
            </CardContent>
          </Card>
                ))
              )
            ) : (
              filteredMenuItems.map((item) => (
                <SortableMenuItem
                  key={item.id}
                  item={item}
                  viewMode={viewMode}
                  isSelected={selectedItems.has(item.id)}
                  imageLoading={!!imageLoading[item.id]}
                  onSelect={(checked) => handleSelectItem(item.id, checked)}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDelete(item.id)}
                  onImageLoad={() => setImageLoading(prev => ({ ...prev, [item.id]: false }))}
                  onImageError={() => {
                    console.error('Image load error for item:', item.id);
                    setImageLoading(prev => ({ ...prev, [item.id]: false }));
                  }}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

