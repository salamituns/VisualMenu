"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, Save } from 'lucide-react'

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

export default function MenuManagementPage() {
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

  const supabase = createClient()

  useEffect(() => {
    loadMenuItems()
  }, [])

  useEffect(() => {
    // Extract unique categories when menu items change
    const uniqueCategories = Array.from(new Set(menuItems.map(item => item.category)))
    setCategories(uniqueCategories)
  }, [menuItems])

  const loadMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading menu items:', error);
        throw error;
      }

      // First cast to unknown, then to DatabaseMenuItem[]
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
        special_offer: item.special_offer
      }));
      setMenuItems(validatedData);
    } catch (err) {
      console.error('Error loading menu items:', err);
      setError('Failed to load menu items');
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

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <Button onClick={() => {
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
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
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
                    setNewItem(false)
                    setEditingId(null)
                    setSelectedImage(null)
                    setImagePreview('')
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
              </form>
            </CardContent>
          </Card>
      )}

      <div className="grid gap-6">
        {categories.map((category) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {menuItems
                  .filter(item => item.category === category)
                  .map((item) => (
                    <Card key={item.id} className="mb-4">
                      <CardContent className="flex items-start space-x-4 p-4">
                        {item.image_url && (
                          <div className="flex-shrink-0">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-24 h-24 object-cover rounded-md"
                              onError={(e) => {
                                console.error('Image load error:', e);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold">{item.name}</h3>
                              <p className="text-sm text-gray-500">{item.description}</p>
                              <p className="mt-1">${parseFloat(item.price).toFixed(2)}</p>
                              
                              {item.special_offer?.discount_price && (
                                <p className="text-sm text-green-600">
                                  Special: ${parseFloat(item.special_offer.discount_price).toFixed(2)}
                                </p>
                              )}
                              
                              {item.dietary_info && item.dietary_info.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm text-gray-600">
                                    Dietary: {item.dietary_info.join(', ')}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(item)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

