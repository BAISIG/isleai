import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';

const supabase = createClient(
  'https://lgurtucciqvwgjaphdqp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndXJ0dWNjaXF2d2dqYXBoZHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2MzgzNTAsImV4cCI6MjA0NTIxNDM1MH0.I1ajlHp5b4pGL-NQzzvcVdznoiyIvps49Ws5GZHSXzk'
);

function SavedChat() {
  const [savedChats, setSavedChats] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch saved chats from Supabase
  const fetchSavedChats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('No authenticated user, redirecting to login');
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('saved_chats')
        .select('id, title, snippet, updated_at, messages')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved chats:', error);
        return;
      }

      setSavedChats(data || []);
    } catch (err) {
      console.error('Unexpected error fetching saved chats:', err);
    }
  };

  // Delete a chat from Supabase
  const handleDeleteChat = async (chatId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('No authenticated user');
        return;
      }

      const { error } = await supabase
        .from('saved_chats')
        .delete()
        .eq('id', chatId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error deleting chat:', error);
        return;
      }

      setSavedChats(savedChats.filter((chat) => chat.id !== chatId));
    } catch (err) {
      console.error('Unexpected error deleting chat:', err);
    }
  };

  // Restore a chat by navigating to Baje.jsx
  const handleRestoreChat = (chat) => {
    navigate('/baje', {
      state: {
        restoredChat: {
          id: chat.id,
          messages: chat.messages,
          title: chat.title
        }
      }
    });
  };

  // Open modal to view chat messages
  const handleViewChat = (chat) => {
    setSelectedChat(chat);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedChat(null);
  };

  // Fetch chats on component mount
  useEffect(() => {
    fetchSavedChats();
  }, []);

  // Handle click outside modal to close it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isModalOpen && !e.target.closest('.modal-content')) {
        handleCloseModal();
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isModalOpen]);

  return (
    <div className="root">
      <div className="main-container">
        <div className="saved-chats-header">
          <h1 className="saved-chats-title">Saved Chats</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span
              className="edit-mode-toggle"
              onClick={() => setIsEditMode(!isEditMode)}
            >
              {isEditMode ? 'Done' : 'Edit'}
            </span>
            <button
              style={{
                fontSize: '24px',
                color: 'white',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0',
              }}
              onClick={() => navigate('/baje')}
            >
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
            </button>
          </div>
        </div>
        <div className="saved-chats-list">
          {savedChats.length === 0 ? (
            <div className="no-saved-chats">
              No saved chats yet. Start a conversation in the chat section!
            </div>
          ) : (
            savedChats.map((chat) => (
              <div
                key={chat.id}
                className="saved-chat-item"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2A2A2A')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1E1E1E')}
                onClick={() => handleViewChat(chat)}
              >
                <div className="chat-icon">💬</div>
                <div className="saved-chat-content">
                  <div className="saved-chat-title">{chat.title}</div>
                  <div className="saved-chat-snippet">{chat.snippet}</div>
                  <div className="saved-chat-time">
                    {new Date(chat.updated_at).toLocaleString()}
                  </div>
                </div>
                {isEditMode && (
                  <div className="action-buttons">
                    <span
                      className="restore-chat"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestoreChat(chat);
                      }}
                    >
                      🔄
                    </span>
                    <span
                      className="delete-chat"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                      }}
                    >
                      🗑️
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && selectedChat && (
        <div className="modal">
          <div className="modal-content">
            <button
              className="modal-close"
              onClick={handleCloseModal}
            >
              ✕
            </button>
            <h2 className="modal-title">{selectedChat.title}</h2>
            <div className="modal-messages">
              {selectedChat.messages.map((msg, index) => (
                <div
                  key={index}
                  className="message"
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    backgroundColor: msg.role === 'user' ? '#5DB075' : '#2A2A2A',
                  }}
                >
                  {msg.content}
                  {msg.fileUrl && (
                    <div>
                      {msg.fileUrl.includes('.jpg') || msg.fileUrl.includes('.png') || msg.fileUrl.includes('.jpeg') ? (
                        <img
                          src={msg.fileUrl}
                          alt="Uploaded"
                          className="message-image"
                        />
                      ) : (
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="message-link"
                        >
                          View File
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        body {
          background: #121212;
          margin: 0;
          font-family: var(--default-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "Source Han Sans CN", sans-serif);
        }

        .root {
          min-height: 100vh;
          padding: 30px;
        }

        .main-container {
          position: relative;
          width: 700px;
          height: 840px;
          margin: 50px auto;
          background: #121212;
          overflow-y: auto;
          border-radius: 8px;
          color: white;
          font-family: Jost, var(--default-font-family);
          box-shadow: 0 0 30px rgba(0,0,0,0.3);
        }

        .saved-chats-header {
          display: flex;
          align-items: center;
          padding: 20px;
          background-color: #1E1E1E;
          border-bottom: 1px solid #303139;
        }

        .saved-chats-title {
          font-size: 24px;
          font-weight: 700;
          flex-grow: 1;
        }

        .edit-mode-toggle {
          color: #5DB075;
          cursor: pointer;
          font-size: 16px;
        }

        .saved-chats-list {
          padding: 20px;
        }

        .saved-chat-item {
          display: flex;
          align-items: center;
          background-color: #1E1E1E;
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 15px;
          cursor: pointer;
          transition: background-color 0.3s;
          position: relative;
        }

        .chat-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          background-color: #005A9C;
          color: white;
          font-size: 24px;
        }

        .saved-chat-content {
          flex-grow: 1;
          max-width: 85%;
        }

        .saved-chat-title {
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 5px;
        }

        .saved-chat-snippet {
          color: #888;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 500px;
        }

        .saved-chat-time {
          color: #888;
          font-size: 12px;
        }

        .action-buttons {
          display: flex;
          gap: 15px;
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
        }

        .restore-chat {
          color: #1E90FF;
          cursor: pointer;
          font-size: 18px;
        }

        .delete-chat {
          color: #FF0000;
          cursor: pointer;
          font-size: 18px;
        }

        .no-saved-chats {
          text-align: center;
          color: #888;
          padding: 50px 20px;
          font-size: 16px;
        }

        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          max-height: 80vh;
          background: #1E1E1E;
          border-radius: 10px;
          padding: 20px;
          z-index: 1000;
          overflow-y: auto;
          box-shadow: 0 0 30px rgba(0,0,0,0.5);
        }

        .modal-content {
          position: relative;
          color: white;
          padding: 20px;
        }

        .modal-close {
          position: absolute;
          top: 10px;
          right: 10px;
          background: transparent;
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
        }

        .modal-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          text-align: center;
        }

        .modal-messages {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .message {
          max-width: 70%;
          padding: 10px;
          border-radius: 8px;
          font-size: 14px;
        }

        .message-image {
          max-width: 200px;
          border-radius: 5px;
          margin-top: 10px;
        }

        .message-link {
          color: #1E90FF;
          text-decoration: none;
          margin-top: 10px;
          display: inline-block;
        }

        /* Mobile Portrait (320px to 479px) */
        @media only screen and (min-width: 320px) and (max-width: 479px) {
          .root {
            padding: 10px;
          }
          .main-container {
            width: 95%;
            height: auto;
            margin: 10px auto;
            border-radius: 4px;
            box-shadow: 0 0 15px rgba(0,0,0,0.2);
          }
          .saved-chats-header {
            padding: 10px;
          }
          .saved-chats-title {
            font-size: 18px;
          }
          .edit-mode-toggle {
            font-size: 14px;
          }
          .saved-chats-list {
            padding: 10px;
          }
          .saved-chat-item {
            padding: 8px;
            margin-bottom: 10px;
            border-radius: 6px;
          }
          .chat-icon {
            width: 30px;
            height: 30px;
            font-size: 16px;
            margin-right: 10px;
          }
          .saved-chat-content {
            max-width: 70%;
          }
          .saved-chat-title {
            font-size: 14px;
            margin-bottom: 3px;
          }
          .saved-chat-snippet {
            font-size: 12px;
            max-width: 200px;
          }
          .saved-chat-time {
            font-size: 10px;
          }
          .action-buttons {
            gap: 10px;
            right: 8px;
          }
          .restore-chat, .delete-chat {
            font-size: 14px;
          }
          .no-saved-chats {
            font-size: 14px;
            padding: 20px 10px;
          }
          .modal {
            width: 90%;
            max-height: 85vh;
            padding: 10px;
            border-radius: 6px;
          }
          .modal-content {
            padding: 10px;
          }
          .modal-close {
            font-size: 14px;
            top: 5px;
            right: 5px;
          }
          .modal-title {
            font-size: 16px;
            margin-bottom: 15px;
          }
          .modal-messages {
            gap: 8px;
          }
          .message {
            max-width: 80%;
            padding: 8px;
            font-size: 12px;
            border-radius: 6px;
          }
          .message-image {
            max-width: 150px;
            margin-top: 8px;
          }
          .message-link {
            font-size: 12px;
            margin-top: 8px;
          }
        }

        /* Mobile Landscape (481px to 767px) */
        @media only screen and (min-width: 481px) and (max-width: 767px) {
          .root {
            padding: 15px;
          }
          .main-container {
            width: 90%;
            height: auto;
            margin: 15px auto;
            border-radius: 6px;
            box-shadow: 0 0 20px rgba(0,0,0,0.25);
          }
          .saved-chats-header {
            padding: 15px;
          }
          .saved-chats-title {
            font-size: 20px;
          }
          .edit-mode-toggle {
            font-size: 15px;
          }
          .saved-chats-list {
            padding: 15px;
          }
          .saved-chat-item {
            padding: 10px;
            margin-bottom: 12px;
            border-radius: 8px;
          }
          .chat-icon {
            width: 35px;
            height: 35px;
            font-size: 18px;
            margin-right: 12px;
          }
          .saved-chat-content {
            max-width: 75%;
          }
          .saved-chat-title {
            font-size: 16px;
            margin-bottom: 4px;
          }
          .saved-chat-snippet {
            font-size: 13px;
            max-width: 300px;
          }
          .saved-chat-time {
            font-size: 11px;
          }
          .action-buttons {
            gap: 12px;
            right: 10px;
          }
          .restore-chat, .delete-chat {
            font-size: 16px;
          }
          .no-saved-chats {
            font-size: 15px;
            padding: 30px 15px;
          }
          .modal {
            width: 85%;
            max-height: 80vh;
            padding: 15px;
            border-radius: 8px;
          }
          .modal-content {
            padding: 15px;
          }
          .modal-close {
            font-size: 15px;
            top: 8px;
            right: 8px;
          }
          .modal-title {
            font-size: 18px;
            margin-bottom: 15px;
          }
          .modal-messages {
            gap: 9px;
          }
          .message {
            max-width: 75%;
            padding: 9px;
            font-size: 13px;
            border-radius: 7px;
          }
          .message-image {
            max-width: 180px;
            margin-top: 9px;
          }
          .message-link {
            font-size: 13px;
            margin-top: 9px;
          }
        }

        /* Tablet Portrait (768px to 1024px) */
        @media only screen and (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
          .root {
            padding: 20px;
          }
          .main-container {
            width: 90%;
            height: 800px;
            margin: 20px auto;
            border-radius: 8px;
            box-shadow: 0 0 25px rgba(0,0,0,0.3);
          }
          .saved-chats-header {
            padding: 15px;
          }
          .saved-chats-title {
            font-size: 22px;
          }
          .edit-mode-toggle {
            font-size: 16px;
          }
          .saved-chats-list {
            padding: 15px;
          }
          .saved-chat-item {
            padding: 12px;
            margin-bottom: 12px;
            border-radius: 8px;
          }
          .chat-icon {
            width: 40px;
            height: 40px;
            font-size: 20px;
            margin-right: 12px;
          }
          .saved-chat-content {
            max-width: 80%;
          }
          .saved-chat-title {
            font-size: 17px;
            margin-bottom: 5px;
          }
          .saved-chat-snippet {
            font-size: 14px;
            max-width: 400px;
          }
          .saved-chat-time {
            font-size: 12px;
          }
          .action-buttons {
            gap: 15px;
            right: 12px;
          }
          .restore-chat, .delete-chat {
            font-size: 17px;
          }
          .no-saved-chats {
            font-size: 16px;
            padding: 40px 15px;
          }
          .modal {
            width: 80%;
            max-height: 85vh;
            padding: 15px;
            border-radius: 8px;
          }
          .modal-content {
            padding: 15px;
          }
          .modal-close {
            font-size: 16px;
            top: 10px;
            right: 10px;
          }
          .modal-title {
            font-size: 19px;
            margin-bottom: 15px;
          }
          .modal-messages {
            gap: 10px;
          }
          .message {
            max-width: 70%;
            padding: 10px;
            font-size: 14px;
            border-radius: 8px;
          }
          .message-image {
            max-width: 200px;
            margin-top: 10px;
          }
          .message-link {
            font-size: 14px;
            margin-top: 10px;
          }
        }

        /* Tablet Landscape (768px to 1024px) */
        @media only screen and (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
          .root {
            padding: 20px;
          }
          .main-container {
            width: 85%;
            height: 700px;
            margin: 20px auto;
            border-radius: 8px;
            box-shadow: 0 0 25px rgba(0,0,0,0.3);
          }
          .saved-chats-header {
            padding: 15px;
          }
          .saved-chats-title {
            font-size: 22px;
          }
          .edit-mode-toggle {
            font-size: 16px;
          }
          .saved-chats-list {
            padding: 15px;
          }
          .saved-chat-item {
            padding: 12px;
            margin-bottom: 12px;
            border-radius: 8px;
          }
          .chat-icon {
            width: 40px;
            height: 40px;
            font-size: 20px;
            margin-right: 12px;
          }
          .saved-chat-content {
            max-width: 80%;
          }
          .saved-chat-title {
            font-size: 17px;
            margin-bottom: 5px;
          }
          .saved-chat-snippet {
            font-size: 14px;
            max-width: 450px;
          }
          .saved-chat-time {
            font-size: 12px;
          }
          .action-buttons {
            gap: 15px;
            right: 12px;
          }
          .restore-chat, .delete-chat {
            font-size: 17px;
          }
          .no-saved-chats {
            font-size: 16px;
            padding: 40px 15px;
          }
          .modal {
            width: 75%;
            max-height: 80vh;
            padding: 15px;
            border-radius: 8px;
          }
          .modal-content {
            padding: 15px;
          }
          .modal-close {
            font-size: 16px;
            top: 10px;
            right: 10px;
          }
          .modal-title {
            font-size: 19px;
            margin-bottom: 15px;
          }
          .modal-messages {
            gap: 10px;
          }
          .message {
            max-width: 70%;
            padding: 10px;
            font-size: 14px;
            border-radius: 8px;
          }
          .message-image {
            max-width: 200px;
            margin-top: 10px;
          }
          .message-link {
            font-size: 14px;
            margin-top: 10px;
          }
        }

        /* Laptop/Desktop (1025px to 1280px) */
        @media only screen and (min-width: 1025px) and (max-width: 1280px) {
          .root {
            padding: 25px;
          }
          .main-container {
            width: 750px;
            height: 850px;
            margin: 30px auto;
            border-radius: 8px;
            box-shadow: 0 0 30px rgba(0,0,0,0.3);
          }
          .saved-chats-header {
            padding: 18px;
          }
          .saved-chats-title {
            font-size: 23px;
          }
          .edit-mode-toggle {
            font-size: 16px;
          }
          .saved-chats-list {
            padding: 18px;
          }
          .saved-chat-item {
            padding: 14px;
            margin-bottom: 14px;
            border-radius: 10px;
          }
          .chat-icon {
            width: 45px;
            height: 45px;
            font-size: 22px;
            margin-right: 14px;
          }
          .saved-chat-content {
            max-width: 85%;
          }
          .saved-chat-title {
            font-size: 18px;
            margin-bottom: 5px;
          }
          .saved-chat-snippet {
            font-size: 14px;
            max-width: 500px;
          }
          .saved-chat-time {
            font-size: 12px;
          }
          .action-buttons {
            gap: 15px;
            right: 14px;
          }
          .restore-chat, .delete-chat {
            font-size: 18px;
          }
          .no-saved-chats {
            font-size: 16px;
            padding: 45px 18px;
          }
          .modal {
            width: 650px;
            max-height: 85vh;
            padding: 18px;
            border-radius: 10px;
          }
          .modal-content {
            padding: 18px;
          }
          .modal-close {
            font-size: 16px;
            top: 12px;
            right: 12px;
          }
          .modal-title {
            font-size: 20px;
            margin-bottom: 18px;
          }
          .modal-messages {
            gap: 12px;
          }
          .message {
            max-width: 70%;
            padding: 12px;
            font-size: 14px;
            border-radius: 8px;
          }
          .message-image {
            max-width: 220px;
            margin-top: 12px;
          }
          .message-link {
            font-size: 14px;
            margin-top: 12px;
          }
        }
      `}</style>
    </div>
  );
}

export default SavedChat;