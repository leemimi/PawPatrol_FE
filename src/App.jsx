import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './layout/Layout'
import Map from './pages/Map'
import Login from './pages/Login'
import MyPage from './pages/MyPage'
import SignUp from './pages/SignUpPage'
import LoginPet from './pages/LoginPet'
import Protection from './pages/Protection'
// import Layout from './layout/Layout.jsx'
import SocialConnect from './pages/SocialConnectPage'

import { useAuthStore } from './stores/useAuthStore'
import './index.css';

const App = () => {

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/login-pet" element={<LoginPet />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/connect" element={<SocialConnect />} />
        <Route path="/" element={<Map />} />
        <Route path="/protection" element={<Protection />} />
        <Route path="/login" element={<Login />} />
      </Route>
    </Routes>
  );
};

export default App;