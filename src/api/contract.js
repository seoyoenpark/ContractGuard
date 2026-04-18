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

// 계약서 등록 및 PDF 업로드
export const uploadContract = (formData) => {
  return api.post('/api/contracts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// 계약서 분석 시작
export const analyzeContract = (contractId) => {
  return api.post(`/api/contracts/${contractId}/analyze`);
};

// 분석 진행 상태 조회 (폴링용)
export const getAnalyzeStatus = (contractId) => {
  return api.get(`/api/contracts/${contractId}/analyze-status`);
};

// 분석 결과 조회
export const getContractResult = (contractId) => {
  return api.get(`/api/contracts/${contractId}/result`);
};

// 계약서 목록 조회 (검사 기록)
export const getContractList = () => {
  return api.get('/api/contracts');
};

// 계약서 단건 요약 조회 (검사 기록 상세)
export const getContractDetail = (contractId) => {
  return api.get(`/api/contracts/${contractId}`);
};

// 계약서 기록 삭제
export const deleteContract = (contractId) => {
  return api.delete(`/api/contracts/${contractId}`);
};