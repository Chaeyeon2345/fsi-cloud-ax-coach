// Day 14~16 도구·표 데이터. 모두 교육용 Framework(SALES_VIEW·INTERPRETATION)이며 특정 회사의 Portfolio나 내부 가격·마진 정책을 다루지 않는다.
// Vendor·제품명은 Example로만 쓰며 기본 학습은 Vendor-neutral이다.

// ── Day 14: Account를 읽는 순서 ──
export const accountReadingOrder: { n: number; step: string; where: string; kind: 'FACT' | 'SALES_VIEW' }[] = [
  { n: 1, step: '업권', where: '시장 모판 · 업권/subSector', kind: 'FACT' },
  { n: 2, step: '회사 규모', where: '총자산(별도 재무상태표, 기준일)', kind: 'FACT' },
  { n: 3, step: '주요 사업', where: '회사 공식 사이트·공시', kind: 'FACT' },
  { n: 4, step: '고객/서비스 특성', where: '개인/기업, 채널, 규제 민감도', kind: 'FACT' },
  { n: 5, step: 'IT Landscape', where: 'IT Footprint 5개 영역', kind: 'FACT' },
  { n: 6, step: 'Core / On-prem', where: '코어·IDC·가상화·GPU 관련 공개 사업', kind: 'FACT' },
  { n: 7, step: 'Public Cloud', where: 'CSP 관계·Landing Zone·Migration', kind: 'FACT' },
  { n: 8, step: 'Data', where: 'DW·Data Lake·분석 플랫폼', kind: 'FACT' },
  { n: 9, step: 'AI·AX', where: 'GenAI·RAG·Agent·AI 플랫폼', kind: 'FACT' },
  { n: 10, step: 'Security / DR', where: '보안·백업·DR 사업', kind: 'FACT' },
  { n: 11, step: '기존 CSP', where: 'Ecosystem · CSP', kind: 'FACT' },
  { n: 12, step: '기존 MSP / SI', where: 'Ecosystem · MSP/SI', kind: 'FACT' },
  { n: 13, step: '주요 Technology Vendor', where: 'Ecosystem · Product/Vendor', kind: 'FACT' },
  { n: 14, step: '공개 조직', where: '사업 근거에 명시된 조직', kind: 'FACT' },
  { n: 15, step: '공개 Keyman', where: '공식 현재 페이지로 확인된 인물(HISTORICAL 구분)', kind: 'FACT' },
  { n: 16, step: '최근 IT·AX Initiative', where: '최근 3년 Timeline', kind: 'FACT' },
  { n: 17, step: '관련 Regulation', where: '금융 IT·규제 Playbook', kind: 'FACT' },
  { n: 18, step: '유사 Reference', where: '국내 사업 사례', kind: 'FACT' },
  { n: 19, step: 'Opportunity Hypothesis', where: '내 해석', kind: 'SALES_VIEW' },
  { n: 20, step: 'Next Discovery', where: '첫 미팅 질문', kind: 'SALES_VIEW' },
];

export const landscapeQuestions = [
  '이 고객은 On-prem 중심인가? (공개 Core·IDC·가상화·GPU 사업이 있는가)',
  '어떤 Public Cloud가 공개적으로 확인되는가? (CSP·Landing Zone·Migration)',
  'Hybrid 사용 흔적이 있는가? (Hybrid 배포모델·전용 연결 언급)',
  'Data 투자 방향은? (DW·Data Lake·분석 플랫폼)',
  'AI는 어느 업무에 쓰고 있는가? (직원용/고객용, 단계)',
  'Security/DR 관련 최근 사업은?',
  '기존 MSP/SI 관계는?',
  '최근 3년간 투자 Theme는 무엇인가?',
];

