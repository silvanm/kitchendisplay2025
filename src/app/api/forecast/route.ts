import { NextResponse } from 'next/server';

const KACHELMANN_API_KEY = process.env.KACHELMANN_API_KEY;
const WEATHER_LAT = process.env.WEATHER_LATITUDE;
const WEATHER_LON = process.env.WEATHER_LONGITUDE;

export async function GET() {
  if (!KACHELMANN_API_KEY) {
    return NextResponse.json({ error: 'Kachelmann API key not configured' }, { status: 500 });
  }

  const url = `https://api.kachelmannwetter.com/v02/forecast/${WEATHER_LAT}/${WEATHER_LON}/3day`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-API-Key': KACHELMANN_API_KEY
      },
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Kachelmann API Error:', response.status, errorText);
      return NextResponse.json({ error: 'Failed to fetch forecast from Kachelmann', details: errorText }, { status: response.status });
    }

    const data = await response.json();
    
    // We only need today's forecast, which is the first item in the data array.
    const todayForecast = data.data[0];

    return NextResponse.json(todayForecast);

  } catch (error) {
    console.error('Error fetching Kachelmann forecast:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 