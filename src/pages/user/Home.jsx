import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import styles from './Home.module.css';

function Home() {
  const navigate = useNavigate();

  const features = [
    { num: 1, title: '독소 조항 자동 탐지', desc: '겸업금지, 일방적 해지권, 과도한 위약금 - AI가 독소조항을 자동으로 찾아냅니다.' },
    { num: 2, title: '어려운 용어, 쉬운 말 해설', desc: '계약서 속 법률 용어를 누구나 이해할 수 있는 말로 풀어드립니다.' },
    { num: 3, title: '수정 제안 문장+협상 가이드 제공', desc: '어디가 문제인지만 알려주는 게 아니라, 어떻게 고쳐달라고 말해야 하는지도 제공합니다.' },
    { num: 4, title: '협상용 메일 초안까지 자동 생성', desc: '상대방에게 수정을 요청하는 메일, 어떻게 쓸지 고민하지 마세요. 분석 결과를 바탕으로 메일 초안까지 만들어드립니다.' },
  ];

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.layout}>
        <Sidebar type="user" />
        <main className={styles.main}>
          <div className={styles.content}>
            <div className={styles.card}>
              <p className={styles.cardTitle}>독소조항이 있을지 걱정되지 않으신가요? <br /> 계약서, 사인하기 전 딱 한 번만 확인해보세요.</p>
              <button className={styles.cardBtn} onClick={() => navigate('/contract')}>
                계약서 검사하기
              </button>
            </div>

            <div className={styles.card}>
              <p className={styles.cardDesc}>
                사회초년생·프리랜서가 가장 많이 마주치는 4대 계약서,<br />
                <span className={styles.highlight}>Contract Guard</span>가 독소조항을 자동으로 찾아드립니다.
                <br />
                계약서를 올려 문제점과 수정 요청 문구까지 바로 받아보세요.
              </p>
              <button className={styles.cardBtn} onClick={() => navigate('/signup')}>
                회원가입하기
              </button>
            </div>

            <div className={styles.featureGrid}>
              {features.map((item) => (
                <div key={item.num} className={styles.featureCard}>
                  <span className={styles.featureBadge}>{item.num}</span>
                  <p className={styles.featureTitle}>{item.title}</p>
                  <p className={styles.featureDesc}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;