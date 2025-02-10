import { Editor } from "@monaco-editor/react";
import useEditorStore from "../util/store";
import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function EditorComponent({ roomId, password }) {
  const { code, setCode, language } = useEditorStore();

  useEffect(() => {
    console.log(`🔗 Subscribing to "codeUpdate" for room ${roomId}`);

    const handleCodeUpdate = (updatedCode) => {
      if (!updatedCode) {
        console.error("❌ Received empty or invalid code update!");
      } else {
        console.log(`📥 Received "codeUpdate" in room ${roomId}:`, updatedCode);
        setCode(updatedCode);
      }
    };

    socket.on("codeUpdate", handleCodeUpdate);
    console.log("below codeUpdate listentner");

    return () => {
      console.log(`🔌 Unsubscribing from "codeUpdate" for room ${roomId}`);
      socket.off("codeUpdate", handleCodeUpdate);
    };
  }, [setCode]);

  const handleChange = (newValue) => {
    console.log(newValue);
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
