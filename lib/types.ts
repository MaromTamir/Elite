export type WealthTier = "affluent" | "hnw" | "uhnw" | "uuhnw";
export type VerificationStatus = "pending" | "in_review" | "verified" | "rejected";
export type Gender = "man" | "woman" | "non_binary" | "prefer_not_to_say";
export type SwipeAction = "like" | "pass" | "super_like";

export interface Profile {
  id: string;
  full_name: string;
  display_name: string;
  birth_date: string;
  gender: Gender;
  seeking: Gender[];
  location: string;
  occupation: string;
  company?: string;
  wealth_tier: WealthTier;
  net_worth_range: string;
  verified: boolean;
  verification_status: VerificationStatus;
  bio?: string;
  interests: string[];
  lifestyle: string[];
  looking_for?: string;
  avatar_url?: string;
  photos: string[];
  is_premium: boolean;
  is_admin: boolean;
  last_active?: string;
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  other_profile?: Profile;
  last_message?: Message;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  read_at?: string;
  created_at: string;
}

export interface Swipe {
  id: string;
  swiper_id: string;
  swiped_id: string;
  action: SwipeAction;
  created_at: string;
}

export const WEALTH_TIER_LABELS: Record<WealthTier, string> = {
  affluent: "Affluent ($1M–$10M)",
  hnw: "High Net Worth ($10M–$30M)",
  uhnw: "Ultra High Net Worth ($30M–$100M)",
  uuhnw: "Ultra Ultra High Net Worth ($100M+)",
};

export const WEALTH_TIER_BADGE: Record<WealthTier, string> = {
  affluent: "Affluent",
  hnw: "HNW",
  uhnw: "UHNW",
  uuhnw: "UUHNW",
};

export const LIFESTYLE_OPTIONS = [
  "Private Aviation", "Yachting", "Polo", "Fine Dining",
  "Art Collecting", "Formula 1", "Philanthropy", "Luxury Travel",
  "Equestrian", "Wine & Spirits", "Real Estate", "Entrepreneurship",
];

export const INTEREST_OPTIONS = [
  "Finance", "Technology", "Fashion", "Architecture", "Music",
  "Literature", "Fitness", "Golf", "Tennis", "Skiing",
  "Photography", "Opera", "Film", "Geopolitics", "Philosophy",
];
