import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { uploadContract, analyzeContract, getAnalyzeStatus, getContractResult } from '../../api/contract.mock';
import styles from './ContractInspect.module.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

/**
 * 내부 전용 PdfViewer 컴포넌트
 * - file: PDF 소스
 * - activeHighlight: { page_number, bbox_norm:{x,y,w,h} } - 포커싱할 하이라이트
 */
function PdfViewer({ file, activeHighlight }) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState(600);
  const containerRef = useRef(null);

  // 활성 하이라이트가 바뀌면 해당 페이지로 이동
  useEffect(() => {
    if (activeHighlight?.page_number) {
      setPageNumber(activeHighlight.page_number);
    }
  }, [activeHighlight]);

  // 컨테이너 폭에 맞춰 PDF 페이지 너비를 리사이즈
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(([entry]) => {
      setContainerWidth(Math.max(320, Math.floor(entry.contentRect.width)));
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  if (!file) {
    return <div className={styles.pdfPlaceholder}>PDF 뷰어</div>;
  }

  const renderBbox = () => {
    if (!activeHighlight || activeHighlight.page_number !== pageNumber) return null;
    const bb = activeHighlight.bbox_norm;
    if (!bb) return null;
    return (
      <div
        className={styles.bbox}
        style={{
          left:   `${bb.x * 100}%`,
          top:    `${bb.y * 100}%`,
          width:  `${bb.w * 100}%`,
          height: `${bb.h * 100}%`,
        }}
      />
    );
  };

  const goPrev = () => setPageNumber((p) => Math.max(1, p - 1));
  const goNext = () => setPageNumber((p) => Math.min(numPages, p + 1));

  return (
    <div className={styles.pdfViewer} ref={containerRef}>
      <div className={styles.pageScroll}>
        <Document
          file={file}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          loading={<div className={styles.pdfPlaceholder}>PDF 불러오는 중...</div>}
          error={<div className={styles.pdfPlaceholder}>PDF를 불러올 수 없습니다.</div>}
        >
          <div className={styles.pageWrap}>
            <Page
              pageNumber={pageNumber}
              width={containerWidth - 24}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
            {renderBbox()}
          </div>
        </Document>
      </div>
      <div className={styles.pagination}>
        <button type="button" onClick={goPrev} disabled={pageNumber <= 1}>이전</button>
        <span>{pageNumber} / {numPages || '-'}</span>
        <button type="button" onClick={goNext} disabled={pageNumber >= numPages}>다음</button>
      </div>
    </div>
  );
}

function ContractInspect() {
  const [step, setStep] = useState('before'); // before | loading | result
  const [file, setFile] = useState(null);
  const [contractId, setContractId] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('simple');
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [activeHighlight, setActiveHighlight] = useState(null);
  const fileInputRef = useRef();
  const pollingRef = useRef();

  // 업로드된 파일로 blob URL 생성 / 해제
  useEffect(() => {
    if (!file) { setPdfUrl(null); return; }
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) { setError('계약서 파일을 업로드해주세요.'); return; }
    try {
      setError('');
      setStep('loading');
      const formData = new FormData();
      formData.append('file', file);

      // 설계서 응답 구조: { success, message, result_code, data: { contract_id, ... } }
      const uploadRes = await uploadContract(formData);
      const id = uploadRes.data?.data?.contract_id;
      if (!id) throw new Error('업로드 응답에 contract_id가 없습니다.');
      setContractId(id);

      await analyzeContract(id);
      startPolling(id);
    } catch (err) {
      const apiError = err?.response?.data?.error;
      if (apiError?.code === 'INVALID_FILE') {
        setError('업로드할 파일이 없거나 형식이 올바르지 않습니다.');
      } else {
        setError('분석 요청에 실패했습니다.');
      }
      setStep('before');
    }
  };

  const startPolling = (id) => {
    pollingRef.current = setInterval(async () => {
      try {
        const statusRes = await getAnalyzeStatus(id);
        const status = statusRes.data?.analyze_status?.overall_status;

        if (status === 'succeeded') {
          clearInterval(pollingRef.current);
          const resultRes = await getContractResult(id);
          setResult(resultRes.data);
          setStep('result');
        } else if (status === 'failed') {
          clearInterval(pollingRef.current);
          setError('분석에 실패했습니다.');
          setStep('before');
        }
      } catch {
        clearInterval(pollingRef.current);
        setError('분석 상태 확인에 실패했습니다.');
        setStep('before');
      }
    }, 3000);
  };

  useEffect(() => {
    return () => clearInterval(pollingRef.current);
  }, []);

  const severityMeta = (sev) => {
    switch (sev) {
      case 'high':   return { label: '위험', className: styles.badgeDanger };
      case 'medium': return { label: '주의', className: styles.badgeWarning };
      case 'low':    return { label: '참고', className: styles.badgeInfo };
      default:       return { label: '주의', className: styles.badgeWarning };
    }
  };

  const focusHighlight = (hl) => {
    if (hl?.page_number) setActiveHighlight({ ...hl, _ts: Date.now() });
  };

  const guideData = [
    { num: 1, title: '계약서 업로드', desc: '검토가 필요한 계약서를 PDF 또는 이미지로 올려주세요. 고용계약서, 임대차계약서 등 다양한 유형을 지원합니다.' },
    { num: 2, title: '계약서 검사', desc: 'AI가 조항 단위로 표준계약서와 비교해 불리하거나 불공정한 조항을 자동으로 탐지합니다.' },
    { num: 3, title: '결과 확인', desc: '독소조항은 자동으로 하이라이팅되고, 어려운 법률 용어는 일상어로 풀어서 설명해드립니다. 어디가 왜 문제인지 바로 이해할 수 있어요.' },
    { num: 4, title: '협상 메일 작성', desc: '위험 조항이 발견되면 수정 요청을 위한 협상 메일 초안을 AI가 자동으로 생성해드립니다. 그대로 복사해서 상대방에게 보내거나, 상황에 맞게 수정해 사용하세요.' },
  ];

  const tabs = [
    { key: 'simple',      label: '쉬운 설명' },
    { key: 'summary',     label: '조항 요약' },
    { key: 'negotiation', label: '협상 가이드' },
    { key: 'mail',        label: '메일 초안' },
  ];

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.layout}>
        <Sidebar type="user" />
        <main className={styles.main}>
          {(step === 'before' || step === 'loading') && (
            <div className={styles.beforeLayout}>
              <div className={styles.guideSection}>
                <div className={styles.guideCards}>
                  {guideData.map((g) => (
                    <div key={g.num} className={styles.guideCard}>
                      <div className={styles.guideNum}>{g.num}</div>
                      <p className={styles.guideTitle}>{g.title}</p>
                      <p className={styles.guideDesc}>{g.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.uploadSection}>
                <div className={styles.uploadArea}>
                  <h2 className={styles.uploadTitle}>계약서 검사하기</h2>
                  {step === 'before' ? (
                    <div
                      className={styles.dropZone}
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => fileInputRef.current.click()}
                    >
                      <span className={styles.uploadIcon}>↑</span>
                      <p className={styles.dropText}>
                        {file ? file.name : '계약서 PDF를 드래그하거나 클릭하여 업로드'}
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                    </div>
                  ) : (
                    <div className={styles.loadingCard}>
                      <p className={styles.loadingText}>검사 중...</p>
                    </div>
                  )}
                  {error && <p className={styles.error}>{error}</p>}
                  <button
                    className={styles.analyzeBtn}
                    onClick={handleAnalyze}
                    disabled={step === 'loading'}
                  >
                    검사하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'result' && result && (
            <div className={styles.resultLayout}>
              <h2 className={styles.resultTitle}>계약서 검사 결과</h2>

              <div className={styles.resultContent}>
                <div className={styles.pdfViewerWrapper}>
                  <PdfViewer file={pdfUrl} activeHighlight={activeHighlight} />
                </div>

                <div className={styles.resultPanel}>
                  <div className={styles.tabBar}>
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <div className={styles.tabContent}>
                    {activeTab === 'simple' && (
                      <div className={styles.simpleList}>
                        {result.term_explanations?.map((item) => (
                          <div
                            key={item.term}
                            className={styles.termCard}
                            role="button"
                            tabIndex={0}
                            onClick={() => focusHighlight(item.highlights?.[0])}
                          >
                            <p className={styles.termTitle}>{item.term}</p>
                            <p className={styles.termDesc}>{item.simple_definition}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'summary' && (
                      <div className={styles.summaryList}>
                        {result.clause_summaries?.map((cs) => (
                          <div
                            key={cs.clause_id}
                            className={styles.summaryCard}
                            role="button"
                            tabIndex={0}
                            onClick={() => focusHighlight(cs.highlights?.[0])}
                          >
                            <p className={styles.summaryTopic}>{cs.topic}</p>
                            <p className={styles.summaryText}>{cs.short_summary}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'negotiation' && (
                      <div className={styles.clauseList}>
                        {result.toxic_assessment?.flagged_clauses?.map((clause) => {
                          const meta = severityMeta(clause.severity);
                          return (
                            <div
                              key={clause.clause_id}
                              className={styles.clauseCard}
                              role="button"
                              tabIndex={0}
                              onClick={() => focusHighlight(clause.highlights?.[0])}
                            >
                              <div className={styles.clauseHeader}>
                                <span className={`${styles.badge} ${meta.className}`}>
                                  {meta.label}
                                </span>
                                <span className={styles.clauseTopic}>{clause.topics?.join(' · ')}</span>
                              </div>
                              <div className={styles.quoteBox}>{clause.quote_excerpt}</div>
                              <div className={styles.reasonRow}>
                                <span className={styles.reasonLabel}>왜 문제인가요?</span>
                                <span className={styles.reasonText}>{clause.reason_generalized}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {activeTab === 'mail' && (
                      <div className={styles.mailCard}>
                        <div className={styles.mailHeader}>
                          <p><span className={styles.mailLabel}>받는 이</span> 담당자 귀중</p>
                          <p><span className={styles.mailLabel}>제목</span> 계약서 일부 조항 수정 요청의 건</p>
                        </div>
                        <div className={styles.mailBody}>
                          <p>안녕하세요.</p>
                          <p>검토해 주신 계약서와 관련하여, 아래 조항에 대해 수정을 요청드립니다.</p>
                          {result.toxic_assessment?.flagged_clauses?.map((clause, idx) => (
                            <p key={clause.clause_id}>
                              {idx + 1}. {clause.topics?.join(', ')} 조항<br />
                              {clause.reason_generalized}
                            </p>
                          ))}
                          <p>수정이 어려우신 경우 협의를 요청드립니다.<br />감사합니다.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ContractInspect;