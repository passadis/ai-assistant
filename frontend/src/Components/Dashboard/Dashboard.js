import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../logo.png';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
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
          fetchRecommendations(response.data.UserId);
        } catch (error) {
          console.error('Error fetching user data:', error);
          navigate('/');
        }
      } else {
        console.error('User ID is missing from local storage.');
        navigate('/');
      }
    };

    const fetchRecommendations = async (userId) => {
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/ai-assistant`, { query: 'recommendation', userId });
        const recommendations = response.data.recommendations;
        const newEntry = {
          query: 'recommendation',
          response: response.data.response,
          recommendations: recommendations || [],
        };
        setChatHistory((prevChatHistory) => [...prevChatHistory, newEntry]);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
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
        setAiResponse('User ID is missing.');
        return;
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/ai-assistant`, { query, userId });
      setAiResponse(response.data.response);

      // Update chat history
      const newEntry = {
        query: query,
        response: response.data.response,
        recommendations: response.data.recommendations || [],
      };
      setChatHistory((prevChatHistory) => [...prevChatHistory, newEntry]);
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
      <main className="main-content">
        <div className="chat-history-container">
          <div className="chat-history-title">Chat History</div>
          <div className="chat-history">
            {chatHistory.map((entry, index) => (
              <div key={index} className="chat-entry">
                <div className="user-query">{entry.query}</div>
                <div className="assistant-response">{entry.response}</div>
                <div className="recommendations">
                  {entry.recommendations.map((rec, recIndex) => (
                    <div key={recIndex} className="recommendation-box">
                      {rec.title} by {rec.author}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="chat-box-container">
          <div className="chat-box">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about books or request recommendations..."
            />
            <button onClick={handleQuery}>Send</button>
          </div>
          <div className="ai-response">
            {aiResponse}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
