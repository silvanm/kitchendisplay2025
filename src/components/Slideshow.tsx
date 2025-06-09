'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Slideshow() {
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/photos');
        if (!response.ok) {
          throw new Error('Failed to fetch photos');
        }
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('No images found');
        }
        setImages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        // Fallback to sample images on error
        setImages(['/img/sample-image.jpg', '/img/sample-slideshow-image.jpg']);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length < 2) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 10000); // Change image every 10 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading Photos...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {error && (
        <div className="absolute top-2 left-2 bg-red-800 text-white p-2 rounded z-10">
          Error: {error}. Displaying fallback images.
        </div>
      )}
      {images.map((src, index) => (
        <div
          key={src + index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={src}
            alt={`Slideshow image ${index + 1}`}
            fill
            className="object-cover"
            sizes="100vh"
            priority={index === 0}
            unoptimized={src.startsWith('http')}
          />
        </div>
      ))}
    </div>
  );
}