// Cloud·AX: "요건 → Architecture"와 "대표 Pattern" 데이터.
// 추천 점수는 만들지 않는다. 고객이 고른 요건이 어떤 Architecture를 "우선 검토"하게 하는지와 그 이유·반대 조건·추가 질문만 보여준다.
import type { DiscoveryCategory } from './cloudAxDiscovery';
import type { ModelName } from './cloudAxMatrix';

export interface Option { id: string; label: string; leans: ModelName[]; reason: string; caution?: string }
export interface Requirement { id: string; label: string; question: string; category: DiscoveryCategory; options: Option[] }

export const requirements: Requirement[] = [
  { id: 'workload', label: 'Business workload', question: '대상은 어떤 종류의 업무입니까?', category: 'Business', options: [
    { id: 'channel', label: '고객 채널·신규 서비스', leans: ['Public Cloud', 'Hybrid'], reason: '변화가 빠르고 변동이 큰 서비스는 Cloud 활용 후보', caution: '코어 연동·개인신용정보 범위 확인' },
    { id: 'core', label: '코어·계정계 거래', leans: ['On-premises', 'Private Cloud', 'Hybrid'], reason: '정합성·근접성·직접 통제가 중요해 내부 또는 경계 설계가 후보', caution: '일률적으로 Cloud 불가로 단정하지 않고 중요도 평가 결과를 받음' },
    { id: 'internal-ai', label: '직원용 AI·지식검색', leans: ['Hybrid', 'Private AI', 'Public Cloud'], reason: '문서 권한과 모델 운영 방식에 따라 갈림' },
  ] },
  { id: 'criticality', label: 'Transaction criticality', question: '서비스가 중단되면 거래·대외 업무에 어떤 영향이 있습니까?', category: 'Availability', options: [
    { id: 'high', label: '고객 거래 중단 등 영향이 큼', leans: [], reason: '모든 모델에서 이중화·DR 설계 비중이 커지고 중요 업무 평가 결과에 따라 절차가 깊어짐', caution: '이용 절차·복구 테스트 증적 일정 확인' },
    { id: 'low', label: '보조·조회 업무', leans: ['Public Cloud', 'Hybrid'], reason: '영향이 작아 선택 폭이 넓음' },
  ] },
  { id: 'procurement', label: 'Procurement', question: '조달·계약 구조의 제약은?', category: 'Procurement', options: [
    { id: 'long', label: '장비 입찰·장기 조달 일정이 있다', leans: ['On-premises', 'Private Cloud', 'Private AI'], reason: '소유 자원은 조달 리드타임이 일정을 좌우', caution: '입찰 일정과 사업 일정 정합성 확인' },
    { id: 'contract', label: '기존 CSP·MSP 계약 또는 지정 파트너가 있다', leans: ['Public Cloud', 'Hybrid'], reason: '기존 계약 활용이 가능한 구조가 후보', caution: '재위탁·계약 조건 확인' },
  ] },
  { id: 'data', label: 'Data sensitivity', question: '처리할 데이터를 외부 Cloud로 보낼 수 있습니까?', category: 'Data', options: [
    { id: 'no', label: '외부로 보낼 수 없다', leans: ['On-premises', 'Private Cloud', 'Private AI'], reason: 'Data boundary를 내부로 고정해야 하므로 내부 보관·처리 구조가 우선 후보', caution: '내부 Cloud화(Private Cloud)나 AI 배치(Private AI)는 인프라 종류와 별개로 따로 확인' },
    { id: 'partial', label: '일부만 가능(비식별·분리 가능)', leans: ['Hybrid'], reason: '핵심 데이터는 내부에 두고 일부 처리·서비스만 Cloud로 나누는 구조가 후보' },
    { id: 'yes', label: '정책상 외부 처리 가능', leans: ['Public Cloud', 'Hybrid'], reason: '외부 Cloud를 직접 쓰거나 내부 연계를 병행하는 구조가 후보', caution: '이용 절차(중요도 평가·위탁·보고 등)는 별도 확인' },
    { id: 'unknown', label: '아직 모른다', leans: [], reason: '데이터 경계를 먼저 확정해야 모델 비교가 의미가 있음' },
  ] },
  { id: 'legacy', label: 'Legacy dependency', question: '기존 시스템과 어떻게 연결됩니까?', category: 'Legacy', options: [
    { id: 'realtime', label: '계정계 등과 실시간 연동', leans: ['On-premises', 'Hybrid', 'Private Cloud'], reason: '내부 시스템과의 근접성·연계 지연이 중요해 내부 또는 경계 설계가 핵심' },
    { id: 'api', label: 'API·배치로 분리 가능', leans: ['Public Cloud', 'Hybrid'], reason: '경계를 API로 나눌 수 있어 Cloud 배치 후보가 넓어짐' },
    { id: 'none', label: '독립된 신규 서비스', leans: ['Public Cloud'], reason: '기존 시스템 제약이 적어 Cloud 활용 후보' },
  ] },
  { id: 'internet', label: 'Internet restriction', question: '인터넷 경유가 가능합니까?', category: 'Network', options: [
    { id: 'blocked', label: '내부망만 허용', leans: ['On-premises', 'Private Cloud', 'Private AI', 'Hybrid'], reason: '외부 경유 없이 동작하는 구조 또는 전용 연결 기반 구조가 필요', caution: 'Hybrid는 전용 연결·Private 접근 설계가 필수' },
    { id: 'limited', label: '전용선·Private 접근만 허용', leans: ['Hybrid', 'Public Cloud'], reason: '전용 연결과 Private 접근으로 Cloud 연동이 가능한 구조' },
    { id: 'open', label: '통제된 인터넷 경유 허용', leans: ['Public Cloud'], reason: '경계 통제를 전제로 Cloud 서비스 접근 가능' },
  ] },
  { id: 'latency', label: 'Network latency', question: '허용 응답 시간은 어느 정도입니까?', category: 'Performance', options: [
    { id: 'tight', label: '내부 시스템에 근접해야 한다(매우 짧다)', leans: ['On-premises', 'Private Cloud', 'Hybrid'], reason: '내부 시스템과의 왕복을 줄이는 배치가 유리', caution: 'Hybrid는 경계 구간 지연을 측정해야 함' },
    { id: 'relaxed', label: '수 초까지 허용', leans: ['Public Cloud', 'Hybrid', 'Private AI'], reason: '위치 선택의 폭이 넓어 다른 요건이 선택을 좌우' },
  ] },
  { id: 'traffic', label: 'Traffic variability', question: '수요는 일정합니까?', category: 'Performance', options: [
    { id: 'spiky', label: '변동이 크거나 예측이 어렵다', leans: ['Public Cloud', 'Hybrid'], reason: '탄력적 확장 또는 피크를 Cloud로 넘기는 구조가 후보' },
    { id: 'steady', label: '일정하고 예측 가능하다', leans: ['On-premises', 'Private Cloud', 'Private AI'], reason: '용량 계획이 가능해 소유 자원의 경제성이 후보가 될 수 있음', caution: '활용률 가정이 틀리면 결과가 뒤집히므로 TCO 확인' },
  ] },
  { id: 'gpu', label: 'GPU demand', question: 'GPU/NPU 수요와 보유 상황은?', category: 'Cost', options: [
    { id: 'small', label: '소규모·PoC', leans: ['Public Cloud'], reason: '사용량 기반으로 시작해 수요를 확인하는 구조가 후보' },
    { id: 'owned', label: '이미 보유했고 상시 추론 수요가 있다', leans: ['On-premises', 'Private AI'], reason: '보유 자원을 활용하는 구조가 경제성 후보', caution: '활용률 목표와 운영 인력 확인' },
    { id: 'large', label: '대규모 학습·추론이 필요하다', leans: ['Public Cloud', 'Private AI'], reason: '확보 방식(예약/직접 조달)에 따라 후보가 갈림', caution: '가용성·조달 리드타임 확인' },
  ] },
  { id: 'staff', label: 'Internal operation capability', question: '인프라·모델 운영 인력이 있습니까?', category: 'Operations', options: [
    { id: 'low', label: '부족하다', leans: ['Public Cloud', 'Hybrid'], reason: '관리형 서비스로 운영 부담을 줄이는 구조가 후보' },
    { id: 'high', label: '충분하다(인프라·모델 운영 가능)', leans: ['On-premises', 'Private Cloud', 'Private AI'], reason: '직접 운영이 가능해 소유·전용 구조가 후보' },
  ] },
  { id: 'managed', label: 'Managed service need', question: '관리형 서비스를 활용해야 합니까?', category: 'Operations', options: [
    { id: 'need', label: '필요하다(관리형 DB·모델 API 등)', leans: ['Public Cloud', 'Hybrid'], reason: '관리형 기능이 제공되는 Cloud 활용이 후보' },
    { id: 'direct', label: '직접 통제하고 싶다', leans: ['On-premises', 'Private Cloud', 'Private AI'], reason: '구성과 운영을 직접 통제하는 구조가 후보' },
  ] },
  { id: 'residency', label: 'Data location (Residency)', question: '데이터 보관 위치 요구는?', category: 'Data', options: [
    { id: 'domestic', label: '국내 보관이 필수다', leans: ['On-premises', 'Private Cloud', 'Private AI', 'Hybrid'], reason: '내부 보관 또는 보관 위치를 통제할 수 있는 구조가 후보', caution: 'Public Cloud는 국내 리전·백업·국외 이전 여부 확인 후 가능 여부를 판단' },
    { id: 'flexible', label: '리전 선택이 가능하면 충분하다', leans: ['Public Cloud', 'Hybrid'], reason: '리전 선택·계약으로 충족 가능한지 확인하는 구조가 후보' },
  ] },
  { id: 'rto', label: 'RTO/RPO', question: '복구 목표는 어느 수준입니까?', category: 'DR/BCP', options: [
    { id: 'strict', label: '엄격하다(분 단위, Region/센터 장애 포함)', leans: [], reason: '모든 모델에서 DR 설계 비중이 커지며 위치를 나눈 이중화가 필요', caution: '같은 CSP·센터 안 DR의 한계를 확인' },
    { id: 'relaxed', label: '비교적 완화되어 있다', leans: [], reason: 'DR이 모델 선택을 좌우하지 않음' },
  ] },
  { id: 'budget', label: 'Budget model', question: '예산은 어떻게 집행됩니까?', category: 'Cost', options: [
    { id: 'capex', label: '자산화(CapEx) 예산이 있다', leans: ['On-premises', 'Private Cloud', 'Private AI'], reason: '소유 자원 투자가 가능한 구조' },
    { id: 'opex', label: '사용량(OpEx) 예산이다', leans: ['Public Cloud', 'Hybrid'], reason: '사용량 기반 과금 구조가 맞는 후보' },
  ] },
  { id: 'speed', label: 'Time-to-market', question: '얼마나 빨리 시작해야 합니까?', category: 'Business', options: [
    { id: 'fast', label: '빠른 PoC가 필요하다', leans: ['Public Cloud'], reason: '자원 확보가 빠른 구조로 가설을 먼저 검증' },
    { id: 'stable', label: '장기 안정 운영이 우선이다', leans: ['On-premises', 'Private Cloud', 'Private AI', 'Hybrid'], reason: '구축 속도보다 통제·안정이 우선인 구조' },
  ] },
  { id: 'ai', label: 'Model operation requirement', question: '어떤 모델을 어떻게 운영합니까?', category: 'AI', options: [
    { id: 'api', label: '상용 관리형 모델 API', leans: ['Public Cloud', 'Hybrid'], reason: '관리형 모델 API를 호출하는 구조가 후보', caution: '입력 데이터 범위와 호출 허용 경로 확인' },
    { id: 'open', label: '오픈 모델을 자체 운영', leans: ['Private AI', 'On-premises'], reason: '모델 서빙·평가를 직접 운영하는 구조가 후보', caution: '운영 역량·가속기·평가 체계 필요' },
    { id: 'mixed', label: '혼합(민감 데이터만 내부)', leans: ['Hybrid', 'Private AI'], reason: '민감 처리와 일반 처리를 나누는 구조가 후보' },
  ] },
];

