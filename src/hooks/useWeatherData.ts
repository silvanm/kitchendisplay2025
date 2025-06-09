import { useState, useEffect } from 'react';

export interface WeatherData {
  indoorTemp: number | null;
  outdoorTemp: number | null;
  co2: number | null;
  rain: number | null;
}

export enum WeatherError {
  None,
  NotAuthenticated,
  FailedToFetch,
}

export function useWeatherData() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<WeatherError>(WeatherError.None);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Reset error on new fetch attempt
      setError(WeatherError.None);
      try {
        const response = await fetch('/api/weather');
        if (response.status === 401) {
          throw new Error('NotAuthenticated');
        }
        if (!response.ok) {
          throw new Error('FailedToFetch');
        }
        const data: WeatherData = await response.json();
        setWeatherData(data);
      } catch (err) {
        if (err instanceof Error && err.message === 'NotAuthenticated') {
          setError(WeatherError.NotAuthenticated);
        } else {
          setError(WeatherError.FailedToFetch);
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