import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Button,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import apiService from "../../services/api.service";
import type { List } from "../../types/list";

const ListDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useAuth();
  const hasCheckedAuth = React.useRef(false);

  const [list, setList] = useState<List | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      if (!auth.isLoading && !auth.isAuthenticated) {
        navigate("/login");
      }
    }
  }, [auth.isAuthenticated, auth.isLoading, navigate]);

  // Fetch list details on component mount
  useEffect(() => {
    const fetchList = async () => {
      if (!id) {
        console.log("ListDetail: No id provided");
        return;
      }

      if (!auth.isAuthenticated) {
        console.log("ListDetail: User not authenticated");
        return;
      }

      console.log("ListDetail: Fetching list with id:", id);
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.getListById(id);
        console.log("ListDetail: Response received:", response);

        if (response.success && response.data) {
          setList(response.data);
        } else {
          setError("No se pudo cargar la lista.");
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error desconocido al cargar la lista";
        setError(`Error al cargar la lista: ${errorMessage}`);
        console.error("Error fetching list:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [auth.isAuthenticated, id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;

    setDeleting(true);
    setError(null);

    try {
      await apiService.deleteList(id);
      setDeleteDialogOpen(false);
      navigate("/lists");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error desconocido al eliminar la lista";
      setError(`Error al eliminar la lista: ${errorMessage}`);
      console.error("Error deleting list:", err);
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          ¿Eliminar lista?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            ¿Estás seguro de que deseas eliminar esta lista? Esta acción no
            se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            autoFocus
          >
            {deleting ? <CircularProgress size={20} /> : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
            "& > *": {
              width: { xs: "100%", sm: "auto" },
            },
          }}
        >
          <Button variant="outlined" onClick={() => navigate("/collections")}>
            ← Volver a Listas
          </Button>
          {!loading && !error && list && list.userId === auth.user?.id && (
            <Box
              sx={{
                display: "flex",
                gap: 2,
                width: { xs: "100%", sm: "auto" },
                "& > *": {
                  flex: { xs: 1, sm: "none" },
                },
              }}
            >
              <Button
                variant="contained"
                onClick={() => navigate(`/list/${id}/edit`)}
              >
                Editar Lista
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteClick}
              >
                Eliminar
              </Button>
            </Box>
          )}
        </Box>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && list && (
          <>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                mb: 2,
                fontSize: { xs: '1.8rem', sm: '2.125rem' },
                wordBreak: 'break-word'
              }}
            >
              {list.title}
            </Typography>

            {list.description && (
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  fontSize: { xs: "1rem", sm: "1.1rem" },
                  lineHeight: 1.6,
                  wordBreak: 'break-word'
                }}
              >
                {list.description}
              </Typography>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Creado: {formatDate(list.createdAt)}
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Lugares en la Lista ({list.places.length})
              </Typography>

              {list.places.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Esta lista aún no tiene lugares.
                </Typography>
              ) : (
                <Box
                  sx={{
                    mt: 2,
                    display: "grid",
                    gap: { xs: 3, md: 4 },
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(3, 1fr)",
                      lg: "repeat(4, 1fr)",
                    },
                  }}
                >
                  {list.places.map((place) => (
                    <Card
                      key={place.id}
                      onClick={() => window.open(`/place/${place.id}`, "_blank")}
                      elevation={0}
                      sx={{
                        height: "100%",
                        display: "flex",
                        cursor: "pointer",
                        flexDirection: "column",
                        border: "2px solid #000",
                        borderRadius: 2,
                        backgroundColor: "#fff",
                        boxShadow: "6px 6px 4px 0px rgba(0,0,0,0.7)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translate(-2px, -2px)",
                          boxShadow: "8px 8px 6px 0px rgba(0,0,0,0.7)",
                          borderColor: "#333",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          height: 200,
                          backgroundImage: `url(${
                            place.image || "/placeholder-image.jpg"
                          })`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundColor: "#f0f0f0",
                          borderBottom: "2px solid #000",
                        }}
                        onError={(e: any) => {
                          const target = e.target as HTMLDivElement;
                          target.style.backgroundImage = "url(/placeholder-image.jpg)";
                        }}
                      />
                      <CardContent sx={{ flexGrow: 1, p: 3, backgroundColor: "#fff" }}>
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            fontWeight: 700,
                            mb: 2,
                            fontSize: { xs: "1.1rem", sm: "1.25rem" },
                            letterSpacing: "0.02em",
                            color: "#000",
                            wordBreak: 'break-word'
                          }}
                        >
                          {place.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            fontSize: "0.9rem",
                          }}
                        >
                          {place.address}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          </>
        )}
      </Container>
    </>
  );
};

export default ListDetail;