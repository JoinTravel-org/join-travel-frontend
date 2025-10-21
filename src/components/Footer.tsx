import React from "react";
import { Box, Container, Divider, Link as MUILink, Stack, Typography } from "@mui/material";

/**
 * Site Footer with semantic & accessible structure.
 * - Uses tokens for color/spacing
 * - Provides visible focus styles
 * - Minimal links to avoid broken navigation; replace with real routes when available
 */
const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      role="contentinfo"
      sx={{
        mt: "auto",
        backgroundColor: "var(--color-surface)",
        color: "var(--color-text)",
        borderTop: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 3, sm: 4 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            © {year} JoinTravel. Todos los derechos reservados.
          </Typography>
          <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: "var(--color-text-secondary)" }}>
            Hecho con ❤️ pensando en accesibilidad y rendimiento.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={3}
          sx={{ justifyContent: { xs: "flex-start", sm: "flex-end" }, alignItems: "center" }}
        >
          <MUILink
            href="mailto:contacto@jointravel.example"
            underline="hover"
            sx={{
              color: "var(--color-link)",
              "&:hover": { color: "var(--color-link-hover)" },
              "&:focus-visible": {
                outline: "none",
                boxShadow: "0 0 0 3px var(--focus-ring-color)",
                borderRadius: "var(--radius-sm)",
              },
            }}
          >
            Contacto
          </MUILink>
          <MUILink
            href="https://twitter.com/intent/tweet?text=Explora%20el%20mundo%20con%20JoinTravel"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{
              color: "var(--color-link)",
              "&:hover": { color: "var(--color-link-hover)" },
              "&:focus-visible": {
                outline: "none",
                boxShadow: "0 0 0 3px var(--focus-ring-color)",
                borderRadius: "var(--radius-sm)",
              },
            }}
            aria-label="Compartir en Twitter (se abre en una nueva pestaña)"
          >
            Compartir
          </MUILink>
          <MUILink
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{
              color: "var(--color-link)",
              "&:hover": { color: "var(--color-link-hover)" },
              "&:focus-visible": {
                outline: "none",
                boxShadow: "0 0 0 3px var(--focus-ring-color)",
                borderRadius: "var(--radius-sm)",
              },
            }}
            aria-label="Código fuente en GitHub (se abre en una nueva pestaña)"
          >
            Código
          </MUILink>
        </Stack>
      </Container>

      <Divider sx={{ opacity: 0.08 }} />

      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "var(--color-text-secondary)",
          }}
        >
          Esta web respeta tu privacidad. No se cargan scripts de seguimiento invasivos.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;