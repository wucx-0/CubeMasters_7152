import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "../components/NavBar/NavBar.jsx";
import PageContainer from "../components/PageContainer/PageContainer";
import LoginPage from "./LoginPage";
import LearnPage from "./LearnPage";
import SolvePage from "./SolvePage";
import FriendsPage from "./FriendsPage";
import LeaderboardPage from "./LeaderboardPage";
import SettingsPage from "./SettingsPage";
import SettingsPersonalisation from "./settings/SettingsPersonalisation.jsx";
import SettingsTimer from "./settings/SettingsTimer.jsx";
import SettingsAbout from "./settings/SettingsAbout.jsx";
import SearchPage from "./SearchPage";

function CubeApp({ user }) {
  return (
    <Router>
      <div className="App app-container">
        {user && <Navbar />}
        <PageContainer>
          <Routes>
            <Route
              path="/login"
              element={!user ? <LoginPage /> : <Navigate to="/learn" />}
            />
            <Route
              path="/learn"
              element={user ? <LearnPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/solve"
              element={user ? <SolvePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/friends"
              element={user ? <FriendsPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/leaderboard"
              element={user ? <LeaderboardPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/settings"
              element={user ? <SettingsPage /> : <Navigate to="/login" />}
            >
              <Route path="about" element={<SettingsAbout />} />
              <Route path="personalisation" element={<SettingsPersonalisation />} />
              <Route path="timer" element={<SettingsTimer />} />
              <Route
                index
                element={<Navigate to="personalisation" replace />}
              />
            </Route>
            <Route
              path="/search"
              element={user ? <SearchPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/"
              element={<Navigate to={user ? "/learn" : "/login"} />}
            />
          </Routes>
        </PageContainer>
      </div>
    </Router>
  );
}

export default CubeApp;
