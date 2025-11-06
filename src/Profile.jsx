import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from '@supabase/supabase-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';

// Initialize Supabase client
const supabase = createClient(
  'https://lgurtucciqvwgjaphdqp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndXJ0dWNjaXF2d2dqYXBoZHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2MzgzNTAsImV4cCI6MjA0NTIxNDM1MH0.I1ajlHp5b4pGL-NQzzvcVdznoiyIvps49Ws5GZHSXzk'
);

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
  loadingContainer: {
    color: "white",
    textAlign: "center",
    padding: "20px",
  },
  container: {
    width: "100%",
    maxWidth: "100%",
    height: "100%",
    backgroundColor: "#121212",
    borderRadius: "8px",
    color: "white",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxSizing: "border-box",
    "@media (min-width: 320px) and (max-width: 479px)": {
      maxWidth: "100%",
      height: "100%",
      borderRadius: "0",
    },
    "@media (min-width: 480px) and (max-width: 767px)": {
      maxWidth: "90%",
      height: "90%",
      borderRadius: "8px",
    },
    "@media (min-width: 768px) and (max-width: 1024px)": {
      maxWidth: "80%",
      height: "85%",
      borderRadius: "10px",
    },
    "@media (min-width: 1025px) and (max-width: 1280px)": {
      maxWidth: "700px",
      height: "840px",
      borderRadius: "12px",
    },
    "@media (min-width: 1281px)": {
      maxWidth: "800px",
      height: "900px",
      borderRadius: "12px",
    },
  },
  header: {
    display: "flex",
    alignItems: "center",
    padding: "10px",
    backgroundColor: "#1E1E1E",
    position: "relative",
    "@media (min-width: 320px) and (max-width: 479px)": {
      padding: "8px",
    },
    "@media (min-width: 480px) and (max-width: 767px)": {
      padding: "12px",
    },
    "@media (min-width: 768px) and (max-width: 1024px)": {
      padding: "15px",
    },
    "@media (min-width: 1025px)": {
      padding: "20px",
    },
  },
  returnButton: {
    position: "absolute",
    right: "10px",
    top: "10px",
    fontSize: "16px",
    color: "white",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0",
    "@media (min-width: 480px) and (max-width: 767px)": {
      fontSize: "18px",
      right: "12px",
      top: "12px",
    },
    "@media (min-width: 768px) and (max-width: 1024px)": {
      fontSize: "20px",
      right: "15px",
      top: "15px",
    },
    "@media (min-width: 1025px)": {
      fontSize: "24px",
      right: "20px",
      top: "20px",
    },
  },
  avatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#005A9C",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "24px",
    marginRight: "10px",
    fontWeight: "bold",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    "@media (min-width: 480px) and (max-width: 767px)": {
      width: "70px",
      height: "70px",
      fontSize: "28px",
      marginRight: "12px",
    },
    "@media (min-width: 768px) and (max-width: 1024px)": {
      width: "80px",
      height: "80px",
      fontSize: "32px",
      marginRight: "15px",
    },
    "@media (min-width: 1025px)": {
      width: "100px",
      height: "100px",
      fontSize: "40px",
      marginRight: "20px",
    },
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: "16px",
    fontWeight: "700",
    marginBottom: "4px",
    "@media (min-width: 480px) and (max-width: 767px)": {
      fontSize: "18px",
      marginBottom: "5px",
    },
    "@media (min-width: 768px) and (max-width: 1024px)": {
      fontSize: "20px",
      marginBottom: "5px",
    },
    "@media (min-width: 1025px)": {
      fontSize: "24px",
      marginBottom: "5px",
    },
  },
  email: {
    fontSize: "12px",
    color: "#888",
    "@media (min-width: 480px) and (max-width: 767px)": {
      fontSize: "14px",
    },
    "@media (min-width: 768px) and (max-width: 1024px)": {
      fontSize: "15px",
    },
    "@media (min-width: 1025px)": {
      fontSize: "16px",
    },
  },
  uploadButton: {
    marginTop: "8px",
    padding: "6px 12px",
    backgroundColor: "#005A9C",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    marginRight: "8px",
    "@media (min-width: 480px) and (max-width: 767px)": {
      padding: "7px 14px",
      fontSize: "13px",
      marginRight: "9px",
    },
    "@media (min-width: 768px) and (max-width: 1024px)": {
      padding: "8px 15px",
      fontSize: "13px",
      marginRight: "10px",
    },
    "@media (min-width: 1025px)": {
      padding: "8px 16px",
      fontSize: "14px",
      marginRight: "10px",
    },
  },
  errorMessage: {
    color: "red",
    fontSize: "12px",
    marginTop: "4px",
    "@media (min-width: 480px) and (max-width: 767px)": {
      fontSize: "13px",
      marginTop: "5px",
    },
    "@media (min-width: 768px) and (max-width: 1024px)": {
      fontSize: "13px",
      marginTop: "5px",
    },
    "@media (min-width: 1025px)": {
      fontSize: "14px",
      marginTop: "5px",
    },
  },
  successMessage: {
    color: "#5DB075",
    fontSize: "12px",
    marginTop: "4px",
    "@media (min-width: 480px) and (max-width: 767px)": {
      fontSize: "13px",
      marginTop: "5px",
    },
    "@media (min-width: 768px) and (max-width: 1024px)": {
      fontSize: "13px",
      marginTop: "5px",
    },
    "@media (min-width: 1025px)": {
      fontSize: "14px",
      marginTop: "5px",
    },
  },
  sections: {
    flex: 1,
    padding: "10px",
    overflowY: "auto",
    "@media (min-width: 480px) and (max-width: 767px)": {
      padding: "12px",
    },
    "@media (min-width: 768px) and (max-width: 1024px)": {
      padding: "15px",
    },
    "@media (min-width: 1025px)": {
      padding: "20px",
    },
  },
  section: {
    backgroundColor: "#1E1E1E",
    borderRadius: "6px",
    padding: "10px",
    marginBottom: "10px",
    "@media (min-width: 480px) and (max-width: 767px)": {
      borderRadius: "8px",
      padding: "12px",
      marginBottom: "15px",
    },
    "@media (min-width: 768px) and (max-width: 1024px)": {
      borderRadius: "8px",
      padding: "12px",
      marginBottom: "15px",
    },
    "@media (min-width: 1025px)": {
      borderRadius: "10px",
      padding: "15px",
      marginBottom: "20px",
    },
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "10px",
    color: "#5DB075",
    "@media (min-width: 480px) and (max-width: 767px)": {
      fontSize: "15px",
      marginBottom: "12px",
    },
    "@media (min-width: 768px) and (max-width: 1024px)": {
      fontSize: "16px",
      marginBottom: "12px",
    },
    "@media (min-width: 1025px)": {
      fontSize: "18px",
      marginBottom: "15px",
    },
  },
  option: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #303139",
    "@media (min-width: 480px) and (max-width: 767px)": {
      padding: "9px 0",
    },
    "@media (min-width: 768px) and (max-width: 1024px)": {
      padding: "9px 0",
    },
    "@media (min-width: 1025px)": {
      padding: "10px 0",
    },
  },
  lastOption: {
    borderBottom: "none",
  },
  toggle: (active) => ({
    width: "40px",
    height: "20px",
    backgroundColor: "#303139",
    borderRadius: "10px",
    position: "relative",
    cursor: "pointer",
    transition: "background 0.3s",
    ...(active && {
      backgroundColor: "#5DB075",
    }),
    "@media (min-width: 480px) and (max-width: 767px)": {
      width: "45px",
      height: "22px",
    },
    "@media (min-width: 768px) and (max-width: 1024px)": {
      width: "45px",
      height: "22px",
    },
    "@media (min-width: 1025px)": {
      width: "50px",
      height: "24px",
    },
  }),
  toggleCircle: (active) => ({
    content: "''",
    position: "absolute",
    width: "16px",
    height: "16px",
    top: "2px",
    left: active ? "22px" : "2px",
    borderRadius: "50%",
    backgroundColor: "white",
    transition: "left 0.3s",
    "@media (min-width: 480px) and (max-width: 767px)": {
      width: "18px",
      height: "18px",
      left: active ? "25px" : "2px",
    },
    "@media (min-width: 768px) and (max-width: 1024px)": {
      width: "18px",
      height: "18px",
      left: active ? "25px" : "2px",
    },
    "@media (min-width: 1025px)": {
      width: "20px",
      height: "20px",
      left: active ? "26px" : "2px",
    },
  }),
  logoutBtn: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#005A9C",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    marginTop: "8px",
    "@media (min-width: 480px) and (max-width: 767px)": {
      padding: "12px",
      fontSize: "15px",
      marginTop: "9px",
    },
    "@media (min-width: 768px) and (max-width: 1024px)": {
      padding: "12px",
      fontSize: "16px",
      marginTop: "10px",
    },
    "@media (min-width: 1025px)": {
      padding: "15px",
      fontSize: "18px",
      marginTop: "10px",
    },
  },
};

