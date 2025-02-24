import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './layout/Layout'
import Map from './pages/Map'
import Login from './pages/Login'
import MyPage from './pages/MyPage'
import SignUp from './pages/SignUpPage'
import LoginPet from './pages/LoginPet'
import Layout from './layout/Layout.jsx'
import SocialConnect from './pages/SocialConnectPage'

import ReportMissingPet  from './pages/ReportMissingPet'
import { useAuthStore } from './stores/useAuthStore'
import './index.css';

const App = () => {

  return (
      <Routes>
        <Route element={<Layout />}>
            <Route path="/" element={<Main />} />
            <Route path="/map" element={<MainMapView />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login-pet" element={<LoginPet />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/find" element={<ReportMissingPet/>} />
            <Route path="/connect" element={<SocialConnect/>} />
        </Route>
      </Routes>
  );
};

export default App;