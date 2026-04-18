// 날짜 포맷 (2026-03-02T11:58:10.000Z → 2026-03-02)
export const formatDate = (isoString) => {
  if (!isoString) return '-';
  return isoString.slice(0, 10);
};

// 날짜 + 시간 포맷 (2026-03-02T12:00:00.000Z → 2026-03-02 12:00:00)
export const formatDateTime = (isoString) => {
  if (!isoString) return '-';
  return isoString.slice(0, 19).replace('T', ' ');
};

// 생년월일 포맷 (20000101 → 2000-01-01)
export const formatBirthDate = (birthDate) => {
  if (!birthDate || birthDate.length !== 8) return birthDate;
  return `${birthDate.slice(0, 4)}-${birthDate.slice(4, 6)}-${birthDate.slice(6, 8)}`;
};

// 위험도 한글 변환 (medium → 중간)
export const formatSeverity = (severity) => {
  const map = {
    low: '낮음',
    medium: '중간',
    high: '높음',
  };
  return map[severity] || severity;
};

// 권한 한글 변환 (ADMIN → 관리자)
export const formatRole = (role) => {
  return role === 'ADMIN' ? '관리자' : '사용자';
};

// 분석 상태 한글 변환 (succeeded → 완료)
export const formatStatus = (status) => {
  const map = {
    succeeded: '완료',
    failed: '실패',
    pending: '대기 중',
    processing: '분석 중',
  };
  return map[status] || status;
};