// 모델별 고정 설명: 반대 옵션이 가능한 조건 / SA Handoff
export const modelGuide: Record<ModelName, { counter: string; handoff: string[]; risk: string }> = {
  'Public Cloud': { risk: '이용 절차·국외 이전·CSP 의존과 종료 계획을 늦게 확인하면 일정이 밀립니다.', counter: '데이터 경계가 내부 고정으로 확정되거나 이용 절차 일정이 사업 일정에 맞지 않으면 Hybrid 또는 내부 구조가 후보로 올라옵니다.', handoff: ['계정·네트워크·권한 구조', '이용 절차(중요도 평가·위탁·보고) 일정', 'DR 전략 선택'] },
  Hybrid: { risk: '연결 구간의 장애·암호화·권한 경계가 가장 큰 위험이며 이중 운영 비용이 늘 수 있습니다.', counter: '외부로 보낼 데이터가 사실상 없다면 내부 구조 단독이, 내부 연계가 거의 없다면 Public Cloud 단독이 단순합니다.', handoff: ['연결 구간(전용선/VPN/Private 접근)과 암호화', '데이터 흐름·권한 경계', '양쪽 장애 시나리오'] },
  'On-premises': { risk: '증설 리드타임과 운영 인력 부담, 활용률 가정이 틀릴 때의 비용 위험이 있습니다.', counter: '수요 변동이 커지거나 운영 인력이 부족하면 관리형 서비스를 쓰는 Hybrid/Public이 후보가 됩니다.', handoff: ['용량·장비·이중화 산정', '증설 리드타임과 조달', '운영·보안 체계'] },
  'Private Cloud': { risk: '플랫폼 운영 부담과 자동화 수준 기대 불일치가 위험입니다.', counter: '플랫폼 운영 부담이 크거나 자원 확장이 빠르게 필요하면 Public/Hybrid가 후보가 됩니다.', handoff: ['플랫폼 범위·자동화 수준', '테넌트 분리·권한', '용량·이중화'] },
  'Private AI': { risk: '가속기 활용률·모델 운영 역량·평가 체계 부족이 위험이며 ‘내부면 안전’이라는 가정이 위험합니다.', counter: 'GPU 활용률 가정이 낮거나 모델 운영 역량이 부족하면 관리형 모델 API(Hybrid/Public)가 후보가 됩니다.', handoff: ['모델·서빙·가속기 용량', '권한·로그·평가 구조', '장애 시 대체 수단'] },
};

