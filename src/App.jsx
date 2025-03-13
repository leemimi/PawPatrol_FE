import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './layout/Layout'
import Map from './pages/Map'
import MyPage from './pages/MyPage'
import SignUp from './pages/SignUpPage'
import SignUpShelter from './pages/SignUpShelterPage'
import LoginPet from './pages/LoginPet'
import Protection from './pages/Protection'
import ProtectionDetail from './pages/ProtectionDetail'
import MyApplications from './pages/MyApplications'
import MyRegisterAnimals from './pages/MyRegisterAnimals'
import RegisterAnimalForm from './pages/RegisterAnimalForm'
import EditAnimalForm from './pages/EditAnimalForm'
import ShelterAnimalList from './pages/ShelterAnimalList'
import Rescue from './pages/Rescue'
// import Layout from './layout/Layout.jsx'
import SocialConnect from './pages/SocialConnectPage'
import LostPostForm from './pages/LostPostForm'
import OAuth2RedirectHandler from './components/OAuth2RedirectHandler';
import ForgotPasswordScreen from './pages/ForgotPasswordScreen';
import LostPetListPages from './pages/LostPetListPages'
import ReportPostForm from './pages/ReportPostForm'
import PetPostDetail from './pages/PetPostDetail'
import Lostmypetfix from './pages/Lostmypetfix'
import Chat from './pages/Chat'
import ChatList from './pages/ChatList'
import ShelterMyPage from './pages/ShelterMyPage';
import AdminDashboard from './pages/AdminDashboard';
import './api/axiosConfig'; // axios 전역 인터셉터 설정, 토큰 만료시 로그아웃 처리
import { useAuthStore } from './stores/useAuthStore'
import NotificationPopup from './components/NotificationPopup';
import { initializeFCM } from './firebase-config';

function App() {
  const [currentNotification, setCurrentNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await initializeFCM();
    };
    
    initialize();
    
    // 커스텀 알림 이벤트 리스너
    const handleCustomNotification = (event) => {
      const data = event.detail;
      
      setCurrentNotification({
        id: data.id,
        title: data.title,
        content: data.body,
        createdAt: data.createdAt || data.timestamp,
        type: data.type
      });
      setShowNotification(true);
      
      setTimeout(() => {
        setShowNotification(false);
        setCurrentNotification(null);
      }, 3000);
    };
    
    window.addEventListener('custom-notification', handleCustomNotification);
    
    return () => {
      window.removeEventListener('custom-notification', handleCustomNotification);
    };
  }, []);

  return (  /*수정*/
    <Router> {/* This Router wrapper was missing  */}
       {showNotification && currentNotification && (
        <NotificationPopup 
          notification={currentNotification}
          onClose={() => setShowNotification(false)}
        />
      )}
      <Routes>
      <Route path="/" element={<LoginPet />} />
        <Route element={<Layout />}>

      

          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/connect" element={<SocialConnect />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/main" element={<Map />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route path="/protection" element={<Protection />} />
          <Route path="/protection/:id" element={<ProtectionDetail />} />
          <Route path="/my-applications" element={<MyApplications />} />
          <Route path="/my-register-animals" element={<MyRegisterAnimals />} />
          <Route path="/register-animal" element={<RegisterAnimalForm />} />
          <Route path="/edit-animal/:id" element={<EditAnimalForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/lost-pet-registration" element={<LostPostForm />} />
          <Route path="/find-pet-report" element={<ReportPostForm />} />
          <Route path="/community" element={<LostPetListPages />} />
          <Route path="/chatlist" element={<ChatList />} />
          {/* You have duplicate route for /community, removed one */}
          <Route path="/PetPostDetail/:postId" element={<PetPostDetail />} />
          <Route path="/lostmypetfix/:postId" element={<Lostmypetfix />} />
          <Route path="/shelter-mypage" element={<ShelterMyPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/sign-up-shelter" element={<SignUpShelter />} />
          <Route path="/rescue" element={<Rescue />} />
          <Route path="/shelters/:shelterId" element={<ShelterAnimalList />} />
        </Route>
      </Routes>
    </Router>

  );
};

export default App;