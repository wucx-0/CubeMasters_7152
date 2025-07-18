import React from "react";
import { Button, CircularProgress } from "@mui/material";

const CustomButton = ({
  type = "button",
  label,
  isSubmitting = false,
  onClick,
  ...props
}) => {
  return (
    <Button
      type={type}
      color="inherit"
      variant="contained"
      sx={{
        width: "190px",
        height: "50px",
        borderRadius: "10px",
        fontFamily: "'Lexend', sans-serif",
        backgroundColor: "rgba(128, 128, 128, 0.15)",
        boxShadow: "none",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          boxShadow: "none",
        },
      }}
      disabled={isSubmitting}
      startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
      onClick={onClick}
      {...props}
    >
      {isSubmitting ? `${label}...` : label}
    </Button>
  );
};

export default CustomButton;
