import React from "react";
import {
  Box,
  Typography,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
} from "@mui/material";
import { LocationOn as LocationIcon, Place as PlaceIcon } from "@mui/icons-material";
import { Rating } from "@fluentui/react-rating";
import type { Place } from "../../types/place";

interface PlacePreviewCardProps {
  place: Place & { distance?: number };
  onClick?: () => void;
}

const PlacePreviewCard: React.FC<PlacePreviewCardProps> = ({ place, onClick }) => {
  return (
    <ListItem
      sx={{
        cursor: onClick ? "pointer" : "default",
        "&:hover": {
          bgcolor: "action.hover",
        },
        borderRadius: 1,
        px: 2,
        py: 1.5,
      }}
      onClick={onClick}
    >
      <ListItemAvatar>
        <Avatar
          src={place.image || undefined}
          sx={{ bgcolor: "primary.main", width: 48, height: 48 }}
          alt={place.name}
        >
          <PlaceIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
              {place.name}
            </Typography>
            {place.distance && (
              <Chip
                label={`${place.distance.toFixed(1)} km`}
                size="small"
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>
        }
        secondary={
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
              <LocationIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                {place.address}
              </Typography>
            </Box>
            {place.rating && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Rating
                  size="small"
                  color="marigold"
                  max={5}
                  value={place.rating}
                  style={{ pointerEvents: 'none' }}
                />
                <Typography variant="body2" color="text.secondary">
                  ({place.rating.toFixed(1)})
                </Typography>
              </Box>
            )}
          </Box>
        }
      />
    </ListItem>
  );
};

export default PlacePreviewCard;