import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function RoomAuth({ onAuthenticated }) {
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  //   const [username, setUsername] = useState(""); // Track username
  //   const [socketId, setSocketId] = useState(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get socket ID when connected
    socket.on("connect", () => {
      //   setSocketId(socket.id);
      console.log("Socket ID received:", socket.id);
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  const handleCreateRoom = async () => {
    try {
      const response = await axios.post("http://localhost:5000/rooms/create", {
        password,
      });
      onAuthenticated(response.data.roomId);
    } catch (err) {
      setError("Failed to create room");
    }
  };

  const handleJoinRoom = async () => {
    // if (!socketId) {
    //   setError("WebSocket connection not established.");
    //   return;
    // }

    try {
      const response = await axios.post("http://localhost:5000/rooms/join", {
        roomId,
        password,
      });
      if (response.data.success) {
        onAuthenticated(roomId);
      }
    } catch (err) {
      setError("Invalid Room ID or Password");
    }
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

      {/* <input
        type="text"
        placeholder="Enter Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="p-2 bg-gray-700 rounded mb-2"
      /> */}

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
        className="bg-blue-500 px-4 py-2 rounded"
      >
        {isCreatingRoom ? "Create Room" : "Join Room"}
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
