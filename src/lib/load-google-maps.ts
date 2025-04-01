
/**
 * Helper function to load Google Maps API
 * @returns Promise that resolves when Google Maps API is loaded
 */
export const loadGoogleMapsAPI = (): Promise<void> => {
  return new Promise<void>((resolve) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }
    
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        resolve();
      } else {
        setTimeout(checkGoogleMaps, 100);
      }
    };
    
    checkGoogleMaps();
  });
};
