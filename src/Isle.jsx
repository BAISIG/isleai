import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';


// 🎨 These are all the colors and styles for our chat app (like coloring book rules)
const styles = {
  // 🌈 Root colors and fonts (the main crayons in our box)
  ':root': {
    '--default-font-family': '...', // ✏️ The type of writing we'll use
    '--bg-gradient': 'linear-gradient(135deg, #000000, #1E90FF)' // 🔵⬛ A pretty blue-black background
  },
  
  // 👶 The whole page rules
  body: {
    background: 'var(--bg-gradient)', // 🖍️ Use our blue-black background
    display: 'flex', // 📦 Arrange things in a nice box
    justifyContent: 'center', // ↔️ Put things in the middle
    alignItems: 'center', // ↕️ Also middle up-down
    minHeight: '100vh', // 📏 Make sure it fills the whole screen
    margin: 0, // 🚫 No extra space around edges
    fontFamily: "'Jost', sans-serif" // ✍️ Our nice writing style
  },

  // 🏠 The main chat box rules
  '.main-container': {
    position: 'relative', // 📍 Stay in one place
    width: '700px', // 📏 This wide
    height: '840px', // 📏 This tall
    background: 'rgba(0, 0, 0, 0.7)', // ⬛ Slightly see-through black
    overflow: 'hidden', // 🙈 Hide anything that sticks out
    borderRadius: '15px', // 🔵 Round corners
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)', // 👥 Soft shadow behind
    display: 'flex', // 📦 Arrange inside pieces
    flexDirection: 'column' // ⬇️ Stack pieces top to bottom
  },

  // 👑 The top hat of our chat (where BAJE's name is)
  '.chat-header': {
    display: 'flex', // 📦 Arrange pieces inside
    alignItems: 'center', // ↔️ Line them up in middle
    background: 'rgba(255, 255, 255, 0.1)', // ⬜ Slightly see-through white
    padding: '15px', // 📏 Space inside
    color: 'white' // ⬜ White writing
  },

  // 🤖 BAJE's robot face picture
  '.ai-avatar': {
    width: '50px', // 📏 This big
    height: '50px', // 📏 This tall
    borderRadius: '50%', // 🔵 Make it a circle
    background: 'url("https://via.placeholder.com/50") center/cover', // 🖼️ Robot picture
    marginRight: '15px' // 📏 Space to the right
  },

  // 📝 Where BAJE's name and status live
  '.ai-info': {
    flexGrow: 1 // 🌱 Grow to fill space
  },
  '.ai-name': {
    fontSize: '18px', // ✏️ Big writing
    fontWeight: 'bold' // ✏️ Thick writing
  },
  '.ai-status': {
    fontSize: '14px', // ✏️ Smaller writing
    color: 'rgba(255, 255, 255, 0.7)' // ⬜ Light white
  },

  // 📜 The message area (where chat appears)
  '.chat-messages': {
    flexGrow: 1, // 🌱 Grow to fill space
    overflowY: 'auto', // ↕️ Scroll up-down if needed
    padding: '20px', // 📏 Space inside
    color: 'white' // ⬜ White writing
  },

  // 💬 Each message bubble
  '.message': {
    background: 'rgba(255, 255, 255, 0.1)', // ⬜ Slightly see-through white
    borderRadius: '10px', // 🔵 Round corners
    padding: '15px', // 📏 Space inside
    marginBottom: '15px', // 📏 Space below
    maxWidth: '80%' // ↔️ Don't make too wide
  },
  
  // 💙 Your messages (different color)
  '.user-message': {
    background: 'rgba(30, 144, 255, 0.3)', // 🔵 Pretty blue
    marginLeft: 'auto', // ➡️ Push to right side
    marginRight: '0' // 🚫 No space on right
  },

  // ✍️ The typing area at bottom
  '.input-section': {
    display: 'flex', // 📦 Arrange pieces
    padding: '15px', // 📏 Space inside
    background: 'rgba(255, 255, 255, 0.1)' // ⬜ Slightly see-through white
  },
  
  // 📝 The typing box
  '.input-field': {
    flexGrow: 1, // 🌱 Grow to fill space
    background: 'rgba(255, 255, 255, 0.2)', // ⬜ More see-through white
    border: 'none', // 🚫 No border line
    borderRadius: '20px', // 🔵 Round corners
    padding: '10px 15px', // 📏 Space inside
    color: 'white' // ⬜ White writing
  },
  
  // ✉️ The send button
  '.send-button': {
    background: '#1E90FF', // 🔵 Pretty blue
    border: 'none', // 🚫 No border
    borderRadius: '50%', // 🔵 Make it a circle
    width: '40px', // 📏 This big
    height: '40px', // 📏 This tall
    display: 'flex', // 📦 Arrange inside
    alignItems: 'center', // ↕️ Center up-down
    justifyContent: 'center', // ↔️ Center left-right
    marginLeft: '10px', // 📏 Space from typing box
    color: 'white', // ⬜ White icon
    cursor: 'pointer', // 👆 Show finger pointer
    transition: 'background 0.3s ease' // 🌈 Smooth color change
  },
  
  // ✨ Send button when mouse hovers
  '.send-button:hover': {
    background: '#1873CC' // 🔵 Darker blue
  },
  
  // 🚫 Send button when disabled
  '.send-button:disabled': {
    background: '#cccccc', // ⬜ Light gray
    cursor: 'not-allowed' // 🚫 No finger pointer
  },
  
  // 💭 Placeholder text in typing box
  '.input-field::placeholder': {
    color: 'rgba(255, 255, 255, 0.6)' // ⬜ Light white
  },
  
  // ... (more styles for typing indicator below)c
};

