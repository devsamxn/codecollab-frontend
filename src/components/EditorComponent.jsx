import { Editor } from "@monaco-editor/react";
import useEditorStore from "../util/store";
import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", { autoConnect: true });

export default function EditorComponent({ roomId }) {
  const { code, setCode, language } = useEditorStore();

  useEffect(() => {
    console.log("Room ID:", roomId);
    if (!roomId) return;

    // Join the WebSocket room
    socket.emit("joinRoom", { roomId });

    // Listen for real-time code updates
    const handleCodeUpdate = (updatedCode) => {
      setCode(updatedCode);
    };

    socket.on("codeUpdate", handleCodeUpdate);

    return () => {
      socket.off("codeUpdate", handleCodeUpdate);
    };
  }, [roomId]);

  const handleChange = (newValue) => {
    setCode(newValue || "");

    // Send updates via WebSockets
    socket.emit("codeChange", { roomId, code: newValue });
  };

  return (
    <div className="flex-1 p-4">
      <Editor
        height="60vh"
        theme="vs-dark"
        language={language}
        value={code}
        onChange={handleChange}
      />
    </div>
  );
}
