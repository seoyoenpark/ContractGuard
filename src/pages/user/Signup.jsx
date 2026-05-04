import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupRequest, signupVerify, signupConfirm } from '../../api/auth';
import styles from './Signup.module.css';

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', id: '', email: '', code: '',
    password: '', passwordConfirm: '',
    birthDate: '', gender: 'MALE',
    job: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeFile, setAgreeFile] = useState(false);
  const [agreeLaw, setAgreeLaw] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationToken, setVerificationToken] = useState('');

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSendCode = async () => {
    if (!form.email) { setError('이메일을 입력해주세요.'); setSuccess(''); return; }
    try {
      await signupRequest(form.email);
      setCodeSent(true);
      setError('');
      setSuccess('인증 메일을 발송했습니다. 메일함을 확인해주세요.');
    } catch {
      setError('인증 코드 발송에 실패했습니다.');
      setSuccess('');
    }
  };

  const handleVerifyCode = async () => {
    if (!codeSent) { setError('먼저 인증코드를 받아주세요.'); setSuccess(''); return; }
    if (!form.code) { setError('인증 코드를 입력해주세요.'); setSuccess(''); return; }
    try {
      const res = await signupVerify(form.email, form.code);
      setVerificationToken(res.data.data.verification_token);
      setCodeVerified(true);
      setError('');
      setSuccess('이메일 인증이 완료되었습니다.');
    } catch {
      setError('인증 코드가 올바르지 않거나 만료되었습니다.');
      setSuccess('');
    }
  };

  const handleSignup = async () => {
    
    if (!form.name || !form.id || !form.email || !form.password || !form.birthDate) {
      setError('모든 필수 항목을 입력해주세요.');
      setSuccess('');
      return;
    }
    
    if (!codeVerified) {
      setError('이메일 인증을 완료해주세요.');
      setSuccess('');
      return;
    }
    
    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      setSuccess('');
      return;
    }
    
    if (!agreeTerms || !agreePrivacy || !agreeFile || !agreeLaw) {
      setError('필수 약관에 모두 동의해주세요.');
      setSuccess('');
      return;
    }

    try {
      const iso =
        form.birthDate.length === 8
          ? `${form.birthDate.slice(0, 4)}-${form.birthDate.slice(4, 6)}-${form.birthDate.slice(6, 8)}`
          : form.birthDate;

      await signupConfirm({
        data: {
          email: form.email,
          verification_token: verificationToken,
          name: form.name,
          id: form.id,
          password: form.password,
          gender: form.gender,
          birthDate: iso,
          job: form.job || '',
        },
      });
      navigate('/login');
    } catch {
      setError('회원가입에 실패했습니다.');
      setSuccess('');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.logo} onClick={() => navigate('/')}>Contract Guard</h1>
      <div className={styles.card}>
        <div className={styles.scrollArea}>
          {error && <div className={styles.toast}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <div className={styles.fieldBox}>
            <span className={styles.fieldLabel}>이름</span>
            <input className={styles.fieldInput} name="name" value={form.name} onChange={handleChange} placeholder="홍길동" />
          </div>

          <div className={styles.fieldBox}>
            <span className={styles.fieldLabel}>아이디</span>
            <input className={styles.fieldInput} name="id" value={form.id} onChange={handleChange} placeholder="아이디를 입력해주세요." />
          </div>

          <div className={styles.fieldBox}>
            <span className={styles.fieldLabel}>이메일</span>
            <div className={styles.fieldRow}>
              <input className={styles.fieldInput} name="email" value={form.email} onChange={handleChange} placeholder="example@email.com" />
              <button className={styles.codeBtn} onClick={handleSendCode} type="button">인증코드 받기</button>
            </div>
          </div>

          <div className={styles.fieldBox}>
            <span className={styles.fieldLabel}>이메일 인증 코드를 입력해주세요.</span>
            <div className={styles.fieldRow}>
              <input className={styles.fieldInput} name="code" value={form.code} onChange={handleChange} />
              <button className={styles.codeBtn} onClick={handleVerifyCode} type="button">인증하기</button>
            </div>
          </div>

          <div className={styles.fieldBox}>
            <span className={styles.fieldLabel}>비밀번호</span>
            <input className={styles.fieldInput} type="password" name="password" value={form.password} onChange={handleChange} placeholder="최소 4자 이상 입력해주세요." />
          </div>

          <div className={styles.fieldBox}>
            <span className={styles.fieldLabel}>비밀번호 확인</span>
            <input className={styles.fieldInput} type="password" name="passwordConfirm" value={form.passwordConfirm} onChange={handleChange} placeholder="비밀번호를 다시 입력해주세요." />
          </div>

          <div className={styles.fieldBox}>
            <span className={styles.fieldLabel}>생년월일</span>
            <input className={styles.fieldInput} name="birthDate" value={form.birthDate} onChange={handleChange} placeholder="YYYYMMDD" />
          </div>

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

          <div className={styles.fieldBox}>
            <span className={styles.fieldLabel}>직업</span>
            <input className={styles.fieldInput} name="job" value={form.job} onChange={handleChange} placeholder="예: 학생, 회사원" />
          </div>

          <hr className={styles.hr} />

          <div className={styles.agreeBlock}>
            <div className={styles.agreeItem}>
              <input type="checkbox" id="terms" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
              <label htmlFor="terms">[필수] 서비스 이용약관 동의</label>
            </div>
            <p className={styles.agreeDesc}>
              Contract Guard 서비스 이용약관에 동의합니다. 본 약관은 서비스 이용 조건 및 권리·의무 관계를 규정합니다.
            </p>
          </div>

          <div className={styles.agreeBlock}>
            <div className={styles.agreeItem}>
              <input type="checkbox" id="file" checked={agreeFile} onChange={(e) => setAgreeFile(e.target.checked)} />
              <label htmlFor="file">[필수] 계약서 파일 처리 동의</label>
            </div>
            <p className={styles.agreeDesc}>
              서비스 분석 기능 제공을 위해 업로드한 계약서 파일을 아래와 같이 처리합니다.
            </p>
            <ul className={styles.agreeList}>
              <li>수집 항목: 업로드한 계약서 파일 내 포함된 텍스트 및 개인정보</li>
              <li>수집 목적: AI 기반 독소조항 분석 및 결과 제공</li>
              <li>보유 기간: 분석 완료 후 즉시 파일 삭제, 분석 결과 이력은 회원 탈퇴 시까지 보관</li>
            </ul>
            <p className={styles.agreeDesc}>동의를 거부할 권리가 있으나, 거부 시 계약서 분석 서비스 이용이 불가합니다.</p>
          </div>

          <div className={styles.agreeBlock}>
            <div className={styles.agreeItem}>
              <input type="checkbox" id="privacy" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} />
              <label htmlFor="privacy">[필수] 개인정보 수집·이용 동의</label>
            </div>
            <p className={styles.agreeDesc}>
              서비스 제공을 위해 아래와 같이 개인정보를 수집·이용합니다.
            </p>
            <ul className={styles.agreeList}>
              <li>수집 항목: 이메일 주소, 비밀번호, 닉네임</li>
              <li>수집 목적: 회원 식별, 서비스 제공, 고객 문의 응대</li>
              <li>보유 기간: 회원 탈퇴 시까지 (단, 관계 법령에 따라 일정 기간 보관될 수 있습니다)</li>
            </ul>
            <p className={styles.agreeDesc}>동의를 거부할 권리가 있으나, 거부 시 서비스 이용이 불가합니다.</p>
          </div>

          <div className={styles.agreeBlock}>
            <div className={styles.agreeItem}>
              <input type="checkbox" id="law" checked={agreeLaw} onChange={(e) => setAgreeLaw(e.target.checked)} />
              <label htmlFor="law">[필수] AI 분석 결과 법적 면책 동의</label>
            </div>
            <p className={styles.agreeDesc}>
              본 서비스는 AI 기술을 활용한 계약서 분석 보조 도구이며, 법률 자문 서비스가 아닙니다. 아래 사항에 동의 후 이용 가능합니다.
            </p>
            <ul className={styles.agreeList}>
              <li>분석 결과는 참고용이며, 법적 효력이나 정확성을 보장하지 않습니다.</li>
              <li>분석 결과를 근거로 한 계약 체결·해지 등의 의사결정에 대해 Contract Guard는 법적 책임을 지지 않습니다.</li>
              <li>정확한 법률 검토가 필요한 경우 변호사 등 법률 전문가와 상담하시기 바랍니다.</li>
            </ul>
            <p className={styles.agreeDesc}>동의를 거부할 권리가 있으나, 거부 시 계약서 분석 서비스 이용이 불가합니다.</p>
          </div>

          <button className={styles.submitBtn} onClick={handleSignup} type="button">회원가입</button>
          <div className={styles.links}>
            <span>이미 계정이 있으신가요?</span>
            <button onClick={() => navigate('/login')} type="button">로그인</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;