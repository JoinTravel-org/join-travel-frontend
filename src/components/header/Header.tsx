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
  Snackbar,
  Alert,
  Slide,
  Backdrop,
  CircularProgress,
  Menu,
  MenuItem,
  Badge,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  Chat as ChatIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useAuth } from "../../hooks/useAuth";
import { useUserStats } from "../../hooks/useUserStats";
import { useChatNotifications } from "../../hooks/useChatNotifications";
import { useNotifications } from "../../hooks/useNotifications";
import Notification from "../user_profile/Notification";
import { NotificationCenter } from "../NotificationCenter";

/**
 * Accessible, responsive site header:
 * - Desktop: inline nav items + theme toggle
 * - Mobile: hamburger opens Drawer navigation with proper aria attributes
 * - Includes logo with dimensions to avoid CLS and decoding="async"
 */
const Header: React.FC = () => {
  const muiTheme = useMuiTheme();
  // Mobile: <800px (as mentioned by user)
  const isMobile = useMediaQuery(muiTheme.breakpoints.down(800));
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const { stats, loading, notification } = useUserStats();
  const { hasUnreadMessages } = useChatNotifications();
  const { unreadCount } = useNotifications();

  const [logoutSnackbarOpen, setLogoutSnackbarOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [noNotificationsDialogOpen, setNoNotificationsDialogOpen] =
    React.useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = React.useState(false);
  const { clearNotification } = useUserStats();

  console.log('Header render - isMobile:', isMobile, 'menu open:', open, 'notifications open:', notificationsDrawerOpen);

  // Search states
  const [searchQuery, setSearchQuery] = React.useState("");


  const navId = "primary-navigation";

  const toggleDrawer = (nextOpen: boolean) => () => {
    console.log('toggleDrawer called with:', nextOpen);
    setOpen(nextOpen);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await auth.logout();
      setLogoutSnackbarOpen(true);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    // Por ahora no hace nada
    handleProfileMenuClose();
    navigate("/profile");
  };

  const handleLogoutClick = async () => {
    handleProfileMenuClose();
    await handleLogout();
    navigate("/");
  };

  // Search handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (isMobile) {
        setOpen(false);
      }
    }
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (isMobile) {
        setOpen(false);
      }
    }
  };

  const NavItems = (
    <>
      <Button
        color="inherit"
        component={RouterLink}
        to="/"
        aria-current={location.pathname === "/" ? "page" : undefined}
        sx={{
          textDecoration: "none",
          position: "relative",
          transition: "all 0.3s ease",
          opacity: 1,
          "&:hover": {
            transform: "translateY(-3px)",
            opacity: 1,
          },
          "&::before": {
            content: '""',
            position: "absolute",
            zIndex: -1,
            bottom: "-1px",
            left: 0,
            right: 0,
            height: "5px",
            backgroundColor: "#A6A6A6",
            transform: "scaleY(0)",
            transformOrigin: "bottom",
            transition: "transform 0.3s ease",
          },
          "&:hover::before": {
            transform: "scaleY(1)",
          },
        }}
      >
        Inicio
      </Button>
      <Button
        color="inherit"
        component={RouterLink}
        to="/add-place"
        aria-current={location.pathname === "/add-place" ? "page" : undefined}
        sx={{
          textDecoration: "none",
          position: "relative",
          transition: "all 0.3s ease",
          opacity: 1,
          "&:hover": {
            transform: "translateY(-3px)",
            opacity: 1,
          },
          "&::before": {
            content: '""',
            position: "absolute",
            zIndex: -1,
            bottom: "-1px",
            left: 0,
            right: 0,
            height: "5px",
            backgroundColor: "#A6A6A6",
            transform: "scaleY(0)",
            transformOrigin: "bottom",
            transition: "transform 0.3s ease",
          },
          "&:hover::before": {
            transform: "scaleY(1)",
          },
        }}
      >
        Agregar Lugar
      </Button>
      <Button
        color="inherit"
        onClick={() => navigate("/collections")}
        sx={{
          textDecoration: "none",
          position: "relative",
          transition: "all 0.3s ease",
          opacity: 1,
          "&:hover": {
            transform: "translateY(-3px)",
            opacity: 1,
          },
          "&::before": {
            content: '""',
            position: "absolute",
            zIndex: -1,
            bottom: "-1px",
            left: 0,
            right: 0,
            height: "5px",
            backgroundColor: "#A6A6A6",
            transform: "scaleY(0)",
            transformOrigin: "bottom",
            transition: "transform 0.3s ease",
          },
          "&:hover::before": {
            transform: "scaleY(1)",
          },
        }}
      >
        Colecciones
      </Button>
      {auth.isAuthenticated ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/groups"
            aria-current={location.pathname === "/groups" ? "page" : undefined}
            sx={{
              textDecoration: "none",
              position: "relative",
              transition: "all 0.3s ease",
              opacity: 1,
              "&:hover": {
                transform: "translateY(-3px)",
                opacity: 1,
              },
              "&::before": {
                content: '""',
                position: "absolute",
                zIndex: -1,
                bottom: "-1px",
                left: 0,
                right: 0,
                height: "5px",
                backgroundColor: "#A6A6A6",
                transform: "scaleY(0)",
                transformOrigin: "bottom",
                transition: "transform 0.3s ease",
              },
              "&:hover::before": {
                transform: "scaleY(1)",
              },
            }}
          >
            Grupos
          </Button>
          <IconButton
            color="inherit"
            component={RouterLink}
            to="/chats"
            aria-label="Mensajes"
            sx={{
              ml: 1,
              textDecoration: "none",
              position: "relative",
              transition: "all 0.3s ease",
              opacity: 1,
              "&:hover": {
                transform: "translateY(-3px)",
                opacity: 1,
              },
              "&::before": {
                content: '""',
                position: "absolute",
                zIndex: -1,
                bottom: "-1px",
                left: 0,
                right: 0,
                height: "5px",
                backgroundColor: "#A6A6A6",
                transform: "scaleY(0)",
                transformOrigin: "bottom",
                transition: "transform 0.3s ease",
              },
              "&:hover::before": {
                transform: "scaleY(1)",
              },
            }}
          >
            <Badge color="error" variant="dot" invisible={!hasUnreadMessages}>
              <ChatIcon />
            </Badge>
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleProfileMenuOpen}
            aria-label="Perfil"
            sx={{
              ml: 0,
              textDecoration: "none",
              position: "relative",
              transition: "all 0.3s ease",
              opacity: 1,
              "&:hover": {
                transform: "translateY(-3px)",
                opacity: 1,
              },
              "&::before": {
                content: '""',
                position: "absolute",
                zIndex: -1,
                bottom: "-1px",
                left: 0,
                right: 0,
                height: "5px",
                backgroundColor: "#A6A6A6",
                transform: "scaleY(0)",
                transformOrigin: "bottom",
                transition: "transform 0.3s ease",
              },
              "&:hover::before": {
                transform: "scaleY(1)",
              },
            }}
          >
            <PersonIcon />
          </IconButton>
        </Box>
      ) : (
        <>
          <Button
            color="inherit"
            component={RouterLink}
            to="/login"
            aria-current={location.pathname === "/login" ? "page" : undefined}
            sx={{
              textDecoration: "none",
              position: "relative",
              transition: "all 0.3s ease",
              opacity: 1,
              "&:hover": {
                transform: "translateY(-3px)",
                opacity: 1,
              },
              "&::before": {
                content: '""',
                position: "absolute",
                zIndex: -1,
                bottom: "-1px",
                left: 0,
                right: 0,
                height: "5px",
                backgroundColor: "#A6A6A6",
                transform: "scaleY(0)",
                transformOrigin: "bottom",
                transition: "transform 0.3s ease",
              },
              "&:hover::before": {
                transform: "scaleY(1)",
              },
            }}
          >
            Iniciar Sesión
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/register"
            aria-current={
              location.pathname === "/register" ? "page" : undefined
            }
            sx={{
              textDecoration: "none",
              position: "relative",
              opacity: 1,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                opacity: 1,
              },
              "&::before": {
                content: '""',
                position: "absolute",
                zIndex: -1,
                bottom: "-1px",
                left: 0,
                right: 0,
                height: "5px",
                backgroundColor: "#A6A6A6",
                transform: "scaleY(0)",
                transformOrigin: "bottom",
                transition: "transform 0.3s ease",
              },
              "&:hover::before": {
                transform: "scaleY(1)",
              },
            }}
          >
            Registrarse
          </Button>
        </>
      )}
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
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "inherit",
              opacity: 1,
              transition: "opacity 0.2s ease",
              "&:hover": {
                opacity: 0.85,
              },
              ":focus-visible": {
                outline: "none",
                boxShadow: "0 0 0 3px var(--focus-ring-color)",
                borderRadius: "var(--radius-sm)",
              },
            }}
          >
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
              sx={{
                fontWeight: 700,
                color: "inherit",
              }}
            >
              JoinTravel
            </Typography>
          </Box>
        </Box>

        {/* Search Bar - Desktop only */}
        {!isMobile && (
          <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
            <TextField
              placeholder="Buscar usuarios o lugares..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
              size="small"
              sx={{
                width: 300,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "inherit",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.7)",
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "rgba(255, 255, 255, 0.7)",
                  opacity: 1,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery.trim() ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleSearchClick}
                      sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Box>
        )}

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
        {!isMobile && (
          <IconButton
            color="inherit"
            onClick={() => setNotificationsDrawerOpen(true)}
            aria-label="Notificaciones"
            sx={{
              textDecoration: "none",
              position: "relative",
              transition: "all 0.3s ease",
              opacity: 1,
              "&:hover": {
                transform: "translateY(-3px)",
                opacity: 1,
              },
              "&::before": {
                content: '""',
                position: "absolute",
                zIndex: -1,
                bottom: "-1px",
                left: 0,
                right: 0,
                height: "5px",
                backgroundColor: "#A6A6A6",
                transform: "scaleY(0)",
                transformOrigin: "bottom",
                transition: "transform 0.3s ease",
              },
              "&:hover::before": {
                transform: "scaleY(1)",
              },
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        )}


        {/* Mobile toggle */}
        {isMobile && (
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label={
              open ? "Cerrar menú de navegación" : "Abrir menú de navegación"
            }
            aria-controls={navId}
            aria-expanded={open ? "true" : "false"}
            onClick={() => {
              console.log('Hamburger menu clicked');
              // Close notifications when opening menu to avoid conflicts
              setNotificationsDrawerOpen(false);
              toggleDrawer(true)();
            }}
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
            zIndex: 1200, // Ensure proper z-index for menu drawer
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
          {/* Search Bar - Mobile */}
          <Box sx={{ px: 2, pb: 2 }}>
            <TextField
              placeholder="Buscar usuarios o lugares..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
              size="small"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                  color: "text.primary",
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.23)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "primary.main",
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "text.secondary",
                  opacity: 1,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery.trim() ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleSearchClick}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Box>
          <Divider />
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
              to="/add-place"
              selected={location.pathname === "/add-place"}
              onClick={toggleDrawer(false)}
            >
              <ListItemText primary="Agregar Lugar" />
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                navigate("/collections");
                toggleDrawer(false)();
              }}
            >
              <ListItemText primary="Colecciones" />
            </ListItemButton>
            {auth.isAuthenticated ? (
              <>
                <ListItemButton
                  component={RouterLink}
                  to="/groups"
                  selected={location.pathname === "/groups"}
                  onClick={toggleDrawer(false)}
                >
                  <ListItemText primary="Grupos" />
                </ListItemButton>
                <ListItemButton
                  component={RouterLink}
                  to="/chats"
                  selected={location.pathname === "/chats"}
                  onClick={toggleDrawer(false)}
                >
                  <ListItemText primary="Mensajes Directos" />
                </ListItemButton>
                <ListItemButton
                  onClick={() => {
                    console.log('Opening notifications drawer from mobile menu');
                    toggleDrawer(false)();
                    // Direct open without delay for mobile
                    setNotificationsDrawerOpen(true);
                  }}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <ListItemText primary="Notificaciones" />
                  <Badge badgeContent={unreadCount} color="error" sx={{ fontSize: '1rem' }} />
                </ListItemButton>
                <ListItemButton
                  component={RouterLink}
                  to="/profile"
                  onClick={() => {
                    toggleDrawer(false);
                    navigate("/profile");
                  }}
                >
                  <ListItemText primary="Mi perfil" />
                </ListItemButton>
                <ListItemButton
                  onClick={() => {
                    handleLogout();
                    toggleDrawer(false)();
                    navigate("/");
                  }}
                >
                  <ListItemText primary="Cerrar sesión" />
                </ListItemButton>
              </>
            ) : (
              <>
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
              </>
            )}
          </List>
        </Box>
      </Drawer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        {/* User Email */}
        <Typography
          sx={{
            px: 2,
            pt: 1.5,
            pb: 0.5,
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "text.primary",
          }}
        >
          {auth.user?.email && auth.user.email.length > 10
            ? `${auth.user.email.substring(0, 10)}...`
            : auth.user?.email || "Usuario"}
        </Typography>
        {/* User Level */}
        <Typography
          sx={{
            px: 2,
            pb: 1,
            fontSize: "0.75rem",
            color: "text.secondary",
          }}
        >
          {loading
            ? "(...)"
            : stats
            ? `Lv.${stats.level} ${stats.levelName}`
            : "Lv.0"}
        </Typography>
        <Divider />
        <MenuItem onClick={handleProfileClick}>Mi perfil</MenuItem>
        <MenuItem onClick={handleLogoutClick}>Cerrar sesión</MenuItem>
      </Menu>

      <Snackbar
        open={logoutSnackbarOpen}
        autoHideDuration={4000}
        onClose={() => setLogoutSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={(props) => <Slide {...props} direction="up" />}
        transitionDuration={500}
      >
        <Alert
          onClose={() => setLogoutSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Sesión cerrada exitosamente.
        </Alert>
      </Snackbar>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoggingOut}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <NotificationCenter
        open={notificationsDrawerOpen}
        onOpenChange={setNotificationsDrawerOpen}
        showIconButton={false}
      />

      {/* Global Level Up Notification */}
      <Notification
        notification={notification}
        onClose={clearNotification}
        autoHideDuration={30000} // 30 seconds
      />

      <Dialog
        open={noNotificationsDialogOpen}
        onClose={() => setNoNotificationsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Notificaciones</DialogTitle>
        <Box sx={{ px: 3, pb: 2 }}>
          <Typography>No hay notificaciones nuevas.</Typography>
        </Box>
        <DialogActions>
          <Button onClick={() => setNoNotificationsDialogOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Header;
