import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { withdraw } from '../../api/auth';
import { logout } from '../../utils/auth';
import styles from './Withdraw.module.css';

function Withdraw() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleWithdraw = async () => {
  if (!email || !password) { setError('이메일과 비밀번호를 입력해주세요.'); return; }
  if (!window.confirm('정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
  try {
    await withdraw(password);   // ← password 전달
    logout();
    navigate('/login');
  } catch {
    setError('비밀번호가 올바르지 않거나 탈퇴에 실패했습니다.');
  }
};

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.layout}>
        <Sidebar type="user" />
        <main className={styles.main}>
          <div className={styles.card}>
            <h2 className={styles.title}>회원 탈퇴</h2>
            <p className={styles.desc}>탈퇴를 원하시면 하단에 이메일과 비밀번호를 입력해주세요.</p>
            <div className={styles.inputGroup}>
              <label className={styles.label}>이메일</label>
              <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="가입한 이메일을 입력해주세요." />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>비밀번호</label>
              <input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호를 입력해주세요." />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button className={styles.withdrawBtn} onClick={handleWithdraw}>탈퇴하기</button>
            <button className={styles.backBtn} onClick={() => navigate('/mypage')}>돌아가기</button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Withdraw;