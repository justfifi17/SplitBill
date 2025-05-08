import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import GroupDetailsPage from './pages/GroupDetailsPage'; // <-- You'll create this file

function App() {
  return (
    <Router>
      <div className="bg-gray-50 min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/groups/:groupId" element={<GroupDetailsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
