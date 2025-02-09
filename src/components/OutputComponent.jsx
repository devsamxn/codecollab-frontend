export default function OutputComponent({ output }) {
  return (
    <pre className="mt-4 bg-gray-800 p-4 rounded">{output || "No Output"}</pre>
  );
}
