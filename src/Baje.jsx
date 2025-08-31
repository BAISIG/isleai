import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './Baje.css';

// API URL from env
const apiUrl = import.meta.env.VITE_API_URL;

const supabase = createClient(
  'https://lgurtucciqvwgjaphdqp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndXJ0dWNjaXF2d2dqYXBoZHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2MzgzNTAsImV4cCI6MjA0NTIxNDM1MH0.I1ajlHp5b4pGL-NQzzvcVdznoiyIvps49Ws5GZHSXzk'
);

function Baje() {
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const tipTimerRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [avatarImage, setAvatarImage] = useState(null);
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
  const [isSubmitMenuOpen, setIsSubmitMenuOpen] = useState(false);
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const [isFactsCardOpen, setIsFactsCardOpen] = useState(false);
  const [isTipCardOpen, setIsTipCardOpen] = useState(false);
  const [fact, setFact] = useState({ questions: '', answers: '' });
  const [currentTip, setCurrentTip] = useState({ id: null, tip_text: '' });
  const [activeAgent, setActiveAgent] = useState('Main');
  const [agentIcon, setAgentIcon] = useState('🤖');
  const [submitIcon, setSubmitIcon] = useState('📝');
  const [uploadError, setUploadError] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationBadge, setShowNotificationBadge] = useState(false);
  const [usageStartTime, setUsageStartTime] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'Barbados',
    nickname: 'Bajan',
    flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Flag_of_Barbados.svg/1200px-Flag_of_Barbados.svg.png'
  });
  const [chatSessionId, setChatSessionId] = useState(null);
  const navigate = useNavigate();

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const FACT_INTERVAL = 1800000; // 30 minutes
  const TIP_INTERVAL = 1800000;  // 30 minutes

  const caribbeanCountries = [
    { name: 'Barbados', nickname: 'Bajan', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Flag_of_Barbados.svg/1200px-Flag_of_Barbados.svg.png' },
  ];

  const defaultTip = {
    id: uuidv4(),
    tip_text: 'Take a catamaran cruise to swim with turtles off the coast.'
  };

  const incrementPromptCount = async (userId) => {
    try {
      // Check if a row exists for this user
      const { data, error: fetchError } = await supabase
        .from("prompts_count")
        .select("id, count")
        .eq("user_id", userId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error checking prompts_count:", fetchError);
        return;
      }

      if (data) {
        // Row exists → update count
        const { error: updateError } = await supabase
          .from("prompts_count")
          .update({ count: data.count + 1 })
          .eq("id", data.id);

        if (updateError) console.error("Error updating prompts_count:", updateError);
      } else {
        // Row doesn't exist → insert with count = 1
        const { error: insertError } = await supabase
          .from("prompts_count")
          .insert({ user_id: userId, count: 1 });

        if (insertError) console.error("Error inserting prompts_count:", insertError);
      }
    } catch (err) {
      console.error("Unexpected error updating prompts_count:", err);
    }
  };

  const insertDefaultTip = async () => {
    try {
      const { error } = await supabase
        .from('tourist_tips')
        .insert({ id: defaultTip.id, tip_text: defaultTip.tip_text });
      if (error) {
        console.error('Error inserting default tip:', error);
        throw error;
      }
      console.log('Inserted default tip:', defaultTip);
      return defaultTip;
    } catch (err) {
      console.error('insertDefaultTip error:', err.message);
      throw err;
    }
  };

  const saveUsageTime = async (sessionId, userId, durationSeconds) => {
    try {
      if (!userId || !sessionId) {
        console.warn('Cannot save usage time: missing userId or sessionId');
        return;
      }

      const { error } = await supabase
        .from('chat_usage')
        .insert({
          id: uuidv4(),
          chat_session_id: sessionId,
          user_id: userId,
          usage_time: Math.round(durationSeconds),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving usage time:', error);
      } else {
        console.log(`Saved usage time: ${durationSeconds} seconds for session ${sessionId}`);
      }
    } catch (err) {
      console.error('Unexpected error saving usage time:', err);
    }
  };

  useEffect(() => {
    if (location.state?.restoredChat) {
      const { id, messages, title } = location.state.restoredChat;
      setChatSessionId(id);
      setMessages(messages);
      console.log('Restored chat:', { id, title, messageCount: messages.length });
    } else {
      const newSessionId = uuidv4();
      setChatSessionId(newSessionId);
      setMessages([
        {
          id: uuidv4(),
          role: 'assistant',
          content: `Welcome to ${selectedCountry.name}! I'm your ${selectedCountry.nickname} helper! Ask me about beaches, food, history, festivals!`,
          created_at: new Date().toISOString()
        }
      ]);
      saveChatToSupabase(newSessionId, []);
    }

    setUsageStartTime(Date.now());

    return () => {
      if (chatSessionId && usageStartTime) {
        const durationMs = Date.now() - usageStartTime;
        const durationSeconds = durationMs / 1000;
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            saveUsageTime(chatSessionId, session.user.id, durationSeconds);
          }
        });
      }
    };
  }, [selectedCountry, activeAgent, location.state]);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/notifications`);
        const notifications = response.data || [];
        
        const lastSeen = localStorage.getItem('lastSeenNotificationCount');
        const unseenCount = notifications.length - Number(lastSeen || 0);

        console.log('Initial notification count:', notifications.length, 'Last seen:', lastSeen, 'Unseen count:', unseenCount);
        setNotificationCount(notifications.length);
        setShowNotificationBadge(unseenCount > 0);
      } catch (error) {
        console.error('Error fetching notification count:', error.message);
        setNotificationCount(0);
        setShowNotificationBadge(false);
      }
    };
    fetchNotificationCount();
  }, []);

  useEffect(() => {
    console.log('Notification state changed:', { notificationCount, showNotificationBadge });
  }, [notificationCount, showNotificationBadge]);

  const saveChatToSupabase = async (sessionId = chatSessionId, chatMessages = messages) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('No authenticated user, skipping chat save');
        return;
      }

      const userMessage = chatMessages.findLast((msg) => msg.role === 'user');
      const snippet = userMessage ? userMessage.content.slice(0, 100) + '...' : 'No user messages yet';
      const title = location.state?.restoredChat?.title || `${selectedCountry.name} ${activeAgent} Chat`;

      const chatData = {
        id: sessionId,
        user_id: session.user.id,
        title,
        snippet,
        messages: chatMessages,
        updated_at: new Date().toISOString()
      };

      const { data: existingChat, error: fetchError } = await supabase
        .from('saved_chats')
        .select('id')
        .eq('id', sessionId)
        .eq('user_id', session.user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing chat:', fetchError);
        return;
      }

      if (existingChat) {
        const { error: updateError } = await supabase
          .from('saved_chats')
          .update(chatData)
          .eq('id', sessionId)
          .eq('user_id', session.user.id);
        if (updateError) console.error('Error updating chat:', updateError);
        else console.log('Chat updated:', sessionId);
      } else {
        const { error: insertError } = await supabase
          .from('saved_chats')
          .insert(chatData);
        if (insertError) console.error('Error saving chat:', insertError);
        else console.log('Chat saved:', sessionId);
      }
    } catch (err) {
      console.error('Error saving chat to Supabase:', err);
    }
  };

  useEffect(() => {
    if (messages.some((msg) => msg.role === 'user')) {
      saveChatToSupabase();
    }
  }, [messages, chatSessionId]);

  useEffect(() => {
    const initializeTimer = (key, interval, callback) => {
      const startTime = localStorage.getItem(key);
      const now = Date.now();
      let delay;

      if (startTime) {
        const elapsed = now - parseInt(startTime, 10);
        const timeSinceLast = elapsed % interval;
        delay = timeSinceLast === 0 ? interval : interval - timeSinceLast;
      } else {
        localStorage.setItem(key, now.toString());
        delay = interval;
      }

      const timer = setTimeout(() => {
        callback();
        const intervalId = setInterval(callback, interval);
        return () => clearInterval(intervalId);
      }, delay);

      return () => clearTimeout(timer);
    };

    const factCleanup = initializeTimer('factTimerStart', FACT_INTERVAL, async () => {
      if (!isFactsCardOpen && !isTipCardOpen) {
        await fetchFact();
        setIsFactsCardOpen(true);
        setIsTipCardOpen(false);
        console.log('New fact fetched and card displayed after 3 minutes');
      } else {
        setTimeout(async () => {
          await fetchFact();
          setIsFactsCardOpen(true);
          setIsTipCardOpen(false);
          console.log('Delayed fact fetched and card displayed');
        }, 10000);
      }
    });

    const tipCleanup = initializeTimer('tipTimerStart', TIP_INTERVAL, async () => {
      if (!isFactsCardOpen && !isTipCardOpen) {
        await fetchTip();
        setIsTipCardOpen(true);
        setIsFactsCardOpen(false);
        console.log('New tourist tip fetched and card displayed after 4 minutes');
      } else {
        setTimeout(async () => {
          await fetchTip();
          setIsTipCardOpen(true);
          setIsFactsCardOpen(false);
          console.log('Delayed tourist tip fetched and card displayed');
        }, 10000);
      }
    });

    return () => {
      factCleanup();
      tipCleanup();
    };
  }, [isFactsCardOpen, isTipCardOpen]);

  useEffect(() => {
    fetchFact().then(() => setIsFactsCardOpen(true));
    fetchTip().then(() => setIsTipCardOpen(false));
  }, [selectedCountry]);

  const fallbackFacts = [
    { questions: 'What is the capital of Barbados?', answers: 'Bridgetown' },
    { questions: 'What sport is most popular in Barbados?', answers: 'Cricket' },
    { questions: 'Who is a famous singer from Barbados?', answers: 'Rihanna' }
  ];

  const fallbackTips = [
    { id: uuidv4(), tip_text: 'Visit Oistins Fish Fry on Friday nights for fresh seafood and lively music!' },
    { id: uuidv4(), tip_text: 'Explore Harrison’s Cave for a stunning underground adventure.' },
    { id: uuidv4(), tip_text: 'Take a catamaran cruise to swim with turtles off the coast.' }
  ];

  const fetchFact = async () => {
    try {
      const { count, error: countError } = await supabase
        .from('sports')
        .select('*', { count: 'exact', head: true });
      if (countError) {
        console.error('Error counting fact records:', countError.message);
        throw new Error('Fact count failed');
      }

      if (!count || count === 0) {
        const fallback = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
        setFact(fallback);
        return;
      }

      const randomOffset = Math.floor(Math.random() * count);
      const { data, error } = await supabase
        .from('sports')
        .select('questions, answers')
        .range(randomOffset, randomOffset);
      if (error || !data || !data.length) {
        throw error || new Error('No fact data received');
      }

      setFact({ questions: data[0].questions, answers: data[0].answers });
    } catch (err) {
      console.error('fetchFact error:', err.message);
      const fallback = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
      setFact(fallback);
    }
  };

  const fetchTip = async (retry = true) => {
    try {
      const { count, error: countError } = await supabase
        .from('tourist_tips')
        .select('*', { count: 'exact', head: true });
      if (countError) {
        console.error('Error counting tip records:', countError.message);
        throw new Error('Tip count failed');
      }

      if (!count || count === 0) {
        console.log('No tips found, inserting default tip...');
        await insertDefaultTip();
        const { data, error } = await supabase
          .from('tourist_tips')
          .select('id, tip_text')
          .eq('id', defaultTip.id)
          .single();
        if (error || !data) {
          throw error || new Error('Failed to fetch default tip');
        }

        setCurrentTip({ id: data.id, tip_text: data.tip_text });
        return;
      }

      const randomOffset = Math.floor(Math.random() * count);
      const { data, error } = await supabase
        .from('tourist_tips')
        .select('id, tip_text')
        .range(randomOffset, randomOffset);
      if (error || !data || !data.length) {
        if (retry) return fetchTip(false);
        throw error || new Error('No tip data received');
      }

      setCurrentTip({ id: data[0].id, tip_text: data[0].tip_text });
    } catch (err) {
      console.error('fetchTip error:', err.message);
      const fallback = fallbackTips[Math.floor(Math.random() * fallbackTips.length)];
      setCurrentTip(fallback);
    }
  };

  const fetchSignedUrl = async (filePath, bucket = 'avatars') => {
    if (!filePath) return null;
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 60);
    if (error) {
      console.error(`Error fetching signed URL from ${bucket} bucket:`, error);
      return null;
    }
    return data.signedUrl;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    async function checkSession() {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        return;
      }
      if (session?.user) {
        const avatarUrl = session.user.user_metadata?.avatarUrl || null;
        if (avatarUrl) {
          const urlParts = avatarUrl.split('/');
          const fileName = urlParts[urlParts.length - 1].split('?')[0];
          const signedUrl = await fetchSignedUrl(fileName, 'avatars');
          if (signedUrl) setAvatarImage(signedUrl);
        }
      }
    }
    checkSession();
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size exceeds 10MB limit.');
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: 'Sorry, the file is too large. Please upload a file smaller than 10MB.',
          created_at: new Date().toISOString()
        }
      ]);
      return;
    }

    setIsLoading(true);
    setUploadError(null);

    try {
      await supabase.auth.refreshSession();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('User not authenticated');

      // Increment prompt count for file upload
      await incrementPromptCount(session.user.id);

      const fileName = `${uuidv4()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('Uploads').upload(fileName, file);
      if (uploadError) throw uploadError;

      const signedUrl = await fetchSignedUrl(fileName, 'Uploads');
      if (signedUrl) {
        const fileMessage = {
          id: uuidv4(),
          role: 'user',
          content: `Uploaded file: ${file.name}`,
          fileUrl: signedUrl,
          created_at: new Date().toISOString()
        };
        setMessages((prev) => [...prev, fileMessage]);

        const response = await axios.post(
          `${apiUrl}/ask`,
          {
            prompt: `User uploaded a file: ${file.name} for ${selectedCountry.name}`,
            fileUrl: signedUrl
          },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );

        const aiMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: response.data.response || `Received your file: ${file.name}`,
          created_at: new Date().toISOString()
        };
        setMessages((prev) => [...prev, aiMessage]);

        await supabase.from('notifications').insert({
          user_id: session.user.id,
          message: `You uploaded a file: ${file.name}`
        });
        const notificationResponse = await axios.get(`${apiUrl}/api/notifications`);
        const notifications = notificationResponse.data || [];
        console.log('Notifications after file upload:', notifications.length);
        setNotificationCount(notifications.length);
        setShowNotificationBadge(true);
      }
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError('Failed to upload file. Please try again.');
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: 'Sorry mon! I couldn’t upload that file. Try again later!',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content: `${activeAgent}: ${inputValue}`,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      await supabase.auth.refreshSession();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('User not authenticated');

      // Increment prompt count for message
      await incrementPromptCount(session.user.id);

      const response = await axios.post(
        `${apiUrl}/ask`,
        {
          prompt: `${selectedCountry.name} ${activeAgent}: ${inputValue}`,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const aiMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response.data.response || "Sorry, I couldn't process that request.",
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, aiMessage]);

      await supabase.from('notifications').insert({
        user_id: session.user.id,
        message: `New response from ${selectedCountry.name} ${activeAgent}`
      });
      const notificationResponse = await axios.get(`${apiUrl}/api/notifications`);
      const notifications = notificationResponse.data || [];
      console.log('Notifications after message:', notifications.length);
      setNotificationCount(notifications.length);
      setShowNotificationBadge(true);
    } catch (error) {
      console.error('Message send error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: "Sorry mon! I'm having a beach day! 🏖️ Try again later!",
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = async () => {
    try {
      if (chatSessionId && usageStartTime) {
        const durationMs = Date.now() - usageStartTime;
        const durationSeconds = durationMs / 1000;
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await saveUsageTime(chatSessionId, session.user.id, durationSeconds);
        }
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error.message);
        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            role: 'assistant',
            content: 'Error logging out. Please try again.',
            created_at: new Date().toISOString()
          }
        ]);
        return;
      }
      setAvatarImage(null);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: 'You have been logged out successfully.',
          created_at: new Date().toISOString()
        }
      ]);
      navigate('/login');
    } catch (err) {
      console.error('Unexpected logout error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: 'Unexpected error during logout. Please try again.',
          created_at: new Date().toISOString()
        }
      ]);
    }
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const toggleCountryMenu = () => {
    setIsCountryMenuOpen(!isCountryMenuOpen);
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Profile', path: '/profile' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Saved Chats', path: '/saved-chats' },
    { name: 'Settings', path: '/settings' },
    { name: 'Help', path: '/help' },
    {
      name: 'Logout',
      path: '/login',
      onClick: async (e) => {
        e.stopPropagation();
        await handleLogout();
        setIsNavOpen(false);
      }
    }
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isNavOpen && !e.target.closest('.nav-card') && !e.target.closest('.hamburger-button')) {
        setIsNavOpen(false);
      }
      if (!e.target.closest('.agent-menu') && !e.target.closest('.agent-menu-container')) {
        setIsAgentMenuOpen(false);
      }
      if (!e.target.closest('.submit-menu') && !e.target.closest('.submit-menu-container')) {
        setIsSubmitMenuOpen(false);
      }
      if (!e.target.closest('.country-menu') && !e.target.closest('.barbados-flag')) {
        setIsCountryMenuOpen(false);
      }
      if (isFactsCardOpen && !e.target.closest('.facts-card') && !e.target.closest('.facts-card-close')) {
        setIsFactsCardOpen(false);
      }
      if (
        isTipCardOpen &&
        !e.target.closest('.tip-card') &&
        !e.target.closest('.tip-card-close') &&
        !e.target.closest('.nav-item')
      ) {
        setIsTipCardOpen(false);
        if (tipTimerRef.current) {
          clearTimeout(tipTimerRef.current);
        }
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isNavOpen, isAgentMenuOpen, isSubmitMenuOpen, isCountryMenuOpen, isFactsCardOpen, isTipCardOpen]);

  return (
    <div className="baje-container" style={{ zIndex: 100 }}>
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            className="ai-avatar"
            style={{
              ...(avatarImage && { backgroundImage: `url(${avatarImage})`, backgroundColor: 'transparent' })
            }}
          >
            {!avatarImage && 'ISLE'}
          </div>
          <div className="ai-info">
            <div className="ai-name">ISLE</div>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <div className="ai-status">Your {selectedCountry.name} Guide</div>
              <div
                className="barbados-flag"
                onClick={toggleCountryMenu}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: `url(${selectedCountry.flagUrl}) center/cover`,
                  marginLeft: '10px',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
        </div>
        <div className="header-buttons">
          <div className="bell-container" style={{ display: 'flex', marginRight: '8px' }}>
            <button
              className="notification-button"
              onClick={() => {
                if (chatSessionId && usageStartTime) {
                  const durationMs = Date.now() - usageStartTime;
                  const durationSeconds = durationMs / 1000;
                  supabase.auth.getSession().then(({ data: { session } }) => {
                    if (session?.user) {
                      saveUsageTime(chatSessionId, session.user.id, durationSeconds);
                    }
                  });
                }
                console.log('Hiding badge and navigating to notifications, saving count:', notificationCount);
                localStorage.setItem('lastSeenNotificationCount', notificationCount.toString());
                setShowNotificationBadge(false);
                setTimeout(() => navigate('/notifications'), 0);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.3s ease',
                fontSize: '18px'
              }}
            >
              🔔
            </button>
            <span
              className="badge"
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-12px',
                backgroundColor: 'red',
                color: 'white',
                fontSize: '12px',
                padding: '2px 6px',
                borderRadius: '50%',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                visibility: notificationCount > 0 && showNotificationBadge ? 'visible' : 'hidden',
                boxShadow: '0 0 0 2px white'
              }}
            >
              {notificationCount}
            </span>
          </div>
          <button className={`hamburger-button ${isNavOpen ? 'active' : ''}`} onClick={toggleNav}>
            <span className="hamburger-button-span"></span>
            <span className="hamburger-button-span"></span>
            <span className="hamburger-button-span"></span>
          </button>
        </div>
      </div>

      <div className={`nav-overlay ${isNavOpen || isCountryMenuOpen || isFactsCardOpen || isTipCardOpen ? 'active' : ''}`}>
        <div className={`nav-card ${isNavOpen ? 'nav-card-open' : ''}`}>
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.name} className="nav-item">
                <Link
                  to={item.path}
                  className="nav-item-a"
                  onClick={(e) => {
                    if (item.onClick) {
                      item.onClick(e);
                    } else {
                      if (chatSessionId && usageStartTime) {
                        const durationMs = Date.now() - usageStartTime;
                        const durationSeconds = durationMs / 1000;
                        supabase.auth.getSession().then(({ data: { session } }) => {
                          if (session?.user) {
                            saveUsageTime(chatSessionId, session.user.id, durationSeconds);
                          }
                        });
                      }
                      setIsNavOpen(false);
                    }
                  }}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className="message" style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.fileUrl ? (
              <>
                <div>{msg.content}</div>
                {msg.fileUrl.includes('.jpg') || msg.fileUrl.includes('.png') || msg.fileUrl.includes('.jpeg') ? (
                  <img src={msg.fileUrl} alt="Uploaded" style={{ maxWidth: '200px', marginTop: '10px' }} />
                ) : (
                  <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                    View File
                  </a>
                )}
              </>
            ) : (
              msg.content
            )}
          </div>
        ))}
        {isLoading && (
          <div className="message">
            <div style={{ display: 'flex', gap: '5px' }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ccc',
                    animation: 'bounce 1.4s infinite ease-in-out',
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div
        className="facts-card"
        style={{
          position: 'absolute',
          bottom: '90px',
          right: '15px',
          width: '250px',
          background: '#F5F5F5',
          borderRadius: '10px',
          padding: '15px',
          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.3)',
          display: isFactsCardOpen ? 'block' : 'none',
          zIndex: 1000
        }}
      >
        <button
          className="facts-card-close"
          onClick={() => setIsFactsCardOpen(false)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            color: 'black'
          }}
        >
          ✕
        </button>
        <div
          style={{
            fontWeight: 'bold',
            color: 'black',
            fontSize: '16px',
            marginBottom: '10px'
          }}
        >
          Did you know?
        </div>
        <div
          style={{
            color: 'black',
            fontSize: '14px',
            marginBottom: '8px'
          }}
        >
          {fact.questions}
        </div>
        <div
          style={{
            color: '#008000',
            fontSize: '14px'
          }}
        >
          {fact.answers}
        </div>
      </div>

      <div
        className="tip-card"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          background: '#F5F5F5',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.5)',
          display: isTipCardOpen ? 'block' : 'none',
          zIndex: 1003,
          color: 'black',
          textAlign: 'center'
        }}
      >
        <button
          className="tip-card-close"
          onClick={() => setIsTipCardOpen(false)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            color: 'black'
          }}
        >
          ✕
        </button>
        <div
          style={{
            fontWeight: 'bold',
            fontSize: '16px',
            marginBottom: '15px'
          }}
        >
          {selectedCountry.name} Travel Tip
        </div>
        <div
          style={{
            fontSize: '14px'
          }}
        >
          {currentTip.tip_text}
        </div>
      </div>

      <div className="input-section" style={{ display: 'flex', alignItems: 'center', padding: '15px', background: 'rgba(255, 255, 255, 0.1)', zIndex: 100 }}>
        <textarea
          className="input-field"
          rows={2}
          placeholder={`Ask me about ${selectedCountry.name}...`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          style={{ flexGrow: 1, marginRight: '10px' }}
        />
        <div
          className="submit-menu-container"
          style={{ position: 'relative' }}
          onMouseEnter={() => setIsSubmitMenuOpen(true)}
          onMouseLeave={() => setIsSubmitMenuOpen(false)}
        >
          <button
            className="submit-button"
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            style={{
              background: '#1E90FF',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              transition: '0.3s ease'
            }}
          >
            {isLoading ? '...' : '➤'}
          </button>
          <div
            className="submit-menu"
            style={{
              position: 'absolute',
              bottom: '100%',
              right: '0',
              background: 'rgba(0, 0, 0, 0.9)',
              borderRadius: '5px',
              padding: '5px',
              display: isSubmitMenuOpen ? 'block' : 'none',
              opacity: isSubmitMenuOpen ? 1 : 0,
              transition: 'opacity 0.2s',
              zIndex: 1003
            }}
          >
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        .baje-container {
          position: relative;
          z-index: 100;
        }
        .chat-header {
          position: sticky;
          top: 0;
          z-index: 101;
        }
        .nav-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0);
          z-index: 99;
          transition: background 0.3s ease;
          visibility: hidden;
        }
        .nav-overlay.active {
          background: rgba(0, 0, 0, 0.5);
          visibility: visible;
        }
        .nav-card {
          position: fixed;
          top: 0;
          right: -300px;
          width: 250px;
          height: 100vh;
          background: rgba(0, 0, 0, 0.9);
          padding: 20px;
          transition: right 0.3s ease;
          z-index: 1000;
          visibility: hidden;
          border-radius: 10px;
          box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.35);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .nav-card.nav-card-open {
          right: 0;
          visibility: visible;
        }
      
        .nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
          margin-top: 150px;
          margin-bottom: 0px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justifyContent: center;
          width: 100%;
          height: 100%;
        }
        .nav-item {
          margin: 15px 0;
          width: 100%;
          text-align: center;
        }
        .nav-item-a {
          color: white;
          text-decoration: none;
          font-size: 18px;
          font-family: var(--default-font-family);
          transition: color 0.2s ease;
          display: block;
          padding: 10px 0;
          text-align: center;
        }
        .nav-item-a:hover {
          color: #1E90FF;
        }
        .hamburger-button.active .hamburger-button-span {
          background: white;
        }
        .hamburger-button.active .hamburger-button-span:nth-child(1) {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
        }
        .hamburger-button.active .hamburger-button-span:nth-child(2) {
          opacity: 0;
        }
        .hamburger-button.active .hamburger-button-span:nth-child(3) {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
        }
        .report-button:hover, .notification-button:hover {
          background: #1E90FF;
        }
        .plus-button:hover, .agent-button:hover, .submit-button:hover, .barbados-flag:hover {
          background: #1873CC;
        }
        .message {
          max-width: 70%;
          margin: 10px;
          border-radius: 5px;
          padding: 10px;
        }
        .message img {
          max-width: 200px;
          border-radius: 5px;
          margin: 10px;
        }
        .message a {
          color: #1E90FF;
          text-decoration: none;
        }
        .message a:hover {
          text-decoration: underline;
        }
        .bell-container {
          position: relative;
          width: 30px;
          height: 30px;
          cursor: pointer;
        }
        .badge {
          position: absolute;
          top: -8px;
          right: -12px;
          background-color: red;
          color: white;
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 50%;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          visibility: hidden;
          box-shadow: 0 0 0 2px white;
        }
        .bell-container .badge {
          visibility: visible;
        }
        @media only screen and (max-width: 450px) {
          .chat-header {
            padding: 10px;
          }
          .hamburger-button {
            margin-left: auto;
          }
          .nav-card {
            width: 100%;
            max-width: 450px;
            right: -450px;
            border-radius: 0;
          }
          .nav-card.nav-card-open {
            right: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default Baje;
