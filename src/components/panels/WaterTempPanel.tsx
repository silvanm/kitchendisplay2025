'use client';

import Image from 'next/image';
import { WaterData } from '@/hooks/useWaterData';

interface WaterTempPanelProps {
  data: WaterData | null;
}

export default function WaterTempPanel({ data }: WaterTempPanelProps) {
  const formatTemp = (temp: number | null) => {
    return temp !== null ? `${temp.toFixed(1)}°C` : '-';
  };

  if (!data) {
    return <span>Loading Water Temperatures...</span>;
  }

  return (
    <div className="flex justify-center items-center space-x-10">
      {/* Pool Temperature */}
      <div className="flex items-center space-x-2">
        <Image src="/img/pool.png" alt="Pool" width={46} height={46} className="w-[4.6vw] h-[4.6vw]" />
        <span>{formatTemp(data.pool)}</span>
      </div>

      {/* Lake Temperature */}
      <div className="flex items-center space-x-2">
        <Image src="/img/lake.png" alt="Lake" width={46} height={46} className="w-[4.6vw] h-[4.6vw]" />
        <span>{formatTemp(data.lake)}</span>
      </div>

      {/* River Temperature */}
      <div className="flex items-center space-x-2">
        <Image src="/img/river.png" alt="River" width={46} height={46} className="w-[4.6vw] h-[4.6vw]" />
        <span>{formatTemp(data.river)}</span>
      </div>
    </div>
  );
}