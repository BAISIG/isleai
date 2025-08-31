import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';

const styles = {
  pageWrapper: {
    margin: 0,
    padding: 0,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, sans-serif",
    backgroundColor: "#000",
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  container: {
    width: "100%",
    maxWidth: "700px",
    height: "840px",
    backgroundColor: "#121212",
    borderRadius: "12px",
    color: "white",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "#1E1E1E",
    position: "relative",
  },
  headerTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#5DB075",
  },
  returnButton: {
    position: "absolute",
    right: "10px",
    top: "10px",
    fontSize: "19.2px", // Increased by 20% from 16px
    color: "white",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0",
    marginTop: "5px",
    "@media (min-width: 480px) and (max-width: 767px)": {
      fontSize: "21.6px", // Increased by 20% from 18px
      right: "12px",
      top: "12px",
      marginTop: "6px",
    },
    "@media (min-width: 768px) and (max-width: 1024px)": {
      fontSize: "24px", // Increased by 20% from 20px
      right: "15px",
      top: "15px",
      marginTop: "7px",
    },
    "@media (min-width: 1025px)": {
      fontSize: "28.8px", // Increased by 20% from 24px
      right: "20px",
      top: "20px",
      marginTop: "8px",
    },
  },
  content: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
  },
  card: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    padding: "16px 20px",
    marginBottom: "20px",
    color: "white",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  iconWrapper: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#1f2937",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "10px",
  },
  title: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#4ade80",
  },
  description: {
    fontSize: "15px",
    color: "#e5e5e5",
    opacity: 0.85,
  },
  time: {
    fontSize: "13px",
    color: "#aaa",
    alignSelf: "flex-end",
    marginTop: "8px",
  },
  loading: {
    fontSize: "16px",
    color: "#e5e5e5",
    textAlign: "center",
    padding: "20px",
  },
  error: {
    fontSize: "16px",
    color: "#f87171",
    textAlign: "center",
    padding: "20px",
  },
};

const icons = {
  traffic: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#4ade80"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  water: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#22d3ee"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2C12 2 7 9 7 13a5 5 0 0 0 10 0c0-4-5-11-5-11z" />
    </svg>
  ),
  waste: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fbbf24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="6" width="18" height="14" rx="2" ry="2" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="9" y1="6" x2="9" y2="20" />
    </svg>
  ),
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("/api/notifications");
        setNotifications(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load notifications. Please try again later.");
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Notifications</h1>
          <button
            style={styles.returnButton}
            onClick={() => navigate('/baje')}
          >
<FontAwesomeIcon
  icon={faArrowRightFromBracket}
  style={{
    width: "30px",     // increase width
    height: "30px",    // keep it proportional
    marginTop: "28px", // push it down
    marginRight: "35px"
  }}
/>
          </button>
        </div>

        <div style={styles.content}>
          {loading && <div style={styles.loading}>Loading notifications...</div>}
          {error && <div style={styles.error}>{error}</div>}
          {!loading &&
            !error &&
            notifications.length === 0 && (
              <div style={styles.loading}>No notifications available.</div>
            )}
          {!loading &&
            !error &&
            notifications.map((note) => (
              <div key={note.id} style={styles.card}>
                <div style={styles.iconWrapper}>{icons[note.type]}</div>
                <div style={styles.title}>{note.title}</div>
                <div style={styles.description}>{note.description}</div>
                <div style={styles.time}>
                  {formatDistanceToNow(new Date(note.created_at), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}