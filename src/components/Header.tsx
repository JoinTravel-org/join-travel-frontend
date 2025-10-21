import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { Menu as MenuIcon, Close as CloseIcon } from "@mui/icons-material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import ThemeToggle from "./ThemeToggle";

/**
 * Accessible, responsive site header:
 * - Desktop: inline nav items + theme toggle
 * - Mobile: hamburger opens Drawer navigation with proper aria attributes
 * - Includes logo with dimensions to avoid CLS and decoding="async"
 */
const Header: React.FC = () => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const [open, setOpen] = React.useState(false);
  const location = useLocation();

  const navId = "primary-navigation";

  const toggleDrawer = (nextOpen: boolean) => () => {
    setOpen(nextOpen);
  };

  const NavItems = (
    <>
      <Button
        color="inherit"
        component={RouterLink}
        to="/"
        aria-current={location.pathname === "/" ? "page" : undefined}
      >
        Inicio
      </Button>
      <Button
        color="inherit"
        component={RouterLink}
        to="/login"
        aria-current={location.pathname === "/login" ? "page" : undefined}
      >
        Iniciar Sesión
      </Button>
      <Button
        color="inherit"
        component={RouterLink}
        to="/register"
        aria-current={location.pathname === "/register" ? "page" : undefined}
      >
        Registrarse
      </Button>
      <ThemeToggle />
    </>
  );

  return (
    <AppBar
      position="sticky"
      color="primary"
      component="header"
      elevation={2}
      sx={{
        backgroundColor: "var(--color-primary)",
        color: "var(--color-primary-contrast)",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <img
            src="/logo.png"
            alt="JoinTravel"
            width={36}
            height={36}
            decoding="async"
            loading="eager"
            fetchPriority="high"
            style={{ display: "block", marginRight: 12 }}
          />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              fontWeight: 700,
              color: "inherit",
              textDecoration: "none",
              ":focus-visible": {
                outline: "none",
                boxShadow: "0 0 0 3px var(--focus-ring-color)",
                borderRadius: "var(--radius-sm)",
              },
            }}
          >
            JoinTravel
          </Typography>
        </Box>

        {/* Desktop nav */}
        {!isMobile && (
          <Box
            component="nav"
            aria-label="Primaria"
            id={navId}
            sx={{ display: "flex", gap: 2, alignItems: "center" }}
          >
            {NavItems}
          </Box>
        )}

        {/* Mobile toggle */}
        {isMobile && (
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label={open ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            aria-controls={navId}
            aria-expanded={open ? "true" : "false"}
            onClick={toggleDrawer(true)}
            sx={{
              "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer(false)}
        PaperProps={{
          id: navId,
          role: "dialog",
          "aria-label": "Navegación principal",
          sx: {
            width: "min(85vw, 320px)",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Navegación
          </Typography>
          <IconButton
            aria-label="Cerrar menú"
            onClick={toggleDrawer(false)}
            sx={{
              "&:hover": { backgroundColor: "rgba(0,0,0,0.05)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box
          component="nav"
          aria-label="Primaria móvil"
          sx={{ display: "block", py: 1 }}
        >
          <List role="list">
            <ListItemButton
              component={RouterLink}
              to="/"
              selected={location.pathname === "/"}
              onClick={toggleDrawer(false)}
            >
              <ListItemText primary="Inicio" />
            </ListItemButton>
            <ListItemButton
              component={RouterLink}
              to="/login"
              selected={location.pathname === "/login"}
              onClick={toggleDrawer(false)}
            >
              <ListItemText primary="Iniciar Sesión" />
            </ListItemButton>
            <ListItemButton
              component={RouterLink}
              to="/register"
              selected={location.pathname === "/register"}
              onClick={toggleDrawer(false)}
            >
              <ListItemText primary="Registrarse" />
            </ListItemButton>
          </List>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ px: 2, py: 1 }}>
            <ThemeToggle />
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Header;