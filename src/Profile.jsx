import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";

// Initialize Supabase client
const supabase = createClient(
  "https://lgurtucciqvwgjaphdqp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndXJ0dWNjaXF2d2dqYXBoZHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2MzgzNTAsImV4cCI6MjA0NTIxNDM1MH0.I1ajlHp5b4pGL-NQzzvcVdznoiyIvps49Ws5GZHSXzk"
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
  },
  header: {
    display: "flex",
    alignItems: "center",
    padding: "10px",
    backgroundColor: "#1E1E1E",
    position: "relative",
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
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: "16px",
    fontWeight: "700",
    marginBottom: "4px",
  },
  email: {
    fontSize: "12px",
    color: "#888",
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
  },
  retryButton: {
    marginTop: "8px",
    padding: "6px 12px",
    backgroundColor: "#5DB075",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  errorMessage: {
    color: "red",
    fontSize: "12px",
    marginTop: "4px",
  },
  successMessage: {
    color: "#5DB075",
    fontSize: "12px",
    marginTop: "4px",
  },
  sections: {
    flex: 1,
    padding: "10px",
    overflowY: "auto",
  },
  section: {
    backgroundColor: "#1E1E1E",
    borderRadius: "6px",
    padding: "10px",
    marginBottom: "10px",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "10px",
    color: "#5DB075",
  },
  option: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #303139",
  },
  lastOption: {
    borderBottom: "none",
  },
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
  },
};

function Profile() {
  const [userData, setUserData] = useState({
    initials: "JD",
    name: "John Doe",
    email: "john.doe@example.com",
  });
  const [avatarFileName, setAvatarFileName] = useState(null);
  const [avatarImage, setAvatarImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  // Generate safe filename
  const getSafeFileName = (email, ext) => {
    const safeEmail = email.replace(/[^a-zA-Z0-9]/g, "_");
    return `${safeEmail}_${Date.now()}.${ext}`;
  };

  // On mount, check session and fetch user data
  useEffect(() => {
    async function checkSession() {
      const { data: { session }, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        setErrorMessage("Failed to check authentication status.");
        return;
      }

      setIsAuthenticated(!!session);
      if (session?.user) {
        const email = session.user.email;
        const username =
          session.user.user_metadata?.display_name ||
          session.user.user_metadata?.username ||
          email.split("@")[0];
        const initials = username
          ? username.slice(0, 2).toUpperCase()
          : email.charAt(0).toUpperCase() +
            email.split("@")[0].charAt(0).toUpperCase();

        setUserData({ initials, name: username, email });

        const avatarUrl = session.user.user_metadata?.avatarUrl || null;
        if (avatarUrl) {
          setAvatarImage(avatarUrl); // public URL now
        }
      }
    }
    checkSession();
  }, []);

  const handleImageUpload = async (e) => {
    if (!isAuthenticated) {
      setErrorMessage("You must be logged in to upload an avatar.");
      return;
    }

    const file = e.target.files[0];
    if (!file) return setErrorMessage("No file selected.");
    if (file.size > 5 * 1024 * 1024)
      return setErrorMessage("File size exceeds 5MB limit.");
    if (!["image/png", "image/jpeg"].includes(file.type))
      return setErrorMessage("Only PNG and JPEG images are allowed.");

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const ext = file.name.split(".").pop();
      const fileName = getSafeFileName(userData.email, ext);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setErrorMessage(`Failed to upload image: ${uploadError.message}`);
        setIsUploading(false);
        return;
      }

      setAvatarFileName(fileName);

      // Direct public URL (no signed URL needed)
      const publicUrl = `https://lgurtucciqvwgjaphdqp.supabase.co/storage/v1/object/public/avatars/${fileName}`;
      setAvatarImage(publicUrl);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatarUrl: publicUrl },
      });

      if (updateError) {
        console.error("Update error:", updateError);
        setErrorMessage(
          `Uploaded image but failed to save profile: ${updateError.message}`
        );
      } else {
        setSuccessMessage("Profile saved successfully.");
      }
    } catch (error) {
      console.error("Error during upload:", error);
      setErrorMessage("An unexpected error occurred while uploading the image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetrySaveProfile = async () => {
    if (!isAuthenticated || !avatarFileName) {
      setErrorMessage(
        "Cannot retry: Please log in and ensure an avatar is uploaded."
      );
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const publicUrl = `https://lgurtucciqvwgjaphdqp.supabase.co/storage/v1/object/public/avatars/${avatarFileName}`;
      const { error } = await supabase.auth.updateUser({
        data: { avatarUrl: publicUrl },
      });

      if (error) {
        console.error("Retry error:", error);
        setErrorMessage(`Failed to save profile: ${error.message}`);
      } else {
        setSuccessMessage("Profile saved successfully.");
      }
    } catch (error) {
      console.error("Retry error:", error);
      setErrorMessage("An unexpected error occurred while saving the profile.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        setErrorMessage("Failed to log out. Please try again.");
        return;
      }
      setIsAuthenticated(false);
      setUserData({
        initials: "JD",
        name: "John Doe",
        email: "john.doe@example.com",
      });
      navigate("/login");
    } catch (error) {
      console.error("Unexpected logout error:", error);
      setErrorMessage("An unexpected error occurred during logout.");
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button
            style={styles.returnButton}
            onClick={() => navigate("/baje")}
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
          </button>

          <div
            style={{
              ...styles.avatar,
              ...(avatarImage && {
                backgroundImage: `url(${avatarImage})`,
                backgroundColor: "transparent",
              }),
            }}
          >
            {!avatarImage && userData.initials}
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
              accept="image/png, image/jpeg"
              style={{ display: "none" }}
              id="avatar-upload"
              onChange={handleImageUpload}
              disabled={isUploading || !isAuthenticated}
            />

            <button
              style={{
                ...styles.uploadButton,
                ...((isUploading || !isAuthenticated) && {
                  opacity: 0.6,
                  cursor: "not-allowed",
                }),
              }}
              onClick={() =>
                document.getElementById("avatar-upload").click()
              }
              disabled={isUploading || !isAuthenticated}
            >
              {isUploading
                ? "Uploading..."
                : isAuthenticated
                ? "Upload Avatar"
                : "Login to Upload"}
            </button>

            {errorMessage?.includes("failed to save profile") && (
              <button
                style={{
                  ...styles.retryButton,
                  ...(isUploading && { opacity: 0.6, cursor: "not-allowed" }),
                }}
                onClick={handleRetrySaveProfile}
                disabled={isUploading}
              >
                Retry Saving Profile
              </button>
            )}
          </div>
        </div>

        <div style={styles.sections}>
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Account Settings</div>
            <div style={styles.option}>
              <span>Edit Profile</span>
              <span
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/settings?scrollTo=profile")}
              >
                ›
              </span>
            </div>
            <div style={{ ...styles.option, ...styles.lastOption }}>
              <span>Change Password</span>
              <span
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/settings?scrollTo=password")}
              >
                ›
              </span>
            </div>
          </div>

          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
