import { AzureKeyCredential, DocumentAnalysisClient } from '@azure/ai-form-recognizer';

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBox: number[];
  category?: string;
  price?: number;
  description?: string;
}

export interface MenuItemExtraction {
  name: string;
  description?: string;
  price: number;
  category?: string;
  confidence: number;
}

export async function extractMenuItems(file: File): Promise<MenuItemExtraction[]> {
  try {
    const endpoint = process.env.NEXT_PUBLIC_AZURE_FORM_ENDPOINT;
    const apiKey = process.env.NEXT_PUBLIC_AZURE_FORM_KEY;

    if (!endpoint || !apiKey) {
      throw new Error('Azure Form Recognizer credentials not configured. Please check your environment variables.');
    }

    console.log('Azure Form Recognizer Endpoint:', endpoint); // For debugging
    
    const client = new DocumentAnalysisClient(
      endpoint,
      new AzureKeyCredential(apiKey)
    );

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Start the analysis
    const poller = await client.beginAnalyzeDocument('prebuilt-menu', buffer);
    const result = await poller.pollUntilDone();

    if (!result.pages || result.pages.length === 0) {
      throw new Error('No text found in image');
    }

    // Process and structure the results
    const menuItems: MenuItemExtraction[] = [];
    let currentCategory = '';

    // Process key-value pairs for menu items
    for (const kvp of result.keyValuePairs || []) {
      const key = kvp.key?.content?.trim();
      const value = kvp.value?.content?.trim();
      
      if (key && value) {
        // Check if the value looks like a price
        const priceMatch = value.match(/\$?(\d+(\.\d{2})?)/);
        if (priceMatch) {
          menuItems.push({
            name: key,
            price: parseFloat(priceMatch[1]),
            category: currentCategory,
            confidence: kvp.confidence || 0.8,
            description: ''
          });
        }
      }
    }

    // If no key-value pairs found, try processing as a table
    if (menuItems.length === 0) {
      for (const table of result.tables || []) {
        for (const cell of table.cells) {
          const content = cell.content?.trim();
          if (!content) continue;

          const isPrice = /^\$?\d+(\.\d{2})?$/.test(content);
          
          if (cell.rowIndex === 0) {
            currentCategory = content;
          } else if (isPrice) {
            const price = parseFloat(content.replace('$', ''));
            const previousCell = table.cells.find(
              c => c.rowIndex === cell.rowIndex && c.columnIndex === cell.columnIndex - 1
            );
            
            if (previousCell?.content) {
              menuItems.push({
                name: previousCell.content.trim(),
                price,
                category: currentCategory,
                confidence: 0.8,
                description: ''
              });
            }
          }
        }
      }
    }

    // Add logging for debugging
    console.log('Extracted menu items:', menuItems);

    return menuItems;
  } catch (error) {
    console.error('Error in OCR processing:', error);
    throw error instanceof Error ? error : new Error('Failed to process menu image');
  }
}

export async function validateExtraction(items: MenuItemExtraction[]): Promise<MenuItemExtraction[]> {
  return items.filter(item => {
    // Basic validation rules
    const hasValidName = item.name && item.name.length > 0;
    const hasValidPrice = item.price && item.price > 0;
    const hasHighConfidence = item.confidence > 0.7; // 70% confidence threshold

    return hasValidName && hasValidPrice && hasHighConfidence;
  });
} 