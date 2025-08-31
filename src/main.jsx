
//Working
// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )
//Working

//Working too
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App.jsx';
// import { BrowserRouter } from 'react-router-dom';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>
// );


import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { TourProvider } from '@reactour/tour';
import App from './App.jsx';


const steps = [
  {
    selector: '.chat-header',
    content: 'This is the chat header with your avatar, AI guide info, and navigation buttons.'
  },
  {
    selector: '.hamburger-button',
    content: 'Click this to open the navigation menu.'
  },
  {
    selector: '.nav-card',
    content: 'The navigation menu contains links to Home, Profile, and more.'
  },
  {
    selector: '.barbados-flag',
    content: 'Click the flag to select a different Caribbean country.'
  },
  {
    selector: '.country-menu',
    content: 'Choose a destination to switch the chat context.'
  },
  {
    selector: '.chat-messages',
    content: 'View your conversation with the AI guide here.'
  },
  {
    selector: '.facts-card',
    content: 'This card shows interesting facts about the selected country.'
  },
  {
    selector: '.quiz-card',
    content: 'Test your knowledge with fun quizzes.'
  },
  {
    selector: '.question-card',
    content: 'Share your thoughts on open-ended questions.'
  },
  {
    selector: '.input-section',
    content: 'Send messages, upload files, select agents, or choose submit types here.'
  },
  {
    selector: '.plus-menu-container',
    content: 'Upload files like images or PDFs with this button.'
  },
  {
    selector: '.agent-menu-container',
    content: 'Select different AI agents (Main, Tourism, Traffic) here.'
  },
  {
    selector: '.submit-menu-container',
    content: 'Choose how to send your message (text, voice, image, maps).'
  }
];

ReactDOM.createRoot(document.getElementById('root')).render(
  <PayPalScriptProvider
    options={{
      'client-id': 'Aav0poIpivqe0oH8RZkwdfHzxNKzGID6j58AZnR3VsImFvbHo9hUVp42jblmT1L1g3Uah-udg3NkAo7o'
    }}
  >
    <TourProvider
      steps={steps}
      styles={{
        popover: (base) => ({
          ...base,
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          fontSize: '14px',
          padding: '15px',
          borderRadius: '10px',
          zIndex: 10001
        }),
        badge: (base) => ({ ...base, background: '#1E90FF', color: 'white' }),
        dot: (base) => ({ ...base, background: '#1E90FF', border: 'none' }),
        button: (base) => ({ ...base, background: '#1E90FF', color: 'white', borderRadius: '5px', padding: '5px 10px', border: 'none' })
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </TourProvider>
  </PayPalScriptProvider>
);