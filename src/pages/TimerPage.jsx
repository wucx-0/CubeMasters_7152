import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { realtimeDb as db } from "../firebase.js";
import { getAuth } from "firebase/auth";
import { ref, push, onValue, set } from "firebase/database";

import CustomButton from "../components/CustomButton.jsx";

import "./pages.css";

const auth = getAuth();
const user = auth.currentUser;
const userId = user?.uid;

const formatTime = (milliseconds) => {
  if (milliseconds === 0) return "0.00";
  const totalSeconds = milliseconds / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedSeconds = seconds.toFixed(2).padStart(5, "0");
  return minutes > 0 ? `${minutes}:${formattedSeconds}` : formattedSeconds;
};

const formatStatTime = (value) => {
  if (
    value === "NA" ||
    value === "DNF" ||
    typeof value !== "number" ||
    isNaN(value) ||
    !isFinite(value)
  ) {
    return "NA";
  }
  return formatTime(value);
};

const generate3x3Scramble = () => {
  const moves = ["U", "D", "F", "B", "R", "L"];
  const modifiers = ["", "'", "2"];
  let scramble = [],
    lastMove = "";
  for (let i = 0; i < 20; i++) {
    let move, face;
    do {
      move = moves[Math.floor(Math.random() * moves.length)];
      face = move[0];
    } while (face === lastMove[0]);
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    scramble.push(move + modifier);
    lastMove = move;
  }
  return scramble.join(" ");
};

const calculateStats = (solves) => {
  if (solves.length === 0)
    return {
      current: { time: 0, mo3: "NA", ao5: "NA", ao12: "NA" },
      best: { time: 0, mo3: "NA", ao5: "NA", ao12: "NA" },
    };

  const processedTimes = solves.map((s) =>
    s.penalty === 2 ? Infinity : s.time + (s.penalty === 1 ? 2000 : 0),
  );

  const calculateAverage = (times) => {
    if (times.includes(Infinity)) return "DNF";
    const sum = times.reduce((a, b) => a + b, 0);
    return sum / times.length;
  };

  const getTrimmedAverage = (slice) => {
    if (slice.length < 5) return "NA";

    const sorted = [...slice];

    // Remove one instance of min and max only
    const min = Math.min(...sorted);
    const max = Math.max(...sorted);

    let removed = 0;
    const filtered = [];

    for (let t of sorted) {
      if (t === min && removed === 0) {
        removed++;
        continue;
      }
      if (t === max && removed === 1) {
        removed++;
        continue;
      }
      filtered.push(t);
    }

    // Ensure we have enough solves left (3 for ao5, 10 for ao12)
    if (
      filtered.length < slice.length - 2 ||
      filtered.includes(Infinity) ||
      filtered.length < 3
    ) {
      return "DNF";
    }

    return calculateAverage(filtered);
  };

  const findBest = (count, useTrim) => {
    let best = Infinity;
    for (let i = 0; i <= processedTimes.length - count; i++) {
      const slice = processedTimes.slice(i, i + count);
      let avg;
      if (useTrim) avg = getTrimmedAverage(slice);
      else if (slice.includes(Infinity)) continue;
      else avg = calculateAverage(slice);

      if (avg !== "NA" && avg !== "DNF" && avg < best) best = avg;
    }
    return best === Infinity ? "NA" : best;
  };

  const current = {
    time:
      processedTimes[processedTimes.length - 1] === Infinity
        ? "DNF"
        : processedTimes[processedTimes.length - 1],
    mo3:
      processedTimes.length >= 3
        ? calculateAverage(processedTimes.slice(-3))
        : "NA",
    ao5:
      processedTimes.length >= 5
        ? getTrimmedAverage(processedTimes.slice(-5))
        : "NA",
    ao12:
      processedTimes.length >= 12
        ? getTrimmedAverage(processedTimes.slice(-12))
        : "NA",
  };

  const best = {
    time: findBest(1, false),
    mo3: findBest(3, false),
    ao5: findBest(5, true),
    ao12: findBest(12, true),
  };

  return { current, best };
};