// 요건 예시(시나리오). 클릭하면 선택이 채워지며 정답이 아니라 검토 출발점이다.
export const scenarios: { id: string; title: string; text: string; picks: Record<string, string> }[] = [
  { id: 's1', title: '내부 Data는 On-prem, Managed GenAI는 활용하고 싶다', text: '민감한 내부 Data는 On-prem에 유지하지만 Managed GenAI를 활용하고 싶다.', picks: { data: 'partial', managed: 'need', ai: 'mixed' } },
  { id: 's2', title: '기존 GPU 보유, 사내 LLM 장기 운영', text: '기존 GPU를 보유하고 있고 사내 LLM을 장기간 안정적으로 운영한다.', picks: { gpu: 'owned', traffic: 'steady', ai: 'open', staff: 'high' } },
  { id: 's3', title: '신규 고객 채널 서비스, 변동이 큰 트래픽', text: '독립된 신규 채널 서비스이며 트래픽 변동이 크다.', picks: { legacy: 'none', traffic: 'spiky', speed: 'fast' } },
];

export interface Pattern {
  id: string; title: string; situation: string;
  flow: { layer: string; nodes: string[] }[]; // 개념도(위 → 아래)
  why: string; components: string[]; security: string[]; regulation: string[]; discoveryIds: string[]; avoid: string[];
  caseIds: string[]; knowledgeIds: string[];
}

