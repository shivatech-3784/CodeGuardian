import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import Editor from "@monaco-editor/react";
import "highlight.js/styles/github.css";
import "./App.css";

/* ✅ CHANGE 1: ADD THIS LINE */
const API = import.meta.env.VITE_API_URL;

function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [framework, setFramework] = useState("jest");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const mapToMonaco = {
    javascript: "javascript",
    typescript: "typescript",
    python: "python",
    java: "java",
    csharp: "csharp",
    cpp: "cpp",
  };

  const btnStyle =
    "px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-600 transition";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert("Copied to clipboard!");
  };

  const downloadFile = (type) => {
    if (!output) return alert("No output to download!");
    let blob;

    if (type === "txt") blob = new Blob([output], { type: "text/plain" });
    if (type === "md") blob = new Blob([output], { type: "text/markdown" });
    if (type === "json")
      blob = new Blob([JSON.stringify({ output }, null, 2)], {
        type: "application/json",
      });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `codeguardian_output.${type}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClick = async (type) => {
    setLoading(true);
    setOutput("");

    let endpoint = "";
    if (type === "Analyze") endpoint = "/api/analyze";
    if (type === "Generate Tests") endpoint = "/api/tests";
    if (type === "Optimize") endpoint = "/api/optimize";

    try {
      /* ✅ CHANGE 2: PREFIX API URL */
      const res = await axios.post(`${API}${endpoint}`, {
        code,
        language,
        framework,
      });
      setOutput(res.data.result);
    } catch (err) {
      setOutput(
        "Backend error: " +
          (err.response?.status || "") +
          " " +
          (err.response?.data?.error || err.message)
      );
    }

    setLoading(false);
  };

  return (
    <div
      className={
        (darkMode ? "dark" : "light") +
        " min-h-screen p-6 " +
        (darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black")
      }
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          🛡️ CodeGuardian — AI Code Reviewer
        </h1>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500"
        >
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* LANGUAGE SELECT */}
      <div className="font-semibold mb-2">Programming Language:</div>

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="px-3 py-2 rounded-md bg-gray-200 text-black mb-4"
      >
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="typescript">TypeScript</option>
        <option value="csharp">C#</option>
        <option value="cpp">C++</option>
      </select>

      {/* EDITOR */}
      <div className="rounded-lg overflow-hidden shadow-lg border border-gray-400 dark:border-gray-700 mb-6">
        <Editor
          height="300px"
          language={mapToMonaco[language]}
          value={code}
          theme="vs-dark"
          onChange={(value) => setCode(value)}
          options={{
            fontSize: 15,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      {/* BUTTONS */}
      <div className="flex gap-4 flex-wrap mb-6">
        <button className={btnStyle} onClick={() => handleClick("Analyze")}>
          Analyze
        </button>

        <div className="font-semibold">Test Framework:</div>

        <select
          value={framework}
          onChange={(e) => setFramework(e.target.value)}
          className="px-3 py-2 rounded-md bg-gray-200 text-black"
        >
          <option value="jest">Jest (JavaScript)</option>
          <option value="pytest">PyTest (Python)</option>
          <option value="junit">JUnit (Java)</option>
          <option value="catch2">Catch2 (C++)</option>
          <option value="nunit">NUnit (C#)</option>
        </select>

        <button
          className={btnStyle}
          onClick={() => handleClick("Generate Tests")}
        >
          Generate Tests
        </button>

        <button className={btnStyle} onClick={() => handleClick("Optimize")}>
          Optimize
        </button>
      </div>

      {/* OUTPUT ACTION BUTTONS */}
      <div className="flex justify-end gap-3 mb-4">
        <button className={btnStyle} onClick={copyToClipboard}>
          Copy Output
        </button>
        <button className={btnStyle} onClick={() => downloadFile("txt")}>
          📄 Download TXT
        </button>
        <button className={btnStyle} onClick={() => downloadFile("md")}>
          📝 Download MD
        </button>
        <button className={btnStyle} onClick={() => downloadFile("json")}>
          📦 Download JSON
        </button>
      </div>

      {/* MARKDOWN OUTPUT */}
      <h3 className="text-xl font-semibold mb-2">AI Output:</h3>

      <div
        className={
          (darkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-black") +
          " p-4 rounded-lg max-h-[400px] overflow-y-auto"
        }
      >
        {loading ? (
          <div className="loader"></div>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {output}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default App;
