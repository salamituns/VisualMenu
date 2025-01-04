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
    
    // If input is a Buffer, convert it to a File object
    if (input instanceof Buffer) {
      const blob = new Blob([input]);
      formData.append('image', blob, 'image.jpg');
    } else {
      formData.append('image', input);
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
    
    // If input is a Buffer, convert it to a File object
    if (input instanceof Buffer) {
      const blob = new Blob([input]);
      formData.append('image', blob, 'image.jpg');
    } else {
      formData.append('image', input);
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