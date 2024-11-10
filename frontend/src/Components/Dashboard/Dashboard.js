import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../logo.png';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('UserId');
      if (userId) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/${userId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          setUser(response.data);
        } catch (error) {
          console.error('Error fetching user data:', error);
          navigate('/');
        }
      } else {
        console.error('User ID is missing from local storage.');
        navigate('/');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('UserId');
    navigate('/');
  };

  const handleQuery = async () => {
    if (!query) return;

    try {
      const userId = localStorage.getItem('UserId');
      if (!userId) {
        console.error('User ID is missing.');
        return;
      }

      // Check if the query is asking for recommendations
      const isRecommendationQuery = query.toLowerCase().includes('recommendation');
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/ai-assistant`, { query, userId });

      const newEntry = {
        query,
        response: response.data.response,
        recommendations: isRecommendationQuery ? response.data.recommendations || [] : [],
      };

      setChatHistory((prevChatHistory) => [...prevChatHistory, newEntry]);
      setQuery('');
    } catch (error) {
      console.error('Error during query processing:', error);
    }
  };

  if (!user) return <div>Loading user data...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <img src={user.PhotoUrl || logo} alt="User" className="user-photo" />
        <h2>Welcome, {user.FirstName}</h2>
        <button onClick={handleLogout}>Logout</button>
      </header>
      
      <div className="chat-container">
        <div className="chat-history">
          {chatHistory.map((entry, index) => (
            <div key={index} className="chat-message">
              <div className="user-message">{entry.query}</div>
              <div className="ai-message">{entry.response}</div>
              {entry.recommendations && entry.recommendations.map((rec, recIndex) => (
                <div key={recIndex} className="recommendation">
                  {rec.title} by {rec.author}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        <div className="input-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your message..."
            className="query-input"
          />
          <button onClick={handleQuery}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
