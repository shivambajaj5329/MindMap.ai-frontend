import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../AuthProvider';
import './css/LandingPage.css';  // Import the CSS file directly

function LandingPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [text, setText] = useState('W');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const fullText = 'Welcome to MindMap';
  const typingSpeed = 200;

  useEffect(() => {
    let index = 1;
    let isDeleting = false;
    const interval = setInterval(() => {
      if (!isDeleting) {
        setText(fullText.substring(0, index + 1));
        index++;
        if (index === fullText.length) {
          isDeleting = true;
        }
      } else {
        setText(fullText.substring(0, index));
        index--;
        if (index === 1) {
          isDeleting = false;
        }
      }
    }, typingSpeed);
    return () => clearInterval(interval);
  }, [fullText, typingSpeed]);

  const handleLogin = async () => {
    try {
      setError('');  // Clear any previous error
      await signInWithEmailAndPassword(auth, username, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Invalid login details');  // Set error message
    }
  };

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing-page">
      <h1 className='landingpage-header-text'>{text}</h1>
      <div className="login-form">
        {error && <p className="error-message">{error}</p>}  {/* Display error message */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Log In</button>
      </div>
    </div>
  );
}

export default LandingPage;
