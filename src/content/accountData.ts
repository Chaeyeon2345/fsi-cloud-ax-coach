// 금융 고객사 지도 시드 (핵심 공략계정 중심, 전체 금융회사가 아님).
// 원칙
//  1) 회사 목록은 업권별 협회·기관 명부(INSTITUTION_ROSTER)로 확인한 회사만 넣는다. 확인하지 못한 경우 rosterNote로 사실을 남긴다.
//  2) 사업(Initiative)은 열어서 확인한 공개 자료만 쓴다. 공개되지 않은 CSP·Architecture·Model·계약금액은 쓰지 않는다.
//     발표·수주·MOU·지정은 구축·운영과 구분한다. "확인된 공개자료 없음"은 "사업 없음"이 아니다.
//  3) AI 성숙도 점수는 만들지 않는다. 공개 사실(사업·조직·책임자·규모)과 근거만 저장하고, 모르면 비워 둔다. 고객별 영업 가설·공략 메모는 이 공개 Seed에 넣지 않는다.
//  4) 기존 Case(KB국민은행 등 10건)는 relatedCaseIds로 연결만 하고 데이터를 복사하지 않는다.
// 조사일: 2026-10-11. 출처 분류: 회사·CSP/MSP/SI 공식 = Tier B, 전문언론 = Tier C, 금융당국 = Tier A.
import { regulatoryCategoryOf, type DeploymentModel, type FinancialInstitution, type FinancialSector, type InitiativeCategory, type InitiativeStatus, type InstitutionInitiative, type MarketGroup, type PublicOrganizationReference, type Source, type SourceType } from '../domain/types';
import { CATEGORY_KEYWORD, CSP_NAMES, DOMAIN_OF_CATEGORY, inferDomains, MSP_SI_NAMES, extractKeywords } from '../domain/accounts';
import { source, V1011 } from './sourceKit';
import { newInitiatives, universeEntries, universeSources, type NewInitiative } from './accountUniverse';
import { assetData, deepResearchIds, hqData, enrichmentSources, initiativeEnrichment, leaderSeeds } from './accountEnrichment';
import { amTakeawayFor, discoveryQuestionsFor } from '../features/initiativeInsights';

const RESEARCHED = '2026-10-11';
const sources: Source[] = [];
const registered = new Set<string>();
// 사업 근거 Source 등록 (같은 key는 한 번만). 모두 사업·사례 자료이므로 180일 재확인 기준(DELIVERY_CASE)이다.
function src(key: string, title: string, publisher: string, tier: Source['tier'], url: string, published: string, notes?: string): string {
  const id = `acct-${key}`;
  if (!registered.has(id)) {
    registered.add(id);
    sources.push(source(id, title, publisher, tier, 'DELIVERY_CASE', url, { published, verified: V1011, notes }));
  }
  return id;
}
// 회사 명부 Source (협회·기관 공식 명부)
function roster(key: string, title: string, publisher: string, url: string, notes?: string): string {
  const id = `roster-${key}`;
  if (!registered.has(id)) {
    registered.add(id);
    sources.push(source(id, title, publisher, 'B', 'INSTITUTION_ROSTER', url, { verified: V1011, notes }));
  }
  return id;
}
const R = {
  kfb: roster('kfb', '전국은행연합회 회원사 정보 · 정사원(은행)', '전국은행연합회', 'https://www.kfb.or.kr/member/list_regular.php', '정사원 23개 항목을 로고 이미지의 대체 텍스트로 확인했습니다. 은행 외 기관(한국수출입은행·신용보증기금 등)도 포함된 목록입니다.'),
  card: roster('crefia-card', '여신금융협회 회원사 안내 · 신용카드사', '여신금융협회', 'https://www.crefia.or.kr/portal/company/membership/membershipIntroduction.xx?coCodeSubId=1', '정회원·준회원 구분이 있습니다. BC카드는 명부에 “비씨카드”로 표기됩니다.'),
  lease: roster('crefia-lease', '여신금융협회 회원사 안내 · 리스·할부금융사', '여신금융협회', 'https://www.crefia.or.kr/portal/company/membership/membershipIntroduction.xx?coCodeSubId=2'),
  sec: roster('kofia', '금융투자협회 회원사 · 증권', '금융투자협회', 'https://kofia.or.kr/members/m_62/sub020201.do?page=1&srchCate=4&srchTp=&srchWord=&pitem=100', '페이지 헤더는 “선물”로 고정 표시되며 증권(srchCate=4) 목록 60개사를 확인했습니다. IBK투자증권은 명부에 “아이비케이투자증권”으로 표기됩니다.'),
  life: roster('klia', '생명보험협회 회원사 안내', '생명보험협회', 'https://www.klia.or.kr/klia/company/member/list.do'),
  nonlife: roster('knia', '손해보험협회 회원사', '손해보험협회', 'https://www.knia.or.kr/about/partner/partner01', '삼성화재·현대해상·메리츠화재는 명부에 “…해상(화재)보험” 등 정식 상호로 표기됩니다.'),
  sb: roster('fsb', '저축은행중앙회 경영공시 · 권역별 저축은행 목록', '저축은행중앙회', 'https://www.fsb.or.kr/mobbusmagefina_0100.act', '회원사 소개 페이지는 열리지 않아 경영공시 바로가기의 권역별 목록(표기명 기준)으로 확인했습니다.'),
};

interface RawInit {
  title: string; date?: string; category: InitiativeCategory; status: InitiativeStatus; summary: string;
  models?: DeploymentModel[]; vendors?: string[]; caseId?: string; srcs: string[];
  dept?: string[]; // 근거 Source(srcs)에 명시된 추진조직명만
  stageUnstated?: boolean; // 원문에 단계가 명시되지 않은 경우 true → sourceStage를 비운다
}
interface Raw {
  id: string; name: string; marketGroup: MarketGroup; sector: FinancialSector; roster: string; rosterNote?: string;
  group?: { name: string; srcId: string }; website?: string; tier?: 'A' | 'B' | 'C';
  cases?: string[]; initiatives?: RawInit[];
  sub?: string; hqx?: { region: string; district: string | null; src: string }; assetx?: { won: number; equityWon: number | null; asOf: string; src: string };
}
const FIRST: MarketGroup = 'FIRST_FINANCIAL_SECTOR';
const SECOND: MarketGroup = 'SECOND_FINANCIAL_SECTOR';

// ── 그룹 소속 근거 (공식 명부가 아닌 회사·보도 자료. 근거가 있는 회사만 financialGroup을 채운다) ──
const G = {
  kbGenai: src('byline-kb-genai', 'KB금융, 그룹 공동 생성형 AI 플랫폼 오픈', '바이라인네트워크', 'C', 'https://byline.network/2025/05/15-457/', '2025-05-15'),
  shinhanGroup: src('shinhan-group-site', '신한금융그룹 공식 사이트(계열사 목록)', '신한금융그룹', 'B', 'https://www.shinhangroup.com', '2026-10-11', '계열사 목록(Family site)에서 신한은행 표기를 확인했다는 조사 기록입니다. 페이지 구조는 바뀔 수 있습니다.'),
  shinhanLifeSite: src('shinhanlife-site', '신한라이프생명 공식 사이트', '신한라이프생명', 'B', 'https://www.shinhanlife.co.kr', '2026-10-11'),
  wooriGroupNews: src('mtn-woori-group', '우리금융그룹 관련 보도(우리은행)', '머니투데이방송', 'C', 'https://news.mtn.co.kr/news-detail/2025082016355896893/share-modal', '2025-08-20'),
  wooriCardLg: src('lg-woori-card', 'LG유플러스 보도자료(우리금융그룹 계열 우리카드 표기)', 'LG유플러스', 'B', 'https://lg.co.kr/media/release/26115', '2026-10-11'),
  jbCapital: src('byline-jb-capital', 'JB우리캐피탈 생성형 AI 플랫폼 보도(JB금융그룹 표기)', '바이라인네트워크', 'C', 'https://byline.network/2026/03/18-557/', '2026-03-18'),
};

