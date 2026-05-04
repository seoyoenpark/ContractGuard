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

// JWT 토큰에서 사용자 ID 추출
export const getUserIdFromToken = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    // Base64URL → Base64 변환 후 UTF-8 안전하게 디코드
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(json);
    // payload 필드명에 맞춰 수정 (1단계에서 확인한 키)
    return decoded.sub ?? decoded.loginId ?? decoded.id ?? null;
  } catch {
    return null;
  }
};