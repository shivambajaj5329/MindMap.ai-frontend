import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../AuthProvider';
import './css/LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [text, setText] = useState('W');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
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
          setTimeout(() => {
            isDeleting = false;
            index = 1;
          }, 1000); // Pause at the end for 1 second
        }
      }
    }, typingSpeed);
    return () => clearInterval(interval);
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccessMessage('Successfully signed up! Please switch to login and sign in.');
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(isLogin ? 'Invalid login details' : 'Error signing up');
    }
  };

  const toggleAuthMode = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setError('');
      setSuccessMessage('');
      setEmail('');
      setPassword('');
      setIsAnimating(false);
    }, 300); // Match this with your CSS transition time
  };

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing-page">
      <h1 className='landingpage-header-text'>{text}</h1>
      <div className="auth-form-container">
        <form onSubmit={handleAuth} className={`auth-form ${isAnimating ? 'fade-out' : ''}`}>
          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isLogin ? 'Log In' : 'Sign Up'}</button>
        </form>
        <p onClick={toggleAuthMode} className="auth-toggle">
          {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
        </p>
      </div>
    </div>
  );
}

export default LandingPage;