'use client';

import { useState, useEffect } from 'react';
import Clock from './Clock';
import InfoPanel from './InfoPanel';
import Slideshow from './Slideshow';

// Import hooks and context
import { useWeatherData } from '@/hooks/useWeatherData';
import { usePowerData } from '@/hooks/usePowerData';
import { useForecastData } from '@/hooks/useForecastData';
import { useWaterData } from '@/hooks/useWaterData';
import { DetailedViewProvider, useDetailedView } from '@/contexts/DetailedViewContext';

// Color calculation constants from docs
const CO2_ALERT_THRESHOLD = 1000;
const CO2_MAX_THRESHOLD = 2000;
const POWER_ALERT_THRESHOLD = 300;
const POWER_MAX_THRESHOLD = 2000;
const RAIN_ALERT_THRESHOLD = 1;

function Display() {
  const { showDetailed } = useDetailedView();
  const [backgroundColor, setBackgroundColor] = useState('black');

  // Fetch all data at the top level
  const { weatherData, error: weatherError, isLoading: weatherIsLoading } = useWeatherData();
  const { powerData } = usePowerData();
  const { forecast } = useForecastData();
  const { waterData } = useWaterData();
  
  useEffect(() => {
    let newColor = 'black';
    let priority = 0; // Higher number = higher priority

    // 1. CO2 Alert (Priority 3)
    const co2 = weatherData?.co2;
    if (co2 && co2 > CO2_ALERT_THRESHOLD) {
      if (priority <= 3) {
        const saturation = Math.min(1, (co2 - (CO2_ALERT_THRESHOLD - 200)) / (CO2_MAX_THRESHOLD - (CO2_ALERT_THRESHOLD - 200)));
        newColor = `hsl(0, ${saturation * 100}%, ${saturation * 50}%)`;
        priority = 3;
      }
    }
    
    // 2. Power Alert (Priority 2)
    const power = powerData?.power;
    if (power && power > POWER_ALERT_THRESHOLD) {
      if (priority <= 2) {
        const brightness = Math.min(1, (power - POWER_ALERT_THRESHOLD) / (POWER_MAX_THRESHOLD - POWER_ALERT_THRESHOLD));
        newColor = `hsl(35, ${brightness * 100}%, ${brightness * 50}%)`;
        priority = 2;
      }
    }
    
    // 3. Rain Alert (Priority 1)
    const rain = forecast?.precCurrent;
    if (rain && rain > RAIN_ALERT_THRESHOLD) {
      if (priority <= 1) {
        newColor = 'hsl(245, 100%, 50%)';
        priority = 1;
      }
    }
    
    setBackgroundColor(newColor);
    
  }, [weatherData, powerData, forecast]);


  const allData = { 
    weatherData, 
    powerData, 
    forecast, 
    waterData,
    weatherError,
    weatherIsLoading
  };

  return (
    <div 
      className="flex h-screen w-screen items-center"
      style={{ backgroundColor: backgroundColor, transition: 'background-color 1s ease-in-out' }}
      onClick={showDetailed}
    >
      {/* Left Column - Information Display */}
      <div className="flex-grow flex flex-col">
        <Clock />
        <InfoPanel data={allData} />
      </div>
      
      {/* Right Column - Square Slideshow */}
      <div className="w-[100vh] h-[100vh]">
        <Slideshow />
      </div>
    </div>
  );
}


export default function KitchenDisplay() {
  return (
    <DetailedViewProvider>
      <Display />
    </DetailedViewProvider>
  );
}