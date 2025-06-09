import { useState, useEffect } from 'react';

export interface ForecastData {
  tempMin: number;
  tempMax: number;
  weatherSymbol: string;
  windSpeed: number;
  precCurrent: number;
}

export function useForecastData() {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/forecast');
        if (!response.ok) {
          throw new Error('Failed to fetch forecast data');
        }
        const data: ForecastData = await response.json();
        setForecast(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3600000); // Refresh every hour
    return () => clearInterval(interval);
  }, []);

  return { forecast, error, isLoading };
} 