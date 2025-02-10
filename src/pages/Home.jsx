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

    // Join the room via WebSockets
    // socket.emit("joinRoom", { roomId });

    // Listen for real-time code updates
    const handleCodeUpdate = (updatedCode) => {
      console.log(
        "inside handleCodeUpdate after listening to codeUpdate: ",
        updatedCode
      );
      setCode(updatedCode);
    };

    // Listen for real-time output updates
    const handleOutputUpdate = (updatedOutput) => {
      console.log(
        "inside handleCodeUpdate after listening to outputUpdate: ",
        updatedOutput
      );
      setOutput(updatedOutput);
      // setLoading(false); // Stop loading when execution finishes
    };
    const handleRunning = (state) => {
      setLoading(state);
    };

    socket.on("codeUpdate", handleCodeUpdate);
    socket.on("runningUpdate", handleRunning);
    socket.on("outputUpdate", handleOutputUpdate);

    return () => {
      socket.off("codeUpdate", handleCodeUpdate);
      socket.off("outputUpdate", handleOutputUpdate);
    };
  }, [roomId]);

  const runCode = () => {
    if (!roomId) return;

    // setLoading(true);
    socket.emit("codeRun", { roomId, language, code });
  };

  const handleAuthenticated = (room, pass) => {
    console.log("in home", room, pass);
    setRoomId(room);
    setPassword(pass); // ✅ Save password
  };

  return roomId ? (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <header className="p-4 text-lg font-bold text-center bg-gray-800">
        Online IDE (Room: {roomId})
      </header>

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

      <EditorComponent roomId={roomId} password={password} />

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
