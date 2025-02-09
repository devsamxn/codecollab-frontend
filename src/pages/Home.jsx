import { useState, useEffect } from "react";
import axios from "axios";
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

  useEffect(() => {
    if (!roomId) return;

    // Join the room via WebSockets
    socket.emit("joinRoom", { roomId });

    // Listen for real-time code updates from other users
    socket.on("codeUpdate", (updatedCode) => {
      setCode(updatedCode);
    });

    return () => {
      socket.off("codeUpdate");
    };
  }, [roomId]);

  const runCode = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/code/run", {
        language,
        code,
      });
      setOutput(response.data.output);
    } catch (error) {
      setOutput("Error executing code");
    }
    setLoading(false);
  };

  const handleAuthenticated = (room) => {
    setRoomId(room);
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

      <EditorComponent roomId={roomId} />

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
    <RoomAuth onAuthenticated={handleAuthenticated} />
  );
}
