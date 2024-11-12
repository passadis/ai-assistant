import React, { useReducer, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import logo from '../logo.png';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './../../AuthContext';

const initialState = {
  user: null,
  query: '',
  chatHistory: [],
  recommendationsReady: false,
};

// Reducer function to handle state updates
function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    case 'ADD_CHAT_HISTORY':
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };
    case 'SET_RECOMMENDATIONS_READY':
      return { ...state, recommendationsReady: true };
    default:
      return state;
  }
}

const Dashboard = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user, query, recommendationsReady, chatHistory } = state;
  const navigate = useNavigate();
  const { auth, logout } = useContext(AuthContext);

  // Polling interval (2 minutes)
  const POLLING_INTERVAL = 120000; // 120 seconds

  // Function to check the recommendations status
  const checkRecommendationsStatus = useCallback(async () => {
    const userId = auth.userId;
    if (!userId) return;

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/check-recommendations`, {
        params: { userId }
      });

      if (response.data.recommendationsReady) {
        dispatch({ type: 'SET_RECOMMENDATIONS_READY' });
      }
    } catch (error) {
      console.error('Error checking recommendations status:', error);
    }
  }, [auth.userId]);

  // Fetch user data on initial load
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = auth.userId;
      const token = auth.token;
      if (userId && token) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          dispatch({ type: 'SET_USER', payload: response.data });
        } catch (error) {
          console.error('Error fetching user data:', error);
          logout();
          navigate('/');
        }
      } else {
        console.error('User is not authenticated.');
        navigate('/');
      }
    };

    fetchUserData();
  }, [auth.userId, auth.token, navigate, logout]);

  // Check recommendations status on login and set up periodic polling
  useEffect(() => {
    checkRecommendationsStatus();

    // Polling mechanism to check every 2 minutes
    const interval = setInterval(() => {
      checkRecommendationsStatus();
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [checkRecommendationsStatus]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleQuery = async () => {
    if (!query.trim()) return;

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/ai-assistant`, {
        query,
        userId: auth.userId
      });

      console.log("AI Response Received:", response.data);

      if (response.data.recommendations && response.data.recommendations.length > 0) {
        dispatch({
          type: 'ADD_CHAT_HISTORY',
          payload: {
            query,
            response: response.data.response,
            recommendations: response.data.recommendations
          }
        });
      } else {
        dispatch({
          type: 'ADD_CHAT_HISTORY',
          payload: { query, response: response.data.response }
        });
      }

      dispatch({ type: 'SET_QUERY', payload: '' });
    } catch (error) {
      console.error('Error during query processing:', error);
    }
  };

  const handleInputChange = (e) => {
    dispatch({ type: 'SET_QUERY', payload: e.target.value });
  };

  if (!user) return <div>Loading user data...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <img src={user.PhotoUrl || logo} alt="User" className="user-photo" />
        <h2>Welcome, {user.FirstName}</h2>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <div className={recommendationsReady ? 'status-ready' : 'status-pending'}>
        {recommendationsReady ? 'Personalized recommendations are ready!' : 'Waiting for your personalized recommendations...'}
      </div>

      <div className="chat-container">
        <div className="chat-history">
          {chatHistory.map((entry, index) => (
            <div key={index} className="chat-message">
              <div className="user-message"><strong>You:</strong> {entry.query}</div>
              <div className="ai-message"><strong>AI:</strong> {entry.response}</div>

              {/* Render recommendations if available */}
              {entry.recommendations && entry.recommendations.length > 0 && (
                <div className="recommendations">
                  <h4>Recommendations:</h4>
                  <ul>
                    {entry.recommendations.map((rec, recIndex) => (
                      <li key={recIndex}>
                        <strong>{rec.title}</strong> by {rec.author}
                        <p>{rec.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="input-container">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="query-input"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleQuery();
              }
            }}
          />
          <button onClick={handleQuery} className="send-button">Send</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
