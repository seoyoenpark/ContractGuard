import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { getContractList, deleteContract } from '../../api/contract.mock';
import { formatDate } from '../../utils/format';
import styles from './InspectionHistory.module.css';

function InspectionHistory() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchList = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getContractList();
        if (!cancelled) setList(res.data.contracts || []);
      } catch {
        // 네트워크 오류 시 기존 리스트는 유지하고 에러만 표시
        if (!cancelled) setError('기록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchList();
    return () => { cancelled = true; };
  }, []);

  const handleDelete = async (contractId, e) => {
    e.stopPropagation();
    if (!window.confirm('검사 기록을 삭제하시겠습니까?')) return;
    try {
      const res = await deleteContract(contractId);
      const deletedId = res.data?.data?.contract_id ?? contractId;
      setList((prev) => prev.filter((c) => c.contract_id !== deletedId));
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  const statusMeta = (status) => {
    switch (status) {
      case 'succeeded':  return { label: '완료',    className: styles.statusDone };
      case 'failed':     return { label: '분석실패', className: styles.statusFailed };
      case 'processing':
      case 'queued':     return { label: '분석중',  className: styles.statusRunning };
      default:           return null;
    }
  };

  const renderListBody = () => {
    if (loading) return <p className={styles.empty}>불러오는 중…</p>;
    if (list.length === 0) return <p className={styles.empty}>검사 기록이 없습니다.</p>;

    return list.map((item, idx) => {
      const sm = statusMeta(item.status);
      return (
        <div
          key={item.contract_id}
          className={styles.item}
          onClick={() => navigate(`/history/${item.contract_id}`)}
          role="button"
          tabIndex={0}
        >
          <div className={styles.itemLeft}>
            <span className={styles.itemNum}>{idx + 1}</span>
            <div>
              <p className={styles.itemTitle}>
                {item.title}
                {sm && (
                  <span className={`${styles.statusBadge} ${sm.className}`}>
                    {sm.label}
                  </span>
                )}
              </p>
              <p className={styles.itemDate}>{formatDate(item.created_at)}</p>
            </div>
          </div>
          <button
            className={styles.deleteBtn}
            onClick={(e) => handleDelete(item.contract_id, e)}
          >
            삭제
          </button>
        </div>
      );
    });
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.layout}>
        <Sidebar type="user" />
        <main className={styles.main}>
          <div className={styles.card}>
            <div className={styles.tabBar}>
              <button className={styles.tab} onClick={() => navigate('/mypage')}>회원 정보 수정</button>
              <button className={`${styles.tab} ${styles.tabActive}`}>검사 기록</button>
            </div>
            <h2 className={styles.title}>검사 기록</h2>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.list}>
              {renderListBody()}
            </div>
          </div>
          <button className={styles.withdrawBtn} onClick={() => navigate('/withdraw')}>회원탈퇴</button>
        </main>
      </div>
    </div>
  );
}

export default InspectionHistory;