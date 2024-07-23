import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../logo.png';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
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
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/ai-assistant`, { query, userId });
      setAiResponse(response.data.response);

      // Add recommendations to AI response
      const recommendations = response.data.recommendations || [];
      const recommendationsText = recommendations.map(rec => `${rec.title} by ${rec.author}`).join('\n');
      const fullResponse = `${response.data.response}\n\n\n${recommendationsText}`;
      setAiResponse(fullResponse);

      setQuery(''); // Clear the input box after submission
    } catch (error) {
      console.error('Error during query processing:', error);
      setAiResponse('An error occurred while processing your request.');
    }
  };

  if (!user) {
    return <div>Loading user data...</div>;
  }

  const defaultPhotoUrl = logo;

return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="user-info">
          <img src={user.PhotoUrl || defaultPhotoUrl} alt="User" className="user-photo" />
          <div>
            <h2>{user.FirstName} {user.LastName}</h2>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <div className="header-title">
          <h1>Welcome {user.FirstName}!</h1>
        </div>
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <main>
        <div className="chat-box">
          <div className="ai-response">
            {aiResponse}
          </div>
          <div className="chat-history">
            {/* Display chat history here if needed */}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about books or request recommendations..."
          />
          <button onClick={handleQuery}>Send</button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
