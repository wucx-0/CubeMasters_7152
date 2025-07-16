import React, { useState } from "react";
import {
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import CustomButton from "../../components/CustomButton.jsx";
import "../../pages/pages.css";

export default function TimerSettings() {
  const [isResetting, setIsResetting] = useState(false);
  const [settings, setSettings] = useState({
    language: "english",
    hideElements: false,
    hideDelay: 0,
    timeFormat: "hh:mm:ss.XX",
    autoExport: "alert",
    importNonLatest: false,
    showHints: true,
    showAvg: true,
    showDiff: "green+red",
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle OK button click (save settings)
  const handleOk = () => {
    console.log("Settings saved:", settings);
    // Add actual save logic here, e.g.:
    // - API call to backend
    // - Save to localStorage
    // - Update global state
    alert("Settings saved successfully!");
  };

  // Handle Reset button click
  const handleReset = () => {
    setIsResetting(true);
    console.log("Resetting to default settings");

    setTimeout(() => {
      setSettings({
        language: "english",
        hideElements: false,
        hideDelay: 0,
        timeFormat: "hh:mm:ss.XX",
        autoExport: "alert",
        importNonLatest: false,
        showHints: true,
        showAvg: true,
        showDiff: "green+red",
      });
      setIsResetting(false);
      alert("Settings reset to defaults");
    }, 500); // Simulate async operation
  };

  return (
    <div className="timer-form settings-container">
      <div className="form-row">
        <label className="form-label">Language:</label>
        <div className="form-field">
          <Select
            name="language"
            value={settings.language}
            onChange={handleChange} // Using handleChange here
            fullWidth
          >
            <MenuItem value="english">English</MenuItem>
          </Select>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "70px",
          gap: "20px",
        }}
      >
        <CustomButton label="OK" onClick={handleOk} />
        <CustomButton
          label="Reset"
          onClick={handleReset}
          isSubmitting={isResetting}
        />
      </div>
    </div>
  );
}
