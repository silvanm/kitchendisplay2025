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
    return NextResponse.json({ error: 'Not authenticated with Netatmo. Please log in.' }, { status: 401 });
  }

  // Use the specific device ID for the office display
  const OFFICE_DEVICE_ID = '70:ee:50:28:ed:f8';
  const url = `https://api.netatmo.com/api/getstationsdata?device_id=${OFFICE_DEVICE_ID}`;

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
      console.error('Netatmo Office API Error:', response.status, errorText);
      if (response.status === 403) {
         return NextResponse.json({ error: 'Invalid Netatmo access token. Please re-login.' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Failed to fetch data from Netatmo', details: errorText }, { status: response.status });
    }

    const data = await response.json();
    
    const device = data.body.devices[0];
    const indoorModule = device.dashboard_data;
    
    // Find outdoor module (NAModule1) for outdoor temperature
    const outdoorModule = device.modules?.find((mod: NetatmoModule) => mod.type === 'NAModule1');

    const extractedData = {
      indoorTemp: indoorModule.Temperature,
      indoorHumidity: indoorModule.Humidity,
      co2: indoorModule.CO2,
      outdoorTemp: outdoorModule ? outdoorModule.dashboard_data.Temperature : null,
      time_utc: indoorModule.time_utc,
    };

    return NextResponse.json(extractedData);

  } catch (error) {
    console.error('Error fetching Netatmo office data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 