export const day14Exercise = [
  { key: 'facts', label: '1. 이 고객의 확인된 FACT 5개', hint: '총자산, 본사, 공개 Cloud 사용, 공개 AI 사업, CSP/MSP/SI 등 Source가 있는 것만' },
  { key: 'initiatives', label: '2. 최근 IT·AX Initiative 3개', hint: '날짜·단계(원문이 말한 것만)·Source를 함께' },
  { key: 'keyman', label: '3. 공개 Keyman', hint: '공식 현재 페이지로 확인된 인물만. 없으면 “공개 확인자료 없음”' },
  { key: 'ecosystem', label: '4. 기존 CSP/MSP/SI', hint: 'Source가 있는 관계만' },
  { key: 'regulation', label: '5. 관련 규제 3개', hint: '금융 IT·규제 Playbook의 영역 이름으로' },
  { key: 'reference', label: '6. 유사 국내 Reference 2개', hint: '국내 사업 사례·Initiative에서' },
  { key: 'hypothesis', label: '7. Opportunity Hypothesis 3개 (SALES_VIEW)', hint: '“공개 사실 → 내 해석” 형태로. 사실처럼 쓰지 않기' },
  { key: 'questions', label: '8. 첫 미팅 질문 10개', hint: '제품이 아니라 Pain·Data·운영·규제부터' },
];

// ── Day 15: Solution Motion ──
export interface Motion { group: string; items: string[]; models: string[] }
export const solutionMotions: Motion[] = [
  { group: 'Infrastructure', items: ['Server', 'Storage', 'Data Center', 'GPU / NPU'], models: ['On-premises', 'Private Cloud', 'Private AI'] },
  { group: 'Virtualization / Private Cloud', items: ['VMware alternative', 'KVM', 'Private Cloud', 'Kubernetes'], models: ['On-premises', 'Private Cloud'] },
  { group: 'Public Cloud', items: ['Landing Zone', 'Migration', 'Cloud Native', 'Managed Service'], models: ['Public Cloud', 'Hybrid'] },
  { group: 'Hybrid', items: ['On-prem + Public Cloud', 'Data boundary', 'Private connectivity'], models: ['Hybrid'] },
  { group: 'Data', items: ['DW', 'Data Lake', 'Lakehouse', 'Analytics', 'Data Governance'], models: ['Public Cloud', 'Hybrid', 'On-premises'] },
  { group: 'Security', items: ['IAM', 'Logging', 'Security Monitoring', 'Zero Trust', 'Cloud Security', 'AI Security'], models: ['Public Cloud', 'Hybrid', 'On-premises', 'Private AI'] },
  { group: 'Resilience', items: ['Backup', 'DR', 'BCP'], models: ['Public Cloud', 'Hybrid', 'On-premises'] },
  { group: 'AI / AX', items: ['Private AI', 'GenAI', 'RAG', 'Knowledge Assistant', 'AI Agent', 'AI Platform', 'LLMOps'], models: ['Public Cloud', 'Hybrid', 'Private AI'] },
  { group: 'Application', items: ['Modernization', 'API', 'Container', 'DevOps'], models: ['Public Cloud', 'Hybrid', 'Private Cloud'] },
  { group: 'Service', items: ['MSP', 'Consulting', 'SI', 'FinOps', 'Operation'], models: ['Public Cloud', 'Hybrid', 'On-premises', 'Private Cloud', 'Private AI'] },
];