const raw: Raw[] = [
  // ───── 은행·인터넷은행 ─────
  { id: 'kb-bank', name: 'KB국민은행', marketGroup: FIRST, sector: 'BANK', roster: R.kfb, tier: 'A', website: 'http://www.kbstar.com/', group: { name: 'KB금융그룹', srcId: G.kbGenai }, cases: ['kb'],
    initiatives: [
      { title: '직원용 생성형 AI 상담 챗봇', date: '2025-07', category: 'GENAI', status: 'PRODUCTION', summary: '직원의 고객 상담을 지원하는 생성형 AI 챗봇 운영. 상세는 사례를 참조하세요.', caseId: 'kb', srcs: ['kb'] },
      { title: 'KB금융 그룹 공동 생성형 AI 플랫폼(KB GenAI 포털) 오픈', date: '2025-05-15', category: 'AI_AGENT', status: 'PRODUCTION', summary: 'KB금융지주와 KB국민은행, KB증권 등 계열사가 협업한 그룹 공동 생성형 AI 플랫폼이 열렸다. 에이전트는 순차 탑재하며 향후 3년간 17개 업무영역에 90여개 에이전트 도입 계획이 보도됐다.', srcs: [G.kbGenai] },
    ] },
  { id: 'shinhan-bank', name: '신한은행', marketGroup: FIRST, sector: 'BANK', roster: R.kfb, tier: 'A', website: 'http://www.shinhan.com/', group: { name: '신한금융그룹', srcId: G.shinhanGroup }, cases: ['shinhan'],
    initiatives: [{ title: 'AI ONE / GPT 연계 금융지식 Q&A', date: '2025-05-12', category: 'GENAI', status: 'PRODUCTION', summary: '직원 업무지식 검색과 고객 상담을 지원하는 GPT 연계 금융지식 Q&A 서비스 오픈이 보도됐다. 상세는 사례를 참조하세요.', caseId: 'shinhan', srcs: ['shinhan'] }] },
  { id: 'hana-bank', name: '하나은행', marketGroup: FIRST, sector: 'BANK', roster: R.kfb, tier: 'A', website: 'http://www.kebhana.com/',
    initiatives: [
      { title: '아이부자 3.0 퍼블릭 클라우드 구축', date: '2025-02-18', category: 'CLOUD', status: 'COMPLETED', summary: 'kt ds가 하나은행 아이부자 3.0의 퍼블릭 클라우드 구축을 마쳤다고 발표했다. 하나은행은 자체 프라이빗 클라우드와 랜딩존을 구축한 뒤 서비스를 단계적으로 퍼블릭 클라우드로 옮기며 아이부자가 첫 이전 서비스라고 보도됐다.', models: ['Hybrid', 'Private Cloud', 'Public Cloud'], vendors: ['kt ds'],
        srcs: [src('fnnews-hana-ibuja', 'kt ds, 하나은행 아이부자 3.0 퍼블릭 클라우드 구축', '파이낸셜뉴스', 'C', 'https://www.fnnews.com/news/202502180928003241', '2025-02-18', '연합뉴스 기사 전재. CSP명·리전·금액은 기사에 없습니다.')] },
      { title: '메가존클라우드와 AI 클라우드 협력 업무협약', date: '2026-01-23', category: 'AI_INFRA_GPU_NPU', status: 'ANNOUNCED', summary: '메가존클라우드가 AI 데이터센터용으로 수입할 GPU/NPU 서버에 대한 금융 지원과 지분 투자를 추진하기로 협약했다. 하나은행 자체 AI 인프라 구축이 아니라 고객사 금융 지원 성격이며 추진 계획 단계다.', vendors: ['메가존클라우드'],
        srcs: [src('byline-hana-mzc', '메가존클라우드-하나은행, 디지털 혁신 금융 서비스 발굴 협력', '바이라인네트워크', 'C', 'https://byline.network/2026/01/26-524/', '2026-01-26')] },
    ] },
  { id: 'woori-bank', name: '우리은행', marketGroup: FIRST, sector: 'BANK', roster: R.kfb, tier: 'A', website: 'http://www.wooribank.com/', group: { name: '우리금융그룹', srcId: G.wooriGroupNews },
    initiatives: [
      { title: 'AX를 위한 AI 에이전트 구축(AI 에이전트 뱅킹)', date: '2026-04-07', category: 'AI_AGENT', status: 'ANNOUNCED', summary: '삼성SDS가 우선협상대상자로 선정됐다. 5개 영역 29개 핵심업무에 175개 이상 AI 에이전트를 FabriX 기반으로 구축하는 계획이며 5월 착수, 12월 약 90개 우선 공개, 이후 단계 확대 일정이 발표됐다. 이후 계약·구축 진행 여부는 확인하지 못했다.', vendors: ['삼성SDS'], srcs: ['financial-channel'] },
      { title: 'AI 챗봇·상담봇 재구축(에이전틱 AICC)', date: '2026-08-31', category: 'CONTACT_CENTER', status: 'BUILDING', summary: 'KT가 우리은행 AI 챗봇·상담봇 재구축 사업자로 선정돼 착수한다고 밝혔다. AI 뱅커와 AI Agent를 연계하는 에이전틱 AICC를 구축한다. 계약금액은 기사에 없다.', vendors: ['KT'],
        srcs: [src('mtn-woori-aicc', '“고객 의도 파악 높인다”…KT, 우리은행 AI 상담 시스템 재구축 착수', '머니투데이방송', 'C', 'https://news.mtn.co.kr/news-detail/2026083111271923186', '2026-08-31')] },
    ] },
  { id: 'nh-bank', name: 'NH농협은행', marketGroup: FIRST, sector: 'BANK', roster: R.kfb, tier: 'A', website: 'https://banking.nonghyup.com/nhbank.html',
    initiatives: [{ title: '차세대 컨택센터(AICC) 구축', date: '2026-08-12', category: 'CONTACT_CENTER', status: 'COMPLETED', summary: '2025년 7월 착수회의를 열고 은행·농협상호금융 IPCC/AICC를 재구축했다. AI 콜봇, 생성형 AI 상담지원, 고객여정 통합상담을 포함하며 2026년 8월 준공보고회를 열었다고 보도됐다. 상용 운영 개시 여부는 확정하지 못했다.', vendors: ['KT'],
      srcs: [src('smarttoday-nh-cc', 'NH농협은행, 차세대 컨택센터 고도화 사업 착수', '스마트투데이', 'C', 'https://www.smarttoday.co.kr/ko-kr/articles/84628', '2025-07-01'), src('metroseoul-nh-cc', 'NH농협은행, AI 컨택센터 오픈', '메트로신문', 'C', 'https://www.metroseoul.co.kr/article/20260812500338', '2026-08-12')] }] },
  { id: 'ibk-bank', name: 'IBK기업은행', marketGroup: FIRST, sector: 'BANK', roster: R.kfb, tier: 'A', website: 'http://www.ibk.co.kr/' },
  { id: 'im-bank', name: 'iM뱅크', marketGroup: FIRST, sector: 'BANK', roster: R.kfb, tier: 'B', website: 'http://www.dgb.co.kr',
    initiatives: [{ title: 'AX추진부 신설(생성형 AI 인프라 구축·유스케이스 발굴)', date: '2025-12-02', category: 'GENAI', status: 'ANNOUNCED', summary: '2025년 11월 초 디지털Biz그룹 산하에 AX추진부를 신설했다. 생성형 AI 서비스 유스케이스 발굴과 인프라 구축을 담당할 예정이라는 보도다. 조직 신설이며 시스템 구축 완료가 아니다.',
      srcs: [src('byline-im-ax', '[단독] iM뱅크, AI·블록체인 전담 AX추진부 신설', '바이라인네트워크', 'C', 'https://byline.network/2025/12/1202/', '2025-12-02')] }] },
  { id: 'jeju-bank', name: '제주은행', marketGroup: FIRST, sector: 'BANK', roster: R.kfb, tier: 'A', website: 'http://www.e-jejubank.com', cases: ['jeju'],
    initiatives: [{ title: 'On-premises 생성형 AI / Agent 플랫폼', date: '2026-03', category: 'GENAI', status: 'PRODUCTION', summary: '보안·망분리 환경에서 직원이 업무 AI Agent를 만들고 활용하는 플랫폼. 공급사 공개 사례 기준 운영 중이며 운영 개시일은 미공개다. 상세는 사례를 참조하세요.', models: ['On-premises'], vendors: ['플래티어', 'KT'], caseId: 'jeju', srcs: ['jeju', 'jeju-award'] }] },
  { id: 'kakao-bank', name: '카카오뱅크', marketGroup: FIRST, sector: 'INTERNET_BANK', roster: R.kfb, tier: 'B', website: 'https://www.kakaobank.com',
    initiatives: [{ title: '“카카오뱅크 AI” 통합 출시', date: '2025-12-15', category: 'CHANNEL', status: 'PRODUCTION', summary: 'AI 검색·금융계산기·AI 이체·상담챗봇을 하나의 대화창으로 통합하고 홈에 AI 탭을 신설했다. LLM 기반 라우터가 의도를 파악해 서비스를 연결한다는 설명이다. 사용 모델·인프라는 기사에 없다.',
      srcs: [src('etnews-kakao-ai', "'AI뱅크'로 달리는 인터넷은행…기술주도권 경쟁 치열", '전자신문', 'C', 'https://www.etnews.com/20251215000252?m=1', '2025-12-15')] }] },
  { id: 'k-bank', name: '케이뱅크', marketGroup: FIRST, sector: 'INTERNET_BANK', roster: R.kfb, tier: 'B', website: 'http://www.kbanknow.com',
    initiatives: [
      { title: '금융 특화 프라이빗 LLM 도입', date: '2025-02-26', category: 'GENAI', status: 'COMPLETED', summary: '인터넷은행 최초로 금융 특화 프라이빗 LLM을 도입했다고 발표했다. 내부 서버에서 데이터를 유지하는 방식이며 직원용 대화형 AI·보고서 자동생성 등에 활용 예정, 고객용 AI 에이전트는 검토 중이다. 운영 범위는 기사에 명확하지 않다.', models: ['Private AI'], vendors: ['KT', 'KT클라우드', '업스테이지'],
        srcs: [src('mydaily-kbank-llm', '케이뱅크, 금융 특화 프라이빗 LLM 도입', '마이데일리', 'C', 'https://mydaily.co.kr/page/view/2025022608555874072', '2025-02-26', '협력사 각각의 역할은 기사에 없습니다.')] },
      { title: '클라우드 기반 생성형 AI 확장 계획', date: '2025-07-16', category: 'GENAI', status: 'REVIEWING', summary: 'CIO가 AWS 기자간담회에서 다음 단계는 클라우드 기반 생성형 AI라고 발언했다. 자체 전용 데이터센터 기반 생성형 AI와 병행해 멀티모달 클라우드 모델을 쓰기 위해 혁신금융서비스를 신청했다고 언급했다. 구체 모델·CSP 서비스명은 기사에 없다.',
        srcs: [src('byline-kbank-cloud-ai', '차대산 CIO “케이뱅크, 다음 단계는 클라우드 기반 생성형 AI”', '바이라인네트워크', 'C', 'https://byline.network/2025/07/0716/', '2025-07-16')] },
    ] },
  { id: 'toss-bank', name: '토스뱅크', marketGroup: FIRST, sector: 'INTERNET_BANK', roster: R.kfb, tier: 'B', website: 'https://www.tossbank.com/',
    initiatives: [{ title: '생성형 AI 혁신금융서비스 4건 지정', date: '2025-12-15', category: 'GENAI', status: 'ANNOUNCED', summary: '코드 리뷰, 마케팅·법률 검토, 경영·재무 분석, Text to SQL 4건이 혁신금융서비스로 지정됐다. AWS Bedrock 기반이라고 보도됐다. 지정 사실이며 운영 개시 여부는 기사에 명시되지 않았다.', vendors: ['AWS Bedrock'],
      srcs: [src('etoday-toss-sandbox', '토스뱅크, ‘생성형 AI 도입’ 혁신금융서비스 4건 지정', '이투데이', 'C', 'https://www.etoday.co.kr/news/view/2536061', '2025-12-15')] }] },
  // ───── 카드 ─────
  { id: 'shinhan-card', name: '신한카드', marketGroup: SECOND, sector: 'CARD', roster: R.card, tier: 'A', website: 'http://www.shinhancard.com',
    initiatives: [
      { title: 'LG AI연구원·LG CNS와 차세대 AI 공동연구 업무협약', date: '2024-01-29', category: 'GENAI', status: 'ANNOUNCED', summary: 'LG CNS, LG AI연구원과 금융 특화 생성형 AI 공동연구 업무협약을 체결했다. 개인화 검색·추천·오퍼 서비스 상용화와 AI 어시스턴트 구축을 과제로 제시했으며 과제는 앞으로 수행할 계획이다.', vendors: ['LG CNS', 'LG AI연구원'],
        srcs: [src('shinhancard-lg-ai', '신한카드, 차세대 AI 공동연구 나선다', '신한카드', 'B', 'https://www.shinhancard.com/pconts/company/html/promotion/press/1226131_3999.html', '2024-01-29')] },
      { title: '사내 생성형 AI 플랫폼 “아이나(AINa)”', date: '2025-07-28', category: 'GENAI', status: 'PRODUCTION', summary: '임직원 업무용 생성형 AI 플랫폼을 구축해 업무 전반에 적용한다고 발표했다. 매뉴얼 검색·답변, 마케팅 문구·준법 심의 지원, SQL 작성 등을 지원하고 팀별 전용 봇을 만들 수 있다. “구축 완료”라는 명시적 표현은 없고 개인 비서 기능은 향후 추가 예정이다. 인프라·파트너·모델은 발표에 없다.',
        srcs: [src('shinhancard-aina', '신한카드, 사내 GenAI 플랫폼으로 업무 효율화한다', '신한카드', 'B', 'https://www.shinhancard.com/pconts/company/html/promotion/press/1235070_3999.html', '2025-07-28')] },
    ] },
  { id: 'kb-card', name: 'KB국민카드', marketGroup: SECOND, sector: 'CARD', roster: R.card, tier: 'A', website: 'http://www.kbcard.com',
    initiatives: [
      { title: '통합 AI 마케팅 시스템 “AIMs 2.0” 구축 계약', date: '2025-12-10', category: 'AI_AGENT', status: 'ANNOUNCED', summary: '오브젠이 KB국민카드와 통합 AI 마케팅 시스템 구축 계약을 공시했다. 기존 분리 시스템을 통합하고 생성형·에이전틱 AI를 활용하는 범위다. 계약 체결 단계이며 구축 완료 여부는 확인하지 못했다.', vendors: ['오브젠'],
        srcs: [src('asiae-kbcard-aims', '오브젠, AI 마케팅 2.0 시대 연다…KB국민카드 AIMs 2.0 계약 체결', '아시아경제', 'C', 'https://core.asiae.co.kr/article/2025121016125147970', '2025-12-10')] },
      { title: '생성형 AI 결합 하이브리드 챗봇 고도화', date: '2026-06-10', category: 'GENAI', status: 'COMPLETED', summary: '기존 상담 챗봇에 생성형 AI를 결합한 하이브리드 챗봇을 3단계에 걸쳐 구축·고도화했다고 밝혔다. 금융권 보안성·신뢰성 유지를 목표로 소개됐다. 벤더·인프라는 기사에 없고 회사 원문은 확인하지 못했다.',
        srcs: [src('segye-kbcard-chatbot', '[이코노 브리핑] 국민카드, 생성형 AI 접목 챗봇 고도화 외', '세계일보', 'C', 'https://www.segye.com/newsView/20260610515854', '2026-06-11')] },
    ] },
  { id: 'samsung-card', name: '삼성카드', marketGroup: SECOND, sector: 'CARD', roster: R.card, tier: 'A', website: 'http://www.samsungcard.com', cases: ['samsungcard'],
    initiatives: [{ title: '모니모 AI 서비스 (혁신금융서비스 지정)', date: '2026-07-01', category: 'GENAI', status: 'ANNOUNCED', summary: '혁신금융서비스 지정 사실. 구축·운영 단계는 별도 근거로 확인해야 한다. 상세는 사례를 참조하세요.', caseId: 'samsungcard', srcs: ['sandbox-july'] }] },
  { id: 'hyundai-card', name: '현대카드', marketGroup: SECOND, sector: 'CARD', roster: R.card, tier: 'B', website: 'https://www.hyundaicard.com/csa/mb/STOREMAIN.hc',
    initiatives: [{ title: '하이브리드 데이터 사이언티스트 플랫폼(HDSP)과 AWS 연계 ML·생성형 AI', date: '2026-05-21', category: 'DATA_ANALYTICS', status: 'COMPLETED', summary: '유휴 온프레미스 장비를 쿠버네티스 기반 ML 플랫폼으로 전환해 2025년 10월 완성했다. 민감 데이터는 온프레미스 오픈소스 모델로, 비식별·고성능 모델 수요는 AWS(Bedrock 등)로 분리 처리하며 프라이빗 링크로 접속한다는 구조가 AWS 서밋에서 소개됐다. EKS 하이브리드 노드 등은 도입 검토 중이다.', models: ['Hybrid', 'On-premises', 'Public Cloud'], vendors: ['AWS', '위대한상상'],
      srcs: [src('ddaily-hyundaicard-hdsp', '“비용·운영 효율 두 마리 토끼 잡아라”…현대카드·위대한상상, AWS AI 서비스로 혁신', '디지털데일리', 'C', 'https://www.ddaily.co.kr/page/view/2026052017124329295', '2026-05-21', '기사에는 리전·모델명이 없습니다. 구체 수치는 회사 발표 기준입니다.')] }] },
  { id: 'lotte-card', name: '롯데카드', marketGroup: SECOND, sector: 'CARD', roster: R.card, tier: 'B',
    initiatives: [
      { title: '온프레미스 컨택센터를 클라우드 기반 AI 컨택센터로 전환', date: '2025-05-28', category: 'CONTACT_CENTER', status: 'PRODUCTION', summary: '온프레미스 컨택센터를 클라우드 기반 AICC로 전환해 운영 중이며 네이버클라우드가 운영 리소스 절감 등을 성과로 발표했다고 보도됐다. 성과 수치는 기업 측 주장이며 검증되지 않았다.', models: ['Public Cloud'], vendors: ['네이버클라우드', 'ECS텔레콤', '브라이트패턴'],
        srcs: [src('byline-lotte-aicc', '네이버클라우드 “롯데카드 AI 고객센터 2년 간 운영 리소스 40% 절감”', '바이라인네트워크', 'C', 'https://byline.network/2025/05/28-483/', '2025-05-28', '전환 시점은 본문에 없습니다. 네이버클라우드 원문 보도자료는 확인하지 못했습니다.')] },
      { title: '디지로카 앱 AI 실시간 큐레이션 서비스', date: '2025-08-21', category: 'CHANNEL', status: 'COMPLETED', summary: '모바일 앱에 결제·행동 데이터 기반 AI 개인화 큐레이션을 구축했다고 밝혔다. 고객센터 AI 보이스봇은 도입 상태이고 금융상품 추천 시스템은 개발 중이다. 벤더·인프라는 기사에 없다.',
        srcs: [src('hankyung-lotte-digiloca', '롯데카드, 디지로카 앱 실시간 큐레이션 서비스…고객 맞춤형 상품·콘텐츠·쇼핑 추천', '한국경제', 'C', 'https://www.hankyung.com/article/2025082125871', '2025-08-21')] },
    ] },
  { id: 'woori-card', name: '우리카드', marketGroup: SECOND, sector: 'CARD', roster: R.card, tier: 'B', website: 'https://pc.wooricard.com/dcpc/main.do', group: { name: '우리금융그룹', srcId: G.wooriCardLg } },
  { id: 'bc-card', name: 'BC카드', marketGroup: SECOND, sector: 'CARD', roster: R.card, tier: 'A', website: 'http://www.bccard.com', cases: ['bc'],
    initiatives: [
      { title: '생성형 AI를 활용한 데이터 분석 플랫폼 (혁신금융서비스 지정)', date: '2026-07-01', category: 'GENAI', status: 'ANNOUNCED', summary: '혁신금융서비스 지정 사실. 구축·운영 단계는 별도 근거로 확인해야 한다. 상세는 사례를 참조하세요.', caseId: 'bc', srcs: ['sandbox-july'] },
      { title: '자체 LLM “BCGPT” 임직원 챗봇과 금융 특화 AI 모델 공개', date: '2026-09-21', category: 'GENAI', status: 'PRODUCTION', summary: 'KT그룹 행사에서 자체 LLM 기반 임직원 AI 챗봇을 약 2년간 운영 중이고 업무 자동화 솔루션을 도입했다고 소개했다. 한국어·금융 특화 AI 모델과 데이터셋을 허깅페이스에 공개했다고 밝혔다. 망분리 환경 때문에 외부 API 대신 자체 기술 확보를 택했다는 설명이며 GPU 등 인프라 세부는 없다.',
        srcs: [src('sidae-bc-bcgpt', 'KT그룹, 금융·미디어 AI 전환 가속', '시대(SIDAE)', 'C', 'https://www.sidae.com/article/2026092112175258909', '2026-09-21', '앱의 BC카드 혁신금융서비스 사례와 별개의 사업입니다. 배포 방식은 기사에 명시되지 않아 분류하지 않았습니다.')] },
    ] },
  // ───── 캐피탈 ─────
  { id: 'jb-woori-capital', name: 'JB우리캐피탈', marketGroup: SECOND, sector: 'CAPITAL', roster: R.lease, tier: 'A', website: 'http://www.wooricap.com', group: { name: 'JB금융그룹', srcId: G.jbCapital }, cases: ['jb'],
    initiatives: [{ title: 'AWS 기반 생성형 AI 업무 플랫폼', date: '2026-03-18', category: 'GENAI', status: 'COMPLETED', summary: '메가존클라우드가 구축 완료와 업무 활용 성과를 발표한 사례. 핵심 데이터는 내부에 보관하고 AI 기능은 클라우드에서 운영하는 Hybrid 구조로 공개됐다. 상세는 사례를 참조하세요.', models: ['Hybrid', 'Public Cloud'], vendors: ['메가존클라우드', 'AWS'], caseId: 'jb', srcs: ['jb'] }] },
  { id: 'hyundai-capital', name: '현대캐피탈', marketGroup: SECOND, sector: 'CAPITAL', roster: R.lease, tier: 'B', website: 'http://www.hyundaicapital.com',
    initiatives: [{ title: 'AI 기반 대출심사 시스템과 마케팅 AI, Agentic AI 전환 추진', date: '2026-01-27', category: 'DATA_ANALYTICS', status: 'COMPLETED', summary: '현대차그룹 뉴스룸은 2024년 설명 가능한 자체 알고리즘 기반 대출심사 시스템을 구축했고 2026년 고객별 최적 금리 제안 마케팅 AI로 국제인공지능학회 상을 받았다고 소개했다. 상품개발·마케팅·심사 전반의 Agentic AI 체제 전환은 추진 방향으로만 기술됐다. 클라우드·생성형 AI 사용 여부는 없다.',
      srcs: [src('hmg-hyundai-capital-ai', '현대캐피탈, 전 세계가 인정한 AI 금융사로 발돋움', '현대자동차그룹 뉴스룸', 'B', 'https://www.hyundaimotorgroup.com/ko/news/hyundai-capital-ai-financial-company', '2026-01-27')] }] },
  // ───── 증권·금융인프라 ─────
  { id: 'mirae-asset-sec', name: '미래에셋증권', marketGroup: SECOND, sector: 'SECURITIES', roster: R.sec, tier: 'A', website: 'http://securities.miraeasset.com',
    initiatives: [
      { title: '금융 특화 sLLM 온프레미스 구축', date: '2024-09-19', category: 'GENAI', status: 'COMPLETED', summary: '네이버클라우드가 경량 모델 HCX-DASH 기반 금융 특화 sLLM을 미래에셋증권 자체 IT 인프라(온프레미스)에 구축을 완료했다고 밝혔다. 사내 데이터로 학습해 사내 시스템에 활용한다.', models: ['On-premises'], vendors: ['네이버클라우드'],
        srcs: [src('naver-mirae-sllm', '네이버클라우드, 미래에셋증권에 하이퍼클로바X 기반 금융 특화 sLLM 구축 완료', '네이버(네이버클라우드 보도자료)', 'B', 'https://navercorp.com/media/pressReleasesDetail?seq=32047', '2024-09-19')] },
      { title: 'GPU 인프라와 사내 LLM·RAG 어시스턴트·AI 에이전트 운영', date: '2026-05-14', category: 'AI_INFRA_GPU_NPU', status: 'PRODUCTION', summary: 'LLM 학습·추론용 GPU 인프라를 마련하고 사내 보안 환경 LLM과 RAG 어시스턴트, AI 리서치 에이전트를 운영한다고 소개됐다. 전사 클라우드와 글로벌 통합 AI·데이터 환경은 추진 중이다. 수상 기사로 수치는 회사 제공으로 보이며 GPU 규모·제품은 없다.',
        srcs: [src('heraldk-mirae-ai', '[비저너리대상 미래에셋증권] AI 기반 업무혁신, 고객 서비스 품질·효율 향상', '미주헤럴드경제', 'C', 'https://www.heraldk.com/article/2026051418334362711', '2026-05-14')] },
    ] },
  { id: 'samsung-sec', name: '삼성증권', marketGroup: SECOND, sector: 'SECURITIES', roster: R.sec, tier: 'B', website: 'http://www.samsungpop.com' },
  { id: 'nh-sec', name: 'NH투자증권', marketGroup: SECOND, sector: 'SECURITIES', roster: R.sec, tier: 'B', website: 'https://www.nhsec.com/',
    initiatives: [{ title: 'AI 에이전트 개발 착수와 전사 AI 플랫폼 구축(7개 우선 분야)', date: '2026-08-12', category: 'AI_AGENT', status: 'BUILDING', summary: 'WM·IB·기관영업 등 7개 우선 분야 AI 에이전트 개발과 전사 AI 플랫폼 구축에 8월 착수하고 연말부터 전사 확산하겠다고 밝혔다. 벤더·모델·인프라는 공개되지 않았다.',
      srcs: [src('metroseoul-nhsec-ai', 'NH투자증권, 사업 간 벽 허물고 AI 전환 속도↑', '메트로신문', 'C', 'https://www.metroseoul.co.kr/article/20260812500190', '2026-08-12')] }] },
  { id: 'kb-sec', name: 'KB증권', marketGroup: SECOND, sector: 'SECURITIES', roster: R.sec, tier: 'B', website: 'http://www.kbsec.com/', group: { name: 'KB금융그룹', srcId: G.kbGenai },
    initiatives: [
      { title: 'KB금융 그룹 공동 생성형 AI 플랫폼(KB GenAI 포털) 참여', date: '2025-05-15', category: 'GENAI', status: 'PRODUCTION', summary: 'KB금융지주와 KB국민은행, KB증권 등 계열사가 협업한 그룹 공동 생성형 AI 플랫폼이 열렸다. 벤더는 기사에 없다.', srcs: [G.kbGenai] },
      { title: 'AWS Industry Week 2025 AI 에이전트 개발 사례 발표', date: '2025-10-16', category: 'AI_AGENT', status: 'PRODUCTION', summary: '투자분석·고객상담·의사결정 지원 등에 AI 에이전트를 개발·적용 중이며 RAG 기반 지식응답 구조를 쓴다고 발표했다. 구체 AWS 서비스명은 기사에 없다.',
        srcs: [src('heraldk-kbsec-aws', 'KB증권, AWS Industry Week 2025에서 AI 에이전트 혁신 사례 발표', '미주헤럴드경제', 'C', 'https://www.heraldk.com/article/2025101616233327808', '2025-10-16')] },
      { title: '금융보안원 “적합” 통보 후 생성형 AI 개발환경(MCP 허브) 구축 추진', date: '2026-06-22', category: 'DEVELOPER_PLATFORM', status: 'BUILDING', summary: '망분리 예외구간 단말에서 생성형 AI를 사용하는 보안대책이 금융보안원 평가에서 적합으로 통보됐다. 이를 토대로 MCP 허브 기반 AI 코딩 도구 개발환경을 구축할 계획이다. 적합 통보는 사실이고 허브 구축은 계획으로 서술됐다.',
        srcs: [src('zdnet-kbsec-mcp', '생성형AI 활용 보안 적합받은 KB증권…AI 전용 데이터·연결망 구축', '지디넷코리아', 'C', 'https://zdnet.co.kr/view/?no=20260622102240', '2026-06-22')] },
    ] },
  { id: 'koreainvest-sec', name: '한국투자증권', marketGroup: SECOND, sector: 'SECURITIES', roster: R.sec, tier: 'B', website: 'http://www.truefriend.com',
    initiatives: [{ title: '사내 생성형 AI 플랫폼 구축 수주', date: '2025-08-04', category: 'GENAI', status: 'ANNOUNCED', summary: '크라우드웍스가 한국투자증권 사내 생성형 AI 플랫폼 구축 사업을 수주했다. 범위는 생성형 AI 서비스 개발, RAG 데이터 시스템, 클라우드 아키텍처 설계, 금융 보안·규제 대응, 에이전트 개발~운영 통합 AI 인프라다. 진행 여부, 모델, GPU, CSP, 금액은 공개되지 않았다.', vendors: ['크라우드웍스'],
      srcs: [src('byline-kis-crowdworks', '크라우드웍스, 한국투자증권 사내 생성형 AI 플랫폼 구축', '바이라인네트워크', 'C', 'https://byline.network/2025/08/4-325/', '2025-08-04')] }] },
  { id: 'shinhan-invest-sec', name: '신한투자증권', marketGroup: SECOND, sector: 'SECURITIES', roster: R.sec, tier: 'B', website: 'https://www.shinhansec.com/',
    initiatives: [
      { title: '구글 클라우드 제미나이 기반 AI 에이전트 플랫폼 구축', date: '2026-08-18', category: 'AI_AGENT', status: 'BUILDING', summary: '구글 클라우드 협력으로 제미나이 엔터프라이즈 에이전트 플랫폼 기반을 구축하고 자체 설계 하이브리드 오케스트레이터를 적용했다. 일부 임직원 대상으로 도입했고 정식 출시를 준비 중이다. 성과 수치는 회사 측 설명이다.', models: ['Public Cloud'], vendors: ['Google Cloud'],
        srcs: [src('ditoday-shinhaninvest-gemini', '신한투자증권, 제미나이로 AI 에이전트 플랫폼 구축', '디지털 인사이트', 'C', 'https://ditoday.com/?p=151089', '2026-08-18')] },
      { title: '“AI 에이전트부” 신설', dept: ['AX본부', 'AI 에이전트부'], date: '2026-08-03', category: 'AI_AGENT', status: 'ANNOUNCED', summary: 'AX본부 산하에 팀장 에이전트와 분야별 에이전트로 구성된 독립 부서를 신설하고 홀세일 협업을 시범 적용한 뒤 리서치·WM·IB 등으로 확대할 계획이다. 최종 검토는 사람이 담당한다.',
        srcs: [src('dailian-shinhaninvest-agent-dept', '“판단은 인간, 실행은 AI”…신한증권, 국내 금융사 최초 AI 에이전트부 신설', '데일리안', 'C', 'https://www.dailian.co.kr/news/view/1673876/', '2026-08-03')] },
      { title: '종합증권사 핵심 원장 클라우드 이전 차세대 사업(2024-07 보도)', date: '2024-07-01', category: 'MIGRATION_MODERNIZATION', status: 'BUILDING', summary: '2024년 7월 기사에 따르면 종합증권사 핵심 원장을 클라우드로 이전하는 차세대 구축 사업을 진행 중이다. 클라우드 사업자는 기사에 명시되지 않았고 이후 완료 여부는 확인하지 못했다.',
        srcs: [src('smarttoday-shinhaninvest-cloud', '신한투자증권, 토스증권과 클라우드 기반 오픈 플랫폼 추진', '스마트투데이', 'C', 'https://www.smarttoday.co.kr/ko-kr/articles/53909', '2024-07-01', '2024년 7월 시점 기사로 이후 진행 상황은 확인하지 못했습니다.')] },
    ] },
  { id: 'ibk-sec', name: 'IBK투자증권', marketGroup: SECOND, sector: 'SECURITIES', roster: R.sec, tier: 'B', website: 'http://www.ibks.com', cases: ['ibk'],
    initiatives: [{ title: 'On-premises 생성형 AI 내재화', date: '2026-03-25', category: 'GENAI', status: 'BUILDING', summary: '사내 지식 검색·회의록·투자정보 작성 지원을 위한 온프레미스 생성형 AI 내재화 사업. 구축 중이며 완료·운영은 확인되지 않았다. 상세는 사례를 참조하세요.', models: ['On-premises'], vendors: ['핑거'], caseId: 'ibk', srcs: ['ibk', 'ibk-bid'] }] },
  { id: 'hana-sec', name: '하나증권', marketGroup: SECOND, sector: 'SECURITIES', roster: R.sec, tier: 'B', website: 'http://www.hanaw.com',
    initiatives: [{ title: '생성형 AI 챗봇 “하나Q” 구축·고객 서비스', date: '2026-06-23', category: 'GENAI', status: 'PRODUCTION', summary: '올거나이즈 LLM 플랫폼 기반 RAG 챗봇을 구축해 5월 22일부터 고객 대상으로 운영한다고 보도됐다(기사에 연도 미표기, 기사일 2026-06-23). 온프레미스 및 DMZ 구조로 설계했다고 한다. 클라우드 사용 언급은 없다.', models: ['On-premises'], vendors: ['올거나이즈'],
      srcs: [src('edaily-hanasec-hanaq', '기업용 AI솔루션 기업 올거나이즈, 하나증권 생성형 AI 챗봇 하나Q 구축', '이데일리', 'C', 'https://edaily.co.kr/News/Read?mediaCodeNo=257&newsId=03286566645484672', '2026-06-23')] }] },
  { id: 'meritz-sec', name: '메리츠증권', marketGroup: SECOND, sector: 'SECURITIES', roster: R.sec, tier: 'B', website: 'http://www.imeritz.com',
    initiatives: [
      { title: 'AWS와 차세대 AI 금융 플랫폼 개발 업무협력', date: '2025-06-25', category: 'CLOUD', status: 'ANNOUNCED', summary: '2025년 6월 24일 협약을 체결했다. 차세대 플랫폼에 AWS 클라우드 기술과 AI 서비스를 결합할 계획이며 금액은 공개되지 않았다.', vendors: ['AWS'],
        srcs: [src('smarttoday-meritz-aws', '메리츠증권–AWS, 차세대 AI 금융 플랫폼 개발 업무협력 관계 구축', '스마트투데이', 'C', 'https://www.smarttoday.co.kr/ko-kr/articles/84079', '2025-06-25')] },
      { title: 'AWS 기반 차세대 증권 플랫폼 설계', date: '2026-03-06', category: 'CLOUD', status: 'BUILDING', summary: '기존 트레이딩 시스템 이전 대신 AI·커뮤니티 중심 신규 리테일 플랫폼을 AWS 서울 리전 Multi-AZ 등으로 설계하고 Bedrock 기반 에이전틱 AI 프로토타입을 검증했다. 상반기 출시를 목표로 준비 중이라고 기술했으며 출시 여부는 확인하지 못했다.', models: ['Public Cloud', 'Hybrid'], vendors: ['AWS'],
        srcs: [src('aws-blog-meritz', '메리츠증권의 AWS 클라우드 여정: 클라우드 기반 차세대 증권 플랫폼 설계', 'AWS 기술 블로그(한국어)', 'B', 'https://aws.amazon.com/ko/blogs/tech/meritz-securities-wts-with-gen-ai', '2026-03-06', 'AWS가 게시한 고객 설계 사례 글입니다.')] },
    ] },
  { id: 'ksfc', name: '한국증권금융', marketGroup: 'FINANCIAL_INFRA_FINTECH', sector: 'FINANCIAL_INFRA', roster: '', tier: 'C', cases: ['ksfc'],
    rosterNote: '금융투자협회 증권 회원사 목록에는 없고 협회·기관 공식 명부로는 확인하지 못했습니다. 기존 사례(Case) 연결을 위해 포함했으며 공식 기관 명부 확인이 필요합니다.',
    initiatives: [{ title: 'On-premises 생성형 AI 활용 플랫폼', date: '2026-07-15', category: 'GENAI', status: 'BUILDING', summary: '임직원의 자료 조사·내규 검색·반복 업무를 지원하는 온프레미스 생성형 AI 플랫폼 구축 착수가 보도됐다(2026년 6~12월 사업 계획). 완료 여부는 확인되지 않았다. 상세는 사례를 참조하세요.', models: ['On-premises'], vendors: ['올거나이즈'], caseId: 'ksfc', srcs: ['ksfc'] }] },
  // ───── 보험 ─────
  { id: 'samsung-life', name: '삼성생명', marketGroup: SECOND, sector: 'LIFE_INSURANCE', roster: R.life, tier: 'A', website: 'http://www.samsunglife.com',
    initiatives: [{ title: 'AI 롤플레잉(AI 디지털 휴먼 상담 훈련) 서비스, 생성형 AI 혁신금융서비스 지정', date: '2026-09-07', category: 'GENAI', status: 'ANNOUNCED', summary: 'AI 디지털 휴먼이 가상 고객 역할을 하는 컨설턴트 상담 훈련 서비스를 9월 중순 출시 예정이라고 밝혔다. 2026년 7월 금융위가 혁신금융서비스로 지정했다(지정은 구축·운영과 별개). 모델·CSP는 언급이 없다.', vendors: ['클레온'],
      srcs: [src('fnnews-samsunglife-roleplay', '삼성생명, AI로 보험상담 훈련한다…생성형 AI 혁신금융서비스', '파이낸셜뉴스', 'C', 'https://www.fnnews.com/news/202609070840148209', '2026-09-07')] }] },
  { id: 'hanwha-life', name: '한화생명', marketGroup: SECOND, sector: 'LIFE_INSURANCE', roster: R.life, tier: 'B', website: 'http://www.hanwhalife.com',
    initiatives: [
      { title: 'AI 데이 2025: AICC·AI STS·상담 AI와 가입설계 AI 에이전트', date: '2025-09-11', category: 'GENAI', status: 'PRODUCTION', summary: 'AICC는 2025년 초 서비스를 시작했고 가입설계 AI 에이전트와 AI 번역은 하반기 시범 운영 후 적용 예정이라고 소개했다. 서비스별 상태가 다르며 대표 상태는 AICC 기준이다.',
        srcs: [src('ddaily-hanwhalife-aiday', '“보험 본업 프로세스 전반에 AI 적용”… 한화생명, AI 데이 2025 개최', '디지털데일리', 'C', 'https://www.ddaily.co.kr/page/view/2025091111232003470', '2025-09-11')] },
      { title: 'AI 오케스트레이터 에이전트 추진, SLM 폐쇄망 학습·OCR 서버 온프레미스', date: '2026-01-07', category: 'AI_AGENT', status: 'REVIEWING', summary: 'AI 담당 인터뷰에서 2026년 에이전트 확대와 오케스트레이터 도입을 핵심 과제로 제시했고, 소형언어모델은 폐쇄망에서만 학습하며 OCR 서버는 온프레미스로 구축했다고 설명했다. 오케스트레이터는 계획 단계이며 장비·벤더 언급은 없다.', models: ['On-premises'],
        srcs: [src('ajunews-hanwhalife-ai', '[아주초대석] “AI는 기술이 아니라 엔진입니다”… 한화생명이 그리는 라이프 솔루션 AI', '아주경제', 'C', 'https://www.ajunews.com/view/20260107135525452', '2026-01-07')] },
    ] },
  { id: 'kyobo-life', name: '교보생명', marketGroup: SECOND, sector: 'LIFE_INSURANCE', roster: R.life, tier: 'B', website: 'http://www.kyobo.com',
    initiatives: [{ title: '생성형 AI 3종 정식 오픈(FP 보장분석 AI 서포터, FP소장 AI 어시스턴트, 임직원용 AI 데스크)', date: '2025-09-03', category: 'GENAI', status: 'PRODUCTION', summary: '2023년 도입한 교보GPT를 고도화한 임직원용 AI 데스크와 FP용 서비스 2종을 열었다. 전년 말 망분리 규제 예외 혁신금융서비스로 지정받아 내부망에서 AI를 쓸 수 있다고 한다. 협력사·모델·내부망 구조는 기사에 없다.',
      srcs: [src('heraldk-kyobo-ai', '교보생명 “설계사도 고객 상담 업무에 AI 활용 확대”', '미주헤럴드경제', 'C', 'https://www.heraldk.com/article/2025090316565309489', '2025-09-03')] }] },
  { id: 'shinhan-life', name: '신한라이프생명', marketGroup: SECOND, sector: 'LIFE_INSURANCE', roster: R.life, tier: 'B', website: 'http://www.shinhanlife.co.kr', group: { name: '신한금융그룹', srcId: G.shinhanLifeSite },
    initiatives: [
      { title: '생성형 AI 활용 보험 지식베이스 구축 프로젝트 완료', date: '2025-09-12', category: 'GENAI', status: 'COMPLETED', summary: '2024년 10월부터 약관 등 보험 기초서류 약 2만 종을 디지털화·구조화해 지식베이스를 완성했다. 이후 보장분석 고도화, 질의응답 자동화, AI 에이전트 도입을 추진한다.',
        srcs: [src('inthenews-shinhanlife-kb', '신한라이프, 생성형AI 활용 위한 지식베이스 구축사업 완료', '인더뉴스', 'C', 'https://inthenews.co.kr/news/article.html?no=76843', '2025-09-12')] },
      { title: '상품 AI 다크팩토리 구축 사업 공고', date: '2026-05-22', category: 'GENAI', status: 'ANNOUNCED', summary: '보험상품 개발 전 공정을 AI로 자동화하는 사업의 공고를 냈다. 총 9개월, 2026년 6~7월 착수 예정으로 보도됐으며 착수 여부는 확인하지 못했다.',
        srcs: [src('sbizz-shinhanlife-darkfactory', '보험상품 개발도 AI가…신한라이프, 자동화 시스템 착착', 'SBS Biz', 'C', 'https://biz.sbs.co.kr/amp/article/20000312115', '2026-05-22')] },
    ] },
  { id: 'samsung-fire', name: '삼성화재', marketGroup: SECOND, sector: 'NON_LIFE_INSURANCE', roster: R.nonlife, tier: 'A', cases: ['samsungfire'],
    initiatives: [
      { title: '임직원용 지능형 업무지식 챗봇 (혁신금융서비스 지정)', date: '2026-07-01', category: 'GENAI', status: 'ANNOUNCED', summary: '혁신금융서비스 지정 사실. 구축·운영 단계는 별도 근거로 확인해야 한다. 상세는 사례를 참조하세요.', caseId: 'samsungfire', srcs: ['sandbox-july'] },
      { title: '암 진단·수술 보험금 심사 “AI 의료심사” 도입', date: '2025-08-20', category: 'GENAI', status: 'PRODUCTION', summary: '진단서·검사결과지·수술기록지를 OCR과 생성형 AI로 분석하는 심사 시스템을 도입했다. 암 심사 건의 인력 검토 비중이 약 55% 줄었다는 것은 회사 설명이다. 협력사·클라우드 언급은 없다.',
        srcs: [src('heraldk-samsungfire-medreview', '삼성화재, 암 진단·수술 보험금 심사에 AI 도입', '미주헤럴드경제', 'C', 'https://www.heraldk.com/article/2025082015452003017', '2025-08-20')] },
    ] },
  { id: 'hyundai-marine', name: '현대해상', marketGroup: SECOND, sector: 'NON_LIFE_INSURANCE', roster: R.nonlife, tier: 'B',
    initiatives: [
      { title: 'KAIST와 보험 특화 AI 공동 연구 전략 MOU', date: '2025-08-28', category: 'OTHER', status: 'ANNOUNCED', summary: '보험 특화 AI 공동 R&D, 전문인력 양성, 산학 생태계 구축을 목표로 MOU를 체결했다. 구체 일정·예산은 없고 시스템 구축이 아닌 연구·인력 협력이다.', vendors: ['KAIST'],
        srcs: [src('heraldk-hyundaimarine-kaist', '현대해상, KAIST와 보험 특화 AI 기술 개발 추진', '미주헤럴드경제', 'C', 'https://www.heraldk.com/article/2025083116103207537', '2025-08-31')] },
      { title: 'SKT와 AI 활용 보험 비즈니스 혁신 전략 MOU', date: '2024-02-14', category: 'GENAI', status: 'ANNOUNCED', summary: 'SKT 언어모델 기반 AI 콜센터·챗봇, 임직원용 LLM 도구, AI 인프라 지원 등을 검토·추진하기로 했다. 모두 계획·검토 단계이며 이후 구현 여부는 확인하지 못했다.', vendors: ['SK텔레콤'],
        srcs: [src('sateconomy-hyundaimarine-skt', 'SKT·현대해상, AI 활용해 보험 비즈니스 혁신한다', '토요경제', 'C', 'https://sateconomy.co.kr/news/view/1065576079907726', '2024-02-15')] },
    ] },
  { id: 'db-insurance', name: 'DB손해보험', marketGroup: SECOND, sector: 'NON_LIFE_INSURANCE', roster: R.nonlife, tier: 'B',
    initiatives: [
      { title: 'AI 에이전트 도입(AI 로보텔러, 다국어 통역 AI, 과실비율 AI 준비)', date: '2026-05-19', category: 'AI_AGENT', status: 'PRODUCTION', summary: 'AI 로보텔러는 2026년 2월부터 삼성SDS와 함께 운영하고 해피콜 다국어 통역 AI는 유베이스와 전년 말부터 운영 중이다. 블랙박스 기반 과실비율 AI는 특허 취득 후 도입을 준비하는 단계다. 에이전트별 상태가 다르다.', vendors: ['삼성SDS', '유베이스'],
        srcs: [src('hankyung-dbins-agents', 'DB손해보험, 사고 접수·언어 통역·과실 판단…현장 곳곳 AI 에이전트 이식', '한국경제', 'C', 'https://www.hankyung.com/article/2026051955141', '2026-05-19')] },
      { title: 'T3Q와 장기보험 보상청구 자동화 AI 협약 및 PoC', date: '2025-08-05', category: 'AI_AGENT', status: 'POC', summary: 'T3Q의 플랫폼을 적용해 장기보험 보상청구 자동화 PoC를 추진하기로 MOU를 맺었다. PoC 결과는 확인하지 못했다.', vendors: ['T3Q'],
        srcs: [src('heraldk-dbins-t3q', 'DB손보, T3Q와 AI 보상 자동화 업무협약 체결', '미주헤럴드경제', 'C', 'https://www.heraldk.com/article/2025080516393196427', '2025-08-05')] },
    ] },
  { id: 'kb-insurance', name: 'KB손해보험', marketGroup: SECOND, sector: 'NON_LIFE_INSURANCE', roster: R.nonlife, tier: 'B', group: { name: 'KB금융그룹', srcId: G.kbGenai },
    initiatives: [
      { title: '자동차사고 과실비율 AI 에이전트 도입', date: '2025-10-01', category: 'AI_AGENT', status: 'PRODUCTION', summary: 'KB금융그룹 공동 KB GenAI 포털 기반으로 사고 접수 내용을 분석해 예상 과실비율을 안내하는 에이전트를 업무에 도입했다. 연말까지 민원·콜센터·인수심사·광고심의 에이전트를 추가할 계획이다. 모델·CSP는 기사에 없다.',
        srcs: [src('hankyung-kbins-agent', 'KB손해보험, AI 에이전트 도입…사고 관련 과실비율 스스로 산정', '한국경제', 'C', 'https://www.hankyung.com/article/2025100196641', '2025-10-01')] },
      { title: 'KB금융 그룹 공동 생성형 AI 플랫폼(KB GenAI 포털) 참여', date: '2025-05-15', category: 'AI_AGENT', status: 'PRODUCTION', summary: '지주와 계열사가 협업해 에이전트 개발 환경을 열었고 KB손보는 보험 상담 에이전트를 개발 중이다. 그룹 차원 사업이며 KB손보 단독이 아니다.', srcs: [G.kbGenai] },
    ] },
  { id: 'korean-re', name: '코리안리재보험', marketGroup: SECOND, sector: 'NON_LIFE_INSURANCE', roster: R.nonlife, tier: 'B', website: 'http://www.koreanre.co.kr', cases: ['koreanre'],
    initiatives: [
      { title: '기업성 보험 요율산정 AI Assistant (혁신금융서비스 지정)', date: '2026-03-18', category: 'GENAI', status: 'ANNOUNCED', summary: '혁신금융서비스 지정 사실. 공급사 공개 자료의 사업 기간·기술은 있으나 명시적 검수 완료·상용 운영일은 확인되지 않았다. 상세는 사례를 참조하세요.', caseId: 'koreanre', srcs: ['sandbox-march', 'koreanre'] },
      { title: '메가존클라우드와 재보험 AX 전략적 업무협약', date: '2026-07-22', category: 'GENAI', status: 'ANNOUNCED', summary: '생성형 AI 기반 인수심사 고도화, 빅데이터 리스크 예측, 클라우드 네이티브 AI RPA 등을 협력하기로 MOU를 맺었다. 계약금액·구체 계약 조건은 없다. 구성 세부는 공개되지 않았다.', vendors: ['메가존클라우드'],
        srcs: [src('venturesquare-koreanre-mzc', '메가존클라우드, 코리안리 AX 고도화 맡는다… AI로 재보험 핵심 업무 혁신', '벤처스퀘어', 'C', 'https://www.venturesquare.net/1100786/', '2026-07-23')] },
    ] },
  // ───── 저축은행 ─────
  { id: 'sbi-sb', name: 'SBI저축은행', marketGroup: SECOND, sector: 'SAVINGS_BANK', roster: R.sb, tier: 'B', website: 'https://www.sbisb.co.kr',
    initiatives: [
      { title: 'SK AX와 AX 기반 IT시스템 통합유지보수 사업(2025~2028)', date: '2025-08-05', category: 'OTHER', status: 'BUILDING', summary: 'SK AX가 2025년부터 3년간 전사 IT 유지보수를 맡고 생성형 AI 기반 회의록 적용과 자체 AI 장애분석 체계 구축 지원을 포함한다. 2022~2024년 1기에 이은 연속 수주다.', vendors: ['SK AX', 'SK텔레콤'],
        srcs: [src('byline-sbisb-skax', 'SK AX, SBI저축은행 AX 파트너로 IT운영 혁신', '바이라인네트워크', 'C', 'https://byline.network/2025/08/5-307/', '2025-08-05')] },
      { title: '중장기 IT 운영전략 ISP 사업 수행사 선정', date: '2026-06-21', category: 'CORE_SYSTEM', status: 'REVIEWING', summary: '2026년 5월 공고한 ISP 사업 수행사를 두 컨소시엄이 경합 중이라고 보도됐다. 코어뱅킹 노후 진단, 마이크로서비스 검토, 레거시 현대화 로드맵 수립이 과제다. 기사 시점에 수행사는 확정되지 않았고 경합 컨소시엄은 후보일 뿐이다.',
        srcs: [src('ddaily-sbisb-isp', 'SBI저축은행, 중장기 IT 운영전략 ISP 사업 수주전', '디지털데일리', 'C', 'https://www.ddaily.co.kr/page/view/2026062012534649203', '2026-06-21')] },
      { title: '모바일뱅킹 iOS 피싱 차단 솔루션 도입 등 정보보호 고도화', date: '2025-10-27', category: 'SECURITY', status: 'PRODUCTION', summary: '모바일뱅킹 앱에 iOS용 실시간 피싱 차단 솔루션을 금융권 최초로 도입했다고 회사가 밝혔다. 회사 관계자 주장 중심의 기사이며 독립 검증은 없다.',
        srcs: [src('sateconomy-sbisb-security', 'SBI저축은행, 정보보호 고도화 박차…보안도 1금융권 수준', '토요경제', 'C', 'https://sateconomy.co.kr/news/view/1065604858848879', '2025-10-27')] },
    ] },
  { id: 'ok-sb', name: 'OK저축은행', marketGroup: SECOND, sector: 'SAVINGS_BANK', roster: R.sb, tier: 'B', website: 'https://www.oksavingsbank.com',
    initiatives: [
      { title: '수신(독자) 시스템 구축 사업 발주(중앙회 전산망 이탈)', date: '2026-08-27', category: 'CORE_SYSTEM', status: 'REVIEWING', summary: '인프라·정보계·채널계·계정계·PMO/감리 5개 부문의 수신 계정계 자체 구축 사업을 발주했고 우선협상대상자 발표는 9월 초로 보도됐다. 낙찰 결과는 확인하지 못했고 입찰 검토 업체는 선정 벤더가 아니다. 사업비는 공개되지 않았다.',
        srcs: [src('ddaily-oksb-core', '중앙회 전산망 떠나는 OK저축은행…여신 이어 수신 시스템 자체 구축 추진', '디지털데일리', 'C', 'https://www.ddaily.co.kr/page/view/2026082711190568943', '2026-08-27')] },
      { title: 'AI 디지털 본부 재편과 AI·RPA 확대 추진', dept: ['AI 디지털 본부'], date: '2026-06-23', category: 'DATA_ANALYTICS', status: 'REVIEWING', summary: 'AI 디지털 본부를 재편하고 데이터 활용 서비스, 리스크 관리 고도화, 신용평가·CRM 고도화를 추진 과제로 제시했다. 조직 재편과 계획 중심이며 구체 시스템·벤더는 없다.',
        srcs: [src('hankyung-oksb-ai', 'OK저축은행, 저축부터 생활정보까지 앱 하나로', '한국경제', 'C', 'https://www.hankyung.com/article/2026062322781', '2026-06-23')] },
    ] },
  { id: 'welcome-sb', name: '웰컴저축은행', marketGroup: SECOND, sector: 'SAVINGS_BANK', roster: R.sb, tier: 'B', website: 'https://www.welcomebank.co.kr',
    initiatives: [
      { title: 'LG유플러스와 생성형 AI “AI 금융비서” 개발·출시', date: '2026-04-24', category: 'GENAI', status: 'PRODUCTION', summary: 'LG유플러스와 개발한 생성형 AI 금융비서를 웰컴디지털뱅크 앱에 적용해 정식 출시했다. 약 한 달 시범 운영을 거쳤고 기반 모델은 LG AI연구원 엑사원이다. 업계 최초라는 것은 회사 주장이다.', vendors: ['LG유플러스', 'LG AI연구원'],
        srcs: [src('lg-welcome-aibot', '웰컴저축은행과 AI 에이전트 개발 협력…AI 금융비서 출시', 'LG유플러스(LG 미디어)', 'B', 'https://www.lg.co.kr/media/release/30083', '2026-04-24')] },
      { title: '전 임직원 AI 에이전트(사내망 접속 AI SaaS) 9월 도입 추진', date: '2026-08-10', category: 'AI_AGENT', status: 'POC', summary: '허용된 사내망에서만 접속하는 AI SaaS 방식으로 직원이 여러 생성형 모델을 골라 에이전트를 직접 만드는 환경을 9월부터 전 임직원으로 확대할 방침이다. 보도 시점에는 AI 리더 31명이 시범 사용 중이었다. 솔루션 업체·모델명은 기사에 없다.', models: ['SaaS'],
        srcs: [src('economist-welcome-agents', '웰컴저축은행, 전 직원에 AI 에이전트…9월부터 업무에 쓴다', '이코노미스트', 'C', 'https://economist.co.kr/article/view/ecn202608100013', '2026-08-10')] },
    ] },
];

