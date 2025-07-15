import React from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import Button from "@mui/material/Button";

function Navbar() {
  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error.message);
    }
  }

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
      <Link to="/friends" className="item Friends">
        Friends
      </Link>
      <Link to="/leaderboard" className="item Leaderboard">
        Leaderboard
      </Link>
      <Link to="/more" className="item More">
        More
      </Link>
      <Link to="/search" className="item Search">
        Search
      </Link>
      <Button
        onClick={handleLogout}
        variant="outlined"
        color="error"
        className="item"
      >
        Logout
      </Button>
    </div>
  );
}

export default Navbar;
