import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { getMyInfo, updateMyInfo } from '../../api/auth';
import styles from './Mypage.module.css';

function Mypage() {
  const navigate = useNavigate();

  // 설계서 p.77 GET /api/users/me 응답 user 필드 기반
  // { id, name, gender, birthDate, email, emailVerified, createdAt, updatedAt }
  const [form, setForm] = useState({
    name: '',
    id: '',
    email: '',
    birthDate: '',
    gender: 'MALE',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 내 정보 조회: cancel 플래그로 race condition 방지
  useEffect(() => {
    let cancelled = false;

    const fetchMyInfo = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getMyInfo();
        // 설계서 p.77: top-level user (data 래핑 없음)
        const u = res.data.user;
        if (!cancelled && u) {
          setForm({
            name: u.name || '',
            id: u.id || '',
            email: u.email || '',
            birthDate: u.birthDate || '',
            gender: u.gender || 'MALE',
          });
        }
      } catch {
        if (!cancelled) setError('회원 정보를 불러오는데 실패했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMyInfo();
    return () => { cancelled = true; };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // PATCH /api/users/me — 설계서 p.101 스펙대로 name, gender 만 전송
  const handleUpdate = async () => {
    if (!form.name.trim()) {
      setError('이름을 입력해주세요.');
      setSuccess('');
      return;
    }
    try {
      await updateMyInfo({
        name: form.name,
        gender: form.gender,
      });
      setSuccess('회원 정보가 수정되었습니다.');
      setError('');
    } catch {
      setSuccess('');
      setError('회원 정보 수정에 실패했습니다.');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.layout}>
        <Sidebar type="user" />
        <main className={styles.main}>
          <div className={styles.card}>
            <div className={styles.tabBar}>
              <button className={`${styles.tab} ${styles.tabActive}`}>회원 정보 수정</button>
              <button className={styles.tab} onClick={() => navigate('/history')}>검사 기록</button>
            </div>
            <h2 className={styles.title}>회원 정보 수정</h2>

            {loading ? (
              <p className={styles.loading}>불러오는 중…</p>
            ) : (
              <>
                {/* 이름: 수정 가능 */}
                <div className={styles.fieldBox}>
                  <span className={styles.fieldLabel}>이름</span>
                  <input
                    className={styles.fieldInput}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="홍길동"
                  />
                </div>

                {/* 아이디: 읽기 전용 (설계서 PATCH 스펙에 없음) */}
                <div className={styles.fieldBox}>
                  <span className={styles.fieldLabel}>아이디</span>
                  <input
                    className={styles.fieldInput}
                    value={form.id}
                    readOnly
                    placeholder="아이디를 입력해주세요."
                  />
                </div>

                {/* 이메일: 읽기 전용 */}
                <div className={styles.fieldBox}>
                  <span className={styles.fieldLabel}>이메일</span>
                  <div className={styles.fieldRow}>
                    <input
                      className={styles.fieldInput}
                      value={form.email}
                      readOnly
                      placeholder="example@email.com"
                    />
                    <span className={styles.verifiedBadge}>인증완료</span>
                  </div>
                </div>

                {/* 비밀번호 변경: 설계서 PATCH 스펙에 없으므로
                    /api/auth/password-reset/... 재설정 플로우로 안내 */}
                <div className={styles.fieldBox}>
                  <span className={styles.fieldLabel}>비밀번호</span>
                  <button
                    className={styles.secondaryBtn}
                    onClick={() => navigate('/reset-password')}
                    type="button"
                  >
                    비밀번호 재설정하기
                  </button>
                </div>

                {/* 생년월일: 읽기 전용 (설계서 PATCH 스펙에 없음) */}
                <div className={styles.fieldBox}>
                  <span className={styles.fieldLabel}>생년월일</span>
                  <input
                    className={styles.fieldInput}
                    value={form.birthDate}
                    readOnly
                    placeholder="YYYY-MM-DD"
                  />
                </div>

                {/* 성별: 수정 가능 */}
                <div className={styles.fieldBox}>
                  <span className={styles.fieldLabel}>성별</span>
                  <div className={styles.genderRow}>
                    <button
                      className={`${styles.genderBtn} ${form.gender === 'FEMALE' ? styles.genderActive : ''}`}
                      onClick={() => setForm({ ...form, gender: 'FEMALE' })}
                      type="button"
                    >여성</button>
                    <button
                      className={`${styles.genderBtn} ${form.gender === 'MALE' ? styles.genderActive : ''}`}
                      onClick={() => setForm({ ...form, gender: 'MALE' })}
                      type="button"
                    >남성</button>
                  </div>
                </div>

                {error && <p className={styles.error}>{error}</p>}
                {success && <p className={styles.success}>{success}</p>}
                <button className={styles.submitBtn} onClick={handleUpdate}>수정하기</button>
              </>
            )}
          </div>
          <button className={styles.withdrawBtn} onClick={() => navigate('/withdraw')}>회원탈퇴</button>
        </main>
      </div>
    </div>
  );
}

export default Mypage;