import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import Editor from "@monaco-editor/react";
import "highlight.js/styles/github.css";
import "./App.css";

const API = import.meta.env.VITE_API_URL; // ✅ IMPORTANT

function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [framework, setFramework] = useState("jest");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleClick = async (type) => {
    setLoading(true);
    setOutput("");

    let endpoint = "";
    if (type === "Analyze") endpoint = "/api/analyze";
    if (type === "Generate Tests") endpoint = "/api/tests";
    if (type === "Optimize") endpoint = "/api/optimize";

    try {
      const res = await axios.post(
        `${API}${endpoint}`, // ✅ FULL URL
        {
          code,
          language,
          framework
        }
      );
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
    <div className={darkMode ? "dark bg-gray-900 text-white" : "bg-gray-100 text-black"}>
      <div className="p-6 min-h-screen">
        <div className="flex justify-between mb-4">
          <h1 className="text-3xl font-bold">🛡️ CodeGuardian — AI Code Reviewer</h1>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>

        <Editor
          height="300px"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(v) => setCode(v)}
        />

        <div className="flex gap-3 mt-4">
          <button onClick={() => handleClick("Analyze")}>Analyze</button>
          <button onClick={() => handleClick("Generate Tests")}>Generate Tests</button>
          <button onClick={() => handleClick("Optimize")}>Optimize</button>
        </div>

        <h3 className="text-xl font-semibold mt-6">AI Output:</h3>

        <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded mt-2">
          {loading ? (
            <div>Loading...</div>
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
    </div>
  );
}

export default App;
