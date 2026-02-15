import { useEffect, useState } from 'react';

interface LocationState {
  location: { coords: { latitude: number; longitude: number } } | null;
  loading: boolean;
  error: string | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ location: null, loading: false, error: 'Geolocation not supported' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          location: { coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude } },
          loading: false,
          error: null,
        });
      },
      (err) => {
        // Fall back to Dallas center on error
        setState({
          location: { coords: { latitude: 32.7767, longitude: -96.7970 } },
          loading: false,
          error: null,
        });
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }, []);

  return state;
}
