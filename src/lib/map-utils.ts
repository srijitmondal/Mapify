
// Initialize Google Map
export const initMap = (
  element: HTMLElement
): google.maps.Map => {
  const defaultCenter = { lat: 40.7128, lng: -74.006 }; // New York City
  
  const mapOptions: google.maps.MapOptions = {
    center: defaultCenter,
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    streetViewControl: false,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_RIGHT,
    },
    fullscreenControl: true,
    fullscreenControlOptions: {
      position: google.maps.ControlPosition.RIGHT_TOP,
    },
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_CENTER,
    },
    scaleControl: true,
  };

  const map = new google.maps.Map(element, mapOptions);
  
  // Add scale bar
  const scaleControl = new google.maps.ScaleControl();
  map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(scaleControl.getDiv());

  return map;
};

// Convert LatLng to simple object
export const latLngToObj = (latLng: google.maps.LatLng): { lat: number; lng: number } => {
  return { lat: latLng.lat(), lng: latLng.lng() };
};

// Calculate distance between two points in meters
export const calculateDistance = (
  point1: google.maps.LatLng | { lat: number; lng: number },
  point2: google.maps.LatLng | { lat: number; lng: number }
): number => {
  if (!(point1 instanceof google.maps.LatLng)) {
    point1 = new google.maps.LatLng(point1.lat, point1.lng);
  }
  
  if (!(point2 instanceof google.maps.LatLng)) {
    point2 = new google.maps.LatLng(point2.lat, point2.lng);
  }
  
  return google.maps.geometry.spherical.computeDistanceBetween(point1, point2);
};

// Calculate area of a polygon in square meters
export const calculateArea = (
  path: google.maps.LatLng[] | { lat: number; lng: number }[]
): number => {
  const latLngPath = path.map(point => {
    if (point instanceof google.maps.LatLng) {
      return point;
    }
    return new google.maps.LatLng(point.lat, point.lng);
  });
  
  return google.maps.geometry.spherical.computeArea(latLngPath);
};

// Format distance for display
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${meters.toFixed(0)} m`;
  } else {
    const km = meters / 1000;
    return `${km.toFixed(2)} km`;
  }
};

// Format area for display
export const formatArea = (squareMeters: number): string => {
  if (squareMeters < 10000) {
    return `${squareMeters.toFixed(0)} m²`;
  } else {
    const hectares = squareMeters / 10000;
    if (hectares < 100) {
      return `${hectares.toFixed(2)} ha`;
    } else {
      const squareKm = squareMeters / 1000000;
      return `${squareKm.toFixed(2)} km²`;
    }
  }
};

// Convert features to GeoJSON
export const featuresToGeoJSON = (features: any[]): any => {
  return {
    type: 'FeatureCollection',
    features: features.map(feature => {
      // Implementation depends on how features are stored
      // This is a placeholder
      return {
        type: 'Feature',
        geometry: {
          // Convert the feature to GeoJSON geometry
        },
        properties: feature.properties || {}
      };
    })
  };
};

// Convert features to KML
export const featuresToKML = (features: any[]): string => {
  // This is a placeholder for KML conversion
  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Map Features</name>
    <description>Exported from Mapify</description>
    <!-- Features would be converted to KML here -->
  </Document>
</kml>`;
  
  return kml;
};

// Download data as a file
export const downloadFile = (content: string, filename: string, type: string): void => {
  const blob = new Blob([content], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
