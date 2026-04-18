import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { getContractDetail } from '../../api/contract.mock';
import { formatDate } from '../../utils/format';
import styles from './InspectionDetail.module.css';

function InspectionDetail() {
  const navigate = useNavigate();
  const { contractId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // fetchDetail을 effect 안으로 인라인 + cancel 플래그로 race condition 방지
  useEffect(() => {
    let cancelled = false;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError('');
        setData(null);
        const res = await getContractDetail(contractId);
        if (!cancelled) setData(res.data.contract_summary);
      } catch {
        if (!cancelled) setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDetail();
    return () => { cancelled = true; };
  }, [contractId]);

  const toxicTopics = data?.toxic_assessment?.topics || [];

  // 설계서 toxic_assessment.severity (high / medium / low) 메타
  const severityMeta = (sev) => {
    switch (sev) {
      case 'high':   return { label: '위험', bannerClass: styles.bannerDanger };
      case 'medium': return { label: '주의', bannerClass: styles.bannerWarning ?? styles.bannerDanger };
      case 'low':    return { label: '참고', bannerClass: styles.bannerInfo ?? styles.bannerDanger };
      default:       return { label: '주의', bannerClass: styles.bannerDanger };
    }
  };

  const renderBody = () => {
    if (loading) return <p className={styles.loading}>불러오는 중…</p>;
    if (error)   return <p className={styles.error}>{error}</p>;
    if (!data)   return null;

    const analysisStatus = data.analysis_request?.analysis_status;
    const isFailed = analysisStatus === 'failed';
    const sev = data.toxic_assessment?.severity;
    const sevInfo = severityMeta(sev);

    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>계약서 검사 기록 상세 조회</span>
          <button className={styles.backBtn} onClick={() => navigate('/history')}>←</button>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>계약서 유형</span>
            <span className={styles.infoValue}>{data.contract_type}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>분석 요청일</span>
            <span className={styles.infoValue}>{formatDate(data.analysis_request?.requested_at)}</span>
          </div>
          {data.analysis_request?.completed_at && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>분석 완료일</span>
              <span className={styles.infoValue}>{formatDate(data.analysis_request.completed_at)}</span>
            </div>
          )}
        </div>

        {/* 분석 실패 케이스 우선 처리 */}
        {isFailed ? (
          <div className={styles.bannerWarn ?? styles.bannerDanger}>
            <p className={styles.bannerTitle}>이 계약서는 분석에 실패했어요</p>
            <p className={styles.bannerSub}>계약서 검사 페이지에서 다시 시도해주세요.</p>
          </div>
        ) : data.toxic_assessment?.detected ? (
          <div className={sevInfo.bannerClass}>
            <p className={styles.bannerTitle}>
              독소 조항이 발견되었어요 ({sevInfo.label})
            </p>
            <p className={styles.bannerSub}>발견된 조항 유형</p>
            <div className={styles.chips}>
              {toxicTopics.map((topic) => (
                <span key={topic} className={styles.chip}>{topic}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.bannerSafe}>
            <p className={styles.bannerTitle}>✅ 독소 조항이 발견되지 않았어요</p>
          </div>
        )}

        {!isFailed && (
          <>
            <p className={styles.sectionTitle}>조항별 요약</p>
            <div className={styles.clauseList}>
              {data.clause_summaries?.map((clause) => {
                // 백엔드가 clause 단위 toxic 플래그를 제공하지 않으므로
                // toxic_assessment.topics에 포함되는지로 근사 판단
                const isToxic = toxicTopics.includes(clause.topic);
                return (
                  <div
                    key={clause.clause_id}
                    className={`${styles.clauseItem} ${isToxic ? styles.clauseToxic : ''}`}
                  >
                    <div className={styles.clauseTop}>
                      <span className={`${styles.dot} ${isToxic ? styles.dotToxic : ''}`} />
                      <span className={`${styles.clauseTopic} ${isToxic ? styles.clauseTopicToxic : ''}`}>
                        {clause.topic}
                      </span>
                    </div>
                    <p className={styles.clauseSummary}>{clause.short_summary}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.layout}>
        <Sidebar type="user" />
        <main className={styles.main}>
          {renderBody()}
        </main>
      </div>
    </div>
  );
}

export default InspectionDetail;