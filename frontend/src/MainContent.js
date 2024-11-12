import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from './logo.png';
import './App.css';
import { AuthContext } from './AuthContext';

function MainContent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  // Access the AuthContext
 const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/login`, {
        username,
        password,
      });
      // localStorage.setItem('token', response.data.token);
      // localStorage.setItem('UserId', response.data.UserId);
      const { token, UserId } = response.data;

      // Update the global auth state
      login(token, UserId)

      navigate('/dashboard');
    } catch (error) {
      console.error('Error logging in:', error.response);
      setErrorMessage('Login failed. Please check your credentials.');
    }
  };

  const navigateToSignup = () => {
    navigate('/signup');
  };

  return (
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <h1>Welcome to Azure Book Recommendations Web App</h1>
      <p>Log in or register your Account</p>
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <form onSubmit={handleLogin} className="form-container">
        <input
          type="text"
          className="input-field"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="input-field"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="button login-btn">Login</button>
      </form>
      <button onClick={navigateToSignup} className="button signup-btn">Register</button>
    </header>
  );
}

export default MainContent;
