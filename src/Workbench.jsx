import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";

const styles = `
  :root {
    --default-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }
  html, body, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    font-family: Inter, var(--default-font-family);
    overflow: hidden;
  }
  .main-container {
    display: flex;
    flex-direction: column;
    height: 100vh; /* full viewport height */
    width: 100vw;  /* full viewport width */
    background: #ffffff;
  }
  .top-nav {
    display: flex;
    align-items: center;
    padding: 12px 24px;
    background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0; /* don’t shrink */
  }
  .logo {
    height: 60px;
    margin-right: 24px;
  }
  .nav-items {
    display: flex;
    gap: 24px;
    font-size: 14px;
  }
  .nav-items a {
    color: #374151;
    text-decoration: none;
  }
  .nav-items a.active {
    color: #000000;
    font-weight: 500;
  }
  .content {
    display: flex;
    flex: 1; /* fill remaining height */
    background: #f9fafb;
    gap: 24px;
    overflow: hidden;
  }
  .sidebar {
    width: 280px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    padding: 16px;
    overflow-y: auto; /* scroll if content too tall */
  }
  .main-editor {
    flex: 1;
    background: white;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
  }
  .editor-header {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  }
  .editor-title {
    font-size: 16px;
    font-weight: 600;
  }
  .run-button {
    background: #2563eb;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
  }
  .run-button:hover {
    background: #1d4ed8;
  }
  .editor-content {
    flex: 1;
    display: flex;
    gap: 16px;
    padding: 16px;
    overflow: hidden;
  }
  .code-panel, .output-panel {
    flex: 1;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .panel-header {
    padding: 8px 16px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
    font-weight: 500;
    flex-shrink: 0;
  }
  .panel-content {
    padding: 16px;
    font-family: monospace;
    font-size: 14px;
    line-height: 1.5;
    overflow: auto;
    white-space: pre-wrap;
    flex: 1;
  }
  .code-panel .panel-content {
    background: #1e1e1e;
    color: #d4d4d4;
  }
  .sidebar-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  .example-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .example-item {
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    color: #374151;
  }
  .example-item:hover {
    background: #f3f4f6;
  }
  .example-item.selected {
    background: #e0e7ff;
    font-weight: 600;
  }
`;

function Workbench() {
  const examples = [
    {
      name: "Basic Chat Completion",
      code: `const response = await baje.complete({
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Tell me about Barbados." }
  ],
  temperature: 0.7,
  max_tokens: 150
});`,
      response: "Barbados is an island country in the Caribbean..."
    },
    {
      name: "Streaming Response",
      code: `// Code for streaming response`,
      response: "Streaming response example..."
    },
    {
      name: "Function Calling",
      code: `// Code for function calling`,
      response: "Function calling example..."
    },
    {
      name: "Classification",
      code: `// Code for classification`,
      response: "Classification example..."
    },
    {
      name: "Text Analysis",
      code: `// Code for text analysis`,
      response: "Text analysis example..."
    }
  ];

  const [selectedExample, setSelectedExample] = useState(0);
  const [currentCode, setCurrentCode] = useState(examples[0].code);
  const [output, setOutput] = useState("");

  useEffect(() => {
    setCurrentCode(examples[selectedExample].code);
    setOutput("");
  }, [selectedExample]);

  const runCode = () => {
    setOutput(examples[selectedExample].response);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="main-container">
        <nav className="top-nav">
          <Link to="/baje">
            <img src="isle.png" alt="Isle Logo" className="logo" />
          </Link>
          <div className="nav-items">
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
              Dashboard
            </NavLink>
            <NavLink to="/workbench" className={({ isActive }) => isActive ? "active" : ""}>
              Workbench
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => isActive ? "active" : ""}>
              Settings
            </NavLink>
          </div>
        </nav>

        <main className="content">
          <aside className="sidebar">
            <div className="sidebar-title">Examples</div>
            <ul className="example-list">
              {examples.map((example, idx) => (
                <li
                  key={idx}
                  className={`example-item ${selectedExample === idx ? "selected" : ""}`}
                  onClick={() => setSelectedExample(idx)}
                >
                  {example.name}
                </li>
              ))}
            </ul>
          </aside>

          <div className="main-editor">
            <div className="editor-header">
              <div className="editor-title">API Playground</div>
              <button className="run-button" onClick={runCode}>Run ▶</button>
            </div>
            <div className="editor-content">
              <div className="code-panel">
                <div className="panel-header">Code</div>
                <div className="panel-content">
                  <pre>{currentCode}</pre>
                </div>
              </div>
              <div className="output-panel">
                <div className="panel-header">Output</div>
                <div className="panel-content">
                  {output || "Output will appear here after running the code."}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default Workbench;