import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { getAdminSummary } from '../../api/admin';
import usersIcon from '../../assets/images/users.png';
import checkIcon from '../../assets/images/check.png';
import warningIcon from '../../assets/images/warning.png';
import styles from './AdminHome.module.css';

function AdminHome() {
  const navigate = useNavigate();

  /* ── 더미 데이터 (설계서 p.104 /api/admin/status/summary 응답 스펙과 일치) ── */
  const [summary, setSummary] = useState({
    users: {
      total: 120,
      by_gender: { MALE: 55, FEMALE: 65 },
    },
    contracts: {
      analyzed_total: 42,
      // 설계서 스펙: 배열 형태 [{ contract_type, count }]
      by_contract_type: [
        { contract_type: '근로계약서', count: 10 },
        { contract_type: '비밀유지계약서', count: 3 },
        { contract_type: '부동산 임대차 계약서', count: 5 },
        { contract_type: '프리랜서 용역계약서', count: 7 },
        { contract_type: '저작권 양도 및 이용 허락 계약서', count: 2 },
      ],
    },
    toxic_detection: {
      detection_events_total: 18,
    },
    // 설계서 스펙: summary 응답 안에 activity.daily_analyses_last_7_days가 들어있음
    activity: {
      daily_analyses_last_7_days: [
        { date: '2026-03-24', count: 2 },
        { date: '2026-03-25', count: 0 },
        { date: '2026-03-26', count: 4 },
        { date: '2026-03-27', count: 1 },
        { date: '2026-03-28', count: 3 },
        { date: '2026-03-29', count: 5 },
        { date: '2026-04-01', count: 6 },
      ],
    },
    generated_at: '2026-04-01T12:00:00.000Z',
  });

  /* ── API 연동 시 주석 해제 ──
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const res = await getAdminSummary();
        // 설계서: axios 응답(res.data)의 data 키에 실 payload가 들어있음
        if (!cancelled) setSummary(res.data.data);
      } catch {
        console.error('데이터 로딩 실패');
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);
  */

  // 설계서 스펙: by_contract_type 은 배열
  const contractTypes = summary?.contracts?.by_contract_type || [];
  // 설계서 스펙: activity.daily_analyses_last_7_days 에서 꺼냄
  const dailyList = summary?.activity?.daily_analyses_last_7_days || [];
  const maxCount = Math.max(...dailyList.map((d) => d.count), 1);

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.layout}>
        <Sidebar type="admin" />
        <main className={styles.main}>
          <h2 className={styles.pageTitle}>대시보드</h2>

          {/* 요약 카드 3개 */}
          <div className={styles.cardRow}>
            <div className={styles.summaryCard}>
              <div className={styles.cardTop}>
                <span className={styles.cardLabel}>전체 회원</span>
                <img src={usersIcon} alt="회원" className={styles.cardIconImg} />
              </div>
              <p className={styles.cardNum}>{summary?.users?.total ?? '-'}명</p>
              <p className={styles.cardSub}>
                남성 {summary?.users?.by_gender?.MALE ?? 0} / 여성 {summary?.users?.by_gender?.FEMALE ?? 0}
              </p>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.cardTop}>
                <span className={styles.cardLabel}>총 분석</span>
                <img src={checkIcon} alt="분석" className={styles.cardIconImg} />
              </div>
              <p className={styles.cardNum}>{summary?.contracts?.analyzed_total ?? '-'}건</p>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.cardTop}>
                <span className={styles.cardLabel}>독소 조항 탐지</span>
                <img src={warningIcon} alt="경고" className={styles.cardIconImgRound} />
              </div>
              <p className={styles.cardNum}>{summary?.toxic_detection?.detection_events_total ?? '-'}건</p>
            </div>
          </div>

          {/* 하단 2개 카드 */}
          <div className={styles.cardRowBottom}>
            <div className={styles.infoCard}>
              <p className={styles.infoTitle}>최근 7일 분석 요청 현황</p>
              <div className={styles.dailyList}>
                {dailyList.length === 0 ? (
                  <p className={styles.empty}>데이터가 없습니다.</p>
                ) : (
                  dailyList.map((item) => (
                    <div key={item.date} className={styles.dailyRow}>
                      <span className={styles.dailyDate}>{item.date}</span>
                      <div className={styles.barWrap}>
                        <div
                          className={styles.bar}
                          style={{ width: `${(item.count / maxCount) * 100}%` }}
                        />
                      </div>
                      <span className={styles.dailyCount}>{item.count}건</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className={styles.infoCard}>
              <p className={styles.infoTitle}>계약서 유형별 건수</p>
              <div className={styles.typeList}>
                {contractTypes.length === 0 ? (
                  <p className={styles.empty}>데이터가 없습니다.</p>
                ) : (
                  contractTypes.map((row) => (
                    <div key={row.contract_type} className={styles.typeRow}>
                      <span className={styles.typeLabel}>{row.contract_type}</span>
                      <span className={styles.typeCount}>{row.count}건</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminHome;