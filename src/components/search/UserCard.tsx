import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import type { User } from "../../types/user";
import UserAvatar from "../common/UserAvatar";

interface UserCardProps {
  user: User;
  onClick?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onClick }) => {
  return (
    <Card
      sx={{
        cursor: onClick ? "pointer" : "default",
        "&:hover": {
          boxShadow: onClick ? 3 : 1,
        },
        transition: "box-shadow 0.2s ease",
      }}
      onClick={onClick}
    >
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <UserAvatar user={user} size={50} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" component="h3">
            {user.name || 'Usuario sin nombre'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
          {user.age && (
            <Typography variant="caption" color="text.secondary">
              {user.age} años
            </Typography>
          )}
          {user.stats && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
              <Chip
                label={`Lv.${user.stats.level} ${user.stats.levelName}`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Typography variant="body2" color="text.secondary">
                {user.stats.points} puntos
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserCard;