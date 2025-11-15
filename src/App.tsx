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
import Home from "./components/home/Home";
import Header from "./components/header/Header";
import Footer from "./components/home/Footer";
import ChatBubble from "./components/ai_chat/ChatBubble";
import { initAnalytics, trackPageview } from "./utils/analytics";
import { useUserStats } from "./hooks/useUserStats";
import { useAnalytics } from "./hooks/useAnalytics";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ConfirmEmail from "./components/auth/ConfirmEmail";
import AddPlace from "./components/add_place/AddPlace";
import PlaceDetail from "./components/place/PlaceDetail";
import CreateItinerary from "./components/itineraries/CreateItinerary";
import ItineraryList from "./components/itineraries/ItineraryList";
import ItineraryDetail from "./components/itineraries/ItineraryDetail";
import Chats from "./components/users_chats/Chats";
import Profile from "./components/user_profile/Profile";
import Notification from "./components/user_profile/Notification";
import SearchResults from "./components/search/SearchResults";
import Lists from "./components/lists/Lists";
import ListDetail from "./components/lists/ListDetail";
import ListEdit from "./components/lists/ListEdit";
import CreateList from "./components/lists/CreateList";
import Collections from "./components/collections/Collections";
import UserProfile from "./components/user/UserProfile";
import GroupPage from "./components/groups/Groups";

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
                <Route path="/profile" element={<Profile />} />
                <Route path="/user/:userId" element={<UserProfile />} />
                <Route path="/groups" element={<GroupPage />} />
                <Route path="/lists" element={<Lists />} />
                <Route path="/list/:id" element={<ListDetail />} />
                <Route path="/list/:id/edit" element={<ListEdit />} />
                <Route path="/create-list" element={<CreateList />} />
                <Route path="/collections" element={<Collections />} />
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
