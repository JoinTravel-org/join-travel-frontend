import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  CircularProgress,
  Rating,
  Button,
  TextField,
  Paper,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import api from "../services/api.service";
import type { Place } from "../types/place";

const PlaceDetail: React.FC = () => {
  const INFO_NOT_AVAILABLE = "Información no disponible temporalmente";
  const { id } = useParams<{ id: string }>();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        if (!id) return;
        const response = await api.getPlaceById(id);
        setPlace(response.data || response);
      } catch (error) {
        console.error("Error fetching place:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlace();
  }, [id]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );

  if (!place)
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5">No se encontró el lugar.</Typography>
      </Container>
    );

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* ===== Main Two-Column Layout ===== */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "flex-start",
          gap: 4,
        }}
      >
        {/* ===== LEFT COLUMN: Place Info ===== */}
        <Card
          sx={{
            flex: { xs: "1 1 100%", md: "1 1 45%" },
            borderRadius: 3,
            boxShadow: 3,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              height: 500,
              backgroundImage: `url(${
                place.image || "/placeholder-image.jpg"
              })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <CardContent sx={{ textAlign: "left" }}>
            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
              gutterBottom
            >
              {place.name}
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight={300}>
              {place.city || INFO_NOT_AVAILABLE}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "flex-start", mt: 1 }}>
              <Rating value={place.rating || 0} readOnly size="small" />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {place.rating?.toFixed(1) || "0.0"} (124 Reseñas)
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {place.description ||
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi."}
            </Typography>
          </CardContent>
        </Card>

        {/* ===== RIGHT COLUMN: Add Review + Reviews ===== */}
        <Box
          sx={{
            flex: { xs: "1 1 100%", md: "1 1 55%" },
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* --- Add Review Card --- */}
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              Escribir una Reseña
            </Typography>
            <Rating size="large" />
            <TextField
              multiline
              minRows={3}
              placeholder="Comparte tu experiencia..."
              fullWidth
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<PhotoCamera />}
                sx={{ textTransform: "none" }}
              >
                Añadir Fotos
              </Button>
              <Button
                variant="outlined"
                startIcon={<VideoLibraryIcon />}
                sx={{ textTransform: "none" }}
              >
                Videos
              </Button>
            </Box>
            <Button variant="contained" sx={{ alignSelf: "flex-start" }}>
              Publicar Reseña
            </Button>
          </Paper>

          {/* --- Reviews List --- */}
          <Box
            sx={{
              height: "400px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Reseñas de Usuarios
            </Typography>

            <Box
              sx={{
                flexGrow: 1,
                maxHeight: "calc(100% - 40px)", // Account for the header
                overflowY: "auto",
                pr: 1,
                "&::-webkit-scrollbar": {
                  width: 6,
                  backgroundColor: "rgba(0,0,0,0.05)",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(0,0,0,0.2)",
                  borderRadius: 3,
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.3)",
                  },
                },
                "&::-webkit-scrollbar-track": {
                  borderRadius: 3,
                },
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 2,
                  width: "100%",
                  pb: 2,
                }}
              >
                {[...Array(10)].map((_, i) => (
                  <Card
                    key={i}
                    sx={{
                      borderRadius: 2,
                      p: 1.5,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.02)",
                      },
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {" "}
                      {/* Changed from subtitle1 to body2 */}
                      Usuario X ({Math.floor(Math.random() * 5) + 1}/5)
                    </Typography>
                    <Rating size="small" readOnly />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "x-small" }}
                    >
                      {" "}
                      {/* Added smaller font size */}
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Pellentesque vel felis nec justo tristique luctus.
                    </Typography>
                  </Card>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default PlaceDetail;