export const patterns: Pattern[] = [
  { id: 'p1', title: 'Public Cloud Web / Channel', situation: '신규 또는 변동이 큰 고객 채널·웹 서비스를 Cloud에서 운영하고 코어와는 API로 연결한다.',
    flow: [{ layer: '사용자', nodes: ['고객·직원'] }, { layer: 'Edge·Network', nodes: ['WAF/CDN', 'Load Balancer'] }, { layer: 'Application', nodes: ['웹·API', '컨테이너/서버'] }, { layer: 'Data', nodes: ['관리형 DB', '캐시'] }, { layer: '내부 연계', nodes: ['API Gateway', '전용선/VPN'] }, { layer: '통제', nodes: ['IAM', '암호화', '감사 로그', '모니터링'] }],
    why: '채널은 변동이 크고 변화가 빨라 탄력성과 배포 속도가 중요합니다. 단, 계정계와의 연동·개인정보 범위에 따라 설계가 달라집니다.',
    components: ['WAF·CDN', '컨테이너/서버 오케스트레이션', '관리형 DB·캐시', 'API Gateway', 'IAM·키 관리', '로그·모니터링'],
    security: ['권한 분리와 최소 권한', '전송·저장 암호화와 Key 관리', 'API 호출 인증·속도 제한', '접속 로그 보관 정책'],
    regulation: ['Cloud 이용 절차(업무 중요도 평가·위탁·이용 보고 등) 확인', '개인정보·개인신용정보 처리 범위 확인', '망 구분(내부업무망/DMZ)과 접속 경로 확인'],
    discoveryIds: ['b1', 'b5', 'b6', 'b10', 'b21', 'b25', 'b29'], avoid: ['핵심 거래를 외부 Cloud에 단독으로 올리는 구조를 업무 중요도 확인 없이 제안', '“채널이라 규제가 없다”고 설명'], caseIds: [], knowledgeIds: ['cloud-lifecycle', 'workload-criticality', 'network'] },
  { id: 'p2', title: 'On-prem ↔ AWS Hybrid 연결', situation: '내부 전산센터와 Cloud를 연결해 일부 워크로드·분석·DR을 Cloud에서 수행한다(예시로 AWS 서비스명을 사용, 다른 CSP도 같은 개념).',
    flow: [{ layer: '내부 전산센터', nodes: ['Core·내부 시스템', '내부 Data'] }, { layer: '연결', nodes: ['전용선', 'VPN(암호화)'] }, { layer: 'Cloud 경계', nodes: ['Transit/Gateway', 'Private 접근'] }, { layer: 'Cloud 워크로드', nodes: ['분석/서비스', 'DR 환경'] }, { layer: '통제', nodes: ['IAM', 'Key', '로그', '모니터링'] }],
    why: '내부 시스템·Data는 유지하면서 Cloud 기능을 단계적으로 활용하려는 경우 연결 구간이 설계의 핵심이 됩니다.',
    components: ['전용선/VPN', 'Transit/Gateway', 'Private 서비스 접근', 'Landing Zone(계정·네트워크 기준)', '통합 로그·모니터링'],
    security: ['전용선과 암호화는 별개 — 구간 암호화 방식 확인', '내외부 인증·권한 체계 일관성', '경계 구간의 로그와 이상 탐지'],
    regulation: ['Cloud 이용 절차와 위탁 검토', '내부-외부 데이터 흐름 검토', '연결 단절 시 업무 연속성 검토'],
    discoveryIds: ['b10', 'b12', 'b18', 'b21', 'b29', 'b30'], avoid: ['전용선이면 암호화도 해결된다고 설명', '연결 구간 장애 시나리오 없이 설계'], caseIds: ['jb'], knowledgeIds: ['direct-connect', 'private-connectivity', 'deployment-selection'] },
  { id: 'p3', title: 'Hybrid GenAI / RAG', situation: '핵심 데이터·문서는 내부에 두고, 생성형 AI 기능은 Cloud의 모델을 활용해 사내 업무를 지원한다.',
    flow: [{ layer: '사용자', nodes: ['임직원', 'SSO/MFA'] }, { layer: 'AI Application', nodes: ['업무 포털', '권한 확인'] }, { layer: 'RAG', nodes: ['문서 검색(내부)', '컨텍스트 구성'] }, { layer: 'Model', nodes: ['Cloud 모델 API', 'Guardrail'] }, { layer: '통제', nodes: ['감사 로그', '평가', 'Kill switch'] }],
    why: '민감 문서는 내부에 두면서 모델의 성능과 관리형 기능을 활용하는 구조입니다. 어떤 컨텍스트가 외부 모델로 나가는지가 핵심입니다.',
    components: ['문서 수집·인덱싱', '권한 반영 검색', '모델 API·Guardrail', '프롬프트·응답 로그', '평가·모니터링'],
    security: ['사용자별 문서 권한을 검색에 적용', '외부로 전달되는 컨텍스트 범위 통제·마스킹', '입력·출력 로그와 보관 정책', '이상 사용 시 차단 수단'],
    regulation: ['금융 AI 가이드라인의 위험관리·책임 체계', '개인정보·신용정보 포함 시 처리 범위 검토', '외부 모델·SaaS 책임소재 확인'],
    discoveryIds: ['b5', 'b13', 'b39', 'b41', 'b42', 'b43', 'b45'], avoid: ['“내부 문서라 안전하다”며 외부 모델로 나가는 컨텍스트 검토 생략', '공개 사례 구조를 고객 구조로 그대로 적용'], caseIds: ['jb'], knowledgeIds: ['jb-hybrid-deep-dive', 'rag', 'ai-governance'] },
  { id: 'p4', title: 'On-prem Private AI', situation: '모델 서빙과 RAG를 내부 전산센터의 GPU/NPU 환경에서 운영하고 업무 시스템과 연계한다.',
    flow: [{ layer: '사용자', nodes: ['임직원', '내부망'] }, { layer: 'AI Application / Agent', nodes: ['업무 앱', 'API·MCP 연계'] }, { layer: 'RAG', nodes: ['검색·벡터', '문서 권한'] }, { layer: 'Model Serving', nodes: ['모델 서빙', 'API 관리'] }, { layer: 'Infra', nodes: ['GPU/NPU', '컨테이너/가상화', '스토리지'] }, { layer: '통제', nodes: ['IAM', '로그', 'Observability', 'DR'] }],
    why: '데이터와 접근 통제를 내부에 유지하고 안정적인 추론 수요에 소유 자원을 활용하는 구조입니다. 구매가 플랫폼 완성은 아니며 서빙·권한·운영이 함께 필요합니다.',
    components: ['GPU/NPU 클러스터', '컨테이너·가상화', '모델 서빙·API 관리', 'RAG·벡터 검색', 'Observability·평가', '기존 시스템 연계'],
    security: ['내부망 분리와 접근 통제', '모델·프롬프트 변경 관리', '프롬프트·응답 로그', 'Agent 권한 최소화'],
    regulation: ['망·데이터 검토는 위치와 별개로 필요', '금융 AI 가이드라인의 평가·책임 체계', 'BCP/DR — 모델·벡터·문서를 함께 복구'],
    discoveryIds: ['b25', 'b33', 'b36', 'b38', 'b40', 'b45', 'b49'], avoid: ['“On-prem AI면 안전하다”고 설명', 'GPU 활용률·운영 인력 가정 없이 구축 제안'], caseIds: ['jeju', 'ibk', 'ksfc'], knowledgeIds: ['private-ai', 'model-serving', 'gpu-npu'] },
  { id: 'p5', title: 'Cloud DR', situation: '내부 센터 또는 한 Cloud 환경의 장애에 대비해 다른 위치(Cloud/Region)에 복구 환경을 둔다.',
    flow: [{ layer: '운영 환경', nodes: ['내부 센터 또는 Cloud'] }, { layer: '복제', nodes: ['데이터 복제', '백업'] }, { layer: '복구 환경', nodes: ['Pilot light / Warm standby'] }, { layer: '전환', nodes: ['DNS/트래픽 전환', '복구 절차'] }, { layer: '검증', nodes: ['복구 테스트', 'RTO/RPO 측정'] }],
    why: 'DR은 고가용성(HA)과 다릅니다. 장애 범위(AZ, Region, 센터, CSP)별로 복구 목표를 정하고 실제 테스트로 입증합니다.',
    components: ['백업·복제', '복구 환경(전략별)', '트래픽 전환', '복구 자동화·절차서', '테스트 계획'],
    security: ['백업 데이터 접근·암호화', '복구 환경의 권한 분리', '랜섬웨어·데이터 손상 시 격리 복구'],
    regulation: ['업무지속성 확보대책의 점검과 이중화 요구 확인', '같은 CSP 안 DR의 동시 장애·국외 이전 확인'],
    discoveryIds: ['b1', 'b29', 'b30', 'b31', 'b32'], avoid: ['Multi-AZ·Snapshot 보유를 DR 완료로 설명', '문서상 RTO/RPO만 확인하고 복구 테스트 생략'], caseIds: [], knowledgeIds: ['bcp-dr-rto-rpo', 'aws-resilience', 'cloud-resilience'] },
  { id: 'p6', title: 'Research & Development AI 환경', situation: '연구·개발 목적의 망분리 예외 범위에서 AI·SaaS를 활용하는 개발·테스트 환경을 구성한다.',
    flow: [{ layer: '연구개발망', nodes: ['개발자', '테스트 환경'] }, { layer: '경계', nodes: ['접근 통제', '데이터 반입 통제'] }, { layer: 'AI/SaaS', nodes: ['AI 개발 도구', '모델 API'] }, { layer: '운영망', nodes: ['운영 환경과 분리'] }, { layer: '통제', nodes: ['로그', '보안 점검'] }],
    why: '연구개발망 예외는 내부업무망 SaaS 예외·생성형 AI 혁신금융서비스와 다른 경로입니다. 운영 데이터를 개발 환경으로 옮기는 흐름이 핵심 위험입니다.',
    components: ['연구개발망 경계', '개발 도구·모델 접근', '데이터 반입 통제', '운영망과 분리', '보안 점검 체계'],
    security: ['운영 데이터의 개발 환경 반입 통제', '접근·세션 기록', '보안 해설서의 통제 항목 이행'],
    regulation: ['연구개발 목적 망분리 예외의 대상·조건 확인', 'SaaS 예외·혁신금융서비스와 구분'],
    discoveryIds: ['b11', 'b13', 'b15', 'b16'], avoid: ['연구개발망 예외와 내부업무망 SaaS 예외를 같은 것으로 설명', '운영 데이터를 통제 없이 개발 환경에서 사용'], caseIds: [], knowledgeIds: ['research-network', 'saas-network-exception', 'ai-saas'] },
  { id: 'p7', title: 'Internal Knowledge Assistant', situation: '직원이 내부 지식(규정·상품·업무 매뉴얼)을 검색·질의하고 근거와 함께 답을 받는 업무 지원 도구.',
    flow: [{ layer: '사용자', nodes: ['직원', 'SSO'] }, { layer: '검색', nodes: ['문서 인덱스', '권한 필터'] }, { layer: '생성', nodes: ['모델', '근거 인용'] }, { layer: '운영', nodes: ['문서 갱신 승인', '피드백'] }, { layer: '통제', nodes: ['로그', '평가', '오답 신고'] }],
    why: '고객 대면 Agent보다 먼저 직원용 지식검색형 서비스가 운영되는 사례가 공개되어 있습니다(사례 참조). 문서 권한과 갱신 책임이 품질을 좌우합니다.',
    components: ['문서 수집·정제', '권한 반영 검색', '모델 호출', '근거 인용 UI', '문서 갱신·승인 프로세스', '평가·피드백'],
    security: ['문서 권한 상속', '민감 문서 제외 기준', '프롬프트·응답 로그'],
    regulation: ['금융 AI 가이드라인의 책임 체계(최종 책임은 임직원)', '개인정보·신용정보 포함 여부 확인'],
    discoveryIds: ['b4', 'b41', 'b42', 'b43', 'b46'], avoid: ['권한 모델 없이 전사 문서를 일괄 색인', '답변 근거 없이 오답 책임을 모호하게 둠'], caseIds: ['kb', 'shinhan', 'jeju'], knowledgeIds: ['rag', 'ax-stack', 'agent'] },
];

