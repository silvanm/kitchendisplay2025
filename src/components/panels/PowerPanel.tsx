'use client';

import Image from 'next/image';
import { useDetailedView } from '@/contexts/DetailedViewContext';
import { PowerData } from '@/hooks/usePowerData';
import { WeatherData } from '@/hooks/useWeatherData';

interface PowerPanelProps {
  powerData: PowerData | null;
  weatherData: WeatherData | null;
}

export default function PowerPanel({ powerData, weatherData }: PowerPanelProps) {
  const { isDetailed } = useDetailedView();

  if (!powerData) {
    return <span>Loading Power...</span>;
  }

  return (
    <div className="flex flex-col justify-center items-center">
      {/* Permanent View */}
      <div className="flex justify-center items-center space-x-2">
        <Image 
          src="/img/flash.svg"
          alt="Power"
          width={46}
          height={46}
          className="w-[4.6vw] h-[4.6vw]"
        />
        <span>
          {powerData.power !== null ? `${Math.round(powerData.power ?? 0)}W` : '-'}
        </span>
      </div>

      {/* Detailed View (On Touch) */}
      {isDetailed && (
        <div className="flex justify-center items-center space-x-2 mt-4 text-[2.5vw]">
          <span>CO₂:</span>
          <span>{weatherData?.co2 !== null ? `${weatherData?.co2}ppm` : '-'}</span>
        </div>
      )}
    </div>
  );
}