export interface Badge {
  name: string;
  description: string;
  earned_at: string;
  iconUrl?: string;
}

export interface UserStats {
  points: number;
  level: number;
  levelName: string;
  progressToNext: number; // Percentage to next level (0-100)
  badges: Badge[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  isEmailConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: UserStats;
  followersCount?: number;
  followingCount?: number;
}

export interface LevelUpNotification {
  newLevel: number;
  levelName: string;
  message: string;
  newBadges?: string[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  progress: number; // Current progress (e.g., 0-100 or count)
  target: number; // Target to complete (e.g., 100 or 5)
  isCompleted: boolean;
  category: "badge" | "level"; // What it leads to
  badgeName?: string; // If category is badge
  levelRequired?: number; // If category is level
  instructions: string[]; // Step-by-step instructions
}

export interface MilestonesResponse {
  success: boolean;
  data?: Milestone[];
  message?: string;
}

export interface UserStatsResponse {
  success: boolean;
  data?: UserStats;
  message?: string;
  notification?: LevelUpNotification;
}

export interface UserMedia {
  id: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  url: string;
  createdAt: string;
}

export interface UserMediaResponse {
  success: boolean;
  data?: UserMedia[];
  message?: string;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
}

export interface FollowStatsResponse {
  success: boolean;
  data?: FollowStats;
  message?: string;
}

export interface IsFollowingResponse {
  success: boolean;
  data?: {
    isFollowing: boolean;
  };
  message?: string;
}
