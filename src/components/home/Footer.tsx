import React from "react";
import { Box, Container, Divider, Link as MUILink, Stack, Typography } from "@mui/material";
import { Email, GitHub } from "@mui/icons-material";

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
          py: { xs: 0.5, sm: 1 },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
          alignItems: "center",
          gap: { xs: 1, sm: 2 },
        }}
      >
        <Box>
          <Typography variant="caption" sx={{ opacity: 0.9, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
            © {year} JoinTravel • Hecho con ❤️ por el equipo de JoinTravel
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={{ xs: 2, sm: 3 }}
          sx={{ justifyContent: { xs: "flex-start", sm: "flex-end" }, alignItems: "center" }}
        >
          <MUILink
            href="mailto:contact@jointravel.world"
            underline="hover"
            sx={{
              color: "var(--color-link)",
              "&:hover": { color: "var(--color-link-hover)" },
              "&:focus-visible": {
                outline: "none",
                boxShadow: "0 0 0 3px var(--focus-ring-color)",
                borderRadius: "var(--radius-sm)",
              },
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            <Email fontSize="small" />
            Contacto
          </MUILink>
          <MUILink
            href="https://github.com/JoinTravel-org/join-travel-frontend"
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
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
            aria-label="Código fuente en GitHub (se abre en una nueva pestaña)"
          >
            <GitHub fontSize="small" />
            Código
          </MUILink>
        </Stack>
      </Container>

      <Divider sx={{ opacity: 0.08 }} />

      <Container maxWidth="lg" sx={{ py: { xs: 0.25, sm: 0.5 } }}>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "var(--color-text-secondary)",
            fontSize: { xs: "0.7rem", sm: "0.75rem" },
            textAlign: "center",
          }}
        >
          Esta web respeta tu privacidad. No se cargan scripts de seguimiento invasivos.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;