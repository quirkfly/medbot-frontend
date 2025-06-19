import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatPage from './pages/ChatPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatPage />} />
      </Routes>
    </Router>
  );
};

export default App;