import { getMessaging, getToken } from 'firebase/messaging';
import { registerServiceWorker } from '../firebase-config';

export async function handleAllowNotification() {
  try {
    // 알림 권한 요청
    const permission = await Notification.requestPermission();
    console.log('알림 권한:', permission);
    
    if (permission === 'granted') {
      // 서비스 워커 등록
      const swRegistration = await registerServiceWorker();
      
      if (!swRegistration) {
        console.log('Service Worker 등록에 실패하여 알림을 설정할 수 없습니다.');
        return null;
      }
      
      // FCM 토큰 가져오기
      await getDeviceToken(swRegistration);
    } else {
      console.log('알림 권한이 거부되었습니다.');
    }
  } catch (error) {
    console.error('알림 설정 오류:', error);
  }
}

async function getDeviceToken(swRegistration) {
  try {
    const messaging = getMessaging();
    const vapidKey = "BHeh2yB3PHsevb5ZeipX3GRAtSSpWqrNBJirSCpoNzi-ardvvdpkgLpM0A2hsWtD79AjQyYmrVKqk_lomM7X1tI";
    
    const token = await getToken(messaging, { 
      vapidKey, 
      serviceWorkerRegistration: swRegistration 
    });
    
    if (token) {
      console.log('푸시 토큰:', token);
      localStorage.setItem('fcmToken', token);
      return token;
    } else {
      console.log('토큰을 가져올 수 없습니다.');
      return null;
    }
  } catch (err) {
    console.error('토큰 가져오기 오류:', err);
    return null;
  }
}