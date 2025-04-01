import React, { useRef, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { initMap } from '@/lib/map-utils';
import { loadGoogleMapsAPI } from '@/lib/load-google-maps';

interface MapContainerProps {
  setMapInstance: (map: google.maps.Map) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({ setMapInstance }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current) return;

    const initializeMap = async () => {
      try {
        // Wait for Google Maps API to be fully loaded
        await loadGoogleMapsAPI();
        
        const map = initMap(mapRef.current);
        setMapInstance(map);
        setLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        toast({
          title: 'Error',
          description: 'Failed to load Google Maps. Please check your internet connection.',
          variant: 'destructive',
        });
      }
    };

    initializeMap();
  }, [setMapInstance, toast]);

  return (
    <div className="relative w-full h-full rounded-md overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default MapContainer;
