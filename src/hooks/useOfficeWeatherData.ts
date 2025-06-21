import { useState, useEffect } from 'react';

export interface OfficeWeatherData {
  indoorTemp: number | null;
  indoorHumidity: number | null;
  outdoorTemp: number | null;
  co2: number | null;
  time_utc: number | null;
}

export enum OfficeWeatherError {
  None,
  NotAuthenticated,
  FailedToFetch,
}

export function useOfficeWeatherData() {
  const [weatherData, setWeatherData] = useState<OfficeWeatherData | null>(null);
  const [error, setError] = useState<OfficeWeatherError>(OfficeWeatherError.None);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setError(OfficeWeatherError.None);
      try {
        const response = await fetch('/api/office-weather');
        if (response.status === 401) {
          throw new Error('NotAuthenticated');
        }
        if (!response.ok) {
          throw new Error('FailedToFetch');
        }
        const data: OfficeWeatherData = await response.json();
        setWeatherData(data);
      } catch (err) {
        if (err instanceof Error && err.message === 'NotAuthenticated') {
          setError(OfficeWeatherError.NotAuthenticated);
        } else {
          setError(OfficeWeatherError.FailedToFetch);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return { weatherData, error, isLoading };
} 