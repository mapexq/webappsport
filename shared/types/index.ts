// Bookmaker types
export interface Bookmaker {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  websiteUrl: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Forecast types
export type ForecastStatus = 'PENDING' | 'WON' | 'LOST' | 'CANCELLED';

export interface Forecast {
  id: string;
  bookmakerId: string;
  sport: string;
  league: string;
  match: string;
  predictionType: string;
  predictionValue: string;
  odds: number;
  status: ForecastStatus;
  matchDate: string;
  result?: string;
  createdAt?: string;
  updatedAt?: string;
}

// News types
export interface News {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  sourceUrl?: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  views: number;
  createdAt?: string;
  updatedAt?: string;
}

// Article types
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  authorId?: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  views: number;
  readingTime: number;
  createdAt?: string;
  updatedAt?: string;
}

