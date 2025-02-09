'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OCRService } from '@/lib/services/ocr'
import { Upload, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

interface MenuScannerProps {
  onScanComplete: (items: Array<{
    name: string;
    description?: string;
    price: number;
    category?: string;
  }>) => void;
  onError: (error: Error) => void;
}

export function MenuScanner({ onScanComplete, onError }: MenuScannerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const { toast } = useToast()
  const supabase = createClient()
  const ocrService = new OCRService()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      })
      return
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 5MB',
        variant: 'destructive',
      })
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleScan = async () => {
    if (!selectedFile) return

    try {
      setIsLoading(true)

      // Upload image to Supabase Storage
      const fileName = `menu-scans/${Date.now()}-${selectedFile.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(fileName)

      // Extract text using OCR
      const results = await ocrService.extractText(publicUrl)
      
      // Parse menu items from OCR results
      const menuItems = await ocrService.parseMenuItems(results)
      
      // Validate results
      const validation = await ocrService.validateResults(menuItems)
      
      if (validation.warnings.length > 0) {
        toast({
          title: 'Scan completed with warnings',
          description: validation.warnings.join('\n'),
          variant: 'warning',
        })
      }

      if (!validation.isValid) {
        throw new Error(validation.errors.join('\n'))
      }

      onScanComplete(menuItems)
      
      toast({
        title: 'Menu scan completed',
        description: `Successfully extracted ${menuItems.length} menu items`,
      })

    } catch (error) {
      console.error('Menu scan error:', error)
      onError(error as Error)
      toast({
        title: 'Scan failed',
        description: error instanceof Error ? error.message : 'Failed to scan menu',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan Menu</CardTitle>
        <CardDescription>
          Upload a clear image of your menu to automatically extract items
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="menu-image">Menu Image</Label>
          <Input
            id="menu-image"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isLoading}
          />
        </div>

        {previewUrl && (
          <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border">
            <img
              src={previewUrl}
              alt="Menu preview"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <Button
          onClick={handleScan}
          disabled={!selectedFile || isLoading}
          className="w-full max-w-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Scan Menu
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
} 