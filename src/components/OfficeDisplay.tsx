'use client';

import { useState, useEffect } from 'react';
import { useOfficeWeatherData, OfficeWeatherError } from '@/hooks/useOfficeWeatherData';

// Clock component for office display
function OfficeClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return { hours, minutes };
  };

  const { hours, minutes } = formatTime(time);

  return (
    <div className="clock w-full text-center opacity-100 transition-opacity duration-500">
      <span className="text-[300px] font-normal text-white transition-opacity duration-500">
        {hours.charAt(0)}
      </span>
      <span className="text-[300px] font-normal text-white transition-opacity duration-500">
        {hours.charAt(1)}
      </span>
      <span className="text-[300px] font-normal text-white">:</span>
      <span className="text-[300px] font-normal text-white transition-opacity duration-500">
        {minutes.charAt(0)}
      </span>
      <span className="text-[300px] font-normal text-white transition-opacity duration-500">
        {minutes.charAt(1)}
      </span>
    </div>
  );
}

// Individual measurement component
function OfficeMeasurement({ 
  icon, 
  value, 
  unit, 
  isWarning = false 
}: {
  icon: string;
  value: number | null;
  unit: string;
  isWarning?: boolean;
}) {
  if (value === null) return null;

  return (
    <div className="measurement">
      <div className="label"></div>
      <div className="value">
        <i 
          className={`fa ${icon} mr-2 text-[80px] mr-5 transition-colors duration-500 ${
            isWarning ? 'text-red-500' : 'text-[#e6b652]'
          }`} 
          aria-hidden="true"
        />
        <span className="text-[80px] text-white leading-relaxed">
          {Math.round(value)}{unit}
        </span>
      </div>
    </div>
  );
}

// Main office display component
export default function OfficeDisplay() {
  const { weatherData, error } = useOfficeWeatherData();
  const [backgroundColor, setBackgroundColor] = useState('black');
  const [showWarning, setShowWarning] = useState(false);
  const [warningText, setWarningText] = useState('');

  // Handle CO2 warnings and background color changes
  useEffect(() => {
    if (!weatherData) return;

    const { co2 } = weatherData;
    let newColor = 'black';
    let warning = false;
    let text = '';

    // CO2 Alert logic
    if (co2 && co2 > 1000) {
      const saturation = Math.min(1, (co2 - 800) / (2000 - 800));
      newColor = `hsl(0, ${saturation * 100}%, ${saturation * 50}%)`;
      
      if (co2 > 1500) {
        warning = true;
        text = 'Bitte nur kurz lüften';
      }
    }

    setBackgroundColor(newColor);
    setShowWarning(warning);
    setWarningText(text);
  }, [weatherData]);

  // Handle connection status
  const isDisconnected = error === OfficeWeatherError.FailedToFetch || 
                         error === OfficeWeatherError.NotAuthenticated;

  const finalBackgroundColor = isDisconnected ? '#00005a' : backgroundColor;

  return (
    <div 
      id="display"
      className="overflow-hidden w-screen h-screen margin-0 padding-0"
      style={{ 
        backgroundColor: finalBackgroundColor,
        transition: 'background-color 1s ease-in-out',
        fontFamily: 'Manrope, sans-serif'
      }}
    >
      <div 
        id="app" 
        className={`overflow-hidden w-full h-full ${isDisconnected ? 'disconnected' : ''}`}
        style={{ backgroundColor: finalBackgroundColor }}
      >
        {/* White overlay for animations */}
        <div className="overlay absolute top-0 w-full h-full bg-white opacity-0 z-[5]"></div>
        
        {/* Logo container (hidden by default) */}
        <div className="logoContainer opacity-0">
          <img id="picture" src="" alt="" />
          <div 
            id="logo" 
            className="opacity-0"
            style={{ backgroundImage: 'url("")' }}
          ></div>
        </div>

        {/* Connection status header */}
        <div id="header" className="self-start text-right text-white">
          {isDisconnected ? 'disconnected' : 'connected'}
        </div>

        {/* Main flex container */}
        <div 
          id="flex-box" 
          className="flex justify-evenly flex-col h-full"
        >
          {/* Clock */}
          <OfficeClock />

          {/* Measurements */}
          <div id="measurements" className="flex justify-around">
            <OfficeMeasurement 
              icon="fa-thermometer-half"
              value={weatherData?.indoorTemp || null}
              unit="°"
            />
            <OfficeMeasurement 
              icon="fa-tint"
              value={weatherData?.indoorHumidity || null}
              unit="%"
            />
            <OfficeMeasurement 
              icon="fa-leaf"
              value={weatherData?.co2 || null}
              unit=""
              isWarning={weatherData?.co2 ? weatherData.co2 > 1000 : false}
            />
            <OfficeMeasurement 
              icon="fa-thermometer-half"
              value={weatherData?.outdoorTemp || null}
              unit="°"
            />
          </div>
        </div>

        {/* Heat warning */}
        <div 
          id="heat-warning"
          className="absolute w-full bottom-[150px] text-[50px] text-center text-white"
          style={{ display: showWarning ? 'block' : 'none' }}
        >
          {warningText}
        </div>

        {/* Internet status */}
        <div 
          id="internet-status"
          className="absolute w-full bottom-[120px] text-[50px] text-center text-white"
          style={{ display: isDisconnected ? 'block' : 'none' }}
        >
          Server not reachable.
        </div>
      </div>

      {/* Footer bar with logo */}
      <div 
        id="footer-bar"
        className="text-white absolute w-full h-[8vh] text-center box-border top-0 m-5"
        style={{
          backgroundImage: 'url("/logo-m+p-2024.svg")',
          backgroundSize: 'auto',
          backgroundPosition: 'left',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>
    </div>
  );
} 