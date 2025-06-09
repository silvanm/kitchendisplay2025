'use client';

import { useState, useEffect } from 'react';
import WeatherPanel from './panels/WeatherPanel';
import WaterTempPanel from './panels/WaterTempPanel';
import PowerPanel from './panels/PowerPanel';
import ForecastPanel from './panels/ForecastPanel';

// Import data types from hooks
import { WeatherData, WeatherError } from '@/hooks/useWeatherData';
import { PowerData } from '@/hooks/usePowerData';
import { WaterData } from '@/hooks/useWaterData';
import { ForecastData } from '@/hooks/useForecastData';

interface AllData {
  weatherData: WeatherData | null;
  powerData: PowerData | null;
  waterData: WaterData | null;
  forecast: ForecastData | null;
  weatherError: WeatherError;
  weatherIsLoading: boolean;
}

interface InfoPanelProps {
  data: AllData;
}

export default function InfoPanel({ data }: InfoPanelProps) {
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const panels = [
    <WeatherPanel key="weather" weatherData={data.weatherData} forecastData={data.forecast} error={data.weatherError} isLoading={data.weatherIsLoading} />,
    <WaterTempPanel key="water" data={data.waterData} />,
    <PowerPanel key="power" powerData={data.powerData} weatherData={data.weatherData} />,
    <ForecastPanel key="forecast" data={data.forecast} />,
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentPanelIndex((prev) => (prev + 1) % panels.length);
        setIsVisible(true);
      }, 250);
    }, 5000);

    return () => clearInterval(interval);
  }, [panels.length]);

  return (
    <div 
      className="text-center text-white mb-2 mt-[1.1vw] transition-opacity duration-500 flex items-center justify-center"
      style={{ 
        fontSize: '3.8vw',
        height: '6vw',
        opacity: isVisible ? 1 : 0
      }}
    >
      {panels[currentPanelIndex]}
    </div>
  );
}