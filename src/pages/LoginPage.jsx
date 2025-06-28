import React from "react";
import "./pages.css";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../App";

function LoginPage() {
  const customTheme = {
    default: {
      colors: {
        brand: "rgba(21, 101, 192, 0.8)", // Primary button/input focus color
        brandAccent: "rgb(21, 101, 192)", // Button hover color
        inputBackground: "rgba(128, 128, 128, 0.1)",
        inputBorder: "rgb(200, 200, 200)",
        inputText: "rgb(50, 50, 50)",
        inputPlaceholder: "rgb(150, 150, 150)",
      },
      space: {
        spaceSmall: "4px",
        spaceMedium: "8px",
        spaceLarge: "16px",
      },
      radii: {
        borderRadiusButton: "8px",
        inputBorderRadius: "8px",
      },
    },
  };

  return (
    <div className="pages">
      <img
        src="/images/logo.png"
        alt="CubeMasters Logo"
        style={{ width: "260px", height: "130px" }}
      />
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: customTheme,
          style: {
            button: {
              width: "100%",
              marginTop: "16px",
            },
            input: {
              width: "100%",
              padding: "12px",
              fontSize: "16px",
            },
            label: {
              marginBottom: "8px",
              fontSize: "14px",
            },
          },
        }}
        providers={[]}
        localization={{
          variables: {
            sign_in: {
              email_label: "Your Email Address",
              password_label: "Your Password",
              email_input_placeholder: "Enter your email",
              password_input_placeholder: "Enter your password",
            },
          },
        }}
      />
    </div>
  );
}

export default LoginPage;