export interface Signal { signal: string; check: string; motions: string; models: string; ask: string; handoff: string }
export const customerSignals: Signal[] = [
  { signal: 'VMware 비용 상승', check: 'VM 규모 / EOL / Migration window', motions: 'Virtualization 대체 · Private Cloud · Cloud Migration', models: 'On-premises · Private Cloud · Public Cloud 후보', ask: '라이선스 갱신 시점과 이전 대상 VM 수는? 중요 업무 포함 여부는?', handoff: 'SA(인프라)·구매' },
  { signal: 'GPU 확보 어려움', check: 'Model / 사용량 / 기간 / Latency', motions: 'Public GPU · On-prem GPU · Hybrid AI', models: 'Public Cloud · Private AI · Hybrid 후보', ask: '필요 GPU 규모와 사용 기간, 변동성은? 데이터를 외부로 보낼 수 있습니까?', handoff: 'SA(AI 인프라)' },
  { signal: '내부 문서검색이 불편', check: 'Data source / 권한 / Update', motions: 'RAG · Knowledge Assistant', models: 'Hybrid · Private AI · Public Cloud 후보', ask: '문서 권한이 AI 검색에도 적용돼야 합니까? 문서는 누가 갱신합니까?', handoff: 'SA(AI)·Security' },
  { signal: 'AI Agent 검토', check: 'Read/Write / Approval / Audit', motions: 'Agent Platform · IAM · Governance', models: 'Hybrid · Private AI 후보', ask: '쓰기·실행 권한이 있습니까? 사람의 승인 지점과 로그는?', handoff: 'Security·Legal·SA' },
  { signal: 'DR 노후화', check: 'RTO/RPO / 복구테스트', motions: 'Backup · DR · Multi-site · Cloud DR', models: 'Public Cloud · Hybrid · On-premises 후보', ask: '승인된 RTO/RPO와 마지막 복구 테스트 결과는? 센터 장애까지 가정합니까?', handoff: 'SA(DR)' },
  { signal: 'Cloud 비용 증가', check: '사용량 / Commitment / Resource', motions: 'FinOps · Optimization', models: 'Public Cloud 운영 중 고객', ask: '비용 책임 조직과 주요 증가 항목은? 약정 활용률은?', handoff: 'FinOps·MSP' },
  { signal: '차세대 시스템 전환 추진', check: '대상 범위 / 일정 / 현 Vendor', motions: 'Application Modernization · SI · Consulting', models: 'On-premises · Hybrid 후보', ask: '전환 범위와 병행 운영 기간은? 의사결정 구조는?', handoff: 'SA·SI 파트너' },
  { signal: 'Cloud 이용 절차 심의 예정', check: '중요도 평가 결과 / 위원회 일정', motions: 'Assessment · Landing Zone · Security', models: 'Public Cloud · Hybrid 후보', ask: '중요도 평가와 CSP 평가는 어디까지 끝났습니까? 위원회 일정은?', handoff: 'Security·Compliance' },
  { signal: '생성형 AI 전사 확대', check: '사용자 수 / 비용 / 거버넌스', motions: 'AI Platform · LLMOps · Governance', models: 'Hybrid · Private AI · Public Cloud 후보', ask: '모델 변경·평가·중단 책임자는? Token/GPU 비용을 누가 관리합니까?', handoff: 'SA(AI)·Governance' },
  { signal: '데이터 분산·품질 문제', check: '데이터 소스 / 분류 / 접근통제', motions: 'Data Platform · Data Governance', models: 'Hybrid · Public Cloud 후보', ask: '데이터 분류와 접근 기준은? AI 활용 계획과 연결됩니까?', handoff: 'Data·Security' },
  { signal: '보안 점검 지적·취약점 누적', check: '평가 범위 / 미조치 항목 / 담당', motions: 'Security Monitoring · Zero Trust · Managed Security', models: '전 모델', ask: '최근 점검 범위와 미조치 취약점, 개선 일정은?', handoff: 'Security' },
  { signal: '운영 인력 부족', check: '24x7 체계 / 위탁 범위', motions: 'MSP · Operation', models: 'Public Cloud · Hybrid 후보', ask: '운영 책임 범위와 위탁 가능 범위는? 재위탁 구조는?', handoff: 'MSP·Legal' },
];

