import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from './logo.png'; // Update the path to your logo
import './App.css';

function MainContent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, {
        username,
        password
      });
      // Handle successful login here
      // For example, save the token to localStorage and redirect
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('UserId', response.data.UserId);
      navigate('/dashboard');// Redirect to dashboard or another page
    } catch (error) {
      console.error("Error logging in:", error.response);
      // Handle errors here, such as displaying a notification
      setErrorMessage('Login failed. Please check your credentials.');
    }
  };

  const navigateToSignup = () => {
    navigate('/signup');
  };

  return (
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <h1>Welcome Azure Book recommendations Web App</h1>
      <p>Sign in or register your Account</p>
      {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error message */}
      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
      </form>
      <button onClick={navigateToSignup}>Sign Up</button>
    </header>
  );
}

export default MainContent;
