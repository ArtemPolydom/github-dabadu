import { useState, useEffect, useCallback } from 'react';

const SCRIPT_ID = 'google-maps-script';
const GOOGLE_MAPS_API_KEY = 'AIzaSyAjvJulCIKazlyXQYxj7jwnRBvy_WrKjf8';

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts?: google.maps.places.AutocompleteOptions
          ) => google.maps.places.Autocomplete;
        };
      };
    };
    initPlacesAutocomplete?: () => void;
  }
}

declare namespace google.maps.places {
  interface Autocomplete {
    addListener(eventName: string, handler: () => void): void;
    getPlace(): PlaceResult;
    unbindAll(): void;
  }
  
  interface AutocompleteOptions {
    types?: string[];
    language?: string;
    fields?: string[];
  }

  interface PlaceResult {
    geometry?: any;
    name: string;
    formatted_address: string;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }
}

export interface PlaceResult {
  name: string;
  formatted_address: string;
  country: string;
  state: string;
}

export function usePlacesAutocomplete() {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [searchInput, setSearchInput] = useState<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearSelection = useCallback(() => {
    setSelectedPlace(null);
    if (searchInput) {
      searchInput.value = '';
      searchInput.removeAttribute('readonly');
    }
  }, [searchInput]);

  const setupAutocomplete = useCallback(() => {
    const input = document.getElementById('search-input') as HTMLInputElement;
    if (!input) return;
    
    setSearchInput(input);

    const autocompleteInstance = new window.google.maps.places.Autocomplete(
      input,
      {
        types: ['lodging'],
        language: 'en',
        fields: ['name', 'formatted_address', 'address_components', 'geometry'],
      }
    );

    autocompleteInstance.addListener('place_changed', () => {
      const place = autocompleteInstance.getPlace();
      
      input.setAttribute('readonly', 'true');
      if (!place.geometry) {
        setError('Please select a hotel from the dropdown');
        return;
      }

      const country = place.address_components.find(
        (component: any) => component.types.includes('country')
      )?.long_name || '';
      const state = place.address_components.find(
        (component: any) => component.types.includes('administrative_area_level_1')
      )?.long_name || '';
      
      setSelectedPlace({
        name: place.name,
        formatted_address: place.formatted_address,
        country,
        state
      });
      setError(null);
    });

    setAutocomplete(autocompleteInstance);
  }, []);

  const resetPlacesAutocomplete = useCallback(() => {
    if (autocomplete) {
      // Unbind all event listeners
      autocomplete.unbindAll();
    }
    
    // Clear the current autocomplete instance
    setAutocomplete(null);
    clearSelection();

    // Reinitialize the autocomplete
    if (window.google?.maps?.places) {
      setTimeout(() => {
        setupAutocomplete();
      }, 0);
    }
  }, [autocomplete, clearSelection, setupAutocomplete]);

  useEffect(() => {
    if (window.google?.maps?.places) {
      setupAutocomplete();
      return;
    }

    if (document.getElementById(SCRIPT_ID)) {
      window.initPlacesAutocomplete = setupAutocomplete;
      return;
    }

    window.initPlacesAutocomplete = () => {
      try {
        setupAutocomplete();
      } catch (err) {
        setError('Failed to initialize Places Autocomplete');
      }
    };

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initPlacesAutocomplete&language=en`;
    script.async = true;
    document.head.appendChild(script);

    return () => {
      window.initPlacesAutocomplete = undefined;
    };
  }, [setupAutocomplete]);

  return { selectedPlace, error, clearSelection, resetPlacesAutocomplete };
}