// 🏠 Our main chat component
function Isle() {
  // 📨 All the messages in our chat
  const [messages, setMessages] = useState([
    { 
      id: '1', // 🏷️ Each message has an ID (like a nametag)
      role: 'assistant', // 🤖 This is from BAJE
      content: "Location: Barbados is..." // 📜 The message words
    },
    // ... (more starting messages)
  ]);
  
  // ✏️ What you're typing right now
  const [inputValue, setInputValue] = useState('');
  
  // ⏳ Is BAJE thinking? (loading spinner)
  const [isLoading, setIsLoading] = useState(false);
  
  // 📜 Magic scroll to bottom
  const messagesEndRef = useRef(null);

  // 🔄 Automatically scroll down when new messages come
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 📤 When you send a message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return; // 🚫 Don't send empty messages

    // ✉️ Add your message to the chat
    const userMessage = { 
      id: Date.now().toString(), // ⏰ Make a unique ID
      role: 'user', // 👶 This is from you
      content: inputValue // 📜 Your words
    };
    setMessages(prev => [...prev, userMessage]); // 📨 Add to message list
    setInputValue(''); // 🧹 Clear the typing box
    setIsLoading(true); // 🎡 Show loading spinner

    try {
      // 📡 Send to BAJE's brain (API call would go here)
      // ... (pretend we send it to BAJE)
      
      // 🤖 BAJE replies (in real app, this comes from API)
      const aiMessage = { 
        id: Date.now().toString(), // ⏰ New ID
        role: 'assistant', // 🤖 From BAJE
        content: "Thanks for your message! I'm BAJE!" // 📜 Reply
      };
      setMessages(prev => [...prev, aiMessage]); // 📨 Add BAJE's reply
    } catch (error) {
      // 😢 Oh no! Something went wrong!
      setMessages(prev => [...prev, { 
        id: Date.now().toString(),
        role: 'assistant', 
        content: "Sorry, I'm having trouble thinking right now..." 
      }]);
    } finally {
      setIsLoading(false); // 🛑 Stop loading spinner
    }
  };

  // ⌨️ When you press Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage(); // 📤 Same as clicking send
    }
  };

  // 🎨 Painting the screen
  return (
    <div className="main-container" style={styles['.main-container']}>
      {/* 👑 The top header with BAJE's info */}
      <div className="chat-header" style={styles['.chat-header']}>
        <div className="ai-avatar" style={styles['.ai-avatar']}></div>
        <div className="ai-info" style={styles['.ai-info']}>
          <div className="ai-name" style={styles['.ai-name']}>BAJE Assistant</div>
          <div className="ai-status" style={styles['.ai-status']}>Online • Level 5</div>
        </div>
        <div className="header-icons">
          <i className="fas fa-info-circle" style={{ color: 'white', marginRight: '10px' }}></i>
          <i className="fas fa-ellipsis-v" style={{ color: 'white' }}></i>
        </div>
      </div>
      
      {/* 📜 The message area */}
      <div className="chat-messages" style={styles['.chat-messages']}>
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.role === 'user' ? 'user-message' : ''}`}
            style={{
              ...styles['.message'],
              ...(message.role === 'user' ? styles['.user-message'] : {})
            }}
          >
            {message.content}
          </div>
        ))}
        {/* 🎡 Loading spinner when BAJE is thinking */}
        {isLoading && (
          <div style={{ 
            display: 'flex',
            padding: '15px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            width: 'fit-content'
          }}>
            <span style={{ 
              height: '10px',
              width: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '50%',
              display: 'inline-block',
              margin: '0 2px',
              animation: 'bounce 1.5s infinite ease-in-out'
            }}></span>
            {/* Two more dots with different animation delays */}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ✍️ The typing area at bottom */}
      <div className="input-section" style={styles['.input-section']}>
        <input 
          type="text" 
          className="input-field" 
          style={styles['.input-field']}
          placeholder="Ask me about Barbados..." 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button 
          className="send-button" 
          style={{
            ...styles['.send-button'],
            ...(isLoading || !inputValue.trim() ? styles['.send-button:disabled'] : {})
          }}
          onClick={handleSendMessage}
          disabled={isLoading || !inputValue.trim()}
        >
          {isLoading ? (
            <i className="fas fa-spinner fa-spin"></i> // 🎡 Spinner when loading
          ) : (
            <i className="fas fa-paper-plane"></i> // ✉️ Paper plane icon
          )}
        </button>
      </div>
    </div>
  );
}

export default Isle