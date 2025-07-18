import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Button, TextField, MenuItem, CircularProgress } from "@mui/material";
import { Divider } from '@mui/material';
import { getAuth } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

import CustomButton from "../../components/CustomButton.jsx";

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
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "it", label: "Italy" },
  { value: "es", label: "Spain" },
  { value: "jp", label: "Japan" },
  { value: "cn", label: "China" },
  { value: "in", label: "India" },
  { value: "br", label: "Brazil" },
  { value: "mx", label: "Mexico" },
  { value: "ru", label: "Russia" },
  { value: "za", label: "South Africa" },
  { value: "ng", label: "Nigeria" },
  { value: "eg", label: "Egypt" },
  { value: "sa", label: "Saudi Arabia" },
  { value: "ae", label: "United Arab Emirates" },
  { value: "kr", label: "South Korea" },
  { value: "sg", label: "Singapore" },
  { value: "nz", label: "New Zealand" },
  { value: "se", label: "Sweden" },
  { value: "no", label: "Norway" },
  { value: "fi", label: "Finland" },
  { value: "dk", label: "Denmark" },
  { value: "nl", label: "Netherlands" },
  { value: "be", label: "Belgium" },
  { value: "ch", label: "Switzerland" },
  { value: "at", label: "Austria" },
  { value: "pt", label: "Portugal" },
  { value: "gr", label: "Greece" },
  { value: "tr", label: "Turkey" },
  { value: "pl", label: "Poland" },
  { value: "ie", label: "Ireland" },
  { value: "ar", label: "Argentina" },
  { value: "cl", label: "Chile" },
  { value: "co", label: "Colombia" },
  { value: "pe", label: "Peru" },
  { value: "ve", label: "Venezuela" },
  { value: "id", label: "Indonesia" },
  { value: "my", label: "Malaysia" },
  { value: "th", label: "Thailand" },
  { value: "vn", label: "Vietnam" },
  { value: "ph", label: "Philippines" },
  { value: "pk", label: "Pakistan" },
  { value: "bd", label: "Bangladesh" },
  { value: "lk", label: "Sri Lanka" },
  // Add more as needed
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
                  SelectProps={{
                    MenuProps: {
                      anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left",
                      },
                      PaperProps: {
                        style: {
                          maxHeight: 200, // Shows about 5 items (adjust based on your item height)
                          marginTop: 8, // Space between field and dropdown
                        },
                      },
                    },
                  }}
                  variant="outlined"
                  error={touched.country && !!errors.country}
                  helperText={touched.country && errors.country}
                >
                  {countries.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                      style={{
                        height: 40, // Consistent item height
                        padding: "8px 16px",
                      }}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Field>
              </div>
            </div>

            <div className="form-row description-row">
              <div className="form-label description-label">Description:</div>
              <div className="form-field description-field">
                <Field
                  as={TextField}
                  name="description"
                  multiline
                  rows={3}
                  fullWidth
                />
              </div>
            </div>

            <div style={{ height: 48 }} />

            {/*edit as needed*/}
            {/*<div className="form-row">
              <label className="form-label">Next Setting:</label>
              <div className="form-field description-field">
                <Field
                    as={TextField}
                    name="nextsettingdescription"
                    multiline
                    rows={3}
                    fullWidth
                />
              </div>
            </div>*/}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <CustomButton
                type="submit"
                label="Save Changes"
                isSubmitting={isSubmitting}
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
