import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBGsITwSycgvFBn31D0shpfUVkJZXm8vQE",
  authDomain: "pawpatrol-2b0e3.firebaseapp.com",
  projectId: "pawpatrol-2b0e3",
  storageBucket: "pawpatrol-2b0e3.firebasestorage.app",
  messagingSenderId: "698844396749",
  appId: "1:698844396749:web:17ab47ff70369755047d84",
  measurementId: "G-HECG01QTQZ"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const vapidKey = "BHeh2yB3PHsevb5ZeipX3GRAtSSpWqrNBJirSCpoNzi-ardvvdpkgLpM0A2hsWtD79AjQyYmrVKqk_lomM7X1tI";

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      console.log('Service Worker 등록 성공:', registration.scope);
      return registration;
    } catch (error) {
      console.log('Service Worker 등록 실패:', error);
      return null;
    }
  }
  console.log('Service Worker를 지원하지 않는 브라우저입니다.');
  return null;
};

export const requestPermission = async () => {
  try {
    const swRegistration = await registerServiceWorker();
    
    if (!swRegistration) {
      console.log('Service Worker 등록에 실패하여 알림을 설정할 수 없습니다.');
      return null;
    }
    
    const permission = await Notification.requestPermission();
    console.log('알림 권한:', permission);
    
    if (permission === 'granted') {
      try {
        const currentToken = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swRegistration });
        if (currentToken) {
          console.log('푸시 토큰:', currentToken);
          localStorage.setItem('fcmToken', currentToken);
          return currentToken;
        } else {
          console.log('토큰을 가져올 수 없습니다.');
          return null;
        }
      } catch (err) {
        console.log('토큰 가져오기 오류:', err);
        return null;
      }
    } else {
      console.log('알림 권한이 거부되었습니다.');
      return null;
    }
  } catch (err) {
    console.error('FCM 설정 오류:', err);
    return null;
  }
};

export const displayNotification = (title, body, data = {}) => {
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        const notificationOptions = {
          body: body,
          requireInteraction: true,
          data: data
        };
        
        registration.showNotification(title, notificationOptions)
          .then(() => console.log('알림 표시 성공'))
          .catch(err => console.error('알림 표시 실패:', err));
      })
      .catch(err => {
        console.error('ServiceWorker ready 실패:', err);
        try {
          new Notification(title, { body: body });
        } catch (e) {
          console.error('모든 알림 방식 실패:', e);
        }
      });
  } else {
    try {
      new Notification(title, { body: body });
    } catch (e) {
      console.error('알림 생성 실패:', e);
    }
  }
};

// 파일: src/firebase/firebase.js 또는 해당 FCM 관련 파일
export const initializeFCM = async () => {
  try {
    const swRegistration = await registerServiceWorker();
    
    if (swRegistration) {
      console.log('Service Worker 상태:', swRegistration.active ? '활성화됨' : '비활성화됨');
    }
    
    const token = await requestPermission();
    
    setupForegroundMessageHandler();
    
    return token;
  } catch (error) {
    console.error('FCM 초기화 오류:', error);
    return null;
  }
};

// onMessageListener는 이제 내부에서만 사용하거나 제거

export const setupForegroundMessageHandler = () => {
  onMessage(messaging, (payload) => {
    console.log('포그라운드 메시지 수신:', payload);
    

    console.log('알림 데이터:', payload.data);
    
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('fcm-message', { 
        detail: payload 
      }));
    }
  });
};


export { messaging };