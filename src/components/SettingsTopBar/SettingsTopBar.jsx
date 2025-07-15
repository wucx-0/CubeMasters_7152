import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../../pages/pages.css";

function SettingsTopBar() {
  const [activeTab, setActiveTab] = useState("personalisation");
  const location = useLocation();

  return (
    <div className="settings-top-bar">
      <Link
        to="/settings/personalisation"
        className={`settings-item ${location.pathname.includes("personalisation") ? "active" : ""}`}
        onClick={() => setActiveTab("personalisation")}
      >
        Personalisation
      </Link>
      <Link
        to="/settings/timer"
        className={`settings-item ${location.pathname.includes("timer") ? "active" : ""}`}
        onClick={() => setActiveTab("timer")}
      >
        Timer
      </Link>
      <Link
        to="/settings/about"
        className={`settings-item ${location.pathname.includes("about") ? "active" : ""}`}
        onClick={() => setActiveTab("about")}
      >
        About
      </Link>
    </div>
  );
}

export default SettingsTopBar;
