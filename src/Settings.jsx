import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  'https://lgurtucciqvwgjaphdqp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndXJ0dWNjaXF2d2dqYXBoZHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2MzgzNTAsImV4cCI6MjA0NTIxNDM1MH0.I1ajlHp5b4pGL-NQzzvcVdznoiyIvps49Ws5GZHSXzk'
);

const VITE_API_URL = 'https://isleaihono.baisig246.workers.dev';

const Settings = () => {
  const [formData, setFormData] = useState({
    organizationName: "Acme Corp",
    displayName: "John Doe",
    plan: "Pro",
    cardNumber: "**** **** **** 1234",
    billingEmail: "billing@acmecorp.com",
    password: "",
    notificationsEmail: true,
    notificationsSMS: false,
    privacyProfilePublic: true,
    deleteConfirmation: "",
  });
  const [error, setError] = useState("");
  const [isSaveHover, setIsSaveHover] = useState(false);
  const [isDeleteHover, setIsDeleteHover] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' or 'error'

  const profileRef = useRef(null);
  const passwordRef = useRef(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const scrollTo = queryParams.get('scrollTo');

  useEffect(() => {
    // Fetch current user data to populate displayName
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        showMessage('Failed to fetch user data. Please log in again.', 'error');
        // Redirect to login after a short delay
        setTimeout(() => { window.location.href = "/login"; }, 2000);
        return;
      }
      if (user && user.user_metadata?.display_name) {
        setFormData((prev) => ({
          ...prev,
          displayName: user.user_metadata.display_name,
        }));
      }
    };
    fetchUser();

    if (scrollTo === 'profile' && profileRef.current) {
      profileRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (scrollTo === 'password' && passwordRef.current) {
      passwordRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [scrollTo]);

  // Function to display custom messages
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 3000); // Message disappears after 3 seconds
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError(""); // Clear error when input changes
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!formData.displayName || !formData.organizationName) {
      setError("Organization Name and Display Name are required.");
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: formData.displayName },
      });
      if (error) throw error;
      showMessage("Profile saved successfully!", 'success');
    } catch (err) {
      setError("Failed to update profile: " + err.message);
      showMessage("Failed to update profile: " + err.message, 'error');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });
      if (error) throw error;
      showMessage("Password updated successfully!", 'success');
      setFormData((prev) => ({ ...prev, password: "" })); // Clear password field
    } catch (err) {
      setError("Failed to update password: " + err.message);
      showMessage("Failed to update password: " + err.message, 'error');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    showMessage("Settings saved!", 'success');
    // In a real app, you'd save these settings to a backend
    console.log("Settings saved:", formData);
  };

  const initiateDeleteAccount = () => {
    if (formData.deleteConfirmation.toLowerCase() !== "delete") {
      setError("Please type 'delete' to confirm account deletion.");
      return;
    }
    setShowConfirmModal(true); // Show the custom confirmation modal
  };

  const confirmDeleteAccount = async () => {
    setShowConfirmModal(false); // Hide the modal
    try {
      // Check for existing session
      let { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session || !session.user) {
        // Attempt to refresh the session
        const { data: refreshedSession, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshedSession?.session) {
          showMessage("User not authenticated. Please log in again.", 'error');
          setTimeout(() => { window.location.href = "/login"; }, 2000);
          return;
        }
        session = refreshedSession.session;
      }

      const userId = session.user.id;
      const accessToken = session.access_token;

      const response = await fetch(`${VITE_API_URL}/api/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error("Failed to parse response JSON:", jsonError);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.message) {
        throw new Error("Invalid server response");
      }

      await supabase.auth.signOut();
      showMessage("Account deleted successfully!", 'success');
      setFormData((prev) => ({ ...prev, deleteConfirmation: "" }));
      setTimeout(() => { window.location.href = "/login"; }, 2000); // Redirect after message
    } catch (err) {
      setError("Failed to delete account: " + err.message);
      showMessage("Failed to delete account: " + err.message, 'error');
      console.error("Delete account error:", err);
    }
  };

  return (
    <>
      <style jsx>{`
        .mainContainer {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background: #f9fafb;
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .mainContainer {
            padding: 8px;
            height: auto;
            min-height: 100vh;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .mainContainer {
            padding: 12px;
            height: auto;
            min-height: 100vh;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .mainContainer {
            padding: 16px;
            height: 100vh;
            min-height: 100vh;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .mainContainer {
            padding: 20px;
            height: 100vh;
            min-height: 100vh;
          }
        }
        @media (min-width: 1281px) {
          .mainContainer {
            padding: 24px;
            height: 100vh;
            min-height: 100vh;
          }
        }

        .topNav {
          background-color: #fff;
          padding: 1rem 2rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .topNav {
            padding: 0.5rem 1rem;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .topNav {
            padding: 0.75rem 1.5rem;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .topNav {
            padding: 0.75rem 1.5rem;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .topNav {
            padding: 1rem 1.75rem;
          }
        }
        @media (min-width: 1281px) {
          .topNav {
            padding: 1rem 2rem;
          }
        }

        .logo {
          height: 60px;
          margin-right: 24px;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .logo {
            height: 40px;
            margin-right: 12px;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .logo {
            height: 48px;
            margin-right: 16px;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .logo {
            height: 50px;
            margin-right: 20px;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .logo {
            height: 55px;
            margin-right: 22px;
          }
        }
        @media (min-width: 1281px) {
          .logo {
            height: 60px;
            margin-right: 24px;
          }
        }

        .navItems {
          display: flex;
          gap: 2rem;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .navItems {
            gap: 1rem;
            font-size: 12px;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .navItems {
            gap: 1.5rem;
            font-size: 13px;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .navItems {
            gap: 1.75rem;
            font-size: 14px;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .navItems {
            gap: 2rem;
            font-size: 14px;
          }
        }
        @media (min-width: 1281px) {
          .navItems {
            gap: 2rem;
            font-size: 16px;
          }
        }

        .navItemLink {
          color: #333;
          text-decoration: none;
          font-weight: 600;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .navItemLink {
            font-size: 12px;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .navItemLink {
            font-size: 13px;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .navItemLink {
            font-size: 14px;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .navItemLink {
            font-size: 14px;
          }
        }
        @media (min-width: 1281px) {
          .navItemLink {
            font-size: 16px;
          }
        }

        .navItemLinkActive {
          color: #0070f3;
          border-bottom: 2px solid #0070f3;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .navItemLinkActive {
            border-bottom: 1px solid #0070f3;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .navItemLinkActive {
            border-bottom: 1.5px solid #0070f3;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .navItemLinkActive {
            border-bottom: 2px solid #0070f3;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .navItemLinkActive {
            border-bottom: 2px solid #0070f3;
          }
        }
        @media (min-width: 1281px) {
          .navItemLinkActive {
            border-bottom: 2px solid #0070f3;
          }
        }

        .content {
          padding: 2rem;
          overflow-y: auto;
          flex-grow: 1;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .content {
            padding: 1rem;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .content {
            padding: 1.5rem;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .content {
            padding: 1.75rem;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .content {
            padding: 2rem;
          }
        }
        @media (min-width: 1281px) {
          .content {
            padding: 2.5rem;
          }
        }

        .card {
          background-color: #fff;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .card {
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 6px;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .card {
            padding: 1.25rem;
            margin-bottom: 1.25rem;
            border-radius: 6px;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .card {
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border-radius: 8px;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .card {
            padding: 1.75rem;
            margin-bottom: 1.75rem;
            border-radius: 8px;
          }
        }
        @media (min-width: 1281px) {
          .card {
            padding: 2rem;
            margin-bottom: 2rem;
            border-radius: 10px;
          }
        }

        .cardTitle {
          margin-bottom: 1rem;
          font-size: 1.25rem;
          font-weight: 700;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .cardTitle {
            font-size: 1rem;
            margin-bottom: 0.75rem;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .cardTitle {
            font-size: 1.125rem;
            margin-bottom: 0.875rem;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .cardTitle {
            font-size: 1.25rem;
            margin-bottom: 1rem;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .cardTitle {
            font-size: 1.375rem;
            margin-bottom: 1.125rem;
          }
        }
        @media (min-width: 1281px) {
          .cardTitle {
            font-size: 1.5rem;
            margin-bottom: 1.25rem;
          }
        }

        .formGroup {
          margin-bottom: 1rem;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .formGroup {
            margin-bottom: 0.75rem;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .formGroup {
            margin-bottom: 0.875rem;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .formGroup {
            margin-bottom: 1rem;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .formGroup {
            margin-bottom: 1.125rem;
          }
        }
        @media (min-width: 1281px) {
          .formGroup {
            margin-bottom: 1.25rem;
          }
        }

        .formGroupFlex {
          display: flex;
          align-items: center;
        }

        .checkboxInput {
          margin-right: 12px;
        }

        .formLabel {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .formLabel {
            margin-bottom: 0.25rem;
            font-size: 0.875rem;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .formLabel {
            margin-bottom: 0.375rem;
            font-size: 0.9375rem;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .formLabel {
            margin-bottom: 0.5rem;
            font-size: 1rem;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .formLabel {
            margin-bottom: 0.5rem;
            font-size: 1rem;
          }
        }
        @media (min-width: 1281px) {
          .formLabel {
            margin-bottom: 0.625rem;
            font-size: 1.125rem;
          }
        }

        .formInput {
          width: 100%;
          padding: 0.5rem;
          font-size: 1rem;
          border-radius: 4px;
          border: 1px solid #ccc;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .formInput {
            padding: 0.375rem;
            font-size: 0.875rem;
            border-radius: 3px;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .formInput {
            padding: 0.4375rem;
            font-size: 0.9375rem;
            border-radius: 4px;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .formInput {
            padding: 0.5rem;
            font-size: 1rem;
            border-radius: 4px;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .formInput {
            padding: 0.5625rem;
            font-size: 1rem;
            border-radius: 5px;
          }
        }
        @media (min-width: 1281px) {
          .formInput {
            padding: 0.625rem;
            font-size: 1.125rem;
            border-radius: 6px;
          }
        }

        .saveButton {
          background-color: #0070f3;
          color: #fff;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s ease;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .saveButton {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            border-radius: 4px;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .saveButton {
            padding: 0.625rem 1.25rem;
            font-size: 0.9375rem;
            border-radius: 5px;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .saveButton {
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            border-radius: 6px;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .saveButton {
            padding: 0.875rem 1.75rem;
            font-size: 1rem;
            border-radius: 6px;
          }
        }
        @media (min-width: 1281px) {
          .saveButton {
            padding: 1rem 2rem;
            font-size: 1.125rem;
            border-radius: 8px;
          }
        }

        .saveButtonHover:hover {
          background-color: #005bb5;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .saveButtonHover:hover {
            background-color: #005bb5;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .saveButtonHover:hover {
            background-color: #005bb5;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .saveButtonHover:hover {
            background-color: #005bb5;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .saveButtonHover:hover {
            background-color: #005bb5;
          }
        }
        @media (min-width: 1281px) {
          .saveButtonHover:hover {
            background-color: #005bb5;
          }
        }

        .dangerButton {
          background-color: #e00;
          color: #fff;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s ease;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .dangerButton {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            border-radius: 4px;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .dangerButton {
            padding: 0.625rem 1.25rem;
            font-size: 0.9375rem;
            border-radius: 5px;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .dangerButton {
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            border-radius: 6px;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .dangerButton {
            padding: 0.875rem 1.75rem;
            font-size: 1rem;
            border-radius: 6px;
          }
        }
        @media (min-width: 1281px) {
          .dangerButton {
            padding: 1rem 2rem;
            font-size: 1.125rem;
            border-radius: 8px;
          }
        }

        .dangerButtonHover:hover {
          background-color: #a00;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .dangerButtonHover:hover {
            background-color: #a00;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .dangerButtonHover:hover {
            background-color: #a00;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .dangerButtonHover:hover {
            background-color: #a00;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .dangerButtonHover:hover {
            background-color: #a00;
          }
        }
        @media (min-width: 1281px) {
          .dangerButtonHover:hover {
            background-color: #a00;
          }
        }

        .billingInfo {
          margin-bottom: 1rem;
          font-size: 1rem;
          color: #555;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .billingInfo {
            font-size: 0.875rem;
            margin-bottom: 0.75rem;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .billingInfo {
            font-size: 0.9375rem;
            margin-bottom: 0.875rem;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .billingInfo {
            font-size: 1rem;
            margin-bottom: 1rem;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .billingInfo {
            font-size: 1rem;
            margin-bottom: 1.125rem;
          }
        }
        @media (min-width: 1281px) {
          .billingInfo {
            font-size: 1.125rem;
            margin-bottom: 1.25rem;
          }
        }

        .errorText {
          color: #e00;
          margin-top: 0.5rem;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .errorText {
            font-size: 0.75rem;
            margin-top: 0.25rem;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .errorText {
            font-size: 0.875rem;
            margin-top: 0.375rem;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .errorText {
            font-size: 0.875rem;
            margin-top: 0.5rem;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .errorText {
            font-size: 0.875rem;
            margin-top: 0.5rem;
          }
        }
        @media (min-width: 1281px) {
          .errorText {
            font-size: 1rem;
            margin-top: 0.625rem;
          }
        }

        .modalOverlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .modalOverlay {
            padding: 8px;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .modalOverlay {
            padding: 12px;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .modalOverlay {
            padding: 16px;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .modalOverlay {
            padding: 20px;
          }
        }
        @media (min-width: 1281px) {
          .modalOverlay {
            padding: 24px;
          }
        }

        .modalContent {
          background-color: #fff;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          max-width: 400px;
          width: 90%;
          text-align: center;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .modalContent {
            padding: 1rem;
            max-width: 90%;
            border-radius: 6px;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .modalContent {
            padding: 1.5rem;
            max-width: 85%;
            border-radius: 6px;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .modalContent {
            padding: 1.75rem;
            max-width: 80%;
            border-radius: 8px;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .modalContent {
            padding: 2rem;
            max-width: 450px;
            border-radius: 8px;
          }
        }
        @media (min-width: 1281px) {
          .modalContent {
            padding: 2.5rem;
            max-width: 500px;
            border-radius: 10px;
          }
        }

        .modalTitle {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #333;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .modalTitle {
            font-size: 1.125rem;
            margin-bottom: 0.75rem;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .modalTitle {
            font-size: 1.25rem;
            margin-bottom: 0.875rem;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .modalTitle {
            font-size: 1.375rem;
            margin-bottom: 1rem;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .modalTitle {
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }
        }
        @media (min-width: 1281px) {
          .modalTitle {
            font-size: 1.75rem;
            margin-bottom: 1.25rem;
          }
        }

        .modalMessage {
          margin-bottom: 1.5rem;
          color: #555;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .modalMessage {
            font-size: 0.875rem;
            margin-bottom: 1rem;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .modalMessage {
            font-size: 0.9375rem;
            margin-bottom: 1.25rem;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .modalMessage {
            font-size: 1rem;
            margin-bottom: 1.5rem;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .modalMessage {
            font-size: 1rem;
            margin-bottom: 1.5rem;
          }
        }
        @media (min-width: 1281px) {
          .modalMessage {
            font-size: 1.125rem;
            margin-bottom: 1.75rem;
          }
        }

        .modalButtonContainer {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .modalButtonContainer {
            gap: 0.5rem;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .modalButtonContainer {
            gap: 0.75rem;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .modalButtonContainer {
            gap: 1rem;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .modalButtonContainer {
            gap: 1rem;
          }
        }
        @media (min-width: 1281px) {
          .modalButtonContainer {
            gap: 1.25rem;
          }
        }

        .modalButton {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s ease;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .modalButton {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            border-radius: 4px;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .modalButton {
            padding: 0.625rem 1.25rem;
            font-size: 0.9375rem;
            border-radius: 5px;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .modalButton {
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            border-radius: 6px;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .modalButton {
            padding: 0.875rem 1.75rem;
            font-size: 1rem;
            border-radius: 6px;
          }
        }
        @media (min-width: 1281px) {
          .modalButton {
            padding: 1rem 2rem;
            font-size: 1.125rem;
            border-radius: 8px;
          }
        }

        .modalConfirmButton {
          background-color: #e00;
          color: #fff;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .modalConfirmButton {
            background-color: #e00;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .modalConfirmButton {
            background-color: #e00;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .modalConfirmButton {
            background-color: #e00;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .modalConfirmButton {
            background-color: #e00;
          }
        }
        @media (min-width: 1281px) {
          .modalConfirmButton {
            background-color: #e00;
          }
        }

        .modalConfirmButtonHover:hover {
          background-color: #a00;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .modalConfirmButtonHover:hover {
            background-color: #a00;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .modalConfirmButtonHover:hover {
            background-color: #a00;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .modalConfirmButtonHover:hover {
            background-color: #a00;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .modalConfirmButtonHover:hover {
            background-color: #a00;
          }
        }
        @media (min-width: 1281px) {
          .modalConfirmButtonHover:hover {
            background-color: #a00;
          }
        }

        .modalCancelButton {
          background-color: #ccc;
          color: #333;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .modalCancelButton {
            background-color: #ccc;
            color: #333;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .modalCancelButton {
            background-color: #ccc;
            color: #333;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .modalCancelButton {
            background-color: #ccc;
            color: #333;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .modalCancelButton {
            background-color: #ccc;
            color: #333;
          }
        }
        @media (min-width: 1281px) {
          .modalCancelButton {
            background-color: #ccc;
            color: #333;
          }
        }

        .modalCancelButtonHover:hover {
          background-color: #bbb;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .modalCancelButtonHover:hover {
            background-color: #bbb;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .modalCancelButtonHover:hover {
            background-color: #bbb;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .modalCancelButtonHover:hover {
            background-color: #bbb;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .modalCancelButtonHover:hover {
            background-color: #bbb;
          }
        }
        @media (min-width: 1281px) {
          .modalCancelButtonHover:hover {
            background-color: #bbb;
          }
        }

        .messageBox {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #333;
          color: #fff;
          padding: 1rem 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          z-index: 1001;
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .messageBox {
            padding: 0.75rem 1.5rem;
            font-size: 0.875rem;
            border-radius: 6px;
            bottom: 10px;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .messageBox {
            padding: 0.875rem 1.75rem;
            font-size: 0.9375rem;
            border-radius: 7px;
            bottom: 15px;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .messageBox {
            padding: 1rem 2rem;
            font-size: 1rem;
            border-radius: 8px;
            bottom: 20px;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .messageBox {
            padding: 1rem 2rem;
            font-size: 1rem;
            border-radius: 8px;
            bottom: 20px;
          }
        }
        @media (min-width: 1281px) {
          .messageBox {
            padding: 1.25rem 2.5rem;
            font-size: 1.125rem;
            border-radius: 10px;
            bottom: 25px;
          }
        }

        .messageBoxVisible {
          opacity: 1;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .messageBoxVisible {
            opacity: 1;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .messageBoxVisible {
            opacity: 1;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .messageBoxVisible {
            opacity: 1;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .messageBoxVisible {
            opacity: 1;
          }
        }
        @media (min-width: 1281px) {
          .messageBoxVisible {
            opacity: 1;
          }
        }

        .messageBoxSuccess {
          background-color: #28a745;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .messageBoxSuccess {
            background-color: #28a745;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .messageBoxSuccess {
            background-color: #28a745;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .messageBoxSuccess {
            background-color: #28a745;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .messageBoxSuccess {
            background-color: #28a745;
          }
        }
        @media (min-width: 1281px) {
          .messageBoxSuccess {
            background-color: #28a745;
          }
        }

        .messageBoxError {
          background-color: #dc3545;
        }
        @media (min-width: 320px) and (max-width: 479px) {
          .messageBoxError {
            background-color: #dc3545;
          }
        }
        @media (min-width: 481px) and (max-width: 767px) {
          .messageBoxError {
            background-color: #dc3545;
          }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .messageBoxError {
            background-color: #dc3545;
          }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .messageBoxError {
            background-color: #dc3545;
          }
        }
        @media (min-width: 1281px) {
          .messageBoxError {
            background-color: #dc3545;
          }
        }
      `}</style>
      <div className="mainContainer">
        <nav className="topNav">
          <Link to="/baje">
            <img src="isle.png" alt="Isle Logo" className="logo" />
          </Link>
          <div className="navItems">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => isActive ? "navItemLink navItemLinkActive" : "navItemLink"}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/workbench"
              className={({ isActive }) => isActive ? "navItemLink navItemLinkActive" : "navItemLink"}
            >
              Workbench
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) => isActive ? "navItemLink navItemLinkActive" : "navItemLink"}
            >
              Settings
            </NavLink>
          </div>
        </nav>

        <main className="content">
          <section ref={profileRef} className="card">
            <h2 className="cardTitle">Profile Settings</h2>
            <form onSubmit={handleProfileSave}>
              <div className="formGroup">
                <label className="formLabel" htmlFor="displayName">
                  Display Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="Enter display name"
                  className="formInput"
                  required
                />
              </div>
              {error && (formData.displayName || formData.organizationName) && (
                <p className="errorText">{error}</p>
              )}
              <button type="submit" className="saveButton">
                Save Profile
              </button>
            </form>
          </section>

          <section ref={passwordRef} className="card">
            <h2 className="cardTitle">Password & Security</h2>
            <form onSubmit={handlePasswordUpdate}>
              <div className="formGroup">
                <label className="formLabel" htmlFor="password">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="formInput"
                  required
                  minLength={6}
                />
              </div>
              {error && formData.password && <p className="errorText">{error}</p>}
              <button type="submit" className="saveButton">
                Update Password
              </button>
            </form>
          </section>

          {/* <section className="card">
            <h2 className="cardTitle">Notifications</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                showMessage("Notification settings saved!", 'success');
              }}
            >
              <div className="formGroup formGroupFlex">
                <input
                  type="checkbox"
                  id="notificationsEmail"
                  name="notificationsEmail"
                  checked={formData.notificationsEmail}
                  onChange={handleChange}
                  className="checkboxInput"
                />
                <label htmlFor="notificationsEmail" className="formLabel">
                  Email Notifications
                </label>
              </div>
              <div className="formGroup formGroupFlex">
                <input
                  type="checkbox"
                  id="notificationsSMS"
                  name="notificationsSMS"
                  checked={formData.notificationsSMS}
                  onChange={handleChange}
                  className="checkboxInput"
                />
                <label htmlFor="notificationsSMS" className="formLabel">
                  SMS Notifications
                </label>
              </div>
              <button type="submit" className="saveButton">
                Save Preferences
              </button>
            </form>
          </section>

          <section className="card">
            <h2 className="cardTitle">Plans & Billing</h2>
            <div className="billingInfo">
              <p>
                <strong>Current Plan:</strong> {formData.plan}
              </p>
              <p>
                <strong>Billing Email:</strong> {formData.billingEmail}
              </p>
              <p>
                <strong>Payment Method:</strong> {formData.cardNumber}
              </p>
            </div>
            <div className="sectionDivider" />
            <form onSubmit={handleSave}>
              <div className="formGroup">
                <label className="formLabel" htmlFor="plan">
                  Change Plan
                </label>
                <select
                  id="plan"
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  className="formInput"
                >
                  <option value="Free">Free</option>
                  <option value="Basic">Basic</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <div className="formGroup">
                <label className="formLabel" htmlFor="billingEmail">
                  Billing Email
                </label>
                <input
                  type="email"
                  id="billingEmail"
                  name="billingEmail"
                  value={formData.billingEmail}
                  onChange={handleChange}
                  placeholder="Enter billing email"
                  className="formInput"
                  required
                />
              </div>
              <button
                type="submit"
                className={isSaveHover ? "saveButton saveButtonHover" : "saveButton"}
                onMouseEnter={() => setIsSaveHover(true)}
                onMouseLeave={() => setIsSaveHover(false)}
              >
                Save Changes
              </button>
            </form>
          </section> */}

          <section className="card">
            <h2 className="cardTitle">Delete Account</h2>
            <p className="billingInfo">
              Deleting your account is <strong>permanent</strong> and will remove all
              your data from our servers. Please type <strong>delete</strong> to confirm.
            </p>
            <div className="formGroup">
              <label className="formLabel" htmlFor="deleteConfirmation">
                Confirm Deletion
              </label>
              <input
                type="text"
                id="deleteConfirmation"
                name="deleteConfirmation"
                value={formData.deleteConfirmation}
                onChange={handleChange}
                placeholder="Type 'delete' to confirm"
                className="formInput"
              />
            </div>
            {error && formData.deleteConfirmation && <p className="errorText">{error}</p>}
            <button
              className={isDeleteHover ? "dangerButton dangerButtonHover" : "dangerButton"}
              onClick={initiateDeleteAccount}
              onMouseEnter={() => setIsDeleteHover(true)}
              onMouseLeave={() => setIsDeleteHover(false)}
            >
              Delete My Account
            </button>
          </section>
        </main>

        {showConfirmModal && (
          <div className="modalOverlay">
            <div className="modalContent">
              <h3 className="modalTitle">Confirm Account Deletion</h3>
              <p className="modalMessage">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </p>
              <div className="modalButtonContainer">
                <button
                  className={isDeleteHover ? "modalButton modalConfirmButton modalConfirmButtonHover" : "modalButton modalConfirmButton"}
                  onClick={confirmDeleteAccount}
                  onMouseEnter={() => setIsDeleteHover(true)}
                  onMouseLeave={() => setIsDeleteHover(false)}
                >
                  Yes, Delete
                </button>
                <button
                  className={isSaveHover ? "modalButton modalCancelButton modalCancelButtonHover" : "modalButton modalCancelButton"}
                  onClick={() => setShowConfirmModal(false)}
                  onMouseEnter={() => setIsSaveHover(true)}
                  onMouseLeave={() => setIsSaveHover(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {message.text && (
          <div
            className={`messageBox ${message.type === 'success' ? 'messageBoxSuccess' : 'messageBoxError'} ${message.text ? 'messageBoxVisible' : ''}`}
          >
            {message.text}
          </div>
        )}
      </div>
    </>
  );
};

export default Settings;
