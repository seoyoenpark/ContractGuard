import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { setToken, setRole } from '../../utils/auth';
import styles from './Login.module.css';

function Login() {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!id || !password) { setError('아이디와 비밀번호를 입력해주세요.'); return; }
  try {
    const res = await login(id, password);
    const { access_token, refresh_token } = res.data.data;
    setToken(access_token);
    localStorage.setItem('refresh_token', refresh_token);
    navigate('/');
  } catch {
    setError('아이디 또는 비밀번호가 올바르지 않습니다.');
  }
};

  return (
    <div className={styles.container}>
      <h1 className={styles.logo} onClick={() => navigate('/')}>
        Contract Guard
      </h1>
      <div className={styles.card}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>아이디</label>
          <input
            className={styles.input}
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="아이디를 입력해주세요."
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>비밀번호</label>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력해주세요."
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button className={styles.loginBtn} onClick={handleLogin}>로그인</button>
        <div className={styles.links}>
          <span>아직 계정이 없으신가요?</span>
          <button onClick={() => navigate('/signup')}>회원가입</button>
        </div>
        <div className={styles.links}>
          <button onClick={() => navigate('/reset-password')}>비밀번호 재설정</button>
          <button onClick={() => navigate('/find-id')}>아이디 찾기</button>
        </div>
      </div>
    </div>
  );
}

export default Login;