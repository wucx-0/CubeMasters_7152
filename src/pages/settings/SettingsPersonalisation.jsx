import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Button, TextField, MenuItem, CircularProgress } from "@mui/material";
import { getAuth } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Make sure you have your Firebase config setup
import "../../pages/pages.css";

const PersonalisationSchema = Yup.object().shape({
  name: Yup.string().required("Please enter your name"),
  username: Yup.string()
    .required("Please choose a username")
    .min(3, "Username must be at least 3 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Only letters, numbers and underscores allowed",
    ),
  country: Yup.string().required("Please select your country"),
  description: Yup.string().max(
    200,
    "Description must be 200 characters or less",
  ),
});

const countries = [
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  // Add more countries as needed
];

export default function PersonalisationForm() {
  const auth = getAuth();
  const user = auth.currentUser;

  const initialValues = {
    name: localStorage.getItem("name") || "",
    username: localStorage.getItem("username") || "",
    country: localStorage.getItem("country") || "us",
    description: localStorage.getItem("description") || "",
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Save to Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          personalisation: {
            name: values.name,
            username: values.username,
            country: values.country,
            description: values.description,
            lastUpdated: new Date().toISOString(),
          },
        },
        { merge: true },
      );

      // Also save to localStorage for immediate access
      localStorage.setItem("name", values.name);
      localStorage.setItem("username", values.username);
      localStorage.setItem("country", values.country);
      localStorage.setItem("description", values.description);

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="personalisation-form settings-container">
      <Formik
        initialValues={initialValues}
        validationSchema={PersonalisationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <div className="form-row">
              <label className="form-label">Name:</label>
              <div className="form-field">
                <Field
                  as={TextField}
                  name="name"
                  variant="outlined"
                  fullWidth
                  error={touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                />
              </div>
            </div>

            <div className="form-row">
              <label className="form-label">Username:</label>
              <div className="form-field">
                <Field
                  as={TextField}
                  name="username"
                  fullWidth
                  error={touched.username && !!errors.username}
                  helperText={touched.username && errors.username}
                />
              </div>
            </div>

            <div className="form-row">
              <label className="form-label">Country:</label>
              <div className="form-field">
                <Field
                  as={TextField}
                  name="country"
                  select
                  fullWidth
                  error={touched.country && !!errors.country}
                  helperText={touched.country && errors.country}
                >
                  {countries.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Field>
              </div>
            </div>

            <div className="form-row description-row">
              <label className="form-label description-label">
                Description:
              </label>
              <div className="form-field">
                <Field
                  as={TextField}
                  name="description"
                  multiline
                  rows={3}
                  fullWidth
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "70px",
              }}
            >
              <Button
                type="submit"
                color="inherit"
                sx={{
                  width: "190px",
                  height: "50px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(128, 128, 128, 0.15)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  },
                }}
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
