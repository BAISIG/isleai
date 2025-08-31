
import React, { useState } from 'react';

const styles = {
  pageWrapper: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, sans-serif",
    background: "#f9fafb",
    margin: 0,
    padding: 0,
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    padding: "12px 24px",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
  },
  navItems: {
    display: "flex",
    gap: "24px",
    fontSize: "14px",
  },
  navLink: {
    color: "#374151",
    textDecoration: "none",
  },
  navLinkActive: {
    color: "#000000",
    fontWeight: 500,
    textDecoration: "none",
  },
  logo: {
    marginRight: "24px",
    display: "flex",
    alignItems: "center",
  },
  logoImage: {
    height: "60px", // Adjust size as needed
    width: "auto",
  },
  container: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  form: {
    background: "white",
    borderRadius: "8px",
    padding: "32px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    maxWidth: "800px",
    width: "100%",
  },
  title: {
    fontSize: "24px",
    fontWeight: 600,
    marginBottom: "24px",
    color: "#111827",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },
  fullWidth: {
    gridColumn: "1 / -1",
  },
  group: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: 500,
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    fontFamily: "inherit",
    fontSize: "14px",
  },
  textarea: {
    minHeight: "120px",
    resize: "vertical",
  },
  map: {
    height: "300px",
    borderRadius: "6px",
    marginBottom: "16px",
    backgroundColor: "#e5e7eb",
  },
  upload: {
    border: "2px dashed #e5e7eb",
    borderRadius: "6px",
    padding: "24px",
    textAlign: "center",
    cursor: "pointer",
  },
  uploadIcon: {
    width: "40px",
    height: "40px",
    marginBottom: "12px",
    color: "#6b7280",
  },
  uploadText: {
    fontSize: "14px",
    color: "#6b7280",
  },
  button: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
  },
};

const ReportIssue = () => {
  const [formData, setFormData] = useState({
    issueType: '',
    urgency: '',
    description: '',
    latitude: '',
    longitude: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div style={styles.pageWrapper}>
      <nav style={styles.nav}>
        <a href="/baje" style={styles.logo}>
          <img src="/isle.png" alt="Isle Logo" style={styles.logoImage} />
        </a>
        <div style={styles.navItems}>
          <a href="/dashboard" style={styles.navLink}>Dashboard</a>
          <a href="/report" style={styles.navLinkActive}>Report Issue</a>
          <a href="/settings" style={styles.navLink}>Settings</a>
        </div>
      </nav>

      <div style={styles.container}>
        <form style={styles.form}>
          <h1 style={styles.title}>Report an Issue</h1>
          <div style={styles.grid}>
            <div style={styles.group}>
              <label style={styles.label}>Issue Type</label>
              <select
                name="issueType"
                value={formData.issueType}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Select issue type</option>
                <option value="traffic">Traffic Problem</option>
                <option value="water">Water Interruption</option>
                <option value="dumping">Illegal Dumping</option>
                <option value="infrastructure">Infrastructure Damage</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Urgency Level</label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Select urgency</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div style={{ ...styles.group, ...styles.fullWidth }}>
              <label style={styles.label}>Issue Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={{ ...styles.input, ...styles.textarea }}
                placeholder="Please describe the issue in detail..."
                required
              />
            </div>

            <div style={{ ...styles.group, ...styles.fullWidth }}>
              <label style={styles.label}>Location</label>
              <div id="map" style={styles.map}>[Map Placeholder]</div>
              <input type="hidden" name="latitude" value={formData.latitude} />
              <input type="hidden" name="longitude" value={formData.longitude} />
            </div>

            <div style={{ ...styles.group, ...styles.fullWidth }}>
              <label style={styles.label}>Upload Photos</label>
              <div style={styles.upload}>
                <svg style={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div style={styles.uploadText}>Drag and drop files here or click to browse</div>
                <input type="file" multiple accept="image/*" style={{ display: 'none' }} />
              </div>
            </div>

            <div style={{ ...styles.group, ...styles.fullWidth }}>
              <button type="submit" style={styles.button}>Submit Report</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;
