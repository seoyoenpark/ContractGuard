// 실서버 연동 복귀 시 import 경로만 다시 '../../api/contract'로 바꾸기

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// 폴링 횟수(분석 진행률 시뮬레이션용)
let pollCount = 0;

// ────────────────────────────────────────────────────────────────
// 모듈 내부 저장소 - getContractList / getContractDetail / deleteContract
// 가 공통으로 사용. 삭제 시 여기서 실제로 제거되어 목록에서 사라짐
// ────────────────────────────────────────────────────────────────
const mockContracts = [
  // 1) 정규직 근로계약서 - high severity
  {
    contract_id: 'c001',
    title: '표준 근로계약서(정규직)',
    status: 'succeeded',
    created_at: '2026-03-25T14:30:00.000Z',
    contract_summary: {
      contract_id: 'c001',
      contract_type: '표준 근로계약서(정규직)',
      analysis_request: {
        analyze_request_id: 'req_c001',
        requested_at: '2026-03-25T14:30:00.000Z',
        completed_at: '2026-03-25T14:31:45.000Z',
        analysis_status: 'succeeded',
      },
      clause_summaries: [
        { clause_id: 'c001_1', topic: '임금', short_summary: '월급 구성·지급일·지급 방식이 정리되어 있음' },
        { clause_id: 'c001_2', topic: '근로시간', short_summary: '소정근로시간·휴게시간 관련 조항이 있음' },
        { clause_id: 'c001_3', topic: '해고', short_summary: '사유 통지 없이 즉시 해지 가능 조항이 포함됨' },
        { clause_id: 'c001_4', topic: '손해배상', short_summary: '간접 손해까지 배상하도록 규정되어 있음' },
      ],
      toxic_assessment: {
        detected: true,
        severity: 'high',
        topics: ['해고', '손해배상'],
      },
    },
  },

  // 2) 프리랜서 용역 계약서 - medium severity
  {
    contract_id: 'c002',
    title: '프리랜서 디자인 용역 계약서',
    status: 'succeeded',
    created_at: '2026-03-22T09:15:00.000Z',
    contract_summary: {
      contract_id: 'c002',
      contract_type: '프리랜서 디자인 용역 계약서',
      analysis_request: {
        analyze_request_id: 'req_c002',
        requested_at: '2026-03-22T09:15:00.000Z',
        completed_at: '2026-03-22T09:16:30.000Z',
        analysis_status: 'succeeded',
      },
      clause_summaries: [
        { clause_id: 'c002_1', topic: '업무 범위', short_summary: '로고 디자인, 배너 제작 등 업무 내용이 명시되어 있음' },
        { clause_id: 'c002_2', topic: '계약 기간', short_summary: '2026년 7월 1일부터 8월 31일까지 계약 기간이 설정됨' },
        { clause_id: 'c002_3', topic: '용역 대금', short_summary: '총 계약 금액 및 지급 방식이 명시되어 있음' },
        { clause_id: 'c002_4', topic: '경업금지', short_summary: '퇴사 후 3년간 동종업계 활동 금지 조항이 포함됨' },
      ],
      toxic_assessment: {
        detected: true,
        severity: 'medium',
        topics: ['업무 범위', '경업금지'],
      },
    },
  },

  // 3) NDA - low severity
  {
    contract_id: 'c003',
    title: '비밀유지계약서(NDA)',
    status: 'succeeded',
    created_at: '2026-03-18T16:45:00.000Z',
    contract_summary: {
      contract_id: 'c003',
      contract_type: '비밀유지계약서(NDA)',
      analysis_request: {
        analyze_request_id: 'req_c003',
        requested_at: '2026-03-18T16:45:00.000Z',
        completed_at: '2026-03-18T16:46:00.000Z',
        analysis_status: 'succeeded',
      },
      clause_summaries: [
        { clause_id: 'c003_1', topic: '비밀정보 정의', short_summary: '비밀정보의 범위가 폭넓게 정의되어 있음' },
        { clause_id: 'c003_2', topic: '비밀유지 기간', short_summary: '계약 종료 후 10년간 유지 의무' },
        { clause_id: 'c003_3', topic: '반환 의무', short_summary: '계약 종료 시 자료 반환 및 폐기 의무' },
      ],
      toxic_assessment: {
        detected: true,
        severity: 'low',
        topics: ['비밀유지 기간'],
      },
    },
  },

  // 4) 부동산 임대차 - 독소 조항 없음
  {
    contract_id: 'c004',
    title: '부동산 임대차 계약서',
    status: 'succeeded',
    created_at: '2026-03-10T11:20:00.000Z',
    contract_summary: {
      contract_id: 'c004',
      contract_type: '부동산 임대차 계약서',
      analysis_request: {
        analyze_request_id: 'req_c004',
        requested_at: '2026-03-10T11:20:00.000Z',
        completed_at: '2026-03-10T11:20:55.000Z',
        analysis_status: 'succeeded',
      },
      clause_summaries: [
        { clause_id: 'c004_1', topic: '보증금/월세', short_summary: '보증금·월세·지급일이 명확히 기재됨' },
        { clause_id: 'c004_2', topic: '계약 기간', short_summary: '2년 계약, 자동 갱신 조항 없음' },
        { clause_id: 'c004_3', topic: '수선 의무', short_summary: '임대인의 주요 수선 의무가 명시됨' },
      ],
      toxic_assessment: {
        detected: false,
        severity: 'low',
        topics: [],
      },
    },
  },

  // 5) 분석 실패 케이스 (상세 페이지의 failed 분기 테스트용)
  {
    contract_id: 'c005',
    title: '저작권 양도 및 이용허락 계약서',
    status: 'failed',
    created_at: '2026-03-05T08:00:00.000Z',
    contract_summary: {
      contract_id: 'c005',
      contract_type: '저작권 양도 및 이용허락 계약서',
      analysis_request: {
        analyze_request_id: 'req_c005',
        requested_at: '2026-03-05T08:00:00.000Z',
        completed_at: '2026-03-05T08:00:40.000Z',
        analysis_status: 'failed',
      },
      clause_summaries: [],
      toxic_assessment: { detected: false, severity: 'low', topics: [] },
    },
  },
];

