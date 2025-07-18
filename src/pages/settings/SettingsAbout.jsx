import React from "react";
import { Typography, Avatar, Box } from "@mui/material";
import "../../pages/pages.css";

export default function AboutPage() {
  return (
    <div className="settings-container">
      <Typography
        variant="h4"
        gutterBottom
        className="form-title"
        sx={{ textAlign: "center", mb: 4, fontFamily: "Lexend, sans-serif" }}
      >
        About CubeMasters
      </Typography>
      <p className="form-description" style={{ textAlign: "center" }}>
        CubeMasters is an Orbitals project brought to you by Wei Jie and
        Chenxiao with the goal of making learning the Rubik's Cube easier for
        all!
      </p>

      <div style={{ height: 24 }} />

      <Box sx={{ display: "flex", flexDirection: "row", gap: 4 }}>
        {/* Column 1: Your Profile */}
        <Box sx={{ flex: 1, p: 3, borderRight: "2px solid grey" }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              src="/images/weijiepfp.jpg"
              sx={{ width: 80, height: 80, mr: 3 }}
            />
            <Typography variant="h5" sx={{ fontFamily: "Lexend, sans-serif" }}>
              Gao Wei Jie
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{ textAlign: "left", fontFamily: "Lexend, sans-serif" }}
          >
            <br />
            Wei Jie is an avid speedcuber who is working on this project for his
            orbitals project. He is inspired to create this project after
            looking at online timer and algorithm webistes. He wishes to
            implement creative features for this app to allow other cubers to
            learn to solve the cube like him!
          </Typography>
        </Box>

        {/* Column 2: CX Profile */}
        <Box sx={{ flex: 1, p: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              src="/path/to/cx/photo.jpg"
              sx={{ width: 80, height: 80, mr: 3 }}
            />
            <Typography variant="h5" sx={{ fontFamily: "Lexend, sans-serif" }}>
              Wu Chenxiao
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{ textAlign: "left", fontFamily: "Lexend, sans-serif" }}
          >
            <br />
            Description: Ut enim ad minim veniam, quis nostrud exercitation
            ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Typography>
        </Box>
      </Box>
    </div>
  );
}
