import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Main from './pages/Main'
import MainMapView from './pages/MainMapView'
import Login from './pages/Login'
import LoginPet from './pages/LoginPet'

import ReportMissingPet  from './pages/ReportMissingPet'
import { useAuthStore } from './stores/useAuthStore'
import './index.css';

const App = () => {

  return (
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/map" element={<MainMapView />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login-pet" element={<LoginPet />} />
        <Route path="/find" element={<ReportMissingPet/>} />
      </Routes>
  );
};

export default App;