function Profile() {
  const [userData, setUserData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  // Fetch profile data from API
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          navigate('/login');
          return;
        }

        const res = await fetch('/api/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          credentials: 'include',
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            await supabase.auth.signOut();
            navigate('/login');
            return;
          }
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to fetch profile');
        }

        const data = await res.json();
        setUserData(data);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setErrorMessage(err.message || 'Failed to load profile');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [navigate]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds 5MB limit.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Only JPG/PNG images are allowed.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      // Extract CSRF token from cookie
      const csrfCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('_csrf='));
      const csrfToken = csrfCookie ? decodeURIComponent(csrfCookie.split('=')[1]) : null;
      if (!csrfToken) {
        throw new Error('CSRF token not available. Please refresh the page.');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('_csrf', csrfToken);

      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Upload failed');
      }

      const { avatarUrl } = await res.json();
      setUserData(prev => ({ ...prev, avatarUrl }));
      setSuccessMessage('Avatar updated successfully.');
    } catch (err) {
      console.error('Avatar upload error:', err);
      setErrorMessage(err.message || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        setErrorMessage('Failed to log out. Please try again.');
        return;
      }
      navigate('/login');
    } catch (error) {
      console.error('Unexpected logout error:', error);
      setErrorMessage('An unexpected error occurred during logout.');
    }
  };

  if (loading) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.loadingContainer}>Loading Profile...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.loadingContainer}>Profile not found. Redirecting...</div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button
            style={styles.returnButton}
            onClick={() => navigate('/baje')}
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
          </button>
          <div
            style={{
              ...styles.avatar,
              ...(userData.avatarUrl && { backgroundImage: `url(${userData.avatarUrl})`, backgroundColor: 'transparent' }),
            }}
          >
            {!userData.avatarUrl && userData.initials}
          </div>
          <div style={styles.info}>
            <div style={styles.name}>{userData.name}</div>
            <div style={styles.email}>{userData.email}</div>
            {errorMessage && (
              <div style={styles.errorMessage}>{errorMessage}</div>
            )}
            {successMessage && (
              <div style={styles.successMessage}>{successMessage}</div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              style={{ display: "none" }}
              id="avatar-upload"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
            <button
              style={{
                ...styles.uploadButton,
                ...(isUploading && { opacity: 0.6, cursor: 'not-allowed' }),
              }}
              onClick={() => document.getElementById("avatar-upload").click()}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Avatar'}
            </button>
          </div>
        </div>
        <div style={styles.sections}>
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Account Settings</div>
            <div style={styles.option}>
              <span>Edit Profile</span>
              <span
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/settings?scrollTo=profile')}
              >
                ›
              </span>
            </div>
            <div style={{ ...styles.option, ...styles.lastOption }}>
              <span>Change Password</span>
              <span
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/settings?scrollTo=password')}
              >
                ›
              </span>
            </div>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
