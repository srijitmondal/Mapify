
/// <reference types="@types/google.maps" />

// This is a declaration file for Google Maps API
// It ensures TypeScript recognizes the 'google' namespace globally

declare global {
  interface Window {
    google: typeof google;
  }
}

export {};
