import CssBaseline from "@mui/material/CssBaseline";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Suspense, useEffect } from "react";
import "./App.css";
import AppThemeProvider from "./contexts/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./components/Home";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ChatBubble from "./components/ChatBubble";
import { initAnalytics, trackPageview } from "./utils/analytics";
import { useUserStats } from "./hooks/useUserStats";
import { useAnalytics } from "./hooks/useAnalytics";

import Login from "./components/Login";
import Register from "./components/Register";
import ConfirmEmail from "./components/ConfirmEmail";
import AddPlace from "./components/AddPlace";
import PlaceDetail from "./components/PlaceDetail";
import CreateItinerary from "./components/CreateItinerary";
import ItineraryList from "./components/ItineraryList";
import ItineraryDetail from "./components/ItineraryDetail";
import ChatView from "./components/ChatView";
import Chats from "./components/Chats";
import Profile from "./components/Profile";
import Notification from "./components/Notification";
import SearchResults from "./components/SearchResults";
import UserProfile from "./components/UserProfile";
import GroupPage from "./components/Groups";

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
  const hideFooterRoutes = ["/login", "/register"];
  return hideFooterRoutes.includes(location.pathname) ? null : <Footer />;
}

function App() {
  useAnalytics();

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
                  element={
                    <Login
                      onSwitchToRegister={() =>
                        (window.location.href = "/register")
                      }
                    />
                  }
                />
                <Route
                  path="/register"
                  element={
                    <Register
                      onSwitchToLogin={() => (window.location.href = "/login")}
                    />
                  }
                />
                <Route path="/confirm-email" element={<ConfirmEmail />} />
                <Route path="/add-place" element={<AddPlace />} />
                <Route path="/itineraries" element={<ItineraryList />} />
                <Route path="/itinerary/:id" element={<ItineraryDetail />} />
                <Route
                  path="/itinerary/:id/edit"
                  element={<CreateItinerary />}
                />
                <Route path="/create-itinerary" element={<CreateItinerary />} />
                <Route path="/place/:id" element={<PlaceDetail />} />
                <Route path="/chats" element={<Chats />} />
                <Route path="/ai-chat" element={<ChatView />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/user/:userId" element={<UserProfile />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/groups" element={<GroupPage />} />
              </Routes>
            </Suspense>
          </main>
          <ConditionalFooter />
          <ChatBubble />
          <NotificationWrapper />
        </Router>
      </AuthProvider>
    </AppThemeProvider>
  );
}

function NotificationWrapper() {
  // This component will handle global notifications
  // Connected to the global notification state from useUserStats
  const { notification, clearNotification } = useUserStats();
  return (
    <Notification notification={notification} onClose={clearNotification} />
  );
}

export default App;
