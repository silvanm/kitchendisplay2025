import { NextResponse } from 'next/server';

const GOOGLE_PHOTOS_SERVICE_URL = process.env.GOOGLE_PHOTOS_SERVICE_URL;

export async function GET() {
  if (!GOOGLE_PHOTOS_SERVICE_URL) {
    return NextResponse.json({ error: 'Google Photos service URL not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(GOOGLE_PHOTOS_SERVICE_URL, {
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Photos Service Error:', response.status, errorText);
      return NextResponse.json({ error: 'Failed to fetch photos', details: errorText }, { status: response.status });
    }

    const photoUrls = await response.json();
    return NextResponse.json(photoUrls);

  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 