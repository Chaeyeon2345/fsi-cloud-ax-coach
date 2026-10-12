// Cloud·AX Discovery 질문은행. 배포모델별로 같은 질문을 반복하지 않고, 고객 요구사항(Category) 기준으로 한 번만 둔다.
// 각 질문은 "왜 묻는가 / 답변에 따라 달라지는 것 / 관련 Architecture"를 갖는다. 교육용 질문이며 고객별 정답이 아니다.
import type { ModelName } from './cloudAxMatrix';

export const discoveryCategories = ['Business', 'User', 'Data', 'Network', 'Security', 'Identity', 'Legacy', 'Integration', 'Performance', 'Availability', 'DR/BCP', 'Operations', 'Cost', 'AI', 'Governance', 'Procurement'] as const;
export type DiscoveryCategory = typeof discoveryCategories[number];

export interface DiscoveryQ { id: string; category: DiscoveryCategory; q: string; why: string; impact: string; related: (ModelName | 'All')[] }
const ALL: 'All' = 'All';

export const discoveryBank: DiscoveryQ[] = [
  // 업무
  { id: 'b1', category: 'Business', q: '이 서비스가 중단되면 고객 거래나 대외 업무에 어떤 영향이 있습니까?', why: '업무 중요도 확인', impact: 'Cloud 이용 가능 범위, DR 수준, 승인 절차의 강도', related: [ALL] },
  { id: 'b2', category: 'Business', q: '대상 업무는 조회·보조입니까, 거래 실행·심사 같은 핵심 업무입니까?', why: '업무 성격과 위험 구분', impact: 'Public/Hybrid 후보 범위, 사람의 승인 필요 여부', related: ['Public Cloud', 'Hybrid', 'On-premises'] },
  { id: 'b3', category: 'Business', q: '이 사업의 성공을 무엇으로 판단합니까(비용, 처리 시간, 만족도, 규제 대응)?', why: '목표 지표 확인', impact: '모델 선택보다 먼저 설계 우선순위를 정함', related: [ALL] },
  { id: 'b4', category: 'User', q: '대상 사용자는 직원입니까, 고객입니까, 외부 파트너까지 포함합니까?', why: '노출 범위 확인', impact: '인터넷 경계, 인증 방식, 고지·책임 요구가 달라짐', related: [ALL] },
  // Data
  { id: 'b5', category: 'Data', q: '처리 데이터가 어디까지 외부 Cloud로 나갈 수 있습니까?', why: 'Data boundary 확인', impact: 'Public / Hybrid / On-prem 판단', related: ['Public Cloud', 'Hybrid', 'On-premises', 'Private AI'] },
  { id: 'b6', category: 'Data', q: '개인정보·개인신용정보·고유식별정보가 포함됩니까? 비식별·가명 처리가 가능합니까?', why: '데이터 종류에 따른 검토 경로 확인', impact: '외부 처리 가능 범위와 법무·보안 검토 대상이 달라짐', related: [ALL] },
  { id: 'b7', category: 'Data', q: '데이터 저장 위치와 처리 위치, 백업 위치는 각각 어디여야 합니까?', why: 'Data residency 확인', impact: '리전 선택, 국외 이전 검토, DR 위치 결정', related: ['Public Cloud', 'Hybrid'] },
  { id: 'b8', category: 'Data', q: '데이터 분류 체계와 접근통제 기준이 정리되어 있습니까?', why: 'AI·분석 활용의 전제 확인', impact: '데이터 플랫폼/RAG 범위, 선행 정비 필요 여부', related: [ALL] },
  { id: 'b9', category: 'Data', q: '이 데이터의 보관 기간과 삭제 요구(Exit 시 반환 포함)는 어떻게 됩니까?', why: '수명주기와 종료 시 데이터 처리 확인', impact: 'CSP·SaaS 선택과 계약 조건', related: ['Public Cloud', 'Hybrid'] },
  // Network
  { id: 'b10', category: 'Network', q: '인터넷을 거치면 안 되는 통신 구간이 있습니까?', why: '연결 방식 제약 확인', impact: '전용선/VPN/Private 접근 설계, 인터넷 경유 서비스 제외', related: ['Public Cloud', 'Hybrid'] },
  { id: 'b11', category: 'Network', q: '내부업무망·연구개발망·DMZ 중 어느 망에서 사용합니까?', why: '망 구분에 따른 접근 경로 확인', impact: '망분리 검토 항목과 사용 가능 서비스 범위', related: [ALL] },
  { id: 'b12', category: 'Network', q: '전용 연결을 쓸 때 구간 암호화 요구가 있습니까?', why: '전용선이 곧 암호화가 아님을 확인', impact: 'VPN 병행 등 암호화 방식 선택', related: ['Hybrid', 'Public Cloud'] },
  { id: 'b13', category: 'Network', q: '외부 SaaS·API(모델 API 포함) 호출이 필요합니까? 허용되는 외부 도착지는 어디입니까?', why: '외부 경유 범위 확인', impact: '프록시·Private 접근·경계 통제 설계', related: [ALL] },
  // Security
  { id: 'b14', category: 'Security', q: '암호화 Key는 누가 소유·관리해야 합니까(고객 관리 키, HSM 요구 포함)?', why: 'Key control 요구 수준 확인', impact: 'KMS 등 관리형 키 사용 여부, 특수 HSM 검토', related: ['Public Cloud', 'Hybrid'] },
  { id: 'b15', category: 'Security', q: '보안성 검토·취약점 점검은 어떤 절차와 일정으로 진행됩니까?', why: '일정 리스크 확인', impact: 'Deal Timeline에 보안 검토 기간 반영', related: [ALL] },
  { id: 'b16', category: 'Security', q: '단말·접속 환경에 대한 보호 대책 요구가 있습니까?', why: '접근 경로 통제 확인', impact: '접속 방식과 사용자 범위', related: [ALL] },
  { id: 'b17', category: 'Security', q: '보안 사고 시 격리·차단 수단(Kill switch 포함)과 책임자는 누구입니까?', why: '사고 대응 구조 확인', impact: '운영 설계와 자동 차단 요건', related: ['Private AI', 'Hybrid', 'Public Cloud'] },
  // Identity
  { id: 'b18', category: 'Identity', q: '사용자·관리자·서비스 계정의 권한을 어떻게 분리하고 있습니까?', why: '권한 분리와 최소 권한 확인', impact: 'IAM 구조, 임시 자격증명, 승인 절차', related: [ALL] },
  { id: 'b19', category: 'Identity', q: '기존 인증 체계(SSO, MFA)와 연동해야 합니까?', why: 'IdP 연동 요구 확인', impact: '인증 연동 설계 범위', related: [ALL] },
  { id: 'b20', category: 'Identity', q: '관리자 접근(특권 계정)의 승인·기록·재검토 주기는 어떻게 됩니까?', why: '특권 접근 통제 확인', impact: '운영 위탁 시 접근 모델, 감사 요건', related: ['Public Cloud', 'Hybrid', 'Private Cloud'] },
  // Legacy
  { id: 'b21', category: 'Legacy', q: '기존 코어·계정계와 실시간 연동이 필요합니까, 배치로 충분합니까?', why: '연계 방식과 결합도 확인', impact: '외부 Cloud 배치 가능 여부, 지연 허용 범위', related: ['Hybrid', 'On-premises', 'Public Cloud'] },
  { id: 'b22', category: 'Legacy', q: '시스템 간 의존 관계(Dependency map)가 정리되어 있습니까?', why: '이전·연계 위험 확인', impact: 'Migration 전략과 순서(Rehost/Replatform/Refactor)', related: ['Public Cloud', 'Hybrid'] },
  { id: 'b23', category: 'Legacy', q: '라이선스 만료(EOL)나 특정 미들웨어 종속 이슈가 있습니까?', why: '현대화 동인과 제약 확인', impact: '이전 대상 우선순위와 비용 구조', related: ['Public Cloud', 'Hybrid', 'Private Cloud'] },
  // User · Integration
  { id: 'b51', category: 'User', q: '사용자 수와 증가 계획은 어떻게 됩니까? 어떤 단말·망에서 접속합니까?', why: '용량과 접속 경로 가정 확인', impact: '용량 산정, 망 구분, 단말 보호 요건', related: [ALL] },
  { id: 'b52', category: 'Integration', q: '연계할 내부 시스템은 몇 개이며 연계 방식(API·배치·메시징)은 무엇입니까?', why: '연계 복잡도와 변경 범위 확인', impact: '연계 구간 설계, 이전 순서, 테스트 범위', related: ['Hybrid', 'On-premises', 'Public Cloud'] },
  { id: 'b53', category: 'Integration', q: '외부 기관·파트너·SaaS와의 연계가 있습니까? 그 구간은 어떻게 통제합니까?', why: '외부 경계와 책임 확인', impact: '경계 통제, 계약·위탁 검토 범위', related: [ALL] },
  // Performance
  { id: 'b24', category: 'Performance', q: '허용 응답 시간은 얼마입니까? 피크 동시 사용자는 얼마입니까?', why: 'Latency·용량 기준 확인', impact: '위치(내부/외부)와 용량 산정', related: [ALL] },
  { id: 'b25', category: 'Performance', q: '트래픽이나 GPU 수요가 일정합니까, 변동성이 큽니까?', why: 'Elasticity/TCO 판단', impact: 'Cloud와 소유 GPU 선택에 영향', related: ['Public Cloud', 'On-premises', 'Private AI'] },
  { id: 'b26', category: 'Performance', q: '성능 목표를 어떻게 측정하고 누가 책임집니까?', why: '성능 책임 소재 확인', impact: 'SLA·모니터링 설계', related: [ALL] },
  // Availability
  { id: 'b27', category: 'Availability', q: '서비스 가용성 목표(예: 운영 시간, 허용 중단)는 무엇입니까?', why: 'HA 요구 확인', impact: 'Multi-AZ·이중화 수준', related: [ALL] },
  { id: 'b28', category: 'Availability', q: '유지보수·배포 시 허용되는 중단 시간이 있습니까?', why: '변경 방식 제약 확인', impact: '무중단 배포 구조, 운영 절차', related: [ALL] },
  // DR/BCP
  { id: 'b29', category: 'DR/BCP', q: '승인된 RTO/RPO는 얼마입니까? 마지막 복구 테스트는 언제였습니까?', why: '문서상 목표와 실제 검증 구분', impact: 'DR 전략(Backup & Restore ~ Active/Active) 선택', related: [ALL] },
  { id: 'b30', category: 'DR/BCP', q: 'Region/전산센터 전체 장애까지 가정합니까?', why: '장애 범위 확인', impact: '같은 CSP·센터 안 DR의 한계 판단', related: ['Public Cloud', 'Hybrid', 'On-premises'] },
  { id: 'b31', category: 'DR/BCP', q: '대체 업무와 의사결정·연락 체계는 BCP에 포함돼 있습니까?', why: 'IT 복구를 넘어선 연속성 확인', impact: 'DR 범위가 IT에 한정되는지 결정', related: [ALL] },
  { id: 'b32', category: 'DR/BCP', q: 'AI 서비스가 중단될 때의 대체 수단(수동 절차, 이전 모델)이 있습니까?', why: 'AI 의존도와 대체 수단 확인', impact: 'AI 장애 시 업무 연속성 설계', related: ['Private AI', 'Hybrid', 'Public Cloud'] },
  // Operation
  { id: 'b33', category: 'Operations', q: '24x7 운영은 누가 담당합니까(자체, 위탁, MSP)?', why: '운영 주체 확인', impact: 'Managed Service 범위, 인력 계획', related: [ALL] },
  { id: 'b34', category: 'Operations', q: '장애·패치·변경을 누가 승인하고 기록합니까?', why: 'Change management 확인', impact: '운영 프로세스와 자동화 범위', related: [ALL] },
  { id: 'b35', category: 'Operations', q: '도입 후 운영 KPI와 책임 조직은 어디입니까?', why: '이전·구축 이후의 소유권 확인', impact: 'Migration 이후 Managed Service·FinOps 연결', related: ['Public Cloud', 'Hybrid', 'Private Cloud'] },
  // Cost
  { id: 'b36', category: 'Cost', q: '3~5년 TCO를 CapEx/OpEx로 나누어 비교해 보셨습니까?', why: '비용 구조 가정 확인', impact: '소유 vs 사용량 기반 판단', related: ['Public Cloud', 'On-premises', 'Private AI'] },
  { id: 'b37', category: 'Cost', q: '예상 사용량(사용자, Token, 저장량)과 증가 가정은 어떻게 됩니까?', why: '용량·비용 추정의 근거 확인', impact: '용량 계획과 FinOps 필요 수준', related: [ALL] },
  { id: 'b38', category: 'Cost', q: 'GPU를 이미 보유했거나 구매 일정이 잡혀 있습니까? 목표 활용률은 얼마입니까?', why: '소유 자원의 경제성 판단', impact: 'On-prem GPU 활용 vs Cloud 사용량 방식', related: ['On-premises', 'Private AI', 'Public Cloud'] },
  // AI
  { id: 'b39', category: 'AI', q: '모델이 답변만 합니까, 내부 시스템에 쓰기·실행까지 합니까?', why: 'Agent 권한 위험 확인', impact: 'IAM, 사람의 승인, 감사 기록 요구', related: [ALL] },
  { id: 'b40', category: 'AI', q: '상용 관리형 모델을 쓸 수 있습니까, 오픈 모델을 자체 운영해야 합니까?', why: '모델 운영 방식 확인', impact: '외부 호출 허용 여부, 서빙·평가 책임', related: ['Public Cloud', 'Hybrid', 'Private AI'] },
  { id: 'b41', category: 'AI', q: '사용자별 문서 권한이 AI 검색·답변에도 적용되어야 합니까?', why: 'RAG 권한 상속 요구 확인', impact: '검색 인덱스·메타데이터 설계', related: [ALL] },
  { id: 'b42', category: 'AI', q: '답변에 근거 문서(Source citation)를 함께 보여줘야 합니까?', why: '검증 가능성 요구 확인', impact: 'RAG 설계와 UI 요건', related: [ALL] },
  { id: 'b43', category: 'AI', q: '검색 대상 문서는 누가 갱신하고 승인합니까?', why: '지식 품질 책임 확인', impact: '문서 파이프라인과 운영 조직', related: [ALL] },
  // Governance
  { id: 'b44', category: 'Governance', q: 'AI가 고객 권리·의무에 영향을 주는 업무에 쓰입니까?', why: '업무 영향도 분류', impact: '위험 분류와 통제 수준(고영향·고위험 검토는 법무와)', related: [ALL] },
  { id: 'b45', category: 'Governance', q: '모델·프롬프트 변경의 평가·승인·Rollback 체계가 있습니까?', why: '변경 통제 확인', impact: 'LLMOps/평가 체계 요건', related: ['Private AI', 'Hybrid', 'Public Cloud'] },
  { id: 'b46', category: 'Governance', q: '오답·부적절 답변이 발생했을 때 신고·수정·중단 절차는 어떻게 됩니까?', why: '사고 대응과 책임 확인', impact: 'Guardrail·모니터링·중단 수단', related: [ALL] },
  // Procurement
  { id: 'b47', category: 'Procurement', q: '이 사업의 의사결정자와 예산 주관 조직은 어디입니까?', why: '의사결정 구조 확인', impact: '제안 시점·승인 경로', related: [ALL] },
  { id: 'b48', category: 'Procurement', q: '계약·위탁·재위탁과 종료(Exit) 조건은 어떻게 검토됩니까?', why: '계약 리스크 확인', impact: 'CSP/SI 선택, 종료 시 데이터 반환 방안', related: ['Public Cloud', 'Hybrid'] },
  { id: 'b49', category: 'Procurement', q: '장비·소프트웨어 조달 리드타임과 입찰 일정이 정해져 있습니까?', why: '소유 자원의 일정 리스크 확인', impact: 'On-prem/Private 구축 일정', related: ['On-premises', 'Private Cloud', 'Private AI'] },
  { id: 'b50', category: 'Procurement', q: '이미 거래 중인 CSP·MSP·SI가 있습니까? 지정 또는 제약이 있습니까?', why: '생태계와 제약 확인', impact: '제안 구조와 파트너 구성', related: [ALL] },
];