// 공식 명부·기관 사이트로 확인한 Market Universe (사업이 없어도 기본 Profile로 등록). 사업은 newInitiatives에서 붙는다.
raw.push(...universeEntries.map<Raw>(u => ({
  id: u.id, name: u.name, marketGroup: u.marketGroup as MarketGroup, sector: u.sector as FinancialSector, roster: u.rosterSrc ?? '',
  rosterNote: u.rosterSrc ? undefined : (u.note ?? '협회·기관 명부 URL을 확인하지 못했습니다'), website: u.website ?? undefined, sub: u.subSector ?? undefined, hqx: u.hq, assetx: u.asset,
})));

// 은행 세부 구분은 시장관행 분류(법적 분류 아님)다. 확신이 없는 회사는 비워 둔다.
const SUB_SECTOR: Record<string, string> = {
  'kb-bank': '시중은행', 'shinhan-bank': '시중은행', 'hana-bank': '시중은행', 'woori-bank': '시중은행', 'nh-bank': '특수은행', 'ibk-bank': '특수은행', 'jeju-bank': '지방은행',
};
const SUB_BY_SECTOR: Partial<Record<FinancialSector, string>> = { INTERNET_BANK: '인터넷전문은행', LIFE_INSURANCE: '생명보험', NON_LIFE_INSURANCE: '손해보험' };

