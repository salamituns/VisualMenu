export interface OptimizedImage {
  data: Buffer;
  format: string;
  width: number;
  height: number;
  size: number;
}

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

export async function optimizeImage(
  input: Buffer | File,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImage> {
  try {
    const formData = new FormData();
    
    // Handle different input types
    if (input instanceof Buffer) {
      // Convert Buffer to Blob using Uint8Array
      const uint8Array = new Uint8Array(input);
      const blob = new Blob([uint8Array], { type: 'image/jpeg' });
      formData.append('image', blob, 'image.jpg');
    } else if (input instanceof File) {
      // File is already a Blob, so we can append it directly
      formData.append('image', input);
    } else {
      throw new Error('Invalid input type: must be Buffer or File');
    }

    const response = await fetch('/api/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to optimize image');
    }

    const result = await response.json();
    
    // Convert base64 back to Buffer
    const optimizedBuffer = Buffer.from(result.optimized, 'base64');

    return {
      data: optimizedBuffer,
      format: 'webp',
      width: 1200, // These are maximum values
      height: 1200,
      size: optimizedBuffer.length
    };
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw new Error('Failed to optimize image: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function generateThumbnail(
  input: Buffer | File,
  size: number = 200
): Promise<Buffer> {
  try {
    const formData = new FormData();
    
    // Handle different input types
    if (input instanceof Buffer) {
      // Convert Buffer to Blob using Uint8Array
      const uint8Array = new Uint8Array(input);
      const blob = new Blob([uint8Array], { type: 'image/jpeg' });
      formData.append('image', blob, 'image.jpg');
    } else if (input instanceof File) {
      // File is already a Blob, so we can append it directly
      formData.append('image', input);
    } else {
      throw new Error('Invalid input type: must be Buffer or File');
    }

    const response = await fetch('/api/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to generate thumbnail');
    }

    const result = await response.json();
    
    // Return the thumbnail buffer
    return Buffer.from(result.thumbnail, 'base64');
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw new Error('Failed to generate thumbnail: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
} 