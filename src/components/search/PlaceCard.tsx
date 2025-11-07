import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Chip,
} from "@mui/material";
import { LocationOn as LocationIcon, Place as PlaceIcon } from "@mui/icons-material";
import { Rating } from "@fluentui/react-rating";
import type { Place } from "../../types/place";

interface PlaceCardProps {
  place: Place;
  onClick?: () => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onClick }) => {
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
          <PlaceIcon />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {place.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
            <LocationIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {place.address}
            </Typography>
          </Box>
          {place.city && (
            <Chip
              label={place.city}
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ mt: 0.5 }}
            />
          )}
          {place.rating && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
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
          <Typography variant="body2" color="text.secondary">
            Agregado {new Date(place.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PlaceCard;