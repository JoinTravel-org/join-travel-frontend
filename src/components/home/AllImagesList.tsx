import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import api from "../../services/api.service";
import MediaGrid from "../media/MediaGrid";
import type { UserMedia } from "../../types/user";

const PAGE_SIZE = 20;

const AllImagesList: React.FC = () => {
  const [images, setImages] = useState<UserMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getRecentPublicImages(page, PAGE_SIZE);

        if (response.success && response.data) {
          setImages((prev) =>
            page === 1 ? response.data! : [...prev, ...response.data!]
          );
          setHasMore(response.data.length === PAGE_SIZE);
        } else {
          setHasMore(false);
        }
      } catch (err: unknown) {
        const errorMessage = (err as { message?: string })?.message || "";
        setError(errorMessage || "Error al cargar las imágenes");
        setImages([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [page]);

  if (loading && page === 1) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        height: images.length === 0 ? "auto" : "500px",
        display: "flex",
        flexDirection: "column",
        mt: 4,
      }}
    >
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Fotos Recientes ({images.length})
      </Typography>

      {images.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Aún no hay fotos disponibles.
          </Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              flexGrow: 1,
              maxHeight: "calc(100% - 40px)",
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
            <MediaGrid media={images} />
          </Box>

          {hasMore && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 2,
              }}
            >
              <Button
                variant="outlined"
                size="small"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={loading}
              >
                {loading ? "Cargando..." : "Cargar más"}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default AllImagesList;