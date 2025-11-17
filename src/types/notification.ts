export const NotificationType = {
  NEW_MESSAGE: "NEW_MESSAGE",
  NEW_GROUP_MESSAGE: "NEW_GROUP_MESSAGE",
  NEW_FOLLOWER: "NEW_FOLLOWER",
  NEW_ITINERARY: "NEW_ITINERARY",
  GROUP_INVITE: "GROUP_INVITE",
  EXPENSE_ADDED: "EXPENSE_ADDED",
  EXPENSE_ASSIGNED: "EXPENSE_ASSIGNED",
  LEVEL_UP: "LEVEL_UP",
  NEW_BADGE: "NEW_BADGE",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface NotificationResponse {
  success: boolean;
  data?: Notification;
  message?: string;
}

export interface NotificationListResponse {
  success: boolean;
  data?: {
    notifications: Notification[];
    unreadCount: number;
  };
  message?: string;
}
