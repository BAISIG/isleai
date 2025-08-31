import React, { useState } from "react";

function Playground() {
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  const [trafficStats] = useState({
    activeIncidents: 12,
    avgResponseTime: 8,
  });

  const [tourismStats] = useState({
    touristArrivals: 1243,
    activeTours: 28,
  });

  const [agentStats] = useState({
    responseTime: 2.3,
    accuracy: 98,
  });

  const sendMessage = () => {
    if (!userInput.trim()) return;
    setChatMessages([...chatMessages, { text: userInput, sender: "user" }]);
    setUserInput("");
  };

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, sans-serif",
        background: "#f9fafb",
        overflow: "hidden",
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 24px",
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: "24px", fontSize: "14px" }}>
          <a
            href="https://example.com/dashboard"
            style={{ color: "#374151", textDecoration: "none" }}
          >
            Dashboard
          </a>
          <a
            href="https://example.com/workbench"
            style={{ color: "#374151", textDecoration: "none" }}
          >
            Workbench
          </a>
          <a
            href="https://example.com/issues"
            style={{
              color: "#000",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Issues
          </a>
          <a
            href="https://example.com/help"
            style={{ color: "#374151", textDecoration: "none" }}
          >
            Help
          </a>
        </div>
      </nav>

      {/* Main content area fills remaining space */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
          padding: "32px 24px",
          overflow: "auto",
        }}
      >
        {/* Traffic */}
        <IssueCard
          title="Traffic Management"
          iconColor="#dc2626"
          iconBg="#fee2e2"
          stats={[
            { label: "Active Incidents", value: trafficStats.activeIncidents },
            { label: "Avg Response Time", value: `${trafficStats.avgResponseTime}m` },
          ]}
          buttonLabel="View Traffic Details"
        />

        {/* Tourism */}
        <IssueCard
          title="Tourism Status"
          iconColor="#15803d"
          iconBg="#ddfdd6"
          stats={[
            { label: "Tourist Arrivals Today", value: tourismStats.touristArrivals.toLocaleString() },
            { label: "Active Tours", value: tourismStats.activeTours },
          ]}
          buttonLabel="View Tourism Data"
        />

        {/* Agent */}
        <div style={cardStyle}>
          <div style={headerStyle}>
            <div style={{ ...iconStyle, background: "#e0f2fe", color: "#0284c7" }}>
              💬
            </div>
            <h2 style={titleStyle}>Main Agent</h2>
          </div>

          <div style={statsGridStyle}>
            <StatItem label="Response Time" value={`${agentStats.responseTime}s`} />
            <StatItem label="Accuracy" value={`${agentStats.accuracy}%`} />
          </div>

          <div
            style={{
              marginTop: "20px",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "20px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                marginBottom: "12px",
                padding: "8px",
                background: "#f8fafc",
                borderRadius: "8px",
              }}
            >
              {chatMessages.map((msg, index) => (
                <div key={index}>{msg.text}</div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask me anything about Barbados..."
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  padding: "8px 16px",
                  background: "#0284c7",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IssueCard({ title, stats, iconColor, iconBg, buttonLabel }) {
  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div style={{ ...iconStyle, background: iconBg, color: iconColor }}>📊</div>
        <h2 style={titleStyle}>{title}</h2>
      </div>

      <div style={statsGridStyle}>
        {stats.map((stat, index) => (
          <StatItem key={index} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div style={{ height: "200px", marginBottom: "20px" }}>
        <canvas />
      </div>

      <button style={actionButtonStyle}>{buttonLabel}</button>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "20px", fontWeight: 600, color: "#0f172a" }}>{value}</div>
    </div>
  );
}

const cardStyle = {
  background: "white",
  borderRadius: "12px",
  padding: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  // To allow "Main Agent" card to stretch height if needed
  height: "100%",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "20px",
};

const iconStyle = {
  width: "40px",
  height: "40px",
  padding: "8px",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
};

const titleStyle = {
  fontSize: "18px",
  fontWeight: 600,
  color: "#111827",
  margin: 0,
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
  marginBottom: "20px",
  flexShrink: 0,
};

const actionButtonStyle = {
  width: "100%",
  padding: "12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontWeight: 500,
  cursor: "pointer",
};

export default Playground;
