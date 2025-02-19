import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Main from './pages/Main'
import Login from './pages/Login'
import { useAuthStore } from './stores/useAuthStore'
import './index.css';

const App = () => {

  return (
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
      </Routes>
  );
};

export default App;