// ────────────────────────────────────────────────────────────────
// POST /api/contracts  (업로드)
// ────────────────────────────────────────────────────────────────
export const uploadContract = async (formData) => {
  await delay(600);
  const file = formData?.get?.('file');
  return {
    status: 201,
    data: {
      success: true,
      message: '계약서가 등록되었습니다.',
      result_code: 201,
      data: {
        contract_id: 'contract_mock_001',
        title: '표준 근로계약서(정규직)',
        file_name: file?.name ?? 'contract.pdf',
        analysis_status: 'uploaded',
        created_at: new Date().toISOString(),
      },
    },
  };
};

// ────────────────────────────────────────────────────────────────
// POST /api/contracts/:id/analyze  (분석 시작)
// ────────────────────────────────────────────────────────────────
export const analyzeContract = async (contractId) => {
  await delay(400);
  pollCount = 0;
  return {
    status: 202,
    data: {
      success: true,
      message: '분석이 시작되었습니다.',
      result_code: 202,
      data: {
        contract_id: contractId,
        analyze_request_id: 'req_mock_001',
        analysis_status: 'queued',
        requested_at: new Date().toISOString(),
      },
    },
  };
};

// ────────────────────────────────────────────────────────────────
// GET /api/contracts/:id/analyze-status  (폴링)
// ────────────────────────────────────────────────────────────────
export const getAnalyzeStatus = async (contractId) => {
  await delay(200);
  pollCount += 1;
  const done = pollCount >= 2;
  const overall_status = done ? 'succeeded' : 'processing';

  return {
    status: 200,
    data: {
      success: true,
      message: '분석 진행 상태 조회 성공',
      result_code: 200,
      analyze_status: {
        contract_id: contractId,
        analyze_request_id: 'req_mock_001',
        overall_status,
        requested_at: new Date(Date.now() - 10_000).toISOString(),
        completed_at: done ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
        stages: {
          ocr: 'done',
          kobert: done ? 'done' : 'running',
          llama: done ? 'done' : 'pending',
        },
        progress_percent: done ? 100 : 60,
      },
    },
  };
};

