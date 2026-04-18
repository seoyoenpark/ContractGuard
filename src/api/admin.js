import axios from 'axios';
import { getToken } from '../utils/auth';

const BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 핵심 지표 요약 조회
export const getAdminSummary = () => {
  return api.get('/api/admin/status/summary');
};

// AI 모델 사용량 추이 조회
export const getAdminUsage = () => {
  return api.get('/api/admin/status/usage');
};

// 전체 회원 목록 조회
export const getUserList = () => {
  return api.get('/api/admin/users');
};

// 특정 회원 상세 조회
export const getUserDetail = (userId) => {
  return api.get(`/api/admin/users/${userId}`);
};

// 회원 권한 변경
export const updateUserRole = (userId, role) => {
  return api.patch(`/api/admin/users/${userId}/role`, { role });
};

// 회원 강제 탈퇴
export const deleteUser = (userId) => {
  return api.delete(`/api/admin/users/${userId}`);
};

// 에러 로그 조회
export const getErrorLogs = () => {
  return api.get('/api/admin/contracts/errors');
};