import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPasswordRequest, resetPasswordConfirm } from '../../api/auth';
import styles from './ResetPassword.module.css';

function ResetPassword() {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [mailSent, setMailSent] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSendMail = async () => {
    if (!id || !email) { setError('아이디와 이메일을 입력해주세요.'); return; }
    try {
      await resetPasswordRequest(id, email);
      setMailSent(true);
      setError('');
    } catch {
      setError('입력하신 정보와 일치하는 회원이 없습니다.');
    }
  };

  const handleVerifyToken = () => {
    if (!token) { setError('인증 코드를 입력해주세요.'); return; }
    setError('');
  };

  const handleReset = async () => {
    if (!token) { setError('인증 코드를 입력해주세요.'); return; }
    if (!newPassword || !passwordConfirm) { setError('새 비밀번호를 입력해주세요.'); return; }
    if (newPassword !== passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return; }
    try {
      await resetPasswordConfirm(token, newPassword);
      setDone(true);
      setError('');
    } catch {
      setError('비밀번호 재설정에 실패했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.logo} onClick={() => navigate('/')}>Contract Guard</h1>
      <div className={styles.card}>
        <p className={styles.desc}>비밀번호를 재설정하고 싶으시면 하단에 아이디와 이메일을 입력해주세요.</p>
        <div className={styles.inputGroup}>
          <label className={styles.label}>아이디</label>
          <input className={styles.input} value={id} onChange={(e) => setId(e.target.value)} placeholder="아이디를 입력해주세요." disabled={mailSent} />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>이메일</label>
          <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" disabled={mailSent} />
        </div>
        <button className={styles.submitBtn} onClick={handleSendMail} disabled={mailSent}>
          재설정 메일 발송
        </button>
        {mailSent && (
          <>
            <div className={styles.inputGroup}>
              <label className={styles.label}>인증 코드를 입력해주세요.</label>
              <div className={styles.row}>
                <input className={styles.input} value={token} onChange={(e) => setToken(e.target.value)} />
                <button className={styles.codeBtn} onClick={handleVerifyToken}>확인</button>
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>새로운 비밀번호</label>
              <input className={styles.input} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>비밀번호 확인</label>
              <input className={styles.input} type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
            </div>
            <button className={styles.submitBtn} onClick={handleReset}>비밀번호 재설정</button>
          </>
        )}
        {done && (
          <div className={styles.resultBox}>
            <p>비밀번호가 변경되었습니다.</p>
            <p>다시 로그인해 주세요.</p>
          </div>
        )}
        {error && <p className={styles.error}>{error}</p>}
        {done && (
          <button className={styles.linkBtn} onClick={() => navigate('/login')}>로그인하러 가기</button>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;