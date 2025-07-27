import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Divider,
} from "@mui/material";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

import CustomButton from "../../components/CustomButton.jsx";

import "../../pages/pages.css";

const PersonalisationSchema = Yup.object().shape({
  name: Yup.string().required("Please enter your name"),
  username: Yup.string()
    .required("Please choose a username")
    .min(3)
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Only letters, numbers and underscores allowed",
    ),
  country: Yup.string().required("Please select your country"),
  description: Yup.string().max(200),
  experienceLevel: Yup.string().required("Please select your experience level"),
  mainEvent: Yup.string().required("Please select your main event"),
  goals: Yup.string().max(100),
  favoriteMethods: Yup.string().max(100),
});

const experienceLevels = ["Beginner", "Intermediate", "Advanced", "Pro"];

const mainEvents = [
  "3x3",
  "2x2",
  "OH",
  "BLD",
  "4x4",
  "5x5",
  "Mega",
  "Pyraminx",
];

const methods = ["CFOP", "Roux", "ZZ", "Petrus", "Other"];

const countries = [
  { value: "us", label: "United States" },
  { value: "sg", label: "Singapore" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "jp", label: "Japan" },
  { value: "cn", label: "China" },
  { value: "in", label: "India" },
  { value: "br", label: "Brazil" },
  // Add more as needed
];

export default function PersonalisationForm() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [initialValues, setInitialValues] = useState({
    name: "",
    username: "",
    country: "us",
    description: "",
    experienceLevel: "",
    mainEvent: "",
    goals: "",
    favoriteMethods: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data()?.personalisation || {};
          setInitialValues((prev) => ({
            ...prev,
            ...data,
          }));
        }
      } catch (error) {
        console.error("Error fetching personalisation data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (!user) throw new Error("User not authenticated");

      await setDoc(
        doc(db, "users", user.uid),
        {
          personalisation: { ...values },
        },
        { merge: true },
      );

      // Optionally cache in localStorage
      Object.keys(values).forEach((key) => {
        localStorage.setItem(key, values[key]);
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 30, textAlign: "center" }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="personalisation-form settings-container">
      <Formik
        enableReinitialize
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
                  variant="outlined"
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
              <div className="form-label description-label">Description:</div>
              <div className="form-field description-field">
                <Field
                  as={TextField}
                  name="description"
                  multiline
                  rows={2}
                  fullWidth
                />
              </div>
            </div>

            <div style={{ height: 24 }} />

            <div className="form-row">
              <label className="form-label">Experience Level:</label>
              <div className="form-field">
                <Field as={TextField} name="experienceLevel" select fullWidth>
                  {experienceLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Field>
              </div>
            </div>

            <div className="form-row">
              <label className="form-label">Main Event:</label>
              <div className="form-field">
                <Field as={TextField} name="mainEvent" select fullWidth>
                  {mainEvents.map((event) => (
                    <MenuItem key={event} value={event}>
                      {event}
                    </MenuItem>
                  ))}
                </Field>
              </div>
            </div>

            <div className="form-row">
              <label className="form-label">Your Goals:</label>
              <div className="form-field">
                <Field
                  as={TextField}
                  name="goals"
                  fullWidth
                  placeholder="Sub-20, Learn OH, Blindfolded..."
                />
              </div>
            </div>

            <div className="form-row">
              <label className="form-label">Favorite Methods:</label>
              <div className="form-field">
                <Field as={TextField} name="favoriteMethods" select fullWidth>
                  {methods.map((method) => (
                    <MenuItem key={method} value={method}>
                      {method}
                    </MenuItem>
                  ))}
                </Field>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 20,
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
