import { NextResponse } from 'next/server';

const SHELLY_AUTH_KEY = process.env.SHELLY_AUTH_KEY;
const SHELLY_DEVICE_ID = process.env.SHELLY_DEVICE_ID;

export async function GET() {
  if (!SHELLY_AUTH_KEY || !SHELLY_DEVICE_ID) {
    return NextResponse.json({ error: 'Shelly credentials not configured' }, { status: 500 });
  }

  const url = 'https://shelly-69-eu.shelly.cloud/device/status';
  const params = new URLSearchParams({
    id: SHELLY_DEVICE_ID,
    auth_key: SHELLY_AUTH_KEY,
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
      // Revalidate every minute
      next: { revalidate: 60 } 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shelly API Error:', response.status, errorText);
      return NextResponse.json({ error: 'Failed to fetch data from Shelly', details: errorText }, { status: response.status });
    }

    const data = await response.json();
    
    const powerConsumption = data.data.device_status.total_power;

    return NextResponse.json({ power: powerConsumption });

  } catch (error) {
    console.error('Error fetching Shelly data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 