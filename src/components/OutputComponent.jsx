export default function OutputComponent({ output }) {
  return (
    <div className="text-sm break-words whitespace-norma max-h-50 overflow-auto">
      <pre className="bg-gray-800 p-4 rounded whitespace-pre-wrap break-words">
        {output || "No Output"}
      </pre>
    </div>
  );
}
