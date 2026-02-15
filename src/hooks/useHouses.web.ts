import { useCallback, useEffect, useState } from 'react';
import { mockHouses } from '../data/mockHouses';
import type { Feature, House } from '../types';

export interface MapBounds {
  ne: { lat: number; lng: number };
  sw: { lat: number; lng: number };
}

export interface HouseFilters {
  bounds?: MapBounds;
  radius?: number;
  minRating?: number;
  features?: Feature[];
}

interface HousesState {
  houses: House[];
  loading: boolean;
  error: string | null;
}

export function useHouses(filters: HouseFilters) {
  const [state, setState] = useState<HousesState>({
    houses: [],
    loading: true,
    error: null,
  });

  const fetchHouses = useCallback(() => {
    let filtered = [...mockHouses];

    if (filters.bounds) {
      filtered = filtered.filter(
        (h) =>
          h.lat >= filters.bounds!.sw.lat &&
          h.lat <= filters.bounds!.ne.lat &&
          h.lng >= filters.bounds!.sw.lng &&
          h.lng <= filters.bounds!.ne.lng,
      );
    }

    if (filters.minRating && filters.minRating > 0) {
      filtered = filtered.filter((h) => (h.avg_rating ?? 0) >= filters.minRating!);
    }

    if (filters.features && filters.features.length > 0) {
      filtered = filtered.filter((h) =>
        filters.features!.every((f) => h.features.includes(f)),
      );
    }

    setState({ houses: filtered, loading: false, error: null });
  }, [
    filters.bounds?.ne.lat,
    filters.bounds?.ne.lng,
    filters.bounds?.sw.lat,
    filters.bounds?.sw.lng,
    filters.minRating,
    filters.features?.join(','),
  ]);

  useEffect(() => {
    fetchHouses();
  }, [fetchHouses]);

  return { ...state, refetch: fetchHouses };
}
