
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, MapPin } from 'lucide-react';
import { loadGoogleMapsAPI } from '@/lib/load-google-maps';

interface SearchPanelProps {
  mapInstance: google.maps.Map | null;
  onClose: () => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ mapInstance, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!mapInstance || !inputRef.current) {
      return;
    }

    const initSearchBox = async () => {
      await loadGoogleMapsAPI();
      
      searchBoxRef.current = new google.maps.places.SearchBox(inputRef.current);
      
      searchBoxRef.current.addListener('places_changed', () => {
        const places = searchBoxRef.current?.getPlaces() || [];
        setSearchResults(places);
        
        if (places.length === 0) {
          return;
        }
        
        // If only one result, automatically zoom to it
        if (places.length === 1 && places[0].geometry?.location) {
          mapInstance.setCenter(places[0].geometry.location);
          mapInstance.setZoom(14);
        }
      });
      
      // Bias the SearchBox results towards current map viewport
      mapInstance.addListener('bounds_changed', () => {
        const bounds = mapInstance.getBounds();
        if (bounds && searchBoxRef.current) {
          searchBoxRef.current.setBounds(bounds);
        }
      });
    };

    initSearchBox();
    
    // Clean up
    return () => {
      if (searchBoxRef.current) {
        google.maps.event.clearInstanceListeners(searchBoxRef.current);
      }
    };
  }, [mapInstance]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // The search is handled by the SearchBox listener
    setLoading(false);
  };

  const handleResultClick = (result: google.maps.places.PlaceResult) => {
    if (!mapInstance || !result.geometry?.location) return;
    
    mapInstance.setCenter(result.geometry.location);
    mapInstance.setZoom(15);
    
    // Optional: add a marker at the location
    new google.maps.Marker({
      map: mapInstance,
      position: result.geometry.location,
      animation: google.maps.Animation.DROP,
      title: result.name,
    });
    
    onClose();
  };

  return (
    <div className="w-full h-full bg-background rounded-md border border-border p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Search Location
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <form onSubmit={handleSearch} className="flex mb-4">
        <Input
          ref={inputRef}
          placeholder="Search for places..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mr-2"
        />
        <Button type="submit" disabled={loading}>
          {loading ? (
            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </form>
      
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {searchResults.length > 0 ? (
            searchResults.map((result, index) => (
              <div
                key={`${result.place_id || index}`}
                className="p-2 border border-border rounded-md cursor-pointer hover:bg-accent"
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{result.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {result.formatted_address}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            searchQuery && (
              <div className="py-8 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No results found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            )
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SearchPanel;
