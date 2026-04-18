// 토큰 저장
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// 토큰 불러오기
export const getToken = () => {
  return localStorage.getItem('token');
};

// 토큰 삭제
export const removeToken = () => {
  localStorage.removeItem('token');
};

// 권한 저장
export const setRole = (role) => {
  localStorage.setItem('role', role);
};

// 권한 불러오기
export const getRole = () => {
  return localStorage.getItem('role');
};

// 권한 삭제
export const removeRole = () => {
  localStorage.removeItem('role');
};

// 로그인 여부 확인
export const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};

// 관리자 여부 확인
export const isAdmin = () => {
  return localStorage.getItem('role') === 'ADMIN';
};

// 로그아웃 (토큰 + 권한 동시 삭제)
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
};