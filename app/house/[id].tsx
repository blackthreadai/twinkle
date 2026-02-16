import React from 'react';
import { Platform } from 'react-native';

// On web, Metro resolves HouseDetailScreen.web.tsx automatically
import HouseDetailScreen from '@/src/screens/HouseDetailScreen';

export default function HouseDetailRoute() {
  return <HouseDetailScreen />;
}
