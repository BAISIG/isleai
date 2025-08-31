import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import isleImage from '../isle.png';

const styles = {
  mainContainer: {
    width: '100vw',
    height: '100vh',
    background: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    fontFamily: "Jost, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, sans-serif",
    animation: 'fadeInOut 5s ease-in-out forwards'
  },
  image: {
    maxWidth: '100%',
    height: '70%',
    objectFit: 'contain',
  }
};

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={styles.mainContainer}>
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.15);
          }
          40% {
            transform: scale(1);
          }
          60% {
            transform: scale(1.1);
          }
          80% {
            transform: scale(1);
          }
        }
        img {
          animation: heartbeat 1.5s ease-in-out infinite;
        }
      `}</style>
      <img src={isleImage} alt="Isle" style={styles.image} />
    </div>
  );
};

export default Home;
