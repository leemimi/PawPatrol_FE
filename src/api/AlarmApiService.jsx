// src/services/notificationService.js
import axios from 'axios';

// API 기본 URL
const API_BASE_URL = import.meta.env.VITE_CORE_API_BASE_URL || '';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});


// 알림 관련 함수들
const NotificationService = {
  // 알림 목록 조회
  getNotifications: async (page = 0, size = 20) => {
    try {
      const response = await api.get(`/api/v1/notifications?page=${page}&size=${size}`);
      console.log("data",response.data)
      return response.data;
    } catch (error) {
      console.error('알림을 불러오는 중 오류 발생:', error);
      throw error;
    }
  },

  // 알림 읽음 처리
  markAsRead: async (notificationId) => {
    try {
      await api.patch(`/api/v1/notifications/${notificationId}/read`);
      return true;
    } catch (error) {
      console.error('알림 읽음 처리 중 오류 발생:', error);
      throw error;
    }
  },
  
  // 알림 삭제 처리
  deleteNotification: async (notificationId) => {
    try {
      await api.delete(`/api/v1/notifications/${notificationId}`);
      return true;
    } catch (error) {
      console.error('알림 삭제 중 오류 발생:', error);
      throw error;
    }
  }
};

export default NotificationService;