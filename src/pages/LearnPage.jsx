import React, { useState } from "react";
import "./pages.css";
import { AlgDB } from "../components/LearnPage/AlgDB.js";

const LearnPage = () => {
  const [query, setQuery] = useState("");

  return (
    <div className="pages">
      {/*<h2>Learn Algorithms!</h2>*/}
      {/* Add your learn page here */}
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
        />
      </div>

      <ul className="learnListHeader">
        <li className="learnListHeaderItem">
          <span className="alg_img">Image</span>
          <span className="alg_cat">Category</span>
          <span className="algcat_id">ID</span>
          <span className="alg_steps">Steps</span>
          <span className="description">Description</span>
        </li>
      </ul>

      <ul className="learnList">
        {AlgDB.filter(
          (alg) =>
            new RegExp(query, "i").test(alg.alg_id) ||
            new RegExp(query, "i").test(alg.alg_cat) ||
            new RegExp(query, "i").test(alg.algcat_id) ||
            new RegExp(query, "i").test(alg.steps1) ||
            new RegExp(query, "i").test(alg.steps2) ||
            new RegExp(query, "i").test(alg.steps3) ||
            new RegExp(query, "i").test(alg.steps4) ||
            new RegExp(query, "i").test(alg.description),
        ).map((alg) => (
          <li key={alg.alg_id} className="learnListItem">
            <span className="alg_img">
              {alg.image ? (
                <img
                  src={alg.image}
                  alt={`${alg.alg_id} visualization`}
                  className="algorithm-image"
                />
              ) : null}
            </span>
            <span className="alg_cat">{alg.alg_cat}</span>
            <span className="algcat_id">{alg.algcat_id}</span>
            <span className="alg_steps">
              <li key={alg.alg_id} className="stepsListItem">
                <span>{alg.steps1 == null ? null : `1) ${alg.steps1}`}</span>
                <span>{alg.steps2 == null ? null : `2) ${alg.steps2}`}</span>
                <span>{alg.steps3 == null ? null : `3) ${alg.steps3}`}</span>
                <span>{alg.steps4 == null ? null : `4) ${alg.steps4}`}</span>
              </li>
            </span>
            <span className="description">{alg.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LearnPage;
