'use client';

import Image from 'next/image';
import { ForecastData } from '@/hooks/useForecastData';

interface ForecastPanelProps {
  data: ForecastData | null;
}

const ICON_CODE_MAP: { [key: string]: string } = {
  "cloudy": "N", "fog": "M", "freezingrain": "U", "overcast": "Y",
  "partlycloudy": "H", "rain": "Q", "raindrizzle": "8", "rainheavy": "X",
  "severethunderstorm": "O", "showers": "R", "showersheavy": "X", "snow": "W",
  "snowheavy": "W", "snowrain": "V", "snowrainshowers": "7", "snowshowers": "S",
  "snowshowersheavy": "S", "sunshine": "B", "thunderstorm": "P", "wind": "F"
};

export default function ForecastPanel({ data }: ForecastPanelProps) {
  if (!data) {
    return <span>Loading Forecast...</span>;
  }
  
  const weatherIcon = ICON_CODE_MAP[data.weatherSymbol] || "B"; // Default to sunshine

  return (
    <div className="flex justify-center items-center space-x-10">
      {/* Weather Icon */}
      <div 
        className="weather-icon"
        data-icon={weatherIcon}
        style={{ fontSize: '4.5vw' }}
      ></div>

      {/* Temp Min/Max */}
      <div className="flex items-center space-x-2">
        <Image src="/img/arrow_down.png" alt="Min" width={32} height={32} className="w-[3vw] h-[3vw]" />
        <span>{data.tempMin.toFixed(0)}°</span>
        <Image src="/img/arrow_up.png" alt="Max" width={32} height={32} className="w-[3vw] h-[3vw]" />
        <span>{data.tempMax.toFixed(0)}°</span>
      </div>

      {/* Precipitation Icon (Umbrella) */}
      {data.precCurrent > 0 && (
        <div className="flex items-center space-x-2">
          <Image src="/img/umbrella.png" alt="Rain" width={40} height={40} className="w-[3.8vw] h-[3.8vw]" />
          <span>{data.precCurrent.toFixed(1)}mm</span>
        </div>
      )}
    </div>
  );
}