import axios from 'axios';
import { getToken } from '../utils/auth';

const BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 요청마다 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 회원가입 - 이메일 인증 코드 발송
export const signupRequest = (email) => {
  return api.post('/api/auth/signup/request', { email });
};

// 회원가입 - 인증 코드 검증
export const signupVerify = (email, code) => {
  return api.post('/api/auth/signup/verify', { email, code });
};

// 회원가입 - 최종 회원가입 생성
export const signupConfirm = (data) => {
  return api.post('/api/auth/signup/confirm', data);
};

// 로그인
export const login = (id, password) => {
  return api.post('/api/auth/login', { id, password });
};

// 로그아웃
export const logoutApi = () => {
  return api.post('/api/auth/logout');
};

// 아이디 찾기
export const findId = (name, email) => {
  return api.post('/api/auth/find-id', { name, email });
};

// 비밀번호 재설정 - 메일 발송
export const resetPasswordRequest = (id, email) => {
  return api.post('/api/auth/password-reset/request', { id, email });
};

// 비밀번호 재설정 - 새 비밀번호 저장
export const resetPasswordConfirm = (token, newPassword) => {
  return api.post('/api/auth/password-reset/confirm', { token, new_password: newPassword });
};

// 내 정보 조회
export const getMyInfo = () => {
  return api.get('/api/users/me');
};

// 내 정보 수정
export const updateMyInfo = (data) => {
  return api.patch('/api/users/me', data);
};

// 회원 탈퇴
export const withdraw = (password) => {
  return api.delete('/api/users/me', { data: { password } });
};