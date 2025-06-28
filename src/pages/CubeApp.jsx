import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "../components/NavBar/NavBar.jsx";
import PageContainer from "../components/PageContainer/PageContainer";
import LearnPage from "./LearnPage";
import SolvePage from "./SolvePage";
import FriendsPage from "./FriendsPage";
import LeaderboardPage from "./LeaderboardPage";
import MorePage from "./MorePage";
import SearchPage from "./SearchPage";

function CubeApp({ session }) {
  return (
    <Router>
      <div className="App app-container">
        {session && <Navbar />}
        <PageContainer>
          <Routes>
            <Route
              path="/login"
              element={!session ? <LoginPage /> : <Navigate to="/learn" />}
            />
            <Route
              path="/learn"
              element={session ? <LearnPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/solve"
              element={session ? <SolvePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/friends"
              element={session ? <FriendsPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/leaderboard"
              element={session ? <LeaderboardPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/more"
              element={session ? <MorePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/search"
              element={session ? <SearchPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/"
              element={<Navigate to={session ? "/learn" : "/login"} />}
            />
          </Routes>
        </PageContainer>
      </div>
    </Router>
  );
}

export default CubeApp;
