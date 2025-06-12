'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Slideshow() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [showNextImage, setShowNextImage] = useState(false);
  const [nextImageOpacity, setNextImageOpacity] = useState(0);

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
        setImageUrls(data);
        setNextImageIndex(data.length > 1 ? 1 : 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        // Fallback to sample images on error
        setImageUrls(['/img/sample-image.jpg', '/img/sample-slideshow-image.jpg']);
        setNextImageIndex(1);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchImages();
  }, []);

  // Preload current and next image
  useEffect(() => {
    if (imageUrls.length === 0) return;

    const preloadImage = (index: number) => {
      if (loadedImages.has(index)) return;

      const img = new window.Image();
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(index));
      };
      img.src = imageUrls[index];
    };

    // Load current image
    preloadImage(currentImageIndex);
    
    // Preload next image
    if (imageUrls.length > 1) {
      preloadImage(nextImageIndex);
    }
  }, [currentImageIndex, nextImageIndex, imageUrls, loadedImages]);

  useEffect(() => {
    if (imageUrls.length < 2) return;

    const interval = setInterval(() => {
      // Only start transition if next image is loaded
      if (loadedImages.has(nextImageIndex)) {
        // Show next image with opacity 0
        setShowNextImage(true);
        
        // Small delay to ensure the element is rendered before starting fade
        setTimeout(() => {
          setNextImageOpacity(1);
        }, 50);
        
        setTimeout(() => {
          // Complete the transition
          setCurrentImageIndex(nextImageIndex);
          setNextImageIndex((nextImageIndex + 1) % imageUrls.length);
          setShowNextImage(false);
          setNextImageOpacity(0);
        }, 1000); // Match transition duration
      }
    }, 10000); // Change image every 10 seconds

    return () => clearInterval(interval);
  }, [imageUrls.length, nextImageIndex, loadedImages]);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading Photos...</div>
      </div>
    );
  }

  if (imageUrls.length === 0) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">No Photos Available</div>
      </div>
    );
  }

  const currentImageUrl = imageUrls[currentImageIndex];
  const nextImageUrl = imageUrls[nextImageIndex];
  const isCurrentImageLoaded = loadedImages.has(currentImageIndex);
  const isNextImageLoaded = loadedImages.has(nextImageIndex);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {error && (
        <div className="absolute top-2 left-2 bg-red-800 text-white p-2 rounded z-10">
          Error: {error}. Displaying fallback images.
        </div>
      )}
      
      {/* Loading indicator for current image */}
      {!isCurrentImageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
          <div className="text-white text-xl">Loading image...</div>
        </div>
      )}

      {/* Current image - always visible when loaded */}
      {isCurrentImageLoaded && (
        <div className="absolute inset-0">
          <Image
            src={currentImageUrl}
            alt={`Slideshow image ${currentImageIndex + 1}`}
            fill
            className="object-cover"
            sizes="100vh"
            priority={currentImageIndex === 0}
            unoptimized={currentImageUrl.startsWith('http')}
          />
        </div>
      )}

      {/* Next image - crossfades in during transition */}
      {isNextImageLoaded && showNextImage && imageUrls.length > 1 && (
        <div 
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: nextImageOpacity }}
        >
          <Image
            src={nextImageUrl}
            alt={`Slideshow image ${nextImageIndex + 1}`}
            fill
            className="object-cover"
            sizes="100vh"
            unoptimized={nextImageUrl.startsWith('http')}
          />
        </div>
      )}
    </div>
  );
}