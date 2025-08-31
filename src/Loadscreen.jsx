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
  spinnerContainer: {
    height: '190px',
    width: '190px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  spinner: {
    height: '190px',
    width: '190px',
    border: '6px solid',
    borderColor: '#005A9C transparent #005A9C transparent', // Dodger blue
    borderRadius: '50%',
    animation: 'spin 1.3s linear infinite',
    position: 'absolute'
  },
 image: {
    maxWidth: '100%',
    height: '150%',
    objectFit: 'contain',
  }
};

const Loadscreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/baje');
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
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <div style={styles.spinnerContainer}>
        <div style={styles.spinner}></div>
        <img src={isleImage} alt="Isle" style={styles.image} />
      </div>
    </div>
  );
};

export default Loadscreen;