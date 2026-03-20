export const VALORANT_RANKS = [
  { value: 1, name: 'Iron 1' },
  { value: 2, name: 'Iron 2' },
  { value: 3, name: 'Iron 3' },
  { value: 4, name: 'Bronze 1' },
  { value: 5, name: 'Bronze 2' },
  { value: 6, name: 'Bronze 3' },
  { value: 7, name: 'Silver 1' },
  { value: 8, name: 'Silver 2' },
  { value: 9, name: 'Silver 3' },
  { value: 10, name: 'Gold 1' },
  { value: 11, name: 'Gold 2' },
  { value: 12, name: 'Gold 3' },
  { value: 13, name: 'Platinum 1' },
  { value: 14, name: 'Platinum 2' },
  { value: 15, name: 'Platinum 3' },
  { value: 16, name: 'Diamond 1' },
  { value: 17, name: 'Diamond 2' },
  { value: 18, name: 'Diamond 3' },
  { value: 19, name: 'Ascendant 1' },
  { value: 20, name: 'Ascendant 2' },
  { value: 21, name: 'Ascendant 3' },
  { value: 22, name: 'Immortal 1' },
  { value: 23, name: 'Immortal 2' },
  { value: 24, name: 'Immortal 3' },
  { value: 25, name: 'Radiant' },
]

export function getRankName(value: number | null | undefined): string {
  if (!value) return 'Unknown Rank'
  const rank = VALORANT_RANKS.find((r) => r.value === value)
  return rank ? rank.name : 'Unknown Rank'
}

export function getRankValue(name: string): number | null {
  const rank = VALORANT_RANKS.find((r) => r.name.toLowerCase() === name.toLowerCase())
  return rank ? rank.value : null
}

export function calculateAverageRank(ranks: (number | null)[]): number {
  const validRanks = ranks.filter((r): r is number => r !== null && r !== undefined);
  if (validRanks.length === 0) return 10; // Default to Gold 1
  
  const sum = validRanks.reduce((acc, curr) => acc + curr, 0);
  return Math.round(sum / validRanks.length);
}

export const VALORANT_SERVERS = [
  'US West',
  'US East',
  'US Central',
  'EU West',
  'EU East',
  'AP/Tokyo',
  'AP/Mumbai',
]
