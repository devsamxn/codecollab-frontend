import { Editor } from "@monaco-editor/react";
import useEditorStore from "../util/store";
import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

export default function EditorComponent({ roomId, socket }) {
  const { code, setCode, language } = useEditorStore();
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

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
  const saveCode = async () => {
    if (!roomId) return;

    setSaving(true);
    setSaveMessage("");

    try {
      const response = await axios.post("http://localhost:5000/rooms/save", {
        roomId,
        code,
      });

      if (response.data.success) {
        setSaveMessage("✅ Code saved!");
      } else {
        setSaveMessage("❌ Failed to save code");
      }
    } catch (error) {
      setSaveMessage("❌ Error saving code");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 2000);
    }
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

      {/* Save Button */}
      <div className="mt-4">
        <button
          onClick={saveCode}
          className="bg-blue-500 px-4 py-2 rounded text-white"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Code"}
        </button>
        {saveMessage && <p className="mt-2 text-sm">{saveMessage}</p>}
      </div>
    </div>
  );
}
