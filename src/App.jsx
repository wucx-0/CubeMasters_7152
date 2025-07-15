import "./App.css";
import { useState, useEffect } from "react";
import { auth, onAuthStateChanged } from "./firebase";
import CubeApp from "./pages/CubeApp";
import LoginPage from "./pages/LoginPage.jsx";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Cleanup function
    return () => unsubscribe();
  }, []);

  if (!user) {
    return <LoginPage />;
  } else {
    return <CubeApp user={user} auth={auth} />;
  }
}