// ────────────────────────────────────────────────────────────────
// GET /api/contracts/:id/result  (분석 결과 조회)
// ────────────────────────────────────────────────────────────────
export const getContractResult = async (contractId) => {
  await delay(500);
  return {
    status: 200,
    data: {
      success: true,
      message: '계약서 분석 결과 조회 성공.',
      result_code: 200,
      contract_id: contractId,
      analysis_status: 'succeeded',

      key_facts: [
        {
          field_key: 'start_date',
          label: '계약 시작일',
          value: '2026-03-02',
          value_type: 'date',
          confidence: 0.96,
          highlights: [{ page_number: 1, bbox_norm: { x: 0.12, y: 0.18, w: 0.22, h: 0.03 } }],
        },
        {
          field_key: 'end_date',
          label: '만기일',
          value: '2027-03-01',
          value_type: 'date',
          confidence: 0.84,
          highlights: [{ page_number: 1, bbox_norm: { x: 0.12, y: 0.22, w: 0.22, h: 0.03 } }],
        },
        {
          field_key: 'monthly_salary',
          label: '월 급여',
          value: 3_200_000,
          value_type: 'currency',
          confidence: 0.91,
          highlights: [{ page_number: 1, bbox_norm: { x: 0.12, y: 0.40, w: 0.30, h: 0.04 } }],
        },
        {
          field_key: 'work_hours',
          label: '소정 근로시간',
          value: '주 40시간',
          value_type: 'text',
          confidence: 0.88,
          highlights: [{ page_number: 1, bbox_norm: { x: 0.12, y: 0.32, w: 0.26, h: 0.04 } }],
        },
      ],

      term_explanations: [
        {
          term: '해지(해약)',
          simple_definition: '계약을 끝내는 절차를 말해요. 보통 서면 통보로 시작합니다.',
          highlights: [{ page_number: 1, bbox_norm: { x: 0.08, y: 0.55, w: 0.18, h: 0.04 } }],
        },
        {
          term: '손해배상',
          simple_definition: '약속을 어겨 상대방에게 끼친 손해를 돈으로 물어주는 것이에요.',
          highlights: [{ page_number: 2, bbox_norm: { x: 0.10, y: 0.30, w: 0.20, h: 0.04 } }],
        },
        {
          term: '경업금지',
          simple_definition: '회사를 그만둔 뒤 같은 업종에서 일하거나 창업하지 못하도록 하는 약정이에요.',
          highlights: [{ page_number: 2, bbox_norm: { x: 0.10, y: 0.55, w: 0.28, h: 0.04 } }],
        },
      ],

      clause_summaries: [
        {
          clause_id: 'clause_001',
          topic: '근무 시간',
          short_summary: '주 40시간, 월~금 09:00–18:00 근무로 규정되어 있어요.',
          highlights: [{ page_number: 1, bbox_norm: { x: 0.08, y: 0.32, w: 0.40, h: 0.04 } }],
        },
        {
          clause_id: 'clause_002',
          topic: '급여 및 복리후생',
          short_summary: '월 320만원, 4대보험 가입, 연 1회 성과급 지급 조건이에요.',
          highlights: [{ page_number: 1, bbox_norm: { x: 0.08, y: 0.42, w: 0.40, h: 0.04 } }],
        },
        {
          clause_id: 'clause_003',
          topic: '해고/계약해지',
          short_summary: '계약 해지 및 관련 절차가 요약되어 있어요.',
          highlights: [{ page_number: 2, bbox_norm: { x: 0.08, y: 0.44, w: 0.40, h: 0.04 } }],
        },
      ],

      toxic_assessment: {
        detected: true,
        severity: 'high',
        flagged_clauses: [
          {
            clause_id: 'clause_003',
            detected: true,
            topics: ['해고', '손해배상'],
            quote_excerpt:
              '회사는 사유 통지 없이 즉시 계약을 해지할 수 있으며, 근로자는 이에 대해 이의를 제기할 수 없다.',
            reason_generalized:
              '사용자에게 불리할 수 있는 조건이 포함되어 있어 독소조항 가능성이 높습니다. 근로기준법상 해고 예고 의무와 충돌할 수 있어요.',
            severity: 'high',
            highlights: [{ page_number: 2, bbox_norm: { x: 0.08, y: 0.44, w: 0.40, h: 0.08 } }],
          },
          {
            clause_id: 'clause_007',
            detected: true,
            topics: ['경업금지'],
            quote_excerpt: '퇴사 후 3년간 동종업계 취업 또는 창업을 금지한다.',
            reason_generalized:
              '일반적으로 1년 이내가 합리적 범위로 인정됩니다. 기간·지역·보상이 과도할 경우 무효 판단될 수 있어요.',
            severity: 'medium',
            highlights: [{ page_number: 2, bbox_norm: { x: 0.10, y: 0.55, w: 0.60, h: 0.06 } }],
          },
          {
            clause_id: 'clause_012',
            detected: true,
            topics: ['업무 범위'],
            quote_excerpt: '회사가 지정하는 기타 업무를 수행한다.',
            reason_generalized:
              '업무 범위가 지나치게 포괄적이어서 계약 목적 외 노무를 강요받을 여지가 있어요.',
            severity: 'low',
            highlights: [{ page_number: 1, bbox_norm: { x: 0.10, y: 0.68, w: 0.55, h: 0.05 } }],
          },
        ],
      },
    },
  };
};

