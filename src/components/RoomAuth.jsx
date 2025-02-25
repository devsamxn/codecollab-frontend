import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import CabinDropdown from "./CabinDropdown";

export default function RoomAuth({ onAuthenticated, socket }) {
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  // 🔹 Auto-Fill Room ID & Password from Invite Link
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get("roomId");
    const passwordFromUrl = urlParams.get("password");

    if (roomFromUrl && passwordFromUrl) {
      setRoomId(roomFromUrl);
      setPassword(passwordFromUrl);
      // toast.info("🔗 Room details auto-filled from invite link!", {
      //   position: "top-right",
      // });
    }
  }, []);

  // 🔹 Handle Room Creation
  const handleCreateRoom = () => {
    if (!password) {
      toast.error("⚠️ Please enter a password!", { position: "top-right" });
      return;
    }

    setLoading(true);
    setError("");

    socket.emit("createRoom", { password }, ({ roomId, code, error }) => {
      setLoading(false);
      if (error) {
        toast.error(`❌ ${error}`, { position: "top-right" });
      } else {
        toast.success("✅ Room Created!", { position: "top-right" });
        onAuthenticated(roomId, password, code);
      }
    });
  };

  // 🔹 Handle Room Joining
  const handleJoinRoom = () => {
    if (!roomId) {
      toast.error("⚠️ Please select a room to join!", {
        position: "top-right",
      });
      return;
    }

    setLoading(true);
    setError("");

    socket.emit(
      "joinRoom",
      { roomId, password },
      ({ success, error, code }) => {
        setLoading(false);
        if (error) {
          toast.error(`❌ ${error}`, { position: "top-right" });
        } else {
          toast.success("✅ Joined Room!", { position: "top-right" });
          onAuthenticated(roomId, password, code);
        }
      }
    );
  };

  return (
    <div className="h-screen flex bg-gray-900 text-white">
      <ToastContainer />

      {/* 🔹 Left Section: Room Selection */}
      <div className="w-1/2 flex flex-col items-center justify-center border-r border-gray-700 p-6">
        <h2 className="text-3xl font-bold mb-4">Available Rooms</h2>
        <CabinDropdown setRoomId={setRoomId} roomId={roomId} />
        {/* 🔹 Dropdown for Room Selection */}
        <div className="relative w-64">
          {/* <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full bg-gray-700 p-3 rounded text-left"
          >
            {roomId ? `Selected: Room ${roomId}` : "Select a Room"}
          </button>

          {dropdownOpen && (
            <div className="absolute w-full mt-2 bg-gray-800 rounded shadow-lg max-h-60 overflow-auto">
              {rooms.length > 0 ? (
                rooms.map((id) => (
                  <div
                    key={id}
                    onClick={() => {
                      setRoomId(id);
                      setDropdownOpen(false);
                    }}
                    className="p-3 cursor-pointer hover:bg-gray-700"
                  >
                    Room {id}
                  </div>
                ))
              ) : (
                <p className="p-3 text-gray-400 text-center">
                  No rooms created in the last 24 hours.
                </p>
              )}
            </div>
          )} */}
        </div>
      </div>

      {/* 🔹 Right Section: Join/Create Room */}
      <div className="w-1/2 flex flex-col items-center justify-center p-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md w-96">
          <h1 className="text-3xl font-bold mb-4 text-center">
            {isCreatingRoom ? "Create a New Room" : "Join an Existing Room"}
          </h1>

          {/* 🔹 Enter Password */}
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 w-full bg-gray-700 rounded mb-4 text-center text-lg"
          />

          {error && <p className="text-red-500 mb-2 text-center">{error}</p>}

          {/* 🔹 Join/Create Room Button */}
          <button
            onClick={isCreatingRoom ? handleCreateRoom : handleJoinRoom}
            className="hover:bg-blue-700 bg-blue-500  duration-300 transition-colors cursor-pointer w-full px-4 py-2 rounded text-white mb-4 text-lg"
            disabled={loading || (!isCreatingRoom && !roomId)}
          >
            {loading
              ? "letting you in..."
              : isCreatingRoom
              ? "Create Room"
              : "Join Room"}
          </button>

          {/* 🔹 Toggle Between Join/Create */}
          <button
            onClick={() => setIsCreatingRoom(!isCreatingRoom)}
            className="text-lg underline block text-center w-full hover:tracking-wide cursor-pointer text-white"
          >
            {isCreatingRoom ? "Join an Existing Room" : "Create a New Room"}
          </button>
        </div>
      </div>
    </div>
  );
}
