import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import useEditorStore from "../util/store";
import EditorComponent from "../components/EditorComponent";
import OutputComponent from "../components/OutputComponent";
import RoomAuth from "../components/RoomAuth";

const socket = io("http://localhost:5000");

export default function Home() {
  const { language, setLanguage, code, setCode } = useEditorStore();
  const [output, setOutput] = useState("");
  const [roomId, setRoomId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState(""); // Store password

  useEffect(() => {
    if (!roomId) return;

    // Listen for real-time code updates
    const handleCodeUpdate = (updatedCode) => {
      console.log("📥 Received Code Update: ", updatedCode);
      setCode(updatedCode);
    };

    // Listen for real-time output updates
    const handleOutputUpdate = (updatedOutput) => {
      console.log("📥 Received Output Update: ", updatedOutput);
      setOutput(updatedOutput);
    };

    // Listen for running state update
    const handleRunningUpdate = (isRunning) => {
      console.log(
        "⚡ Code Execution State:",
        isRunning ? "Running..." : "Idle"
      );
      setLoading(isRunning);
    };

    socket.on("codeUpdate", handleCodeUpdate);
    socket.on("outputUpdate", handleOutputUpdate);
    socket.on("runningUpdate", handleRunningUpdate);

    return () => {
      socket.off("codeUpdate", handleCodeUpdate);
      socket.off("outputUpdate", handleOutputUpdate);
      socket.off("runningUpdate", handleRunningUpdate);
    };
  }, [roomId]);

  // 🔹 Emit the run code event and update all users
  const runCode = () => {
    if (!roomId) return;
    socket.emit("codeRun", { roomId, language, code });
  };

  // 🔹 Handle authentication and set room details
  const handleAuthenticated = (room, pass, code) => {
    console.log("🔑 Room Authenticated:", room);
    setRoomId(room);
    setPassword(pass); // ✅ Store password
    setCode(code);
  };

  return roomId ? (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <header className="p-4 text-lg font-bold text-center bg-gray-800">
        Online IDE (Room: {roomId})
      </header>

      {/* Language Selection Dropdown */}
      <div className="p-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-gray-700 p-2 rounded"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
      </div>

      {/* Code Editor */}
      <EditorComponent roomId={roomId} socket={socket} />

      {/* Run Button & Output */}
      <div className="p-4">
        <button
          onClick={runCode}
          className="bg-green-500 px-4 py-2 rounded text-white flex items-center"
          disabled={loading}
        >
          {loading ? "Running..." : "Run Code"}
        </button>
        <OutputComponent output={output} />
      </div>
    </div>
  ) : (
    <RoomAuth onAuthenticated={handleAuthenticated} socket={socket} />
  );
}