// ────────────────────────────────────────────────────────────────
// GET /api/contracts  (검사 기록 목록 조회, p.77~78)
// 응답 최상위에 contracts 배열을 돌려줍니다.
// ────────────────────────────────────────────────────────────────
export const getContractList = async () => {
  await delay(350);
  const contracts = mockContracts.map(({ contract_id, title, status, created_at }) => ({
    contract_id,
    title,
    status,
    created_at,
  }));
  return {
    status: 200,
    data: {
      success: true,
      message: '내 계약서 목록 조회 성공',
      result_code: 200,
      contracts,
    },
  };
};

// ────────────────────────────────────────────────────────────────
// GET /api/contracts/:id  (검사 기록 상세 요약 조회, p.79~80)
// 응답 최상위에 contract_summary 객체를 돌려줍니다.
// ────────────────────────────────────────────────────────────────
export const getContractDetail = async (contractId) => {
  await delay(400);
  const found = mockContracts.find((c) => c.contract_id === contractId);

  if (!found) {
    // 설계서에는 404 케이스가 명시되어 있지 않지만, axios의 실패 응답을 흉내냅니다.
    const err = new Error('NOT_FOUND');
    err.response = {
      status: 404,
      data: {
        success: false,
        message: '해당 계약서를 찾을 수 없습니다.',
        result_code: 404,
      },
    };
    throw err;
  }

  return {
    status: 200,
    data: {
      success: true,
      message: '계약서 분석 요약 조회 성공',
      result_code: 200,
      contract_summary: found.contract_summary,
    },
  };
};

// ────────────────────────────────────────────────────────────────
// DELETE /api/contracts/:id  (검사 기록 삭제, p.103)
// 모듈 저장소에서도 실제로 제거 → 같은 세션 내 재조회 시 사라져 보입니다.
// ────────────────────────────────────────────────────────────────
export const deleteContract = async (contractId) => {
  await delay(250);
  const idx = mockContracts.findIndex((c) => c.contract_id === contractId);
  if (idx !== -1) mockContracts.splice(idx, 1);

  return {
    status: 200,
    data: {
      success: true,
      message: '계약서가 삭제되었습니다.',
      result_code: 200,
      data: {
        contract_id: contractId,
        deleted_at: new Date().toISOString(),
      },
    },
  };
};