import { createClient } from '@/lib/supabase/client'

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface OCRResult {
  text: string;
  boundingBox: BoundingBox;
  confidence: number;
}

interface ParsedMenuItem {
  name: string;
  description?: string;
  price: number;
  category?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class OCRService {
  private apiKey: string;
  private endpoint: string;
  private supabase = createClient();

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_AZURE_CV_KEY || '';
    this.endpoint = process.env.NEXT_PUBLIC_AZURE_CV_ENDPOINT || '';

    if (!this.apiKey || !this.endpoint) {
      throw new Error('Azure Computer Vision credentials not configured');
    }
  }

  async extractText(imageUrl: string): Promise<OCRResult[]> {
    try {
      const response = await fetch(
        `${this.endpoint}/vision/v3.2/ocr?language=en&detectOrientation=true`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': this.apiKey,
          },
          body: JSON.stringify({
            url: imageUrl,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to extract text from image');
      }

      const data = await response.json();
      return this.processOCRResponse(data);
    } catch (error) {
      console.error('OCR extraction error:', error);
      throw error;
    }
  }

  private processOCRResponse(data: any): OCRResult[] {
    const results: OCRResult[] = [];
    
    if (data.regions) {
      for (const region of data.regions) {
        for (const line of region.lines) {
          for (const word of line.words) {
            results.push({
              text: word.text,
              boundingBox: this.parseBoundingBox(word.boundingBox),
              confidence: word.confidence || 0.0,
            });
          }
        }
      }
    }

    return results;
  }

  private parseBoundingBox(boundingBox: string): BoundingBox {
    const [x, y, width, height] = boundingBox.split(',').map(Number);
    return { x, y, width, height };
  }

  async parseMenuItems(results: OCRResult[]): Promise<ParsedMenuItem[]> {
    const items: ParsedMenuItem[] = [];
    let currentItem: Partial<ParsedMenuItem> = {};
    
    // Group words by lines using y-coordinates
    const lines = this.groupIntoLines(results);
    
    for (const line of lines) {
      const text = line.map(r => r.text).join(' ');
      
      // Try to identify price
      const priceMatch = text.match(/\$?\d+\.?\d*/);
      if (priceMatch) {
        if (currentItem.name) {
          currentItem.price = parseFloat(priceMatch[0].replace('$', ''));
          items.push(currentItem as ParsedMenuItem);
          currentItem = {};
        }
        continue;
      }
      
      // If we have a price but no description, the previous line was probably a description
      if (!currentItem.description && currentItem.name && !currentItem.price) {
        currentItem.description = text;
        continue;
      }
      
      // If we don't have a name yet, this line is probably a name
      if (!currentItem.name) {
        currentItem.name = text;
      }
    }
    
    // Add the last item if it exists
    if (currentItem.name && currentItem.price) {
      items.push(currentItem as ParsedMenuItem);
    }
    
    return items;
  }

  private groupIntoLines(results: OCRResult[]): OCRResult[][] {
    const lineThreshold = 10; // pixels
    const sortedResults = [...results].sort((a, b) => a.boundingBox.y - b.boundingBox.y);
    
    const lines: OCRResult[][] = [];
    let currentLine: OCRResult[] = [];
    let lastY = sortedResults[0]?.boundingBox.y;
    
    for (const result of sortedResults) {
      if (Math.abs(result.boundingBox.y - lastY) > lineThreshold) {
        if (currentLine.length > 0) {
          lines.push(currentLine.sort((a, b) => a.boundingBox.x - b.boundingBox.x));
          currentLine = [];
        }
        lastY = result.boundingBox.y;
      }
      currentLine.push(result);
    }
    
    if (currentLine.length > 0) {
      lines.push(currentLine.sort((a, b) => a.boundingBox.x - b.boundingBox.x));
    }
    
    return lines;
  }

  async validateResults(items: ParsedMenuItem[]): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    for (const [index, item] of items.entries()) {
      // Validate name
      if (!item.name || item.name.length < 2) {
        errors.push(`Item ${index + 1}: Invalid or missing name`);
      }
      
      // Validate price
      if (!item.price || item.price <= 0) {
        errors.push(`Item ${index + 1}: Invalid or missing price`);
      }
      
      // Add warnings for potentially problematic items
      if (item.price > 1000) {
        warnings.push(`Item ${index + 1}: Unusually high price - please verify`);
      }
      
      if (item.name.length > 100) {
        warnings.push(`Item ${index + 1}: Unusually long name - please verify`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
} 