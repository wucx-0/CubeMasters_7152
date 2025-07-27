import React, { useState } from "react";
import CustomButton from "../CustomButton.jsx";

function FriendsSidebar({ friends, onAddFriend }) {
  return (
    <div className="friends-sidebar">
      <div className="friends-sidebar-header">
        <span>#</span>
        <span>Username</span>
        <span>Country</span>
        <span></span>
      </div>
      <div className="friends-scroll-area">
        {friends.length === 0 && <p>No friends found.</p>}
        {friends.map((friend, idx) => (
          <div key={friend.username} className="friends-sidebar-row">
            <span>{idx + 1}</span>
            <span>{friend.username}</span>
            <span>{friend.country}</span>
            <span
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            ></span>
            <span>
              <CustomButton
                className="add-friend-button"
                onClick={() => onAddFriend(friend.username)}
                style={{ width: "50px" }}
              >
                Add
              </CustomButton>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FriendsSidebar;
