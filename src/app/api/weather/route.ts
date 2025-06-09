import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/netatmoToken';

interface NetatmoModule {
  type: string;
  dashboard_data: {
    [key: string]: number;
  };
}

export async function GET() {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    // 401 Unauthorized is more appropriate if the user needs to log in
    return NextResponse.json({ error: 'Not authenticated with Netatmo. Please log in.' }, { status: 401 });
  }

  const NETATMO_DEVICE_ID = process.env.NETATMO_DEVICE_ID;
  if (!NETATMO_DEVICE_ID) {
    return NextResponse.json({ error: 'Netatmo device ID not configured' }, { status: 500 });
  }

  const url = `https://api.netatmo.com/api/getstationsdata?device_id=${NETATMO_DEVICE_ID}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      // Revalidate every 5 minutes
      next: { revalidate: 300 } 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Netatmo API Error:', response.status, errorText);
      // If the error is an auth error, we might want to be more specific
      if (response.status === 403) {
         return NextResponse.json({ error: 'Invalid Netatmo access token. Please re-login.' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Failed to fetch data from Netatmo', details: errorText }, { status: response.status });
    }

    const data = await response.json();
    
    const device = data.body.devices[0];
    const indoorModule = device.dashboard_data;
    const outdoorModule = device.modules.find((mod: NetatmoModule) => mod.type === 'NAModule1');
    const rainModule = device.modules.find((mod: NetatmoModule) => mod.type === 'NAModule3');

    const extractedData = {
      indoorTemp: indoorModule.Temperature,
      co2: indoorModule.CO2,
      outdoorTemp: outdoorModule ? outdoorModule.dashboard_data.Temperature : null,
      rain: rainModule ? rainModule.dashboard_data.sum_rain_1 : null,
    };

    return NextResponse.json(extractedData);

  } catch (error) {
    console.error('Error fetching Netatmo data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 