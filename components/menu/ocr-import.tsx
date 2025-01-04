'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from 'lucide-react';
import { extractMenuItems, validateExtraction, type MenuItemExtraction } from '@/lib/ocr';
import { createCategory, createMenuItem } from '@/lib/db';

interface OCRImportProps {
  menuId: string;
  onComplete: () => void;
}

export function OCRImport({ menuId, onComplete }: OCRImportProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedItems, setExtractedItems] = useState<MenuItemExtraction[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image size should be less than 10MB');
      }

      // Extract menu items using OCR
      const items = await extractMenuItems(file);
      
      // Validate the extracted items
      const validItems = await validateExtraction(items);

      if (validItems.length === 0) {
        throw new Error('No menu items could be extracted from the image. Please ensure the image contains clear text and prices.');
      }

      setExtractedItems(validItems);
      setShowPreview(true);

    } catch (err) {
      console.error('Error processing menu image:', err);
      if (err instanceof Error && err.message.includes('Resource not found')) {
        setError('This feature requires a paid Azure subscription. The OCR menu scanning feature is currently in development mode. Please check back later or contact support for more information.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to process menu image');
      }
      // Reset the file input
      const fileInput = document.getElementById('menu-image') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    try {
      setLoading(true);
      setError(null);

      // Group items by category
      const itemsByCategory = extractedItems.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      }, {} as Record<string, MenuItemExtraction[]>);

      // Create categories and items
      for (const [categoryName, items] of Object.entries(itemsByCategory)) {
        // Create category
        const category = await createCategory({
          name: categoryName,
          menu_id: menuId,
          description: '',
          display_order: 0
        });

        // Create items in this category
        await Promise.all(items.map(item => 
          createMenuItem({
            name: item.name,
            description: item.description || '',
            price: item.price,
            category_id: category.id,
            is_available: true,
            image_url: '',
            allergens: [],
            dietary_info: [],
            display_order: 0
          })
        ));
      }

      onComplete();
      setShowPreview(false);
      setExtractedItems([]);

    } catch (err) {
      console.error('Error importing menu items:', err);
      setError(err instanceof Error ? err.message : 'Failed to import menu items');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Menu from Image</CardTitle>
        <CardDescription>Upload a menu image to automatically extract items</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!showPreview ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => document.getElementById('menu-image')?.click()}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {loading ? 'Processing...' : 'Upload Menu Image'}
                </Button>
                <input
                  id="menu-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {error && (
                <div className="text-sm text-red-500">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium">Extracted Menu Items</h3>
              
              <div className="border rounded-lg divide-y">
                {extractedItems.map((item, index) => (
                  <div key={index} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-gray-500">{item.description}</div>
                      )}
                      {item.category && (
                        <div className="text-xs text-gray-400">Category: {item.category}</div>
                      )}
                    </div>
                    <div className="font-medium">${item.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleImport}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Import Items
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPreview(false);
                    setExtractedItems([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 