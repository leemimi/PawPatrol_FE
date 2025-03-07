// src/firebase-config.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGsITwSycgvFBn31D0shpfUVkJZXm8vQE",
  authDomain: "pawpatrol-2b0e3.firebaseapp.com",
  projectId: "pawpatrol-2b0e3",
  storageBucket: "pawpatrol-2b0e3.firebasestorage.app",
  messagingSenderId: "698844396749",
  appId: "1:698844396749:web:17ab47ff70369755047d84",
  measurementId: "G-HECG01QTQZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// VAPID key for web push
const vapidKey = "BHeh2yB3PHsevb5ZeipX3GRAtSSpWqrNBJirSCpoNzi-ardvvdpkgLpM0A2hsWtD79AjQyYmrVKqk_lomM7X1tI";

// Register service worker
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

// Request notification permission and get FCM token
export const requestPermission = async () => {
  try {
    // First register service worker
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

// 알림 표시 함수 (간소화)
export const displayNotification = (title, body, data = {}) => {
  console.log('알림 생성 시도:', { title, body });
  
  try {
    // 가장 단순한 알림 생성 방식으로 시도
    const notification = new Notification(title, {
      body: body
    });
    
    notification.onclick = function() {
      window.focus();
      notification.close();
      
      // 알림 클릭 시 특정 페이지로 이동이 필요한 경우
      if (data && data.url) {
        window.location.href = data.url;
      }
    };
    
    console.log('알림 생성 성공 - 기본 방식');
    return;
  } catch (error) {
    console.error('기본 알림 생성 실패:', error);
  }
  
  // 기본 방식 실패 시 Service Worker 사용
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        const notificationOptions = {
          body: body,
          requireInteraction: true
        };
        
        registration.showNotification(title, notificationOptions)
          .then(() => console.log('ServiceWorker 알림 표시 성공'))
          .catch(err => console.error('ServiceWorker 알림 표시 실패:', err));
      })
      .catch(err => {
        console.error('ServiceWorker ready 실패:', err);
      });
  }
};

// Initialize FCM - call this in your app entry point (e.g., App.jsx or main.jsx)
export const initializeFCM = async () => {
  try {
    const swRegistration = await registerServiceWorker();
    
    // 서비스 워커 상태 확인
    if (swRegistration) {
      console.log('Service Worker 상태:', swRegistration.active ? '활성화됨' : '비활성화됨');
    }
    
    const token = await requestPermission();
    
    // 포그라운드 메시지 리스너 설정
    setupForegroundMessageHandler();
    
    return token;
  } catch (error) {
    console.error('FCM 초기화 오류:', error);
    return null;
  }
};

// 포그라운드 메시지 핸들러 설정
export const setupForegroundMessageHandler = () => {
  onMessage(messaging, (payload) => {
    console.log('포그라운드 메시지 수신:', payload);
    
    // 제목과 내용 설정
    let title = 'PawPatrol 알림';
    let body = '새로운 알림이 있습니다.';
    
    // payload.data가 있는 경우 처리
    if (payload.data) {
      if (payload.data.title) {
        title = payload.data.title;
      }
      
      if (payload.data.body) {
        body = payload.data.body;
      } else if (payload.data.content) {
        body = payload.data.content;
      }
    }
    
    // payload.notification이 있는 경우 처리
    if (payload.notification) {
      if (payload.notification.title) {
        title = payload.notification.title;
      }
      if (payload.notification.body) {
        body = payload.notification.body;
      }
    }
    
    // 알림 표시 (중요: 무조건 직접 알림 API를 먼저 사용)
    if (Notification.permission === 'granted') {
      try {
        console.log('직접 Notification API로 알림 생성');
        // 먼저 기본 Notification API로 바로 시도
        new Notification(title, {
          body: body,
          // 필수 옵션만 포함하여 단순화
          requireInteraction: true
        });
      } catch (error) {
        console.error('직접 알림 생성 실패:', error);
        // 실패한 경우에만 ServiceWorker 알림 시도
        displayNotification(title, body, payload.data);
      }
    } else {
      console.warn('알림 권한이 없어 알림을 표시할 수 없습니다. 현재 권한:', Notification.permission);
      
      // 권한 없는 경우 권한 요청
      requestPermission().then(() => {
        if (Notification.permission === 'granted') {
          new Notification(title, {
            body: body
          });
        }
      });
    }
  });
};

// 포그라운드 메시지 리스너 (기존 코드와 호환성 유지)
export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('포그라운드 메시지 수신 (Promise):', payload);
      resolve(payload);
    });
  });
};

export { messaging };