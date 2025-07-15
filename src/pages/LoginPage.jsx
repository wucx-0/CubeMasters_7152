import React, { useState } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import "./pages.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("That email is already registered. Please log in instead.");
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div
      className="pages"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <img
        src="/images/logo.png"
        alt="CubeMasters Logo"
        style={{ width: "260px", height: "130px", marginBottom: "16px" }}
      />

      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: "320px", width: "100%" }}
      >
        <label
          style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}
        >
          Email:
        </label>
        <input
          type="email"
          placeholder="Enter your email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: "12px",
          }}
        />

        <label
          style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}
        >
          Password:
        </label>
        <input
          type="password"
          placeholder="Enter your password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: "16px",
          }}
        />

        {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

        <button
          type="submit"
          style={{
            width: "100%",
            backgroundColor: "rgba(21, 101, 192, 0.8)",
            color: "#fff",
            padding: "12px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            marginTop: "8px",
          }}
        >
          {isSignup ? "Sign Up" : "Login"}
        </button>
      </form>

      <p style={{ fontSize: "14px", marginTop: "12px" }}>
        {isSignup ? "Already have an account?" : "Don't have an account?"}
        <button
          onClick={() => setIsSignup(!isSignup)}
          style={{
            background: "none",
            border: "none",
            color: "rgb(21, 101, 192)",
            cursor: "pointer",
            textDecoration: "underline",
            fontSize: "14px",
          }}
        >
          {isSignup ? "Login" : "Sign up"}
        </button>
      </p>
    </div>
  );
}

export default LoginPage;
