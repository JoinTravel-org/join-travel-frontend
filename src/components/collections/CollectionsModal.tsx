import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import {
  FormatListBulleted as FormatListBulletedIcon,
  Map as MapIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface CollectionsModalProps {
  open: boolean;
  onClose: () => void;
}

const CollectionsModal: React.FC<CollectionsModalProps> = ({ open, onClose }) => {
  const navigate = useNavigate();

  const handleNavigateToCollections = () => {
    onClose();
    navigate("/collections");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle component="div" sx={{ textAlign: "center", pb: 1 }}>
        <Typography variant="h5" component="h2" fontWeight={600}>
          Colecciones
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Organiza tus lugares favoritos y planifica tus viajes
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pb: 3, textAlign: "center" }}>
        <Box sx={{ py: 4 }}>
          <Box
            sx={{
              bgcolor: "primary.main",
              borderRadius: "50%",
              width: 80,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <FormatListBulletedIcon sx={{ fontSize: 40, color: "white" }} />
          </Box>
          <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
            Gestiona tus Colecciones
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Crea listas de lugares favoritos y planifica itinerarios detallados para tus viajes
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
        <Button onClick={onClose} variant="outlined" size="large" sx={{ mr: 2 }}>
          Cancelar
        </Button>
        <Button
          onClick={handleNavigateToCollections}
          variant="contained"
          size="large"
          startIcon={<MapIcon />}
        >
          Ver Colecciones
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CollectionsModal;