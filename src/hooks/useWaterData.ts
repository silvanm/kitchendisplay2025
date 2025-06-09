import { useState, useEffect } from 'react';

export interface WaterData {
  pool: number | null;
  lake: number | null;
  river: number | null;
}

export function useWaterData() {
  const [waterData, setWaterData] = useState<WaterData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/water');
        if (!response.ok) {
          throw new Error('Failed to fetch water temperatures');
        }
        const data: WaterData = await response.json();
        setWaterData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 900000); // Refresh every 15 minutes
    return () => clearInterval(interval);
  }, []);

  return { waterData, error, isLoading };
} 