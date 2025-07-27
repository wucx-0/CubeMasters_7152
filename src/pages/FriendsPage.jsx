import React, { useEffect, useState } from "react";
import "./pages.css";
import {
  TextField,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Avatar,
  Divider,
  Tooltip,
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

import FriendsSidebar from "../components/FriendsSidebar/FriendsSidebar.jsx";

const countries = [
  { value: "us", label: "United States" },
  { value: "sg", label: "Singapore" },
  { value: "uk", label: "United Kingdom" },
  { value: "in", label: "India" },
  { value: "au", label: "Australia" },
  { value: "cn", label: "China" },
  { value: "kr", label: "South Korea" },
  { value: "jp", label: "Japan" },
  // add the rest if needed
];

const getCountryLabel = (code) =>
  countries.find((c) => c.value === code)?.label || code;

// Badge icons with tooltip labels for clarity
const badgeIcons = {
  "100solves": "🥉",
  sub30: "🥈",
  uploaded: "🥇",
};

const FriendsPage = () => {
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Example: load friends from API or props
  const [friends, setFriends] = useState([
    {
      name: "Alice",
      username: "alice123",
      country: "Singapore",
      description: "Loves 3x3 and Pyraminx",
      points: 1500,
    },
    {
      name: "Bob",
      username: "bob_solver",
      country: "USA",
      description: "Speedcubing enthusiast",
      points: 1200,
    },
    // ...more friends
  ]);

  const handleAddFriend = (username) => {
    alert(`Add friend clicked for: ${username}`);
    // Your logic here, e.g. send friend request
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "users"));
        // Map each doc to user personalisation + id for keys
        const users = snapshot.docs
          .map((doc) => {
            const data = doc.data().personalisation;
            return data ? { id: doc.id, ...data } : null;
          })
          .filter(Boolean);
        setAllUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const filtered = allUsers.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.username?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="pages timer-grid">
      <div className="main-timer-center">
        <div className="search" style={{ marginBottom: "24px" }}>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          />
          <span className="search-icon material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Search by name or username"
            className="search-input"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
        </div>

        {loading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={2}>
            {filtered.map((user) => (
              <Grid item xs={12} sm={6} md={4} key={user.id}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item>
                        {user.profilePicture ? (
                          <Avatar alt={user.name} src={user.profilePicture} />
                        ) : (
                          <Avatar>
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </Avatar>
                        )}
                      </Grid>
                      <Grid item xs>
                        <Typography variant="h6">{user.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          @{user.username} • {getCountryLabel(user.country)}
                        </Typography>
                      </Grid>
                    </Grid>

                    {user.description && (
                      <Typography
                        variant="body2"
                        sx={{ marginTop: 1 }}
                        color="text.secondary"
                      >
                        {user.description}
                      </Typography>
                    )}

                    <Divider sx={{ my: 1.5 }} />

                    <Typography variant="subtitle2">Stats:</Typography>
                    <Typography variant="body2">
                      Average 3x3:{" "}
                      {user.average3x3 && user.average3x3 !== ""
                        ? user.average3x3
                        : "N/A"}{" "}
                      seconds
                    </Typography>
                    <Typography variant="body2">
                      Total Solves: {user.totalSolves ?? 0}
                    </Typography>

                    {/*future feature*/}
                    {/*<Typography variant="subtitle2" sx={{ mt: 1 }}>
                    Badges:
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "1.3rem" }}>
                    {user.badges && user.badges.length > 0 ? (
                      user.badges.map((badge, idx) => (
                        <Tooltip key={idx} title={badge} arrow>
                          <span style={{ marginRight: 8 }}>
                            {badgeIcons[
                              badge.toLowerCase().replace(/\s/g, "")
                            ] || "🏅"}
                          </span>
                        </Tooltip>
                      ))
                    ) : (
                      <span>No badges yet</span>
                    )}
                  </Typography>*/}

                    <Button
                      variant="contained"
                      fullWidth
                      size="small"
                      sx={{ marginTop: 2 }}
                    >
                      Add Friend
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </div>

      <div className="right-sidebar">
        <FriendsSidebar friends={friends} onAddFriend={handleAddFriend} />
      </div>
    </div>
  );
};

export default FriendsPage;
