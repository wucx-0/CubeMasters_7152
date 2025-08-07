import React from "react";
import "./pages.css";
import RubiksCube from "../components/SolvePage/RubiksCube.jsx";

const SolvePage = () => {
  return (
    <>
      <div className="pages solve-page">
        <div className="solve-container">
          <div className="solve-left-panel">
            <h2>Cube Solver</h2>
            <div className="solve-instructions">
              <h3>How to use:</h3>
              <ul>
                <li>
                  Use keyboard controls: U/u, D/d, R/r, L/l, F/f, B/b (Uppercase
                  = clockwise, lowercase = anticlockwise)
                </li>
              </ul>
            </div>
          </div>
          <div className="solve-right-panel">
            <div className="rubiks-cube">
              <RubiksCube />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SolvePage;
