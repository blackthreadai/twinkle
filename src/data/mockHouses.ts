import type { House, Feature } from '../types';

const DALLAS_CENTER = { lat: 32.7767, lng: -96.7970 };

function house(
  id: number,
  address: string,
  lat: number,
  lng: number,
  features: Feature[],
  avgRating: number,
  ratingCount: number,
  description: string,
): House {
  return {
    id: `mock-${id}`,
    user_id: 'mock-user',
    address,
    lat,
    lng,
    description,
    features,
    photos: [
      `https://picsum.photos/seed/twinkle${id}/400/300`,
      `https://picsum.photos/seed/twinkle${id}b/400/300`,
    ],
    season_year: new Date().getFullYear(),
    is_active: true,
    claimed_by: null,
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
    avg_rating: avgRating,
    rating_count: ratingCount,
  };
}

export const mockHouses: House[] = [
  house(1, '1234 Candy Cane Ln, Dallas, TX', 32.7850, -96.7920, ['Lights', 'Music', 'Animatronics'], 4.8, 42, 'Stunning synchronized light show with over 50,000 LEDs'),
  house(2, '567 Snowflake Dr, Highland Park, TX', 32.8320, -96.7910, ['Lights', 'Blowups'], 4.5, 28, 'Giant inflatable wonderland with a 20ft Santa'),
  house(3, '890 Reindeer Way, University Park, TX', 32.8260, -96.8050, ['Lights', 'Music', 'Strobes'], 4.9, 67, 'The legendary display — voted #1 in DFW three years running'),
  house(4, '321 Tinsel Blvd, Lakewood, TX', 32.7920, -96.7500, ['Lights'], 3.5, 12, 'Classic white lights and elegant wreaths'),
  house(5, '444 Mistletoe Ave, Oak Lawn, TX', 32.8080, -96.8100, ['Lights', 'Music'], 4.2, 19, 'Tasteful display with carols playing from 6-10pm'),
  house(6, '777 North Pole Ct, Preston Hollow, TX', 32.8650, -96.8020, ['Lights', 'Music', 'Animatronics', 'Blowups'], 5.0, 89, 'Absolutely jaw-dropping — full animated village with fog machines'),
  house(7, '159 Evergreen Terrace, Uptown, TX', 32.8000, -96.8000, ['Lights', 'Strobes'], 3.2, 8, 'Colorful strobing display — not for the faint of heart'),
  house(8, '246 Holly St, East Dallas, TX', 32.7880, -96.7600, ['Lights', 'Blowups'], 3.8, 15, 'Fun collection of holiday inflatables'),
  house(9, '802 Jingle Bell Rd, Lake Highlands, TX', 32.8800, -96.7500, ['Lights', 'Music', 'Animatronics'], 4.6, 34, 'Moving reindeer and a real sleigh photo op'),
  house(10, '963 Frost Ave, Oak Cliff, TX', 32.7400, -96.8200, ['Lights'], 2.8, 5, 'Simple but charming roofline lights'),
  house(11, '511 Nutcracker Ln, Greenville Ave, TX', 32.8150, -96.7700, ['Lights', 'Music', 'Blowups'], 4.3, 22, 'Nutcracker theme with march music'),
  house(12, '128 Starlight Pl, Kessler Park, TX', 32.7550, -96.8400, ['Lights', 'Animatronics'], 4.0, 17, 'Animated nativity scene with star projector'),
  house(13, '675 Gingerbread Way, M Streets, TX', 32.8050, -96.7600, ['Lights', 'Music', 'Strobes', 'Blowups'], 4.7, 51, 'Over-the-top display — every inch covered in lights'),
  house(14, '349 Sleigh Ride Dr, Northwood Hills, TX', 32.8900, -96.7800, ['Lights', 'Music'], 3.9, 11, 'Lovely neighborhood display with hot cocoa stand'),
  house(15, '888 Angel Wings Ct, Lakewood Hills, TX', 32.7980, -96.7400, ['Lights', 'Animatronics', 'Blowups'], 4.4, 27, 'Angel-themed with floating lit wings'),
  house(16, '222 Rudolph Run, White Rock, TX', 32.8200, -96.7300, ['Lights', 'Music', 'Strobes'], 4.1, 16, 'Laser light show synced to Trans-Siberian Orchestra'),
  house(17, '456 Frosty Meadow, Bishop Arts, TX', 32.7450, -96.8300, ['Lights', 'Blowups'], 3.6, 9, 'Quirky display with a giant Frosty'),
  house(18, '741 Silver Bells Dr, Devonshire, TX', 32.8500, -96.7700, ['Lights', 'Music', 'Animatronics'], 4.8, 38, 'Musical bells and animated elves workshop'),
];
