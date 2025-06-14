'use client';

import Image from 'next/image';
import { useDetailedView } from '@/contexts/DetailedViewContext';
import { WeatherData, WeatherError } from '@/hooks/useWeatherData';
import { ForecastData } from '@/hooks/useForecastData';

interface WeatherPanelProps {
  weatherData: WeatherData | null;
  forecastData: ForecastData | null;
  error: WeatherError;
  isLoading: boolean;
}

export default function WeatherPanel({ weatherData, forecastData, error, isLoading }: WeatherPanelProps) {
  const { isDetailed } = useDetailedView();

  const formatTemp = (temp: number | null) => temp !== null ? `${temp.toFixed(0)}°C` : '-';

  if (isLoading) return <span>Loading Weather...</span>;
  if (error === WeatherError.NotAuthenticated) {
    return (
      <a href="/api/auth/netatmo/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-2xl hover:bg-blue-700 transition-colors no-underline">
        Login to Netatmo
      </a>
    );
  }
  if (error === WeatherError.FailedToFetch || !weatherData) {
    return <span className="text-red-500">Weather Data Unavailable</span>;
  }

  return (
    <div className="flex flex-col justify-center items-center">
      {/* Permanent View */}
      <div className="flex justify-center items-center space-x-2">
        <div className="flex items-center ">
          <Image src="/img/indoor.png" alt="Indoor" width={46} height={46} className="w-[4.6vw] h-[4.6vw]" />
          <span>{formatTemp(weatherData.indoorTemp)}</span>
        </div>
        <div className="flex items-center ">
          <Image src="/img/outdoor.png" alt="Outdoor" width={46} height={46} className="w-[4.6vw] h-[4.6vw]" />
          <span>{formatTemp(weatherData.outdoorTemp)}</span>
        </div>
      </div>

      {/* Detailed View (On Touch) */}
      {isDetailed && (
        <div className="flex justify-center items-center space-x-2 mt-4 text-[2.5vw]">
          <div className="flex items-center ">
            <span className="weather-icon" data-icon="F" style={{ fontSize: '2.5vw' }}></span>
            <span>{forecastData ? `${forecastData.windSpeed.toFixed(0)} km/h` : '-'}</span>
          </div>
          <div className="flex items-center ">
            <Image src="/img/umbrella.png" alt="Rain" width={32} height={32} className="w-[2.5vw] h-[2.5vw]" />
            <span>{weatherData.rain !== null ? `${weatherData.rain.toFixed(1)}mm/h` : '-'}</span>
          </div>
        </div>
      )}
    </div>
  );
}