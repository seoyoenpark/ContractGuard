import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { findId } from '../../api/auth';
import styles from './FindId.module.css';

function FindId() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleFindId = async () => {
    if (!name || !email) { setError('이름과 이메일을 입력해주세요.'); return; }
    try {
      const res = await findId(name, email);
      setResult(res.data.data.masked_id);
      setError('');
    } catch {
      setError('입력하신 정보와 일치하는 회원이 없습니다.');
      setResult('');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.logo} onClick={() => navigate('/')}>Contract Guard</h1>
      <div className={styles.card}>
        <p className={styles.desc}>아이디를 찾기 원하시면 하단에 이름과 이메일을 입력해주세요.</p>
        <div className={styles.inputGroup}>
          <label className={styles.label}>이름</label>
          <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>이메일</label>
          <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" />
        </div>
        <button className={styles.submitBtn} onClick={handleFindId}>아이디 찾기</button>
        {result && (
          <div className={styles.resultBox}>
            <p>회원 정보가 확인되었습니다.</p>
            <p>{name}님의 아이디는 <span className={styles.resultId}>{result}</span>입니다.</p>
          </div>
        )}
        {error && <p className={styles.error}>{error}</p>}
        <button className={styles.linkBtn} onClick={() => navigate('/login')}>로그인하러 가기</button>
      </div>
    </div>
  );
}

export default FindId;