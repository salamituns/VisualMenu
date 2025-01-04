import { NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Optimize the main image
    const optimizedImage = await sharp(buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Generate thumbnail
    const thumbnail = await sharp(buffer)
      .resize(200, 200, {
        fit: 'cover',
        position: 'centre'
      })
      .webp({ quality: 80 })
      .toBuffer();

    return NextResponse.json({
      optimized: Buffer.from(optimizedImage).toString('base64'),
      thumbnail: Buffer.from(thumbnail).toString('base64')
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
} 