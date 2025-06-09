import { useState, useEffect } from 'react';

export interface PowerData {
  power: number | null;
}

export function usePowerData() {
  const [powerData, setPowerData] = useState<PowerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/power');
        if (!response.ok) {
          throw new Error('Failed to fetch power data');
        }
        const data: PowerData = await response.json();
        setPowerData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return { powerData, error, isLoading };
} 