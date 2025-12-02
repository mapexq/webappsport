// Types for the Sports Betting App

export interface Bookmaker {
  id: number;
  name: string;
  logo: string;
  logoImage?: string;
  rating: number;
  bonus: string;
  bonusAmount: number;
  features: string[];
  license: string;
}

export interface Prediction {
  id: number;
  eventName: string;
  discipline: string;
  tournament: string;
  expert: {
    name: string;
    avatar: string;
    status: 'amateur' | 'expert';
    winRate: number;
  };
  prediction: string;
  odds: number;
  comment: string;
  source: string;
  timestamp: string;
}

export interface News {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  timestamp: string;
  readTime: number;
}

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  timestamp: string;
  readTime: number;
}

export type TabType = 'bonuses' | 'predictions' | 'news' | 'articles';
export type ConnectionIssue = 'offline' | 'vpn' | 'region' | null;

