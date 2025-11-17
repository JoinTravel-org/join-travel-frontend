import { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Badge,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useNotifications } from "../hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "NEW_MESSAGE":
      case "NEW_GROUP_MESSAGE":
        return "💬";
      case "NEW_FOLLOWER":
        return "👤";
      case "NEW_ITINERARY":
        return "🗺️";
      case "GROUP_INVITE":
        return "👥";
      case "EXPENSE_ADDED":
      case "EXPENSE_ASSIGNED":
        return "💰";
      case "LEVEL_UP":
        return "⬆️";
      case "NEW_BADGE":
        return "🏆";
      default:
        return "🔔";
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Drawer anchor="right" open={open} onClose={handleClose}>
        <Box
          sx={{
            width: 400,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="h6">Notificaciones</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Actions */}
          {unreadCount > 0 && (
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <Button
                startIcon={<MarkEmailReadIcon />}
                onClick={handleMarkAllAsRead}
                size="small"
              >
                Marcar todas como leídas
              </Button>
            </Box>
          )}

          {/* Notifications List */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />
              </Box>
            ) : notifications.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  p: 3,
                }}
              >
                <NotificationsIcon
                  sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  No tienes notificaciones
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {notifications.map((notification, index) => (
                  <Box key={notification.id}>
                    <ListItem
                      sx={{
                        bgcolor: notification.read
                          ? "transparent"
                          : "action.hover",
                        px: 2,
                        py: 1.5,
                      }}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => handleDelete(notification.id)}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemButton
                        onClick={() =>
                          !notification.read &&
                          handleMarkAsRead(notification.id)
                        }
                        sx={{ p: 0, pr: 1 }}
                      >
                        <Box sx={{ display: "flex", gap: 1.5, width: "100%" }}>
                          <Box sx={{ fontSize: 24, flexShrink: 0 }}>
                            {getNotificationIcon(notification.type)}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: notification.read ? 400 : 600,
                                mb: 0.5,
                              }}
                            >
                              {notification.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {notification.message}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              sx={{ mt: 0.5 }}
                            >
                              {formatDistanceToNow(
                                new Date(notification.createdAt),
                                {
                                  addSuffix: true,
                                  locale: es,
                                }
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      </ListItemButton>
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
};
