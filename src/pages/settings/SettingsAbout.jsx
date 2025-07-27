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

      <Box sx={{ display: "flex", flexDirection: "row", gap: 3 }}>
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
            Wei Jie is an ardent software engineer, committed to improving his
            skills and learn more about Software engineering through this
            Orbitals project. He is also an avid speedcuber who is working on
            this project for his orbitals project. He is inspired to create this
            project after looking at online timer and algorithm websites. He
            wishes to implement creative features for this app to allow other
            cubers to learn to solve the cube like him! Through this project, he
            hopes to practice and deepen my skills in UI/UX design and app
            development!
          </Typography>
        </Box>

        {/* Column 2: CX Profile */}
        <Box sx={{ flex: 1, p: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              src="/images/chenxiaopfp.jpg"
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
            <br /> Chenxiao is a passionate software engineer who has worked on
            past projects like Connect 4 and other interactive games. Eager to
            take on the challenge of visualizing the Rubik’s Cube in this
            Orbital project, I aim to deepen my understanding of UI/UX
            design—exploring intuitive interfaces, smooth animations, and
            user-friendly interactions. Through this project, I hope to refine
            my skills in frontend development, 3D rendering, and state
            management while creating a tool that helps cubers learn and
            practice efficiently.
          </Typography>
        </Box>
      </Box>
    </div>
  );
}
