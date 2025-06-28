import "./App.css";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import CubeApp from "./pages/CubeApp";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import LoginPage from "./pages/LoginPage.jsx";

export const supabase = createClient(
  "https://meejapxlwiuxcszkekhf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lZWphcHhsd2l1eGNzemtla2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTUwMTQsImV4cCI6MjA2NjU5MTAxNH0.essdaHfc4Sbfirnn1yCd0oCMPgnH6Z81_ltb_jPnLHU",
);

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    //one time thing
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    //active listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    //clean up function in useEffect
    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <LoginPage />;
  } else {
    return <CubeApp session={session} supabase={supabase} />;
  }
}