// Phase C.5 재검증에서 원문과 달라 정정한 사업 정보 (title/summary 교체, 벤더 추가·삭제)
const CORRECTIONS: Record<string, { title?: string; summary?: string; removeVendors?: string[]; addCsp?: string[] }> = {
  'sbi-sb-2': { title: '중장기 IT 운영전략 ISP 사업 수주전' },
  'mirae-asset-sec-2': { summary: 'LLM 학습·추론용 GPU 인프라를 마련하고 사내 보안 환경 LLM과 RAG 어시스턴트, AI 리서치 에이전트를 운영한다고 소개됐다. 기사는 전사 클라우드와 글로벌 통합 AI·데이터 환경도 구축된 것으로 설명한다. 수상 기사로 수치는 회사 제공으로 보이며 GPU 규모·제품은 없다.' },
  'kb-bank-2': { summary: 'KB금융지주와 KB국민은행, KB증권 등 계열사가 협업한 그룹 공동 생성형 AI 플랫폼이 열렸다. 에이전트는 순차 탑재하며 향후 3년간 17개 업무영역에 90여개 에이전트 도입 계획이 보도됐다.' },
  'hyundai-card-1': { removeVendors: ['위대한상상'] },
  'shinhan-bank-1': { addCsp: ['Microsoft Azure'] },
  'kb-card-1': { summary: '오브젠이 KB국민카드와 통합 AI 마케팅 시스템 구축 계약을 공시했다. 기존 분리 시스템을 통합하고 생성형·에이전틱 AI를 활용하는 범위이며 계약 규모는 약 36억원으로 보도됐다. 계약 체결 단계이며 구축 완료 여부는 확인하지 못했다.' },
};
// DB 심층조사 대상 이름 정렬용 한글 표기 (KB·NH·IBK 같은 영문 약칭이 뒤로 밀리지 않게 한다)
const SORT_NAME_KO: Record<string, string> = {
  'kb-bank': '국민은행', 'nh-bank': '농협은행', 'ibk-bank': '기업은행', 'im-bank': '아이엠뱅크', 'kb-card': '국민카드', 'bc-card': '비씨카드', 'kb-sec': '케이비증권', 'nh-sec': '엔에이치투자증권',
  'ibk-sec': '아이비케이투자증권', 'db-insurance': '디비손해보험', 'kb-insurance': '케이비손해보험', 'sbi-sb': '에스비아이저축은행', 'ok-sb': '오케이저축은행', 'jb-woori-capital': '제이비우리캐피탈', 'k-bank': '케이뱅크',
};
const VERIFIED_AT = '2026-10-11';
// Case 최소요건(목적·Workload·단계·배포/CSP 단서·기술·보안/거버넌스·Source)을 이미 충족한 기존 사업은 Case(LIGHT)로도 노출한다. 사례 데이터는 사업을 참조해 만든다.
export const PROMOTED_IDS = ['hana-bank-1', 'hyundai-card-1', 'mirae-asset-sec-1', 'hana-sec-1', 'meritz-sec-2', 'welcome-sb-2', 'u-cd-01-n2', 'u-li-06-n2'];

