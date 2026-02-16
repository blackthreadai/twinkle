import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { useLocation } from '../hooks/useLocation';
import { useHouses, type HouseFilters, type MapBounds } from '../hooks/useHouses';
import { HouseMarker } from '../components/HouseMarker';
import { FilterSheet, type FilterValues } from '../components/FilterSheet';
import { MAPBOX_ACCESS_TOKEN } from '../lib/mapbox';
import type { Feature, House } from '../types';

MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

const DEFAULT_CENTER: [number, number] = [-97.7431, 30.2672]; // Austin, TX fallback

export default function MapScreen() {
  const { location, loading: locationLoading } = useLocation();
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const mapRef = useRef<MapboxGL.MapView>(null);

  const [bounds, setBounds] = useState<MapBounds | undefined>();
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({
    radius: 10,
    minRating: 0,
    features: [],
  });

  const houseFilters: HouseFilters = {
    bounds,
    minRating: filterValues.minRating,
    features: filterValues.features.length > 0 ? filterValues.features : undefined,
  };

  const { houses, loading: housesLoading } = useHouses(houseFilters);

  const userCenter: [number, number] = location
    ? [location.coords.longitude, location.coords.latitude]
    : DEFAULT_CENTER;

  const handleRegionChange = useCallback(async () => {
    if (!mapRef.current) return;
    const visibleBounds = await mapRef.current.getVisibleBounds();
    if (visibleBounds) {
      setBounds({
        ne: { lat: visibleBounds[0][1], lng: visibleBounds[0][0] },
        sw: { lat: visibleBounds[1][1], lng: visibleBounds[1][0] },
      });
    }
  }, []);

  const handleMarkerPress = (house: House) => {
    setSelectedHouse(house);
  };

  const handleCalloutPress = (house: House) => {
    console.log('Navigate to HouseDetailScreen:', house.id);
    setSelectedHouse(null);
  };

  const handleApplyFilters = (values: FilterValues) => {
    setFilterValues(values);
  };

  if (locationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Finding your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Dark}
        onRegionDidChange={handleRegionChange}
        onDidFinishLoadingMap={handleRegionChange}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={12}
          centerCoordinate={userCenter}
          animationDuration={0}
        />

        <MapboxGL.UserLocation visible />

        {houses.map((house) => (
          <MapboxGL.MarkerView
            key={house.id}
            id={house.id}
            coordinate={[house.lng, house.lat]}
          >
            <TouchableOpacity onPress={() => handleMarkerPress(house)}>
              <HouseMarker house={house} />
            </TouchableOpacity>
          </MapboxGL.MarkerView>
        ))}
      </MapboxGL.MapView>

      {/* Selected house callout */}
      {selectedHouse && (
        <TouchableOpacity
          style={styles.callout}
          activeOpacity={0.9}
          onPress={() => handleCalloutPress(selectedHouse)}
        >
          <View style={styles.calloutContent}>
            {selectedHouse.photos.length > 0 && (
              <Image source={{ uri: selectedHouse.photos[0] }} style={styles.calloutImage} />
            )}
            <View style={styles.calloutInfo}>
              <Text style={styles.calloutAddress} numberOfLines={2}>
                {selectedHouse.address}
              </Text>
              <View style={styles.calloutRating}>
                <Text style={styles.calloutStars}>
                  {'★'.repeat(Math.round(selectedHouse.avg_rating ?? 0))}
                  {'☆'.repeat(5 - Math.round(selectedHouse.avg_rating ?? 0))}
                </Text>
                <Text style={styles.calloutRatingText}>
                  {(selectedHouse.avg_rating ?? 0).toFixed(1)}
                </Text>
              </View>
              <View style={styles.calloutTags}>
                {(selectedHouse.features as Feature[]).slice(0, 3).map((f) => (
                  <View key={f} style={styles.tag}>
                    <Text style={styles.tagText}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.calloutClose}
            onPress={() => setSelectedHouse(null)}
          >
            <Text style={styles.calloutCloseText}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Filter button */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setFiltersVisible(true)}
      >
        <Text style={styles.filterButtonText}>⚙ Filters</Text>
        {(filterValues.minRating > 0 || filterValues.features.length > 0) && (
          <View style={styles.filterBadge} />
        )}
      </TouchableOpacity>

      {/* Loading indicator */}
      {housesLoading && (
        <View style={styles.loadingBadge}>
          <ActivityIndicator size="small" color="#FFD700" />
        </View>
      )}

      {/* Add House FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => console.log('Navigate to AddHouseScreen')}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* Filter Sheet */}
      <FilterSheet
        visible={filtersVisible}
        initialValues={filterValues}
        onApply={handleApplyFilters}
        onClose={() => setFiltersVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFD700',
    marginTop: 12,
    fontSize: 16,
  },
  callout: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calloutContent: {
    flexDirection: 'row',
  },
  calloutImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginRight: 12,
  },
  calloutInfo: {
    flex: 1,
  },
  calloutAddress: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  calloutRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  calloutStars: {
    color: '#FFD700',
    fontSize: 14,
  },
  calloutRatingText: {
    color: '#ccc',
    fontSize: 12,
    marginLeft: 6,
  },
  calloutTags: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  tag: {
    backgroundColor: '#111111',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    color: '#FFD700',
    fontSize: 11,
  },
  calloutClose: {
    position: 'absolute',
    top: 8,
    right: 12,
  },
  calloutCloseText: {
    color: '#888',
    fontSize: 18,
  },
  filterButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#444',
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filterBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B22222',
    marginLeft: 6,
  },
  loadingBadge: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#000000',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#B22222',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#FFD700',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 30,
  },
});
