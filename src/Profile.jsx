// Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";

/**
 * Supabase client INSIDE this file.
 * Uses your project URL + ANON key (no signed URLs).
 * Bucket "avatars" must be PUBLIC.
 */
const supabase = createClient(
  "https://lgurtucciqvwgjaphdqp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndXJ0dWNjaXF2d2dqYXBoZHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2MzgzNTAsImV4cCI6MjA0NTIxNDM1MH0.I1ajlHp5b4pGL-NQzzvcVdznoiyIvps49Ws5GZHSXzk"
);

/** -------------------- styles -------------------- */
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
    maxWidth: "800px",
    height: "900px",
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
  returnButton: {
    position: "absolute",
    right: "20px",
    top: "20px",
    fontSize: "24px",
    color: "white",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    backgroundColor: "#005A9C",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "40px",
    marginRight: "20px",
    fontWeight: "bold",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  info: { flex: 1 },
  name: { fontSize: "24px", fontWeight: "700", marginBottom: "5px" },
  email: { fontSize: "16px", color: "#888" },
  uploadButton: {
    marginTop: "8px",
    padding: "8px 16px",
    backgroundColor: "#005A9C",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    marginRight: "10px",
  },
  retryButton: {
    marginTop: "8px",
    padding: "8px 16px",
    backgroundColor: "#5DB075",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  errorMessage: { color: "red", fontSize: "14px", marginTop: "5px" },
  successMessage: { color: "#5DB075", fontSize: "14px", marginTop: "5px" },
  sections: { flex: 1, padding: "20px", overflowY: "auto" },
  section: {
    backgroundColor: "#1E1E1E",
    borderRadius: "10px",
    padding: "15px",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "500",
    marginBottom: "15px",
    color: "#5DB075",
  },
  option: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #303139",
  },
  lastOption: { borderBottom: "none" },
  logoutBtn: {
    width: "100%",
    padding: "15px",
    backgroundColor: "#005A9C",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "18px",
    cursor: "pointer",
    marginTop: "10px",
  },
};

/** -------------------- component -------------------- */
export default function Profile() {
  const [userData, setUserData] = useState({
    initials: "JD",
    name: "John Doe",
    email: "john.doe@example.com",
  });

  // avatarFileName is the object key in the bucket (e.g., "john_doe_123.png")
  const [avatarFileName, setAvatarFileName] = useState(null);

  // avatarImage is the final URL we render (public, no signing)
  const [avatarImage, setAvatarImage] = useState(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const navigate = useNavigate();

  /** Create a safe filename */
  const getSafeFileName = (email, ext) => {
    const safeEmail = email.replace(/[^a-zA-Z0-9]/g, "_");
    return `${safeEmail}_${Date.now()}.${ext}`;
  };

  /** Get a PUBLIC URL (no signing) for a stored object */
  const getPublicUrl = (fileName) => {
    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    return data?.publicUrl || null;
  };

  /** On mount, check auth session and pull avatar from user metadata (avatarUrl) */
  useEffect(() => {
    (async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

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
          : (email?.charAt(0) || "U").toUpperCase() +
            (email?.split("@")[0]?.charAt(0) || "S").toUpperCase();

        setUserData({ initials, name: username, email });

        // If metadata already has a public avatar URL, use it as-is
        const existingAvatarUrl = session.user.user_metadata?.avatarUrl || null;
        if (existingAvatarUrl) {
          setAvatarImage(existingAvatarUrl);
          // Try to parse a filename from the URL for later updates (optional)
          try {
            const parts = existingAvatarUrl.split("/");
            const last = parts[parts.length - 1];
            // remove any query param
            setAvatarFileName(last.split("?")[0]);
          } catch {
            /* ignore */
          }
        }
      }
    })();
  }, []);

  /** Handle avatar upload to PUBLIC bucket and save the public URL to user metadata */
  const handleImageUpload = async (e) => {
    if (!isAuthenticated) {
      setErrorMessage("You must be logged in to upload an avatar.");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) {
      setErrorMessage("No file selected.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File size exceeds 5MB limit.");
      return;
    }

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setErrorMessage("Only PNG and JPEG images are allowed.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const ext = file.name.split(".").pop();
      const fileName = getSafeFileName(userData.email, ext);

      // Upload to PUBLIC bucket (no signed URL)
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setErrorMessage(`Failed to upload image: ${uploadError.message}`);
        setIsUploading(false);
        return;
      }

      setAvatarFileName(fileName);

      // Get permanent public URL
      const publicUrl = getPublicUrl(fileName);
      if (!publicUrl) {
        setErrorMessage("Failed to retrieve public URL.");
        setIsUploading(false);
        return;
      }

      // Update user metadata with the public URL (no signing!)
      const { data: updateData, error: updateError } =
        await supabase.auth.updateUser({
          data: { avatarUrl: publicUrl },
        });

      if (updateError) {
        console.error("Update error:", updateError);
        setErrorMessage(
          `Uploaded image but failed to save profile: ${updateError.message}`
        );
      } else if (updateData?.user) {
        // Cache-bust to ensure the newly uploaded image shows immediately
        setAvatarImage(`${publicUrl}?v=${Date.now()}`);
        setSuccessMessage("Profile saved successfully.");
      }
    } catch (err) {
      console.error("Error during upload:", err);
      setErrorMessage("An unexpected error occurred while uploading the image.");
    } finally {
      setIsUploading(false);
    }
  };

  /** Retry save metadata only (no re-upload) */
  const handleRetrySaveProfile = async () => {
    if (!isAuthenticated || !avatarFileName) {
      setErrorMessage("Cannot retry: Please log in and ensure an avatar is uploaded.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const publicUrl = getPublicUrl(avatarFileName);
      if (!publicUrl) {
        setErrorMessage("Failed to recreate public URL.");
        setIsUploading(false);
        return;
      }

      const { data, error } = await supabase.auth.updateUser({
        data: { avatarUrl: publicUrl },
      });

      if (error) {
        console.error("Retry error:", error);
        setErrorMessage(`Failed to save profile: ${error.message}`);
      } else if (data?.user) {
        setAvatarImage(`${publicUrl}?v=${Date.now()}`);
        setSuccessMessage("Profile saved successfully.");
      }
    } catch (err) {
      console.error("Retry error:", err);
      setErrorMessage("An unexpected error occurred while saving the profile.");
    } finally {
      setIsUploading(false);
    }
  };

  /** Logout */
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
      setAvatarImage(null);
      setAvatarFileName(null);
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
          <button style={styles.returnButton} onClick={() => navigate("/baje")}>
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
          </button>

          <div
            style={{
              ...styles.avatar,
              backgroundImage: avatarImage ? `url("${avatarImage}")` : "none",
              backgroundColor: avatarImage ? "transparent" : "#005A9C",
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
                ...(isUploading || !isAuthenticated
                  ? { opacity: 0.6, cursor: "not-allowed" }
                  : null),
              }}
              onClick={() => document.getElementById("avatar-upload").click()}
              disabled={isUploading || !isAuthenticated}
            >
              {isUploading
                ? "Uploading..."
                : isAuthenticated
                ? "Upload Avatar"
                : "Login to Upload"}
            </button>

            {errorMessage?.toLowerCase().includes("failed to save profile") && (
              <button
                style={{
                  ...styles.retryButton,
                  ...(isUploading ? { opacity: 0.6, cursor: "not-allowed" } : null),
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
