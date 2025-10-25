import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, useEffect } from "react";
import "./App.css";
import AppThemeProvider from "./contexts/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./components/Home";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { initAnalytics, trackPageview } from "./utils/analytics";

import Login from "./components/Login";
import Register from "./components/Register";
import ConfirmEmail from "./components/ConfirmEmail";
import AddPlace from "./components/AddPlace";
import PlaceDetail from "./components/PlaceDetail";
import CreateItinerary from "./components/CreateItinerary";

function AnalyticsListener() {
    const location = useLocation();
    useEffect(() => {
        initAnalytics();
        trackPageview();

    }, [location.pathname]);
    return null;
}

function ConditionalFooter() {
    const location = useLocation();
    const hideFooterRoutes = ['/login', '/register'];
    return hideFooterRoutes.includes(location.pathname) ? null : <Footer />;
}

function App() {
    return (
        <AppThemeProvider>
            <AuthProvider>
                <CssBaseline />
                <a className="skip-link" href="#main-content">
                    Skip to content
                </a>
                <Router>
                    <AnalyticsListener />
                    <Header />
                    <main id="main-content">
                        <Suspense
                            fallback={
                                <div aria-busy="true" style={{ padding: "1rem" }}>
                                    Cargando…
                                </div>
                            }
                        >
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route
                                    path="/login"
                                    element={<Login onSwitchToRegister={() => window.location.href = '/register'} />}
                                />
                                <Route
                                    path="/register"
                                    element={<Register onSwitchToLogin={() => window.location.href = '/login'} />}
                                />
                                <Route path="/confirm-email" element={<ConfirmEmail />} />
                                <Route path="/add-place" element={<AddPlace />} />
                                <Route path="/create-itinerary" element={<CreateItinerary />} />
                                <Route path="/place/:id" element={<PlaceDetail />} />
                            </Routes>
                        </Suspense>
                    </main>
                    <ConditionalFooter />
                </Router>
            </AuthProvider>
        </AppThemeProvider>
    );
}

export default App;