// 대표 Pattern 보강: Data flow와 Operations
export const patternExtra: Record<string, { dataFlow: string[]; operations: string[] }> = {
  p1: { dataFlow: ['사용자 요청 → WAF/로드밸런서 → 웹·API', 'API → 관리형 DB(고객 데이터 범위 확인)', '필요 시 API Gateway → 전용선/VPN → 내부 코어(최소 데이터만)'], operations: ['배포·변경 승인과 롤백', '계정·권한 정기 검토', '로그 보관과 모니터링', '비용(FinOps) 점검'] },
  p2: { dataFlow: ['내부 시스템 → 전용선/VPN(암호화 방식 확인) → Cloud 경계 → 워크로드', '데이터 반출 대상·주기를 사전에 정의', 'DR 목적이면 복제 방향과 복구 방향을 구분'], operations: ['연결 구간 이중화·장애 전환', '내외부 통합 모니터링', '양쪽 변경 관리 일치', '연결 단절 시 대체 절차'] },
  p3: { dataFlow: ['사용자 질의 → 권한 확인 → 내부 문서 검색', '검색 결과 일부(컨텍스트)만 마스킹해 Cloud 모델로 전달', '응답 + 근거 → 사용자, 프롬프트·응답은 로그로 보관'], operations: ['문서 갱신·승인 프로세스', '모델·프롬프트 변경 승인과 평가', '오답 신고·중단', '호출량·비용 모니터링'] },
  p4: { dataFlow: ['사용자 → 내부망 앱 → 권한 반영 검색 → 내부 모델 서빙', '업무 시스템 연계는 API/MCP로 최소 권한', '로그·평가 데이터는 내부에 보관'], operations: ['GPU 활용률·용량 관리', '모델 서빙·버전 운영', 'LLMOps(평가·롤백)', '복구 대상(모델·벡터·문서) 훈련'] },
  p5: { dataFlow: ['운영 환경 → 복제/백업 → 복구 환경', '장애 시 트래픽 전환 → 복구 환경 서비스', '복구 후 원복(fail-back) 경로 정의'], operations: ['정기 복구 테스트와 결과 기록', 'RTO/RPO 측정', '백업 데이터 접근 통제', '절차서 갱신'] },
  p6: { dataFlow: ['개발자 → 연구개발망 → AI 도구/모델(허용 범위)', '운영 데이터는 가명 처리 등 조건을 충족한 것만 반입', '개발 산출물 → 승인된 단방향 경로 → 운영 반영'], operations: ['반입·반출 승인 체계', '정기 위험성 평가(예: 연 1회 점검)', '보호대책 변경 시 재심의', '운영망과 분리 점검'] },
  p7: { dataFlow: ['직원 질의 → 권한 필터 → 문서 인덱스 검색', '선택된 근거 문서 + 질의 → 모델 → 답변·근거', '피드백·오답 신고 → 문서/프롬프트 개선'], operations: ['문서 소유자와 갱신 주기', '평가·오답 처리', '권한 변경 반영', '사용 로그 리뷰'] },
};