export const partnerRoles: { role: string; does: string }[] = [
  { role: 'Customer (금융회사)', does: '업무 책임·규제 책임·최종 승인. 위탁해도 책임은 면제되지 않음' },
  { role: 'CSP', does: 'Cloud 인프라·서비스 제공, 공동 책임 모델의 인프라 측 책임' },
  { role: 'MSP', does: 'Cloud 환경의 구축·운영·비용·보안 관리를 대행' },
  { role: 'SI', does: '시스템 설계·개발·통합과 전환 프로젝트 수행' },
  { role: 'ISV', does: '특정 업무·기술 소프트웨어 제품 제공' },
  { role: 'Infra Vendor', does: '서버·스토리지·네트워크·GPU 등 인프라 제품 공급' },
  { role: 'Security Vendor', does: '보안 제품·관제·진단 제공' },
  { role: 'Consulting', does: '전략·아키텍처·규제 대응·Assessment 자문' },
  { role: 'Application Vendor', does: '뱅킹·보험·증권 등 업무 애플리케이션 공급' },
];

export const expansionPaths: { name: string; steps: string[] }[] = [
  { name: 'Cloud Land & Expand', steps: ['Assessment', '구축(Landing Zone)', 'Migration', 'Managed Service', 'Security', 'Optimization', 'Expansion'] },
  { name: 'AI Land & Expand', steps: ['GPU / 환경', 'AI Platform', 'RAG', 'Agent', 'Operation(LLMOps)'] },
  { name: 'Resilience Land & Expand', steps: ['Backup', 'DR 구축', '복구 훈련', 'Multi-site / Cloud DR', 'Managed 운영'] },
];

export interface DiscoverySet { motion: string; questions: string[] }
export const motionDiscovery: DiscoverySet[] = [
  { motion: 'Migration', questions: ['왜 지금 옮기려 합니까?', '비용 때문입니까, EOL 때문입니까?', '어떤 Application이 대상입니까?', 'Downtime 허용은?', '운영은 누가 합니까?'] },
  { motion: 'Private AI', questions: ['왜 Public API가 어려운가?', 'Data 위치 요구는?', 'GPU utilization 계획은?', 'Model은 누가 운영?', 'Model update는 어떻게?'] },
  { motion: 'DR', questions: ['RTO/RPO는?', '최근 실제 복구테스트는?', 'Center 장애까지 가정합니까?', 'Backup과 DR을 구분하고 있습니까?', '복구 후 원복 절차는?'] },
  { motion: 'Public Cloud (Landing Zone)', questions: ['대상 업무의 중요도 평가는 끝났습니까?', '계정·네트워크·권한 기준이 있습니까?', '위원회·보고 일정은?', '종료(Exit) 방안은?', '운영 주체는?'] },
  { motion: 'Hybrid', questions: ['내부에 남길 데이터는?', '연결 방식(전용선/VPN)과 암호화 요구는?', '연결 단절 시 업무는?', '양쪽 운영 조직은 누구입니까?', '데이터 이동 승인 절차는?'] },
  { motion: 'Data Platform', questions: ['데이터 소스와 분류 기준은?', '접근통제 책임자는?', 'AI 활용 계획은?', '품질·계보 관리는?', '비용 구조(저장·처리)는?'] },
  { motion: 'RAG / Knowledge Assistant', questions: ['문서 권한이 검색에도 적용돼야 합니까?', '문서는 누가 갱신·승인합니까?', '답변 근거(citation)가 필요합니까?', '오답 신고·중단 절차는?', '사용자 규모와 응답 시간 목표는?'] },
  { motion: 'AI Agent', questions: ['읽기만 합니까, 쓰기·실행까지 합니까?', '사람의 승인 지점은?', '감사 로그와 중단 수단은?', '대상 시스템과 권한 범위는?', '실패 시 롤백은?'] },
  { motion: 'Security / Zero Trust', questions: ['최근 점검 범위와 미조치 항목은?', 'IAM·특권 계정 검토 주기는?', '로그 수집·보관 정책은?', '단말·접속 통제 요구는?', '사고 대응 훈련 여부는?'] },
  { motion: 'Virtualization / Private Cloud', questions: ['현재 가상화 플랫폼과 라이선스 갱신 시점은?', '이전 대상 VM·중요 업무 비율은?', '컨테이너 전환 계획은?', '자동화·셀프서비스 요구는?', '운영 인력 역량은?'] },
  { motion: 'FinOps / Optimization', questions: ['비용 책임 조직은 어디입니까?', '약정(Commitment) 활용률은?', '주요 증가 항목은?', '태깅·비용 배분 체계는?', '절감 목표와 승인 구조는?'] },
];

