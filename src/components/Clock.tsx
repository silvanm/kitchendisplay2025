'use client';

import { useState, useEffect } from 'react';

const GERMAN_DAYS = [
  'Sunntig', 'Mäntig', 'Zischtig', 'Mittwuch', 'Donnschtig', 'Friitig', 'Samschtig'
];

const GERMAN_MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-CH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    const dayName = GERMAN_DAYS[date.getDay()];
    const day = date.getDate();
    const month = GERMAN_MONTHS[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName} · ${day}. ${month} ${year}`;
  };

  return (
    <div className="text-center text-white">
      {/* Date Display */}
      <div 
        className="uppercase mb-2 mt-[1.1vw]"
        style={{ fontSize: '2.5vw' }}
      >
        {formatDate(time)}
      </div>
      
      {/* Time Display */}
      <div className="font-normal">
        <ul className="list-none m-0 p-0">
          <li 
            className="inline-block text-center"
            style={{ fontSize: '11vw' }}
          >
            {formatTime(time)}
          </li>
        </ul>
      </div>
    </div>
  );
}