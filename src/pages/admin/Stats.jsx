import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import usersIcon from '../../assets/images/users.png';
import checkIcon from '../../assets/images/check.png';
import warningIcon from '../../assets/images/warning.png';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { getAdminSummary, getAdminUsage, getErrorLogs } from '../../api/admin';
import styles from './Stats.module.css';

const DONUT_COLORS = ['#fa8c73', '#f5c6bc'];

function Stats() {
  const { section } = useParams();

  /* ── 더미 데이터 (설계서 p.104/p.106/p.110 응답 스펙과 일치) ── */
  const [summary, setSummary] = useState({
    users: {
      total: 120,
      by_gender: { MALE: 55, FEMALE: 65 },
    },
    contracts: {
      analyzed_total: 42,
      // 설계서 스펙: 배열 형태
      by_contract_type: [
        { contract_type: '근로계약서', count: 10 },
        { contract_type: '비밀유지계약서', count: 3 },
        { contract_type: '부동산 임대차 계약서', count: 5 },
        { contract_type: '프리랜서 용역계약서', count: 7 },
        { contract_type: '저작권 양도 및 이용 허락 계약서', count: 2 },
      ],
    },
    // 설계서 스펙: detection_events_total 한 개만 존재
    toxic_detection: { detection_events_total: 8 },
    activity: {
      daily_analyses_last_7_days: [
        { date: '2026-03-24', count: 2 },
        { date: '2026-03-25', count: 0 },
        { date: '2026-04-01', count: 6 },
      ],
    },
    generated_at: '2026-04-01T12:00:00.000Z',
  });

  const [usage, setUsage] = useState({
    window: { days: 7, end_date: '2026-04-01' },
    // 설계서 스펙: uploads / analyses_completed / toxic_clauses_detected 필드
    daily: [
      { date: '2026-03-24', uploads: 5,  analyses_completed: 20, toxic_clauses_detected: 6 },
      { date: '2026-03-25', uploads: 10, analyses_completed: 75, toxic_clauses_detected: 15 },
      { date: '2026-04-01', uploads: 12, analyses_completed: 45, toxic_clauses_detected: 9 },
    ],
    totals_in_window: { uploads: 27, analyses_completed: 140, toxic_clauses_detected: 30 },
    pipeline_invocations_in_window: { ocr: 10, nlp_kobert: 3, llm_llama: 7 },
    generated_at: '2026-04-01T12:00:00.000Z',
  });

  const [logs, setLogs] = useState([
    '2026-03-23T14:11:30.112Z [INFO] 200 : 사용자(101) 로그인 성공',
    '2026-03-23T14:12:05.487Z [INFO] 201 : 사용자(101) 계약서 업로드 완료 (contract_id=45)',
    '2026-03-23T14:12:06.120Z [INFO] 202 : 사용자(101) 분석 요청 생성(analysis_request_id=67, status=queued)',
    '2026-03-23T14:12:08.904Z [INFO] 200 : analysis.stage.ocr 실행 시작 (analysis_request_id=67, contract_id=45)',
    '2026-03-23T14:12:12.330Z [INFO] 200 : analysis.stage.ocr 완료 (analysis_request_id=67, pages_json_len=2)',
    '2026-03-23T14:12:16.771Z [INFO] 200 : analysis.stage.nlp 실행 완료 (analysis_request_id=67, key_facts_cnt=8)',
    '2026-03-23T14:12:22.905Z [WARN] 409 : 분석 요청 중복 감지(이미 running) (analysis_request_id=67)',
  ]);

  const [selectedType, setSelectedType] = useState(null);

  /* ── API 연동 시 주석 해제 ──
  const [summary, setSummary] = useState(null);
  const [usage, setUsage] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [sumRes, useRes] = await Promise.all([
          getAdminSummary(),
          getAdminUsage(),
        ]);
        // 설계서: 모든 관리자 응답은 { success, ..., data: {...} } 래핑
        if (!cancelled) {
          setSummary(sumRes.data.data);
          setUsage(useRes.data.data);
        }

        try {
          const logRes = await getErrorLogs();
          if (!cancelled) setLogs(logRes.data.data?.lines || []);
        } catch {
          console.error('에러 로그 로딩 실패');
        }
      } catch {
        console.error('통계 데이터 로딩 실패');
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [section]);
  */

  // 성별 도넛 차트 데이터
  const genderData = summary ? [
    { name: '여성', value: summary.users?.by_gender?.FEMALE || 0 },
    { name: '남성', value: summary.users?.by_gender?.MALE || 0 },
  ] : [];

  // 계약서 유형별 막대 차트 데이터 (설계서 스펙: 배열 형태)
  const contractData = (summary?.contracts?.by_contract_type || []).map((row) => ({
    name: row.contract_type,
    건수: row.count,
  }));

  // 독소조항 탐지율 게이지
  // 설계서에는 attempt_total 필드가 없으므로 analyzed_total(분석된 계약서 수)을 분모로 사용
  const analyzedTotal = summary?.contracts?.analyzed_total || 0;
  const toxicDetected = summary?.toxic_detection?.detection_events_total || 0;
  const toxicRate = analyzedTotal > 0 ? Math.round((toxicDetected / analyzedTotal) * 100) : 0;

  // AI 사용량 - 날짜별 가로 막대 (설계서 스펙: analyses_completed 필드 사용)
  const dailyData = (usage?.daily || []).map((d) => ({
    date: d.date?.slice(5) || '',
    분석요청횟수: d.analyses_completed || 0,
  }));

  // AI 사용량 - 모델별 가로 막대
  const modelData = usage ? [
    { name: 'OCR',       호출횟수: usage.pipeline_invocations_in_window?.ocr || 0 },
    { name: 'KoBERT',    호출횟수: usage.pipeline_invocations_in_window?.nlp_kobert || 0 },
    { name: 'LLM Llama', 호출횟수: usage.pipeline_invocations_in_window?.llm_llama || 0 },
  ] : [];

  // 선택된 계약서 유형 정보 (contractData에서 직접 찾음)
  const selectedContractInfo = selectedType
    ? { type: selectedType, count: contractData.find((r) => r.name === selectedType)?.건수 ?? 0 }
    : null;

  const renderContent = () => {
    switch (section) {
      case 'ai':
        return <AiSection summary={summary} dailyData={dailyData} modelData={modelData} />;
      default:
        return (
          <MainStatsSection
            genderData={genderData}
            contractData={contractData}
            toxicRate={toxicRate}
            analyzedTotal={analyzedTotal}
            toxicDetected={toxicDetected}
            selectedContractInfo={selectedContractInfo}
            onBarClick={(data) => {
              if (data?.activeLabel) setSelectedType(data.activeLabel);
            }}
            genderSummary={summary?.users?.by_gender}
            logs={logs}
          />
        );
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.layout}>
        <Sidebar type="admin" />
        <main className={styles.main}>
          {section === 'ai' ? (
            <h2 className={styles.pageTitle}>AI 모델 사용량 추이</h2>
          ) : (
            <h2 className={styles.pageTitle}>통계 및 분석</h2>
          )}
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

/* 메인 통계 섹션 (계약서/독소조항/사용자/에러로그) */
function MainStatsSection({
  genderData, contractData, toxicRate, analyzedTotal, toxicDetected,
  selectedContractInfo, onBarClick, genderSummary, logs,
}) {
  return (
    <div className={styles.statsGrid}>
      {/* 사용자 성별 비율 */}
      <div className={styles.chartCard}>
        <p className={styles.chartTitle}>사용자 성별 비율</p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={genderData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={85}
              dataKey="value"
              label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
            >
              {genderData.map((_, i) => (
                <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        {genderSummary && (
          <div className={styles.chartCaption}>
            여성 : {genderSummary.FEMALE || 0}명, 남성 : {genderSummary.MALE || 0}명
          </div>
        )}
      </div>

      {/* 계약서 유형별 요청 건수 */}
      <div className={styles.chartCard}>
        <p className={styles.chartTitle}>계약서 유형 별 요청 건수</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={contractData} onClick={onBarClick}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="건수" fill="#7b8ee8" />
          </BarChart>
        </ResponsiveContainer>
        {selectedContractInfo && (
          <div className={styles.chartCaption}>
            {selectedContractInfo.count}명의 사용자가 {selectedContractInfo.type}을(를) 요청했어요
          </div>
        )}
      </div>

      {/* 총 독소조항 탐지 횟수 (분석된 계약서 중 비율) */}
      <div className={styles.chartCard}>
        <p className={styles.chartTitle}>총 독소조항 탐지 횟수</p>
        <div className={styles.gaugeWrap}>
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="60" fill="none" stroke="#e9ecef" strokeWidth="14" />
            <circle
              cx="80" cy="80" r="60"
              fill="none"
              stroke="#7b8ee8"
              strokeWidth="14"
              strokeDasharray={`${(toxicRate / 100) * 376} 376`}
              strokeLinecap="round"
              transform="rotate(-90 80 80)"
            />
          </svg>
        </div>
        <div className={styles.chartCaption}>
          분석 횟수 : {analyzedTotal}, 탐지 횟수 : {toxicDetected}
        </div>
      </div>

      {/* 에러 로그 조회 */}
      <div className={styles.chartCard}>
        <p className={styles.chartTitle}>에러 로그 조회</p>
        <div className={styles.logPreview}>
          {logs.length === 0 ? (
            <p className={styles.logText}>에러 로그가 없습니다.</p>
          ) : (
            logs.map((line, idx) => (
              <p key={idx} className={styles.logText}>{line}</p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* AI 모델 사용량 섹션 */
function AiSection({ summary, dailyData, modelData }) {
  return (
    <div className={styles.aiSection}>
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

      <div className={styles.cardRow}>
        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>최근 7일 분석 요청 현황</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="date" type="category" tick={{ fontSize: 11 }} width={50} />
              <Tooltip />
              <Bar dataKey="분석요청횟수" fill="#7b8ee8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.chartCard}>
          <p className={styles.chartTitle}>모델 별 호출 횟수</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={modelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={60} />
              <Tooltip />
              <Bar dataKey="호출횟수" fill="#7b8ee8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Stats;