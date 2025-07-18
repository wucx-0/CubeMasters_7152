import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";
import { auth, db } from "../../firebase";
import { signOut } from "firebase/auth";
import { Button, Box, Typography } from "@mui/material";

import { getDoc, doc } from "firebase/firestore";

function Navbar() {
  const [username, setUsername] = useState("");

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error.message);
    }
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("Checking for username...");

        // Check localStorage first
        const localUsername = localStorage.getItem("username");
        console.log("LocalStorage username:", localUsername);
        if (localUsername) setUsername(localUsername);

        // Then check Firestore
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const personalisation = docSnap.data()?.personalisation;
            console.log("Firestore data:", personalisation);

            const firestoreUsername = personalisation?.username;
            console.log("Firestore username:", firestoreUsername);

            if (firestoreUsername) {
              setUsername(firestoreUsername);
              localStorage.setItem("username", firestoreUsername);
              console.log("Set username to:", firestoreUsername);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUsername("");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="navbar">
      <div className="itemlogo Logo">
        <Link to="/">
          <img
            src="/images/logo.png"
            alt="CubeMasters Logo"
            style={{ width: "130px", height: "65px" }}
          />
        </Link>
      </div>
      <Link to="/learn" className="item Learn">
        Learn
      </Link>
      <Link to="/solve" className="item Solve">
        Solve
      </Link>
      <Link to="/timer" className="item Timer">
        Timer
      </Link>
      <Link to="/friends" className="item Friends">
        Friends
      </Link>
      <Link to="/leaderboard" className="item Leaderboard">
        Leaderboard
      </Link>
      <Link to="/settings" className="item Settings">
        Settings
      </Link>
      <Button
        onClick={handleLogout}
        variant="outlined"
        color="error"
        className="item"
      >
        Logout
      </Button>

      {username && (
        <Box
          className="item welcome-message"
          sx={{
            width: "190px",
            height: "100px",
            margin: "0 auto", // Centers the box

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: "rgba(0, 0, 0, 0.5)",
              textAlign: "center",
              fontFamily: "Lexend, sans-serif",
            }}
          >
            Welcome back,
            <br />
            {username}!
          </Typography>
        </Box>
      )}
    </div>
  );
}

export default Navbar;
