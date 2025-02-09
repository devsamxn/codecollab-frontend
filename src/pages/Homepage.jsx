import { useState } from "react";
import { Editor } from "@monaco-editor/react";
import useEditorStore from "../util/store";
import axios from "axios";

export default function Home() {
  const { code, setCode, language, setLanguage } = useEditorStore();
  const [output, setOutput] = useState("");

  const runCode = async () => {
    try {
      const response = await axios.post("http://localhost:5000/run", {
        language,
        code,
      });
      setOutput(response.data.output);
    } catch (error) {
      setOutput("Error executing code");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="p-4 text-lg font-bold text-center bg-gray-800">
        Online IDE
      </header>

      {/* Language Selection */}
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

      {/* Editor */}
      <div className="flex-1 p-4">
        <Editor
          height="60vh"
          theme="vs-dark"
          language={language}
          value={code}
          onChange={(newValue) => setCode(newValue || "")}
        />
      </div>

      {/* Run Button & Output */}
      <div className="p-4">
        <button
          onClick={runCode}
          className="bg-green-500 px-4 py-2 rounded text-white"
        >
          Run Code
        </button>
        <pre className="mt-4 bg-gray-800 p-4 rounded">{output}</pre>
      </div>
    </div>
  );
}
