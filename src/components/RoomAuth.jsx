import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";

// const socket = io("http://localhost:5000");

export default function RoomAuth({ onAuthenticated, socket }) {
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  const handleCreateRoom = () => {
    setLoading(true);
    setError("");

    socket.emit("createRoom", { password }, ({ roomId, error }) => {
      setLoading(false);
      if (error) {
        setError(error);
      } else {
        onAuthenticated(roomId, password); // ✅ Send password to Home.js
      }
    });
  };

  const handleJoinRoom = () => {
    setLoading(true);
    setError("");

    socket.emit(
      "joinRoom",
      { roomId, password },
      ({ success, error, code }) => {
        setLoading(false);
        if (error) {
          setError(error);
        } else {
          onAuthenticated(roomId, password, code); // ✅ Send password to Home.js
        }
      }
    );
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">
        {isCreatingRoom ? "Create a New Room" : "Join an Existing Room"}
      </h1>

      {!isCreatingRoom && (
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="p-2 bg-gray-700 rounded mb-2"
        />
      )}

      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 bg-gray-700 rounded mb-4"
      />

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <button
        onClick={isCreatingRoom ? handleCreateRoom : handleJoinRoom}
        className="bg-blue-500 px-4 py-2 rounded w-40 flex justify-center"
        disabled={loading}
      >
        {loading
          ? "Processing..."
          : isCreatingRoom
          ? "Create Room"
          : "Join Room"}
      </button>

      <button
        onClick={() => setIsCreatingRoom(!isCreatingRoom)}
        className="mt-4 text-sm text-gray-400 underline"
      >
        {isCreatingRoom ? "Join an Existing Room" : "Create a New Room"}
      </button>
    </div>
  );
}
