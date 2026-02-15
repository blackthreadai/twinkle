import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Feature, House } from '../types';

export interface MapBounds {
  ne: { lat: number; lng: number };
  sw: { lat: number; lng: number };
}

export interface HouseFilters {
  bounds?: MapBounds;
  radius?: number; // miles (unused when bounds provided)
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

  const currentYear = new Date().getFullYear();

  const fetchHouses = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      let query = supabase
        .from('houses')
        .select('*, house_stats(avg_rating, rating_count)')
        .eq('season_year', currentYear)
        .eq('is_active', true);

      if (filters.bounds) {
        query = query
          .gte('lat', filters.bounds.sw.lat)
          .lte('lat', filters.bounds.ne.lat)
          .gte('lng', filters.bounds.sw.lng)
          .lte('lng', filters.bounds.ne.lng);
      }

      if (filters.features && filters.features.length > 0) {
        // Filter houses that contain ALL selected features
        for (const feature of filters.features) {
          query = query.contains('features', JSON.stringify([feature]));
        }
      }

      const { data, error } = await query;

      if (error) {
        setState({ houses: [], loading: false, error: error.message });
        return;
      }

      // Flatten the joined stats and apply minRating filter client-side
      const houses: House[] = (data ?? [])
        .map((row: Record<string, unknown>) => {
          const stats = row.house_stats as
            | { avg_rating: number; rating_count: number }[]
            | { avg_rating: number; rating_count: number }
            | null;
          const stat = Array.isArray(stats) ? stats[0] : stats;
          return {
            ...row,
            avg_rating: stat?.avg_rating ?? 0,
            rating_count: stat?.rating_count ?? 0,
            house_stats: undefined,
          } as unknown as House;
        })
        .filter((h) => {
          if (filters.minRating && filters.minRating > 0) {
            return (h.avg_rating ?? 0) >= filters.minRating;
          }
          return true;
        });

      setState({ houses, loading: false, error: null });
    } catch (err) {
      setState({
        houses: [],
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, [filters.bounds?.ne.lat, filters.bounds?.ne.lng, filters.bounds?.sw.lat, filters.bounds?.sw.lng, filters.minRating, filters.features?.join(','), currentYear]);

  useEffect(() => {
    fetchHouses();
  }, [fetchHouses]);

  return { ...state, refetch: fetchHouses };
}
