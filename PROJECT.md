# Twinkle 🎄✨

**Discover the best Christmas lights in your neighborhood. Build routes. Share the magic.**

## Overview

Twinkle is a community-driven app for discovering, rating, and navigating to the best Christmas light displays. Users can pin houses on a map, upload photos, leave ratings and reviews, and build optimized driving routes to see the best displays in their area.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Platform | iOS / Android (React Native via Expo) |
| Backend | Supabase (Auth, Postgres, Storage) |
| Maps | Mapbox GL + Optimization API |
| Navigation | React Navigation (bottom tabs + stack) |

## Core Features

### 🗺️ Map View
- Interactive Mapbox map with house pins
- Cluster markers when zoomed out
- Color-coded pins by rating (green = 4+, yellow = 3+, red = below 3)
- User location tracking

### 🏠 Add a House
- Search by address (geocoding)
- Up to 5 photos per house
- Feature tags: **Lights**, **Music**, **Strobes**, **Animatronics**, **Blowups**
- Description field
- Auto-tagged with current season year

### ⭐ Ratings
- 1–5 stars, half-star increments (0.5 step)
- One rating per user per house per season
- Average displayed to one decimal place
- Rating count shown

### 💬 Reviews
- Text reviews with language filter (profanity check)
- Flagging system for inappropriate content
- One review per user per house (editable)

### 🔍 Search & Filter
- Radius-based search (1mi, 5mi, 10mi, 25mi)
- Filter by minimum rating
- Filter by feature tags
- Sort by rating, distance, newest

### 🚗 Route Builder
- "Best houses in X minutes" — loop routes back to start
- Powered by Mapbox Optimization API (TSP solver)
- Save and name routes
- Share routes publicly (deep links)

### 🔄 Seasonal Reset
- Houses tagged with `season_year`
- Each season is fresh — old houses marked inactive
- Historical data preserved

## Future Features

- **Monetization:** Featured/promoted house listings (paid placement)
- **Claim Flow:** Anyone can add a house; homeowner can claim ownership later for verified badge and management
- **Push Notifications:** "New houses added near you"
- **Social:** Follow users, share to social media
- **Events:** Live events at houses (Santa visits, etc.)

## Dependencies (to install)

```
@supabase/supabase-js
@rnmapbox/maps
expo-location
expo-image-picker
@react-navigation/native
@react-navigation/bottom-tabs
@react-navigation/native-stack
react-native-screens
react-native-safe-area-context
react-native-gesture-handler
```

## Project Structure

```
twinkle/
├── src/
│   ├── screens/          # App screens
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Service clients (Supabase, Mapbox)
│   ├── types/            # TypeScript type definitions
│   └── navigation/       # Navigation config
├── supabase/
│   └── schema.sql        # Database schema + RLS policies
├── assets/               # Images, fonts
└── PROJECT.md            # This file
```

## Environment Variables

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=
```