export const day15Exercises = [
  { id: 'e1', signal: '“VMware 라이선스 비용이 크게 올랐습니다.”' },
  { id: 'e2', signal: '“사내 LLM을 쓰고 싶은데 GPU를 구하기 어렵습니다.”' },
  { id: 'e3', signal: '“직원들이 내부 규정을 찾는 데 시간이 너무 걸립니다.”' },
  { id: 'e4', signal: '“DR 센터 장비가 노후화돼 복구 테스트를 못 했습니다.”' },
  { id: 'e5', signal: '“AI Agent가 업무 시스템을 직접 처리하게 하고 싶습니다.”' },
];
export const day15Steps = ['Pain', '확인질문', 'Architecture 후보', 'Solution Motion', 'Partner', 'SA Handoff', 'Expansion'];

// ── Day 16 ──
export const accountPlanFields: { key: string; label: string }[] = [
  { key: 'business', label: '1. 고객 Business' }, { key: 'strategy', label: '2. 경영/IT 전략' }, { key: 'sector', label: '3. 업권' }, { key: 'scale', label: '4. 규모' },
  { key: 'org', label: '5. 조직' }, { key: 'stakeholder', label: '6. Stakeholder' }, { key: 'keyman', label: '7. Keyman' }, { key: 'landscape', label: '8. IT Landscape' },
  { key: 'ecosystem', label: '9. CSP/MSP/SI' }, { key: 'initiatives', label: '10. 최근 IT·AX Initiative' }, { key: 'regulation', label: '11. Regulation / Security' }, { key: 'vendor', label: '12. 현재 Vendor' },
  { key: 'pain', label: '13. Customer Pain' }, { key: 'hypothesis', label: '14. Opportunity Hypothesis' }, { key: 'competition', label: '15. Competition' }, { key: 'budget', label: '16. Budget / Procurement' },
  { key: 'timeline', label: '17. Timeline' }, { key: 'next', label: '18. Next Action' }, { key: 'owner', label: '19. Owner' }, { key: 'expansion', label: '20. Expansion Path' },
];
export const stakeholderRoles = ['Economic Buyer', 'Business Sponsor', 'IT Decision Maker', 'Cloud / Infra', 'Data', 'AI / AX', 'Security / CISO', 'Risk / Compliance', 'Procurement', 'Operations', 'User', 'Champion', 'Partner / SI'];

