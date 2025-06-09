'use client';

import React, { createContext, useState, useContext, useCallback, useRef, useEffect } from 'react';

interface DetailedViewContextType {
  isDetailed: boolean;
  showDetailed: () => void;
}

const DetailedViewContext = createContext<DetailedViewContextType | undefined>(undefined);

export const useDetailedView = () => {
  const context = useContext(DetailedViewContext);
  if (!context) {
    throw new Error('useDetailedView must be used within a DetailedViewProvider');
  }
  return context;
};

export const DetailedViewProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDetailed, setIsDetailed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showDetailed = useCallback(() => {
    // If there's an existing timer, clear it
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    setIsDetailed(true);
    
    // Set a new timer to hide the detailed view after 60 seconds
    timerRef.current = setTimeout(() => {
      setIsDetailed(false);
    }, 60000); // 60 seconds
  }, []);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <DetailedViewContext.Provider value={{ isDetailed, showDetailed }}>
      {children}
    </DetailedViewContext.Provider>
  );
}; 