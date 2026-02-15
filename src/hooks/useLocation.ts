import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  location: Location.LocationObject | null;
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
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState({ location: null, loading: false, error: 'Location permission denied' });
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setState({ location: current, loading: false, error: null });

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 50 },
        (loc) => setState((prev) => ({ ...prev, location: loc })),
      );
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

  return state;
}