export const meetingFlow: { n: number; step: string; level: 1 | 2 | 3; ask: string }[] = [
  { n: 1, step: 'Business Pain', level: 1, ask: '이 사업을 왜 추진하십니까? 지금 가장 불편한 점은 무엇입니까?' },
  { n: 2, step: 'User', level: 1, ask: '누가 사용하고 몇 명입니까?' },
  { n: 3, step: 'Current Process', level: 1, ask: '지금은 어떤 절차로 처리하고 있습니까?' },
  { n: 4, step: 'Current System', level: 2, ask: '어떤 시스템과 Vendor를 쓰고 있습니까?' },
  { n: 5, step: 'Data', level: 2, ask: '어떤 데이터가 어디에 있고 어디까지 이동할 수 있습니까?' },
  { n: 6, step: 'Network', level: 2, ask: '어느 망에서 접속하고 외부 연결 제약은 무엇입니까?' },
  { n: 7, step: 'Security', level: 2, ask: '보안성 검토와 권한·로그 요구는 무엇입니까?' },
  { n: 8, step: 'Regulation', level: 2, ask: '이용 절차·위탁·AI 거버넌스 등 검토 항목은 어디까지 정리돼 있습니까?' },
  { n: 9, step: 'Availability', level: 2, ask: '허용 중단 시간과 서비스 수준은?' },
  { n: 10, step: 'RTO/RPO', level: 2, ask: '승인된 RTO/RPO와 복구 테스트는?' },
  { n: 11, step: 'Integration', level: 2, ask: '연계할 시스템과 방식은?' },
  { n: 12, step: 'Operation', level: 2, ask: '운영은 누가 맡고 어떻게 승인합니까?' },
  { n: 13, step: 'Cost', level: 3, ask: '비용은 어떤 구조(CapEx/OpEx)로 보십니까?' },
  { n: 14, step: 'Budget', level: 3, ask: '예산은 확보돼 있습니까? 어느 조직 예산입니까?' },
  { n: 15, step: 'Timeline', level: 3, ask: '언제까지 무엇이 결정돼야 합니까?' },
  { n: 16, step: 'KPI', level: 3, ask: '성공을 어떤 지표로 판단합니까?' },
  { n: 17, step: 'Decision Process', level: 3, ask: '누가 어떤 순서로 결정합니까?' },
];
export const meetingLevels = { 1: 'Level 1 — Business: 왜 하는가?', 2: 'Level 2 — IT / Architecture: 현재 어떻게 되어 있는가?', 3: 'Level 3 — Deal: 누가, 언제, 어떤 예산으로 결정하는가?' } as const;

export const pocChecklist = ['실제 User', '실제 Data', 'Success KPI', 'Security review', 'Architecture', 'Performance', 'Cost', 'Operation owner', 'Incident process', 'Model/Application owner', 'Procurement', 'Budget', 'Production date', 'Expansion'];
export const qualification = [
  { key: 'problem', label: 'Problem — 해결할 문제가 명확한가' }, { key: 'owner', label: 'Owner — 책임 조직·담당이 있는가' }, { key: 'value', label: 'Value — 기대 가치가 정의됐는가' },
  { key: 'fit', label: 'Technical fit — 기술적으로 맞는가' }, { key: 'timing', label: 'Timing — 시점이 있는가' }, { key: 'budget', label: 'Budget path — 예산 경로가 있는가' },
  { key: 'decision', label: 'Decision process — 결정 과정을 아는가' }, { key: 'next', label: 'Next action — 다음 행동이 합의됐는가' },
];
export const meetingOutputFields = [
  { key: 'pain', label: '고객 Pain' }, { key: 'facts', label: '확인된 Fact' }, { key: 'unknown', label: '미확인사항' }, { key: 'tech', label: '기술 검토 필요사항' },
  { key: 'reg', label: '규제 검토사항' }, { key: 'stake', label: 'Stakeholder' }, { key: 'budget', label: 'Budget/Timing' }, { key: 'next', label: 'Next Action' },
];
export const simulationFields = [
  { key: 'hypothesis', label: '1. Opportunity Hypothesis 3개' }, { key: 'questions', label: '2. Discovery 10개' }, { key: 'motions', label: '3. Solution Motion 2개' },
  { key: 'architecture', label: '4. Architecture 후보' }, { key: 'handoff', label: '5. Handoff (SA/Security/Data/AI/Legal)' }, { key: 'next', label: '6. Next Action' },
];
export const selfCheck = [
  '확인된 FACT와 내 가설(SALES_VIEW)을 구분해서 썼는가?',
  '공개되지 않은 CSP·Architecture·Keyman을 추정해서 쓰지 않았는가?',
  '제품 설명이 아니라 Pain·Data·운영·규제 질문으로 시작했는가?',
  'Architecture 후보를 단정하지 않고 반대 옵션이 가능한 조건을 적었는가?',
  '규제 판단을 직접 하지 않고 법무·보안 Handoff를 적었는가?',
  '다음 Action에 담당과 시점이 있는가?',
];
