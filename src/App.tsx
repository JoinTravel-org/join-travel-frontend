import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, useEffect } from "react";
import "./App.css";
import AppThemeProvider from "./contexts/ThemeProvider";
import Home from "./components/Home";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { initAnalytics, trackPageview } from "./utils/analytics";

import Login from "./components/Login";
import Register from "./components/Register";
import ConfirmEmail from "./components/ConfirmEmail";

function AnalyticsListener() {
  const location = useLocation();
  useEffect(() => {
    initAnalytics();
    trackPageview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
  return null;
}

function App() {
  return (
    <AppThemeProvider>
      <CssBaseline />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Router>
        <AnalyticsListener />
        <Header />
        <main id="main-content">
          <Suspense fallback={<div aria-busy="true" style={{padding: '1rem'}}>Cargando…</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/login"
                element={<Login onSwitchToRegister={() => {}} />}
              />
              <Route
                path="/register"
                element={<Register onSwitchToLogin={() => {}} />}
              />
              <Route path="/confirm-email" element={<ConfirmEmail />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </Router>
    </AppThemeProvider>
  );
}

export default App;
