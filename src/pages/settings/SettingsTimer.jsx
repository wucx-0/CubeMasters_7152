import React, { useState } from "react";
import {
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import "../../pages/pages.css";

export default function TimerSettings() {
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

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div className="settings-timer">
      <FormControl fullWidth margin="normal">
        <label>Language</label>
        <Select
          name="language"
          value={settings.language}
          onChange={handleChange}
        >
          <MenuItem value="english">English</MenuItem>
          <MenuItem value="spanish">Spanish</MenuItem>
          {/* Add more languages */}
        </Select>
      </FormControl>

      <div className="form-actions">
        <Button variant="contained" color="primary">
          OK
        </Button>
        <Button variant="outlined" color="secondary">
          Reset
        </Button>
        <Button variant="outlined">EXPORT</Button>
      </div>
    </div>
  );
}