const DATE_OK = /^\d{4}-\d{2}(-\d{2})?$/;
function buildNew(x: NewInitiative, instId: string, n: number): InstitutionInitiative {
  const text = `${x.title} ${x.summary} ${[...x.csp, ...x.msp, ...x.vendors, ...x.products, ...x.keywords].join(' ')}`;
  const orgs: PublicOrganizationReference[] = x.depts.filter(Boolean).map(name => ({ name, sourceIds: x.srcs, lastVerifiedAt: RESEARCHED }));
  const some = <T,>(a: T[]) => (a.length ? a : undefined);
  const base: Omit<InstitutionInitiative, 'amTakeaway' | 'discoveryQuestions'> = {
    id: `${instId}-n${n}`, institutionId: instId, title: x.title, announcedAt: x.date && DATE_OK.test(x.date) ? x.date : undefined,
    domains: inferDomains(text, x.csp.length > 0), kind: x.kind as InstitutionInitiative['kind'], sourceStage: (x.stage ?? undefined) as InstitutionInitiative['sourceStage'], summary: x.summary,
    deploymentModels: some(x.models as DeploymentModel[]), cspVendors: some(x.csp), mspSiPartners: some(x.msp), technologyVendors: some(x.vendors), products: some(x.products),
    ownerDepartments: some(orgs), technologyKeywords: [...new Set([...extractKeywords(text), ...x.keywords.filter(k => k.length <= 20)])].slice(0, 8),
    businessPurpose: x.purpose ?? undefined, workloads: some(x.workloads), targetUsers: some(x.targetUsers), securityGovernancePoints: some(x.security), businessOutcome: some(x.outcome),
    stageReviewedAt: VERIFIED_AT, stageEvidenceQuote: x.stage ? x.quote : undefined, relatedCaseIds: x.caseId ? [x.caseId] : [], sourceIds: x.srcs, lastVerifiedAt: RESEARCHED,
  };
  return { ...base, amTakeaway: amTakeawayFor(base), discoveryQuestions: discoveryQuestionsFor(base) };
}
function build(r: Raw): FinancialInstitution {
  const initiatives0: InstitutionInitiative[] = (r.initiatives ?? []).map((i, n) => {
    const id = `${r.id}-${n + 1}`;
    const fix = CORRECTIONS[id];
    const en = initiativeEnrichment[id];
    const vendors = (i.vendors ?? []).filter(v => !fix?.removeVendors?.includes(v));
    const cspVendors = [...vendors.filter(v => CSP_NAMES.includes(v)), ...(fix?.addCsp ?? [])];
    const mspSiPartners = vendors.filter(v => MSP_SI_NAMES.includes(v));
    const technologyVendors = vendors.filter(v => !CSP_NAMES.includes(v) && !MSP_SI_NAMES.includes(v));
    const title = fix?.title ?? i.title, summary = fix?.summary ?? i.summary;
    const domains = new Set(DOMAIN_OF_CATEGORY[i.category]);
    if (cspVendors.length) domains.add('PUBLIC_CLOUD');
    if (i.models?.some(m => m === 'Private AI' || m === 'On-premises' || m === 'Private Cloud')) domains.add('CORE_ONPREM');
    const keywords = [...new Set([...extractKeywords(`${title} ${summary} ${[...vendors, ...cspVendors].join(' ')}`), ...(i.models?.includes('Private AI') ? ['Private AI'] : []), ...(CATEGORY_KEYWORD[i.category] ? [CATEGORY_KEYWORD[i.category]!] : [])])];
    // 단계: 재검증(Phase C.5)한 값만 쓴다. 재검증 결과가 없거나 원문이 단계를 말하지 않으면 비운다.
    const sourceStage = en?.stage ?? undefined;
    const orgs: PublicOrganizationReference[] = [...new Set([...(i.dept ?? []), ...(en?.depts ?? [])])].map(name => ({ name, sourceIds: i.srcs, lastVerifiedAt: RESEARCHED }));
    const base = {
      id, institutionId: r.id, title, announcedAt: i.date, domains: [...domains], sourceStage, summary, deploymentModels: i.models,
      cspVendors: cspVendors.length ? cspVendors : undefined, technologyVendors: technologyVendors.length ? technologyVendors : undefined, mspSiPartners: mspSiPartners.length ? mspSiPartners : undefined,
      ownerDepartments: orgs.length ? orgs : undefined, technologyKeywords: keywords,
      businessPurpose: en?.businessPurpose ?? undefined, workloads: en?.workloads.length ? en.workloads : undefined, targetUsers: en?.targetUsers.length ? en.targetUsers : undefined,
      securityGovernancePoints: en?.securityGovernancePoints.length ? en.securityGovernancePoints : undefined, businessOutcome: en?.businessOutcome.length ? en.businessOutcome : undefined,
      stageReviewedAt: en?.reviewed ? VERIFIED_AT : undefined, stageEvidenceQuote: sourceStage && en?.quote ? en.quote : undefined,
      relatedCaseIds: i.caseId ? [i.caseId] : [], sourceIds: i.srcs, lastVerifiedAt: RESEARCHED,
    };
    // SALES_VIEW: 영업 관점 해석과 질문 (사실이 아니며 Source의 주장도 아니다)
    return { ...base, amTakeaway: amTakeawayFor(base), discoveryQuestions: discoveryQuestionsFor(base) };
  });
  const initiatives = [...initiatives0, ...newInitiatives.filter(x => x.inst === r.id).map((x, n) => buildNew(x, r.id, n + 1))];
  initiatives.forEach((i, n) => { if (PROMOTED_IDS.includes(i.id)) initiatives[n] = { ...i, relatedCaseIds: [...i.relatedCaseIds, `promo-${i.id}`] }; });
  const asset = r.assetx ?? assetData[r.id];
  const hq = r.hqx ? { ...r.hqx, note: null as string | null } : hqData[r.id];
  const people = leaderSeeds.filter(l => l.inst === r.id);
  const sourceIds = [...new Set([...(r.roster ? [r.roster] : []), ...(r.group ? [r.group.srcId] : []), ...(asset ? [asset.src] : []), ...(hq ? [hq.src] : []), ...people.map(l => l.src), ...initiatives.flatMap(i => i.sourceIds)])];
  const allReviewed = initiatives.length > 0 && initiatives.every(i => i.stageReviewedAt);
  const deep = deepResearchIds.includes(r.id);
  return {
    id: r.id, name: r.name, sortNameKo: SORT_NAME_KO[r.id], dbResearchPriority: deep || undefined,
    marketGroup: r.marketGroup === 'FINANCIAL_INFRA_FINTECH' ? 'OTHER' : r.marketGroup, sector: r.sector, subSector: r.sub ?? SUB_SECTOR[r.id] ?? SUB_BY_SECTOR[r.sector], regulatoryCategory: regulatoryCategoryOf[r.sector],
    financialGroup: r.group?.name, website: r.website, rosterNote: r.rosterNote, priorityTier: r.tier,
    universeSourceId: r.roster || undefined,
    scale: asset ? {
      totalAssets: asset.won, unit: '원', assetAsOf: asset.asOf, assetBasis: '별도 재무상태표 자산총계', assetSourceIds: [asset.src],
      secondaryScaleMetric: asset.equityWon != null ? { label: '자기자본(자본총계)', value: asset.equityWon, unit: '원', asOf: asset.asOf, sourceIds: [asset.src] } : undefined,
    } : undefined,
    headOffice: hq ? { region: hq.region, district: hq.district ?? undefined, sourceIds: [hq.src], note: hq.note ?? undefined } : undefined,
    researchCoverage: !initiatives.length ? 'UNRESEARCHED' : deep && allReviewed ? 'DEEP' : 'BASIC',
    ownerDepartments: [],
    publicLeaders: people.map(l => ({ personName: l.name, title: l.title, department: l.dept, scope: l.scope, asOfDate: l.asOf, historical: l.historical || undefined, sourceIds: [l.src], lastVerifiedAt: VERIFIED_AT })),
    initiatives, relatedCaseIds: [...new Set([...(r.cases ?? []), ...initiatives.flatMap(i => i.relatedCaseIds)])], sourceIds, lastResearchedAt: RESEARCHED,
  };
}
// 규모(DART 재무 공시)·책임자(공식 경영진 페이지/임원 보도) 근거 Source
for (const e of [...enrichmentSources, ...universeSources]) {
  const kind = e.id.startsWith('ur-') ? 'INSTITUTION_ROSTER' : e.id.startsWith('fin-') || e.id.startsWith('hq-') ? 'FINANCIAL_DISCLOSURE' : 'DELIVERY_CASE';
  const tier = (kind === 'FINANCIAL_DISCLOSURE' ? 'A' : (e.tier as Source['tier']) ?? 'C') as Source['tier'];
  if (!sources.some(x => x.id === e.id)) sources.push({ ...source(e.id, e.title, e.publisher, tier, kind, e.url, { published: e.published ?? undefined, verified: V1011 }), sourceType: e.sourceType as SourceType });
}
export const institutions: FinancialInstitution[] = raw.map(build);
export const accountSources: Source[] = sources;

// 출처 등급: 명부 = 협회, 금융당국(Tier A) = 금융당국, Tier C = 전문언론, Tier B = 발행처가 금융회사·금융그룹이면 금융회사 공식, 아니면 공식 CSP/MSP/SI/Vendor.
// 모기업 그룹 뉴스룸처럼 어느 쪽인지 애매한 자료는 OTHER로 둔다.
const customerNames = institutions.flatMap(i => [i.name, i.financialGroup].filter((x): x is string => !!x));
function typeOf(s: Source): SourceType {
  if (s.kind === 'INSTITUTION_ROSTER') return 'ASSOCIATION_OFFICIAL';
  if (s.tier === 'A') return 'REGULATOR_OFFICIAL';
  if (s.tier === 'C') return 'PROFESSIONAL_MEDIA';
  if (s.publisher.includes('현대자동차그룹')) return 'OTHER';
  return customerNames.some(n => s.publisher.includes(n)) ? 'CUSTOMER_OFFICIAL' : 'VENDOR_OFFICIAL';
}
export function assignSourceTypes(all: Source[]) { all.forEach(s => { if (!s.sourceType) s.sourceType = typeOf(s); }); }
assignSourceTypes(sources);
