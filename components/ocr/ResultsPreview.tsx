'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Check, X } from 'lucide-react'

interface ParsedMenuItem {
  name: string;
  description?: string;
  price: number;
  category?: string;
}

interface ResultsPreviewProps {
  results: ParsedMenuItem[];
  onConfirm: (items: ParsedMenuItem[]) => void;
  onEdit: (index: number, item: ParsedMenuItem) => void;
  onCancel: () => void;
}

export function ResultsPreview({ results, onConfirm, onEdit, onCancel }: ResultsPreviewProps) {
  const [editedResults, setEditedResults] = useState<ParsedMenuItem[]>(results)

  const handleItemEdit = (index: number, field: keyof ParsedMenuItem, value: string) => {
    const newResults = [...editedResults]
    const item = { ...newResults[index] }

    if (field === 'price') {
      item.price = parseFloat(value) || 0
    } else {
      (item[field] as string) = value
    }

    newResults[index] = item
    setEditedResults(newResults)
    onEdit(index, item)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Review Scanned Items</CardTitle>
        <CardDescription>
          Review and edit the extracted menu items before adding them to your menu
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {editedResults.map((item, index) => (
          <Card key={index}>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${index}`}>Name</Label>
                  <Input
                    id={`name-${index}`}
                    value={item.name}
                    onChange={(e) => handleItemEdit(index, 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`price-${index}`}>Price</Label>
                  <Input
                    id={`price-${index}`}
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => handleItemEdit(index, 'price', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Textarea
                  id={`description-${index}`}
                  value={item.description || ''}
                  onChange={(e) => handleItemEdit(index, 'description', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`category-${index}`}>Category</Label>
                <Input
                  id={`category-${index}`}
                  value={item.category || ''}
                  onChange={(e) => handleItemEdit(index, 'category', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button onClick={() => onConfirm(editedResults)}>
          <Check className="mr-2 h-4 w-4" />
          Add {editedResults.length} Items
        </Button>
      </CardFooter>
    </Card>
  )
} 