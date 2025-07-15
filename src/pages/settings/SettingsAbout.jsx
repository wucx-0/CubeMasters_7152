import React from "react";
import { Typography, Avatar, Box } from "@mui/material";
import "../../pages/pages.css";

export default function AboutPage() {
  return (
    <div className="settings-about">
      <Typography variant="h4" gutterBottom>
        About CubeMasters
      </Typography>

      <Box display="flex" alignItems="center" my={4}>
        <Avatar
          src="/path/to/your/photo.jpg"
          sx={{ width: 100, height: 100 }}
        />
        <Box ml={3}>
          <Typography variant="h6">Your Name</Typography>
          <Typography variant="body1">Role: Developer</Typography>
        </Box>
      </Box>

      <Box display="flex" alignItems="center" my={4}>
        <Avatar src="/path/to/cx/photo.jpg" sx={{ width: 100, height: 100 }} />
        <Box ml={3}>
          <Typography variant="h6">CX Name</Typography>
          <Typography variant="body1">Role: Co-developer/Designer</Typography>
        </Box>
      </Box>
    </div>
  );
}
