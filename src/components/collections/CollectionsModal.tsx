import React from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  FormatListBulleted as FormatListBulletedIcon,
  Map as MapIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface CollectionsMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

const CollectionsMenu: React.FC<CollectionsMenuProps> = ({ anchorEl, open, onClose }) => {
  const navigate = useNavigate();

  const handleNavigateToLists = () => {
    onClose();
    navigate("/lists");
  };

  const handleNavigateToItineraries = () => {
    onClose();
    navigate("/itineraries");
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      PaperProps={{
        sx: {
          minWidth: 200,
          borderRadius: 2,
          mt: 1,
        },
      }}
    >
      <MenuItem onClick={handleNavigateToLists} sx={{ py: 1.5 }}>
        <ListItemIcon>
          <FormatListBulletedIcon color="primary" />
        </ListItemIcon>
        <ListItemText>
          <Typography variant="body1" fontWeight={500}>
            Listas
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Organiza tus lugares favoritos
          </Typography>
        </ListItemText>
      </MenuItem>

      <MenuItem onClick={handleNavigateToItineraries} sx={{ py: 1.5 }}>
        <ListItemIcon>
          <MapIcon color="secondary" />
        </ListItemIcon>
        <ListItemText>
          <Typography variant="body1" fontWeight={500}>
            Itinerarios
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Planifica tus viajes
          </Typography>
        </ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default CollectionsMenu;