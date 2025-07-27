import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  // import firebase if needed
} from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import "./pages.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getFriendlyError = (code) => {
    const messages = {
      "auth/invalid-email": "Invalid email address.",
      "auth/user-disabled": "Account disabled.",
      "auth/user-not-found": "No user found with this email.",
      "auth/wrong-password": "Incorrect password.",
      "auth/email-already-in-use": "That email is already registered.",
      "auth/weak-password": "Password should be at least 6 characters.",
    };
    return messages[code] || "Something went wrong. Please try again.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await sendEmailVerification(userCredential.user);
        alert(
          "Signup successful! Please check your email to verify your account.",
        );
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );

        if (!userCredential.user.emailVerified) {
          setError("Please verify your email before logging in.");
          return;
        }

        // Redirect on success
        navigate("/dashboard");
      }
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Enter your email to reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Please check your inbox.");
    } catch (err) {
      setError(getFriendlyError(err.code));
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
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: loading ? "#aaa" : "rgba(21, 101, 192, 0.8)",
            color: "#fff",
            padding: "12px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: "8px",
          }}
        >
          {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
        </button>

        <div style={{ textAlign: "center", marginTop: "12px" }}>
          {!isSignup && (
            <p style={{ fontSize: "14px", marginBottom: "4px" }}>
              Forgot password?
              <button
                onClick={handleResetPassword}
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "rgb(21, 101, 192)",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "14px",
                  marginLeft: "4px",
                }}
              >
                Reset password
              </button>
            </p>
          )}

          <p style={{ fontSize: "14px", margin: 0 }}>
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "rgb(21, 101, 192)",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "14px",
                marginLeft: "4px",
              }}
            >
              {isSignup ? "Login" : "Sign up"}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
