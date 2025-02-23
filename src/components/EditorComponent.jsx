import { Editor } from "@monaco-editor/react";
import useEditorStore from "../util/store";
import { useEffect, useState } from "react";
import axios from "axios";
export default function EditorComponent({ roomId, socket }) {
  const { code, setCode, language } = useEditorStore();

  useEffect(() => {
    console.log(code);
    console.log(`🔗 Subscribing to "codeUpdate" for room ${roomId}`);

    const handleCodeUpdate = (updatedCode) => {
      console.log(updatedCode);
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
  }, [code, roomId, setCode]);

  const handleChange = (newValue) => {
    console.log(newValue);
    setCode(newValue || "");

    // Send updates via WebSockets
    socket.emit("codeChange", { roomId, code: newValue });
  };

  return (
    <div className="flex-1 p-4">
      <Editor
        height="80vh"
        theme="vs-dark"
        language={language}
        value={code}
        onChange={handleChange}
      />
    </div>
  );
}
