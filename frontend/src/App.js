import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import MainContent from './MainContent';
import Register from './Components/Register/Register';
import Dashboard from './Components/Dashboard/Dashboard';
import { AuthContext } from './AuthContext';

function App() {
  const { auth } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={auth.token ? <Navigate to="/dashboard" /> : <MainContent />}
        />
        <Route
          path="/dashboard"
          element={auth.token ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={auth.token ? <Navigate to="/dashboard" /> : <Register />}
        />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
