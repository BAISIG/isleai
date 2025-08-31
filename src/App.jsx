import { Routes, Route, useNavigate } from 'react-router-dom';
import { TourProvider } from '@reactour/tour';
import { createClient } from '@supabase/supabase-js';
import { useEffect } from "react";
import Signup1 from './Signup1.jsx';
import Baje from './Baje.jsx';
import BajeTour from './BajeTour.jsx';
import Login from './Login.jsx';
import Home from './Home.jsx';
import Dashboard from './Dashboard.jsx';
import HelpPage from './FAQ.jsx';
import Packages from './Packages.jsx';
import Profile from './Profile.jsx';
import ReportIssue from './ReportIssue.jsx';
import SavedChat from './SavedChat.jsx';
import Settings from './Settings.jsx';
import Workbench from './Workbench.jsx';
import Notifications from './Notifications.jsx';
import PaymentCard from './PaymentCard.jsx';
import Onboarding from './Onboarding.jsx';
import Paywall from './PaymentWall.jsx';
import ForgotPassword from './ForgotPassword.jsx';
import ResetPassword from './ResetPassword.jsx';
import AdminSendNotification from './AdminSendNotification.jsx';
import Loadscreen from './Loadscreen.jsx';

const supabase = createClient(
  "https://lgurtucciqvwgjaphdqp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndXJ0dWNjaXF2d2dqYXBoZHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2MzgzNTAsImV4cCI6MjA0NTIxNDM1MH0.I1ajlHp5b4pGL-NQzzvcVdznoiyIvps49Ws5GZHSXzk"
);

function useAuthRefresh() {
  const navigate = useNavigate();
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error || !session) {
        console.error("Auto-refresh error:", error?.message || "No session");
        navigate("/login", { replace: true });
      } else {
        console.log("Session refreshed successfully at", new Date().toISOString());
      }
    }, 15 * 60 * 1000); // Refresh every 15 minutes
    return () => clearInterval(interval);
  }, [navigate]);
}

const tourSteps = [
  {
    selector: '.chat-header',
    content: 'This is the chat header where you can see the app title and navigation options.',
  },
  {
    selector: '.hamburger-button',
    content: 'Click here to open the navigation menu.',
  },
  {
    selector: '.barbados-flag',
    content: 'Select a Caribbean country to explore!',
  },
  {
    selector: '.input-section',
    content: 'Type your questions here to interact with the guide.',
  },
];

function App() {
  const navigate = useNavigate();

  // Integrate global session refresh
  useAuthRefresh();

  // Debug navigation
  const handleTourClose = () => {
    console.log('TourProvider onClose triggered at', new Date().toISOString());
    console.log('Navigating to /baje');
    localStorage.setItem('hasTakenTour', 'true');
    navigate('/baje', { replace: true }); // Use replace to avoid adding to history stack
  };

  return (
    <TourProvider
      steps={tourSteps}
      onClose={handleTourClose}
      afterOpen={() => console.log('Tour opened at', new Date().toISOString())}
      showSkipButton={false} // Disable the skip button
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup1 />} />
        <Route path="/login" element={<Login />} />
        <Route path="/baje" element={<Baje />} />
        <Route path="/baje-tour" element={<BajeTour />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/report" element={<ReportIssue />} />
        <Route path="/saved-chats" element={<SavedChat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/workbench" element={<Workbench />} />
        <Route path="/payment-card" element={<PaymentCard />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/paywall" element={<Paywall />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin" element={<AdminSendNotification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/loadscreen" element={<Loadscreen />} />
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </TourProvider>
  );
}

export default App;