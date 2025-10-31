export interface UserStats {
  points: number;
  level: number;
  levelName: string;
  progressToNext: number; // Percentage to next level (0-100)
  badges: string[];
}

export interface User {
  id: string;
  email: string;
  isEmailConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: UserStats;
}

export interface LevelUpNotification {
  newLevel: number;
  levelName: string;
  message: string;
}

export interface UserStatsResponse {
  success: boolean;
  data?: UserStats;
  message?: string;
  notification?: LevelUpNotification;
}