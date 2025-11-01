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
} from "@mui/material";
import { Menu as MenuIcon, Close as CloseIcon, Person as PersonIcon, Notifications as NotificationsIcon } from "@mui/icons-material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../hooks/useAuth";
import { useUserStats } from "../hooks/useUserStats";
import Notification from "./Notification";

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
    const navigate = useNavigate();
    const auth = useAuth();
    const { stats, loading, notification } = useUserStats();

    const [logoutSnackbarOpen, setLogoutSnackbarOpen] = React.useState(false);
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const { clearNotification } = useUserStats();

    const navId = "primary-navigation";

    const toggleDrawer = (nextOpen: boolean) => () => {
        setOpen(nextOpen);
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await auth.logout();
            setLogoutSnackbarOpen(true);
        } catch (error) {
            console.error('Logout failed:', error);
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
    };

    const handleLogoutClick = async () => {
        handleProfileMenuClose();
        await handleLogout();
        navigate('/');
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
                to="/add-place"
                aria-current={location.pathname === "/add-place" ? "page" : undefined}
            >
                Agregar Lugar
            </Button>
            <Button
                color="inherit"
                component={RouterLink}
                to="/itineraries"
                aria-current={location.pathname === "/itineraries" ? "page" : undefined}
            >
                Itinerarios
            </Button>
            {auth.isAuthenticated ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ color: 'inherit', fontWeight: 600 }}>
                        {loading ? '...' : (stats ? `Lv.${stats.level} ${stats.levelName}` : 'Lv.0 Explorador')}
                    </Typography>
                    <IconButton
                        color="inherit"
                        onClick={() => clearNotification()}
                        aria-label="Notificaciones"
                        sx={{ ml: 0 }}
                    >
                        <Badge color="error" variant="dot" invisible={notification === null}>
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                    <IconButton
                        color="inherit"
                        onClick={handleProfileMenuOpen}
                        aria-label="Perfil"
                        sx={{ ml: 0 }}
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
                </>
            )}
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
                                opacity: 0.7,
                                color: "inherit",
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
                            to="/add-place"
                            selected={location.pathname === "/add-place"}
                            onClick={toggleDrawer(false)}
                        >
                            <ListItemText primary="Agregar Lugar" />
                        </ListItemButton>
                        <ListItemButton
                            component={RouterLink}
                            to="/itineraries"
                            selected={location.pathname === "/itineraries"}
                            onClick={toggleDrawer(false)}
                        >
                            <ListItemText primary="Itinerarios" />
                        </ListItemButton>
                        {auth.isAuthenticated ? (
                            <>
                                <ListItemButton
                                    component={RouterLink}
                                    to="/profile"
                                    onClick={toggleDrawer(false)}
                                >
                                    <ListItemText
                                        primary={`Mi perfil ${loading ? '(...)' : (stats ? `(Lv.${stats.level} ${stats.levelName})` : '(Lv.0)')}`}
                                    />
                                </ListItemButton>
                                <ListItemButton
                                    onClick={() => {
                                        handleLogout();
                                        toggleDrawer(false)();
                                        navigate('/');
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
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ px: 2, py: 1 }}>
                        <ThemeToggle />
                    </Box>
                </Box>
            </Drawer>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <MenuItem onClick={handleProfileClick}>Mi perfil</MenuItem>
                <MenuItem onClick={handleLogoutClick}>Cerrar sesión</MenuItem>
            </Menu>


            <Snackbar
                open={logoutSnackbarOpen}
                autoHideDuration={4000}
                onClose={() => setLogoutSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                TransitionComponent={(props) => <Slide {...props} direction="up" />}
                transitionDuration={500}
            >
                <Alert onClose={() => setLogoutSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                    Sesión cerrada exitosamente.
                </Alert>
            </Snackbar>

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={isLoggingOut}
            >
                <CircularProgress color="inherit" />
            </Backdrop>

            {/* Global Level Up Notification */}
            <Notification
                notification={notification}
                onClose={clearNotification}
                autoHideDuration={30000} // 30 seconds
            />
        </AppBar>
    );
};

export default Header;