// start of actual Timer Page
function TimerPage() {
  const [state, setState] = useState({
    running: false,
    startTime: 0,
    currentTime: 0,
    inspectionTime: 15,
    inspectionRunning: false,
    solves: [],
    scramble: generate3x3Scramble(),
    wcaInspection: true,
    spacebarLock: false,
  });

  const [popupSolve, setPopupSolve] = useState(null);
  const [popupIndex, setPopupIndex] = useState(null);
  const [wcaReadyToStart, setWcaReadyToStart] = useState(false);
  const [currentScrambleIndex, setCurrentScrambleIndex] = useState(null);

  const inspectionInterval = useRef(null);
  const timerInterval = useRef(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const solvesRef = ref(db, `solves/${user.uid}`);

    const unsubscribe = onValue(solvesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const firebaseSolves = Object.values(data)
          .filter((s) => s.date)
          .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by solve date

        setState((prev) => ({
          ...prev,
          solves: firebaseSolves,
        }));
      } else {
        setState((prev) => ({ ...prev, solves: [] }));
      }
    });

    return () => unsubscribe();
  }, []);

  const startInspection = () => {
    setState((prev) => ({
      ...prev,
      inspectionRunning: true,
      inspectionTime: 15,
    }));
    inspectionInterval.current = setInterval(() => {
      setState((prev) => {
        if (prev.inspectionTime <= 1) {
          clearInterval(inspectionInterval.current);
          return { ...prev, inspectionTime: 0, inspectionRunning: false };
        }
        return { ...prev, inspectionTime: prev.inspectionTime - 1 };
      });
    }, 1000);
  };

  const startTimer = () => {
    clearInterval(inspectionInterval.current);
    const start = Date.now();
    setState((prev) => ({
      ...prev,
      running: true,
      startTime: start,
      currentTime: 0,
      inspectionRunning: false,
    }));
    timerInterval.current = setInterval(() => {
      setState((prev) => ({
        ...prev,
        currentTime: Date.now() - prev.startTime,
      }));
    }, 10);
  };

  const stopTimer = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    clearInterval(timerInterval.current);

    const overtime = (Date.now() - state.startTime) / 1000;
    let penalty = 0;
    if (
      state.wcaInspection &&
      !state.inspectionRunning &&
      state.inspectionTime === 0
    ) {
      if (overtime > 2) penalty = 2;
      else penalty = 1;
    }

    const newSolve = {
      time: state.currentTime,
      scramble: state.scramble,
      date: new Date().toISOString(),
      penalty,
    };

    // Update UI immediately
    setState((prev) => ({
      ...prev,
      running: false,
      scramble: generate3x3Scramble(),
      solves: [...prev.solves, newSolve],
    }));

    setCurrentScrambleIndex(state.solves.length); // this is the latest solve index

    // Push to Firebase in the background
    push(ref(db, `solves/${userId}`), newSolve)
      .then(() => console.log("✅ Solve saved successfully"))
      .catch((err) => console.error("❌ Error saving solve:", err));
  };

  const handleSpace = useCallback(
    (e) => {
      if (e.code !== "Space" || state.spacebarLock) return;
      e.preventDefault();
      setState((prev) => ({ ...prev, spacebarLock: true }));
      setTimeout(() => {
        setState((prev) => ({ ...prev, spacebarLock: false }));
      }, 200);

      if (!state.running && !state.inspectionRunning) {
        if (state.wcaInspection) {
          if (!wcaReadyToStart) {
            startInspection();
            setWcaReadyToStart(true);
          } else {
            setWcaReadyToStart(false);
            startTimer();
          }
        } else {
          startTimer();
        }
      } else if (state.inspectionRunning) {
        clearInterval(inspectionInterval.current);
        setState((prev) => ({ ...prev, inspectionRunning: false }));
        startTimer();
      } else if (state.running) {
        stopTimer();
      }
    },
    [state, wcaReadyToStart],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleSpace);
    return () => document.removeEventListener("keydown", handleSpace);
  }, [handleSpace]);

  const deleteSolve = (index) => {
    if (!window.confirm("Are you sure you want to delete this solve?")) return;
    setState((prev) => {
      const newSolves = [...prev.solves];
      newSolves.splice(index, 1);
      return { ...prev, solves: newSolves };
    });
  };

  const addPenalty = (index, penaltyType) => {
    setState((prev) => {
      const newSolves = [...prev.solves];
      newSolves[index].penalty = penaltyType;
      return { ...prev, solves: newSolves };
    });
  };

  const resetSession = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    if (window.confirm("Reset all session solves?")) {
      const userSolvesRef = ref(db, `solves/${userId}`);
      set(userSolvesRef, []) // clears from Firebase
        .then(() => {
          // clear UI immediately
          setState((prev) => ({ ...prev, solves: [] }));
        });
    }
  };

  const downloadSession = () => {
    const blob = new Blob([JSON.stringify(state.solves, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cube_solves_session.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => calculateStats(state.solves), [state.solves]);

  const recentSolves = state.solves;

  // load the page
  return (
    <div className="pages timer-grid">
      <div className="main-timer-center">
        <div className="scramble-display">
          {currentScrambleIndex !== null
            ? state.solves[currentScrambleIndex]?.scramble || state.scramble
            : state.scramble}
        </div>
        <div className="big-timer">
          {state.inspectionRunning
            ? `${state.inspectionTime}${state.inspectionTime === 0 ? " (+2/DNF)" : ""}`
            : formatTime(state.running ? state.currentTime : 0)}
        </div>
        <h3 style={{ textAlign: "center", opacity: 0.2 }}>
          Press spacebar to start/stop timer!
        </h3>
      </div>

      <div className="right-sidebar">
        <h3 style={{ textAlign: "center", textDecoration: "underline" }}>
          Solves
        </h3>
        <div className="sidebar-grid-header">
          <span>#</span>
          <span>Time</span>
          <span>AO5</span>
          <span>AO12</span>
        </div>

        {/* Scrollable section */}
        <div className="solves-scroll-area">
          {[...recentSolves].reverse().map((solve, idx) => {
            const globalIndex = recentSolves.length - 1 - idx;

            const partialStats = calculateStats(
              state.solves.slice(0, globalIndex + 1),
            );
            const ao5 = partialStats.current.ao5;
            const ao12 = partialStats.current.ao12;
            const timeBase = formatTime(solve.time);
            const timeText =
              solve.penalty === 2
                ? `${timeBase} (DNF)`
                : solve.penalty === 1
                  ? `${timeBase} (+2)`
                  : timeBase;

            return (
              <div key={globalIndex} className="sidebar-grid-row">
                <span>{recentSolves.length - idx}</span>
                <span
                  className="time-clickable"
                  onClick={() => {
                    setPopupSolve(solve);
                    setPopupIndex(globalIndex);
                  }}
                >
                  {timeText}
                </span>
                <span>{formatStatTime(ao5)}</span>
                <span>{formatStatTime(ao12)}</span>
                <span>
                  <CustomButton
                    label="✖"
                    onClick={() => deleteSolve(globalIndex)}
                    style={{
                      width: 25,
                      height: 25,
                      minWidth: 25,
                      minHeight: 25,
                      padding: 0,
                      fontSize: 16,
                      backgroundColor: "transparent",
                      boxShadow: "none",
                    }}
                  />
                </span>
              </div>
            );
          })}
        </div>

        <div
          className="custom-button-group"
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            marginTop: "12px",
          }}
        >
          <CustomButton
            label="◀ Prev"
            onClick={() =>
              setCurrentScrambleIndex((prev) => (prev > 0 ? prev - 1 : 0))
            }
            isSubmitting={false}
            style={{ height: "30px" }}
          />
          <CustomButton
            label="Reset"
            onClick={resetSession}
            isSubmitting={false}
            style={{ height: "30px" }}
          />
          <CustomButton
            label="Next ▶"
            onClick={() =>
              setCurrentScrambleIndex(
                (prev) => (prev < state.solves.length - 1 ? prev + 1 : null), // go back to latest scramble
              )
            }
            isSubmitting={false}
            style={{ height: "30px" }}
          />
        </div>

        <div className="best-stats">
          <h3 style={{ textAlign: "center", textDecoration: "underline" }}>
            Stats
          </h3>
          <div className="stats-grid-2col">
            <div className="grid-label"></div>
            <div className="grid-col-header">Current</div>
            <div className="grid-col-header">Best</div>

            <div className="stat-label">Time</div>
            <div className="stat-label">
              {formatStatTime(stats.current.time)}
            </div>
            <div className="stat-label">{formatStatTime(stats.best.time)}</div>

            <div className="stat-label">Mo3</div>
            <div className="stat-label">
              {formatStatTime(stats.current.mo3)}
            </div>
            <div className="stat-label">{formatStatTime(stats.best.mo3)}</div>

            <div className="stat-label">Ao5</div>
            <div className="stat-label">
              {formatStatTime(stats.current.ao5)}
            </div>
            <div className="stat-label">{formatStatTime(stats.best.ao5)}</div>

            <div className="stat-label">Ao12</div>
            <div className="stat-label">
              {formatStatTime(stats.current.ao12)}
            </div>
            <div className="stat-label">{formatStatTime(stats.best.ao12)}</div>
          </div>

          <div className="custom-button-group">
            <CustomButton
              label={`WCA: ${state.wcaInspection ? "ON" : "OFF"}`}
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  wcaInspection: !prev.wcaInspection,
                }))
              }
              isSubmitting={false}
              style={{
                backgroundColor: state.wcaInspection
                  ? "rgba(104,175,106,0.8)"
                  : "rgba(128,128,128,0.2)", // green if ON, grey if OFF

                height: "30px",
              }}
            />
            <CustomButton
              label="Export"
              onClick={downloadSession}
              isSubmitting={false}
              style={{ height: "30px" }}
            />
          </div>
        </div>
      </div>

      {popupSolve && (
        <div className="popup">
          <h4>Scramble</h4>
          <p>{popupSolve.scramble}</p>
          <p>{new Date(popupSolve.date).toLocaleString()}</p>
          {(() => {
            const partialStats = calculateStats(
              state.solves.slice(0, popupIndex + 1),
            );
            const ao5 = partialStats.current.ao5;
            const ao12 = partialStats.current.ao12;
            return (
              <>
                <p>AO5: {formatStatTime(ao5)}</p>
                <p>AO12: {formatStatTime(ao12)}</p>
              </>
            );
          })()}
          <div
            className="custom-button-group"
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "center",
              marginTop: "12px",
            }}
          >
            <CustomButton
              label="OK"
              onClick={() => {
                addPenalty(popupIndex, 0); // Clear penalty by setting to 0
                setPopupSolve(null);
              }}
            />
            <CustomButton
              label="+2"
              onClick={() => {
                addPenalty(popupIndex, 1);
                setPopupSolve(null);
              }}
            />
            <CustomButton
              label="DNF"
              onClick={() => {
                addPenalty(popupIndex, 2);
                setPopupSolve(null);
              }}
            />
            <CustomButton label="Close" onClick={() => setPopupSolve(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default TimerPage;
