import React, { useState, useEffect } from "react";
import "./pages.css";
import { AlgDB } from "../components/LearnPage/AlgDB.js";
import IconButton from "@mui/material/IconButton";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

function LearnPage() {
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState({});
  const [originalOrder, setOriginalOrder] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setOriginalOrder(AlgDB.map((alg) => alg.alg_id));
        fetchFavorites(user.uid);
      } else {
        setFavorites({});
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchFavorites = async (uid) => {
    try {
      const docRef = doc(db, "favorites", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFavorites(docSnap.data());
      } else {
        setFavorites({});
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setFavorites({});
    }
  };

  const toggleFavorite = async (algId) => {
    const user = auth.currentUser;
    if (!user) return;

    const newFavorites = {
      ...favorites,
      [algId]: !favorites[algId],
    };
    setFavorites(newFavorites);

    try {
      const docRef = doc(db, "favorites", user.uid);
      await setDoc(docRef, newFavorites);
    } catch (error) {
      console.error("Error saving favorite:", error);
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

  // Sort algorithms with favorites first (in original order), then non-favorites
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
        </li>
      </ul>

      <ul className="learnList">
        {sortedAlgorithms.map((alg) => (
          <li
            key={alg.alg_id}
            className={`learnListItem ${favorites[alg.alg_id] ? "favorited" : ""}`}
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
            <span className="favorite">
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
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LearnPage;
