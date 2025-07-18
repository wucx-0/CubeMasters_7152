import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SettingsTopBar from "../components/SettingsTopBar/SettingsTopBar.jsx";
import SettingsPersonalisation from "./settings/SettingsPersonalisation.jsx";
import SettingsTimer from "./settings/SettingsTimer.jsx";
import SettingsAbout from "./settings/SettingsAbout.jsx";
import "./pages.css";

export default function SettingsPage() {
  return (
    <div className="pages settings-page">
      <SettingsTopBar />
      <div className="settings-content">
        <Routes>
          <Route path="/" element={<Navigate to="personalisation" replace />} />
          <Route path="personalisation" element={<SettingsPersonalisation />} />
          <Route path="timer" element={<SettingsTimer />} />
          <Route path="about" element={<SettingsAbout />} />
        </Routes>
      </div>
    </div>
  );
}
