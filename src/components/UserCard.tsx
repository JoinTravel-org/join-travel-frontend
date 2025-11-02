import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Chip,
} from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import type { User } from "../types/user";

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
        <Avatar sx={{ bgcolor: "primary.main" }}>
          <PersonIcon />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {user.email}
          </Typography>
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
          <Typography variant="body2" color="text.secondary">
            Miembro desde {new Date(user.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserCard;