import React, { useState, useEffect } from "react";
import { AlgDB } from "../components/LearnPage/AlgDB.js";
import IconButton from "@mui/material/IconButton";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./pages.css";

function LearnPage() {
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState({});
  const [doneStatus, setDoneStatus] = useState({});
  const [originalOrder, setOriginalOrder] = useState([]);
  const [growInAlg, setGrowInAlg] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setOriginalOrder(AlgDB.map((alg) => alg.alg_id));
        fetchUserStatus(user.uid);
      } else {
        setFavorites({});
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserStatus = async (uid) => {
    try {
      // Fetch favorites
      const favRef = doc(db, "favorites", uid);
      const favSnap = await getDoc(favRef);
      setFavorites(favSnap.exists() ? favSnap.data() : {});

      // Fetch done
      const doneRef = doc(db, "done", uid);
      const doneSnap = await getDoc(doneRef);
      setDoneStatus(doneSnap.exists() ? doneSnap.data() : {});
    } catch (error) {
      console.error("Error fetching user status:", error);
      setFavorites({});
      setDoneStatus({});
    }
  };

  const toggleFavorite = async (algId) => {
    const user = auth.currentUser;
    if (!user) return;

    const isFavoriting = !favorites[algId];
    const wrapper = document.querySelector(`div[data-algid="${algId}"]`);

    if (!wrapper) return;

    if (!isFavoriting) {
      // UNFAVORITING: Shrink first, then update state
      wrapper.classList.add("unfavoriting");
      setTimeout(() => wrapper.classList.add("start"), 10);

      setTimeout(() => {
        wrapper.classList.remove("unfavoriting", "start");
        const newFavorites = { ...favorites, [algId]: false };
        setFavorites(newFavorites);
        setDoc(doc(db, "favorites", user.uid), newFavorites).catch(
          console.error,
        );
        setGrowInAlg(algId); // <-- triggers grow-in for new location
      }, 300);
    } else {
      // FAVORITING: Shrink in place
      wrapper.classList.add("unfavoriting");
      setTimeout(() => wrapper.classList.add("start"), 10);

      setTimeout(() => {
        wrapper.classList.remove("unfavoriting", "start");
        const newFavorites = { ...favorites, [algId]: true };
        setFavorites(newFavorites);
        setDoc(doc(db, "favorites", user.uid), newFavorites).catch(
          console.error,
        );
        setGrowInAlg(algId); // <-- triggers grow-in for top
      }, 300);
    }
  };

  const toggleDone = async (algId) => {
    const user = auth.currentUser;
    if (!user) return;

    const updatedDone = {
      ...doneStatus,
      [algId]: !doneStatus[algId],
    };
    setDoneStatus(updatedDone);

    try {
      const docRef = doc(db, "done", user.uid);
      await setDoc(docRef, updatedDone);
    } catch (error) {
      console.error("Error saving done status:", error);
    }
  };

  const filteredAlgorithms = AlgDB.filter(
    (alg) =>
      new RegExp(query, "i").test(alg.alg_id) ||
      new RegExp(query, "i").test(alg.alg_cat) ||
      new RegExp(query, "i").test(alg.algcat_id) ||
      new RegExp(query, "i").test(alg.steps1) ||
      new RegExp(query, "i").test(alg.steps2) ||
      new RegExp(query, "i").test(alg.steps3) ||
      new RegExp(query, "i").test(alg.steps4) ||
      new RegExp(query, "i").test(alg.description),
  );

  const sortedAlgorithms = [...filteredAlgorithms].sort((a, b) => {
    const aIsFavorite = favorites[a.alg_id];
    const bIsFavorite = favorites[b.alg_id];

    if (aIsFavorite && bIsFavorite) {
      return originalOrder.indexOf(a.alg_id) - originalOrder.indexOf(b.alg_id);
    }
    if (aIsFavorite) return -1;
    if (bIsFavorite) return 1;
    return originalOrder.indexOf(a.alg_id) - originalOrder.indexOf(b.alg_id);
  });

  return (
    <div className="pages">
      <div className="search">
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=search"
        />
        <span className="search-icon material-symbols-outlined">search</span>
        <input
          type="text"
          placeholder="Search for algorithms..."
          className="search-input"
          onChange={(e) => setQuery(e.target.value)}
          value={query}
        />
      </div>

      <ul className="learnListHeader">
        <li className="learnListHeaderItem">
          <span className="alg_img">Image</span>
          <span className="alg_cat">Category</span>
          <span className="algcat_id">ID</span>
          <span className="alg_steps">Steps</span>
          <span className="description">Description</span>
          <span className="favorite">Favorite</span>
          <span className="done">Done</span>
        </li>
      </ul>

      <div className="learnListScrollContainer">
        <ul className="learnList">
          {sortedAlgorithms.map((alg) => (
            <div
              key={alg.alg_id}
              data-algid={alg.alg_id}
              className="learnListItem-wrapper"
            >
              <li
                className={`learnListItem ${favorites[alg.alg_id] ? "favorited" : ""} ${alg.alg_id === growInAlg ? "grow-in" : ""}`}
                onAnimationEnd={() => {
                  if (growInAlg === alg.alg_id) {
                    setGrowInAlg(null); // remove class after animation
                  }
                }}
              >
                <span className="alg_img">
                  {alg.image && (
                    <img
                      src={alg.image}
                      alt={`${alg.alg_id} visualization`}
                      className="algorithm-image"
                    />
                  )}
                </span>
                <span className="alg_cat">{alg.alg_cat}</span>
                <span className="algcat_id">{alg.algcat_id}</span>
                <span className="alg_steps">
                  <ul className="stepsList">
                    {alg.steps1 && <li>1) {alg.steps1}</li>}
                    {alg.steps2 && <li>2) {alg.steps2}</li>}
                    {alg.steps3 && <li>3) {alg.steps3}</li>}
                    {alg.steps4 && <li>4) {alg.steps4}</li>}
                  </ul>
                </span>
                <span className="description">{alg.description}</span>
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
                <span className="favorite-button">
                  <IconButton
                    aria-label={
                      favorites[alg.alg_id]
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                    onClick={() => toggleFavorite(alg.alg_id)}
                    size="small"
                    disableRipple
                  >
                    {favorites[alg.alg_id] ? (
                      <Favorite color="error" />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>
                </span>
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
                <span className="done">
                  <IconButton
                    aria-label={
                      doneStatus[alg.alg_id]
                        ? "Mark as not done"
                        : "Mark as done"
                    }
                    onClick={() => toggleDone(alg.alg_id)}
                    size="small"
                    disableRipple
                  >
                    {doneStatus[alg.alg_id] ? (
                      <span
                        className="material-symbols-outlined"
                        style={{ color: "green" }}
                      >
                        check_circle
                      </span>
                    ) : (
                      <span
                        className="material-symbols-outlined"
                        style={{ color: "gray" }}
                      >
                        radio_button_unchecked
                      </span>
                    )}
                  </IconButton>
                </span>
              </li>
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default LearnPage;
