import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar/NavBar.jsx";
import PageContainer from './components/PageContainer/PageContainer';
import LoginPage from "./pages/LoginPage";
import LearnPage from "./pages/LearnPage";
import SolvePage from "./pages/SolvePage";
import FriendsPage from "./pages/FriendsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import MorePage from "./pages/MorePage";
import SearchPage from "./pages/SearchPage";
// import { useState } from "react";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App app-container">
        <Navbar />
        <PageContainer>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/solve" element={<SolvePage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/more" element={<MorePage />} />
            <Route path="/search" element={<SearchPage />} />

            {/* Default page */}
            <Route path="/" element={<LearnPage />} />
          </Routes>
        </PageContainer>
      </div>
    </Router>
  );
}

export default App;