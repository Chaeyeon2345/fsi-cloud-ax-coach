export const industries = ['은행','카드','증권','보험','캐피탈','저축은행','핀테크·전자금융','상호금융·협동조합','자산운용·투자','신용정보·금융인프라','기타'] as const;
export type Industry = typeof industries[number];
export const deployments = ['Public Cloud','Hybrid','On-premises','Private Cloud','Private AI','SaaS','Multi-cloud'] as const;
export type DeploymentModel = typeof deployments[number];
export type ContentKind = 'DEMO' | 'VERIFIED';
// ARCHITECTURE_GUIDE: 법적 의무가 아닌 "금융 요구사항 → 기술 구성" 교육용 분석. FACT와 같은 수준으로 표시하지 않는다.
// FACT: 규제·공식 정책 사실 · TECH_FACT: 공식 기술 문서(AWS 등)로 확인한 기술 사실 · ARCHITECTURE_GUIDE: 교육용 구성 분석(법적 의무 아님)
export type ClaimType = 'FACT' | 'TECH_FACT' | 'INTERPRETATION' | 'ARCHITECTURE_GUIDE' | 'SALES_VIEW' | 'MEETING';
export type Verification = 'VERIFIED' | 'NEEDS_VERIFICATION';

// ── Source: 자료별 날짜·상태를 각각 저장한다 (전역 확인일 없음) ──
export const sourceStatuses = ['CURRENT','ANNOUNCED','HISTORICAL','SUPERSEDED'] as const;
export type SourceStatus = typeof sourceStatuses[number];
// 재확인 기준일(freshness.ts)이 자료 종류별로 다르다.
// REGULATORY_POLICY: 법령·감독규정·금융위 정책/FAQ, 혁신금융서비스 지정 목록·공고 · FSEC_GUIDE: 금융보안원 가이드
// TECH_PRODUCT: 기술·제품 문서 · DELIVERY_CASE: 구축사/MSP 공식 고객사례, 실제 납품·운영 사례
// INSTITUTION_ROSTER: 업권별 협회·기관의 회원사/등록 명부 (고객사 지도의 회사 목록 근거)
export const sourceKinds = ['REGULATORY_POLICY','FSEC_GUIDE','TECH_PRODUCT','DELIVERY_CASE','INSTITUTION_ROSTER','FINANCIAL_DISCLOSURE'] as const;
export type SourceKind = typeof sourceKinds[number];
export const sourceTypes = ['CUSTOMER_OFFICIAL','REGULATOR_OFFICIAL','DISCLOSURE','VENDOR_OFFICIAL','ASSOCIATION_OFFICIAL','PROFESSIONAL_MEDIA','OTHER'] as const;
export type SourceType = typeof sourceTypes[number]; // 배열 순서 = Drawer 기본 표시 우선순위
export const sourceTypeLabels: Record<SourceType, string> = {
  CUSTOMER_OFFICIAL: '금융회사 공식', REGULATOR_OFFICIAL: '금융당국 공식', DISCLOSURE: '공시', VENDOR_OFFICIAL: '공식 CSP·MSP·SI·Vendor', ASSOCIATION_OFFICIAL: '공식 협회', PROFESSIONAL_MEDIA: '전문언론', OTHER: '기타',
};
export interface Source {
  id: string; title: string; publisher: string; tier: 'A'|'B'|'C'|'D'; kind: SourceKind; url: string;
  publishedAt?: string;
  effectiveAt?: string | null; // null = 공식 Source에서 시행일이 확인되지 않음. undefined = 해당 없음/미검토
  lastVerifiedAt: string; // YYYY-MM-DD, 이 자료를 실제로 확인한 날
  status: SourceStatus;
  locator?: string; notes?: string;
  sourceType?: SourceType; // 금융시장 IT·AX Index의 출처 등급 (Drawer 표시 우선순위)
}
export interface Claim { id: string; type: ClaimType; text: string; sourceIds: string[]; basisClaimIds?: string[] }
export interface Evidence { value: string; status: 'DISCLOSED'|'DERIVED'|'UNKNOWN'; sourceIds: string[] }
// 콘텐츠의 확인일은 연결된 Source에서 계산한다 (freshness.ts의 oldestVerifiedAt).
export interface ContentBase { id: string; title: string; contentKind: ContentKind; sourceIds: string[] }

// ── Knowledge Domain (내부 검색·연결용. 메인 메뉴와 같을 필요는 없다) ──
export const knowledgeDomains = ['FINANCIAL_BUSINESS_IT','REGULATION','CLOUD_ARCHITECTURE','AX_AI','SECURITY_RESILIENCE','SALES'] as const;
export type KnowledgeDomain = typeof knowledgeDomains[number];
export const domainLabels: Record<KnowledgeDomain, string> = {
  FINANCIAL_BUSINESS_IT: '금융업무·IT', REGULATION: '규제', CLOUD_ARCHITECTURE: 'Cloud Architecture',
  AX_AI: '금융 AX·AI', SECURITY_RESILIENCE: '보안·복원력', SALES: '영업',
};
// 모든 Knowledge/Case/Day에서 확인할 수 있어야 하는 영업 학습 필드 (영업 Playbook 탭에만 두지 않는다)
export interface SalesLearningExtension {
  amMustKnow: string[]; discoveryQuestions: string[]; architectureMeaning: string;
  relatedServices: string[]; saHandoff: string[]; nextQuestions: string[]; commonMistakes: string[];
}
export const sectionLabels = ['한 줄 결론','왜 생겼나','기존에는','어떤 문제가 있었나','무엇이 바뀌었나','현재','금융사 실무','Cloud/AX 영향','영업 포인트','미팅 30초 설명'] as const;
export interface LearningSection { label: typeof sectionLabels[number]; text: string; type: ClaimType; sourceIds: string[] }
export interface KnowledgeCard extends ContentBase {
  domain: KnowledgeDomain; secondaryDomains?: KnowledgeDomain[];
  // 카드의 재확인 여부는 primarySourceIds(카드의 핵심 근거)로만 계산한다. 나머지(보조) 출처는 개별 배지로 표시한다.
  primarySourceIds: string[];
  summary: string; sections: LearningSection[]; relatedCaseIds: string[]; verification: Verification; caveats: string[];
  sales?: SalesLearningExtension;
}

// ── Case: Stage(사업 단계)와 CaseType(레퍼런스 성격)은 별개 ──
export const stages = ['혁신금융서비스 지정','PoC','구축 중','구축 완료','상용 운영','확인 필요'] as const;
export type CaseStage = typeof stages[number];
export const caseTypes = ['DELIVERY','PRODUCTION','BUILDING','REGULATORY','BENCHMARK'] as const;
export type CaseType = typeof caseTypes[number];
export const caseTypeLabels: Record<CaseType, string> = {
  DELIVERY: '구축 납품', PRODUCTION: '실제 운영', BUILDING: '구축 진행', REGULATORY: '규제특례·지정 사실', BENCHMARK: '해외·타 산업 벤치마크',
};
// 허용되는 Stage 조합. BENCHMARK는 해외·타 산업 자료라 모든 단계를 허용한다.
export const caseTypeStages: Record<CaseType, readonly CaseStage[]> = {
  DELIVERY: ['구축 완료'], PRODUCTION: ['상용 운영'], BUILDING: ['PoC','구축 중'], REGULATORY: ['혁신금융서비스 지정'], BENCHMARK: stages,
};
export const caseRegions = ['KR','GLOBAL'] as const;
export type CaseRegion = typeof caseRegions[number];
export const caseDepths = ['DEEP_DIVE','LIGHT'] as const;
export type CaseDepth = typeof caseDepths[number];
export interface CaseStudy extends ContentBase {
  company: string; industry: Industry; date: string; stage: CaseStage; stageNote: string; stageSourceIds: string[];
  caseType: CaseType; region: CaseRegion; depth: CaseDepth;
  problem: string; deploymentModels: DeploymentModel[]; deploymentSourceIds: string[];
  csp: Evidence; model: Evidence; technology: Evidence; security: Evidence; architecture: Evidence; partner: Evidence;
  data?: Evidence; outcome?: Evidence; // Deep Dive의 "Case 읽는 8칸". 미검토면 undefined(미공개와 구분)
  sales?: SalesLearningExtension;
  salesView: string; meetingLine: string; relatedKnowledgeIds: string[]; caveats: string[];
}
export type ArchitecturePattern = ContentBase & { description: string; deploymentModels: DeploymentModel[]; componentIds: string[] } & ({ kind: 'GENERIC_PATTERN'; customerCaseId?: never } | { kind: 'DISCLOSED_CUSTOMER_ARCHITECTURE'; customerCaseId: string });
export interface TechnologyComponent extends ContentBase { role: string }
export type QuizFormat = 'SINGLE' | 'OX' | 'CONFUSION' | 'SCENARIO';
// 문항의 근거: 법규·공식문서 FACT인지, 교육용 해석(ARCHITECTURE_GUIDE/INTERPRETATION)인지 내부 metadata로 구분한다.
export type QuizBasis = Extract<ClaimType, 'FACT' | 'TECH_FACT' | 'INTERPRETATION' | 'ARCHITECTURE_GUIDE'>;
export interface QuizQuestion extends ContentBase { category: '금융규제'|'금융 IT'|'사례'|'아키텍처'; format: QuizFormat; basis: QuizBasis; prompt: string; options: string[]; correctIndex: number; reasons: string[]; relatedKnowledgeIds: string[]; relatedCaseIds: string[] }
export interface MeetingQuestion extends ContentBase { question: string; keywords: string[]; answer30s: string; answer60s: string; followUps: string[]; relatedKnowledgeIds: string[]; relatedCaseIds: string[] }
export type MeetingMode = 'quick'|'customer'|'deep-dive'|'account-manager';

// ── 16일 Curriculum ──
// SKELETON: 제목·목표·연결만 있는 상태(내용 작성 전). READY: 아래 필수 필드를 모두 채운 상태.
// READY의 최소 요건은 validate.ts가 검사한다 (결론 5·외울 문장 5·Discovery 5 등). 중복 Fact는 Knowledge Card를 참조한다.
export type DayContentStatus = 'SKELETON' | 'READY';
export interface CurriculumDay {
  id: string; day: number; title: string; goal: string; contentStatus: DayContentStatus;
  conclusions: string[]; whyLearn: string; prerequisites: string[];
  knowledgeIds: string[]; caseIds: string[]; architectureIds: string[];
  discoveryQuestions: string[]; relatedServices: string[]; meeting30s: string; nextQuestions: string[]; confusionPairs: string[];
  quizIds: string[]; meetingIds: string[]; memorize: string[]; sourceIds: string[];
  timelineIds?: string[];              // 이 Day에서 보여줄 규제 변화 이벤트 (Day 5)
  visuals?: DayVisual[];               // 이 Day에서 보여줄 도식
  sales?: SalesLearningExtension;
}
export type DayVisual = 'NETWORK_MAP' | 'LIFECYCLE_FLOW' | 'SYSTEM_LAYERS';
export const CURRICULUM_LENGTH = 16;

export interface TimelineEvent extends ContentBase { date: string; eventType: '발표'|'시행'|'가이드'|'지정'|'개선'|'추진'; status: 'ANNOUNCED'|'CURRENT'|'HISTORICAL'; previous: string; change: string; implication: string; knowledgeId: string }
export interface LearningProgress { contentId: string; completedAt: string }
export interface ReviewItem { questionId: string; dueAt: string; confidence: '모름'|'애매'|'확실'; correct: boolean }
export interface Bookmark { contentId: string; kind: 'knowledge'|'case'|'institution'; createdAt: string }
export interface PersistedState { version: 1; progress: LearningProgress[]; bookmarks: Bookmark[]; reviews: ReviewItem[]; meetingPracticed: string[] }
export interface ContentStore { sources: Source[]; knowledge: KnowledgeCard[]; cases: CaseStudy[]; quiz: QuizQuestion[]; meeting: MeetingQuestion[]; timeline: TimelineEvent[]; architectures: ArchitecturePattern[]; components: TechnologyComponent[]; curriculum: CurriculumDay[]; institutions: FinancialInstitution[] }

// ── 금융시장 IT·AX Index (구 "고객사 지도") ──
// 목적: 임의의 AI 성숙도 점수가 아니라, 공개된 사실(회사 규모·IT 사업·추진조직·책임자·구축사·근거)을 한 화면에서 비교하게 하는 Evidence-first 지표다.
// Case Library = 사업/프로젝트 단위, Index = 금융회사(Account) 단위. 두 데이터는 relatedCaseIds로만 연결하고 복사하지 않는다.
// "공개자료 없음"은 "사업 없음"이 아니다 (No evidence ≠ No activity). Source 없는 사실·사람 이름·조직명은 저장하지 않는다.
export const marketGroups = ['FIRST_FINANCIAL_SECTOR','SECOND_FINANCIAL_SECTOR','FINANCIAL_INFRA_FINTECH','OTHER'] as const;
export type MarketGroup = typeof marketGroups[number];
export const marketGroupLabels: Record<MarketGroup, string> = {
  FIRST_FINANCIAL_SECTOR: '제1금융권', SECOND_FINANCIAL_SECTOR: '제2금융권', FINANCIAL_INFRA_FINTECH: '금융인프라·핀테크', OTHER: '기타',
};
export const financialSectors = ['BANK','INTERNET_BANK','CARD','SECURITIES','LIFE_INSURANCE','NON_LIFE_INSURANCE','CAPITAL','SAVINGS_BANK','MUTUAL_FINANCE','ASSET_MANAGEMENT','FINTECH_ELECTRONIC_FINANCE','FINANCIAL_INFRA','OTHER'] as const;
export type FinancialSector = typeof financialSectors[number];
export const sectorLabels: Record<FinancialSector, string> = {
  BANK: '은행', INTERNET_BANK: '인터넷은행', CARD: '카드', SECURITIES: '증권', LIFE_INSURANCE: '생명보험', NON_LIFE_INSURANCE: '손해보험', CAPITAL: '캐피탈',
  SAVINGS_BANK: '저축은행', MUTUAL_FINANCE: '상호금융', ASSET_MANAGEMENT: '자산운용', FINTECH_ELECTRONIC_FINANCE: '핀테크·전자금융', FINANCIAL_INFRA: '금융인프라', OTHER: '기타',
};
// 화면에 보이는 업권 순서 (영업 학습 우선순서). 공식 인허가 분류(regulatoryCategory)와 섞지 않는다.
export const displaySectors = ['BANKING','CARD','SECURITIES','INSURANCE','CAPITAL','SAVINGS_BANK','MUTUAL_FINANCE','FINTECH','ASSET_INVEST','INFRA_CREDIT','OTHER'] as const;
export type DisplaySector = typeof displaySectors[number];
export const displaySectorLabels: Record<DisplaySector, string> = {
  BANKING: '은행', CARD: '카드', SECURITIES: '증권', INSURANCE: '보험', CAPITAL: '캐피탈', SAVINGS_BANK: '저축은행', MUTUAL_FINANCE: '상호금융',
  FINTECH: '핀테크·전자금융', ASSET_INVEST: '자산운용·투자', INFRA_CREDIT: '금융인프라·신용정보', OTHER: '기타',
};
export const displaySectorOf: Record<FinancialSector, DisplaySector> = {
  BANK: 'BANKING', INTERNET_BANK: 'BANKING', CARD: 'CARD', SECURITIES: 'SECURITIES', LIFE_INSURANCE: 'INSURANCE', NON_LIFE_INSURANCE: 'INSURANCE', CAPITAL: 'CAPITAL',
  SAVINGS_BANK: 'SAVINGS_BANK', MUTUAL_FINANCE: 'MUTUAL_FINANCE', ASSET_MANAGEMENT: 'ASSET_INVEST', FINTECH_ELECTRONIC_FINANCE: 'FINTECH', FINANCIAL_INFRA: 'INFRA_CREDIT', OTHER: 'OTHER',
};
// 금융위원회 인허가 대분류를 참고한 내부 분류 (화면 순서와 별개)
export const regulatoryCategories = ['BANKING','CAPITAL_MARKET','INSURANCE','NON_BANK','OTHER'] as const;
export type RegulatoryCategory = typeof regulatoryCategories[number];
export const regulatoryCategoryOf: Record<FinancialSector, RegulatoryCategory> = {
  BANK: 'BANKING', INTERNET_BANK: 'BANKING', SECURITIES: 'CAPITAL_MARKET', ASSET_MANAGEMENT: 'CAPITAL_MARKET', LIFE_INSURANCE: 'INSURANCE', NON_LIFE_INSURANCE: 'INSURANCE',
  CARD: 'NON_BANK', CAPITAL: 'NON_BANK', SAVINGS_BANK: 'NON_BANK', MUTUAL_FINANCE: 'NON_BANK', FINTECH_ELECTRONIC_FINANCE: 'NON_BANK', FINANCIAL_INFRA: 'OTHER', OTHER: 'OTHER',
};
export const priorityTiers = ['A','B','C'] as const;
export type PriorityTier = typeof priorityTiers[number];
// 조사 수준 = "우리 DB가 이 회사를 얼마나 조사했는가"이다. 고객의 디지털 성숙도가 아니다.
export const researchCoverages = ['UNRESEARCHED','BASIC','DEEP'] as const;
export type ResearchCoverage = typeof researchCoverages[number];
export const researchCoverageLabels: Record<ResearchCoverage, string> = {
  UNRESEARCHED: '공개 확인자료 없음 / 추가 조사 필요', BASIC: '기초 조사', DEEP: '심층 조사',
};
export const itDomains = ['CORE_ONPREM','PUBLIC_CLOUD','DATA','AI_AX','SECURITY_DR','OTHER'] as const;
export type ITFootprintDomain = typeof itDomains[number];
export const itDomainLabels: Record<ITFootprintDomain, string> = {
  CORE_ONPREM: 'Core·On-prem', PUBLIC_CLOUD: 'Public Cloud', DATA: 'Data', AI_AX: 'AI·AX', SECURITY_DR: 'Security·DR', OTHER: '기타',
};
export const itDomainScope: Record<ITFootprintDomain, string> = {
  CORE_ONPREM: 'Core system, 전산센터/IDC, 서버·스토리지, VMware/KVM, Private Cloud, Kubernetes, GPU/NPU, On-prem AI, Legacy modernization',
  PUBLIC_CLOUD: 'AWS, Azure, GCP, Naver Cloud, Landing Zone, Migration, Container, Managed Service',
  DATA: 'DW, Data Lake, Lakehouse, Data Platform, Analytics, MLOps, 데이터 거버넌스',
  AI_AX: 'GenAI, RAG, Knowledge Assistant, AI Agent, Contact Center AI, Document AI, Coding Assistant, AI Platform',
  SECURITY_DR: 'IAM, Zero Trust, SOC, Security, Backup, DR, BCP, AI Security',
  OTHER: '위 영역에 속하지 않는 사업(채널·개발자 플랫폼 등)',
};
// 기존 사업 분류(category)는 도메인 매핑의 입력으로만 쓴다. 한 사업은 여러 도메인에 cross-tag 될 수 있으나 데이터는 복사하지 않는다.
export const initiativeCategories = ['CLOUD','MIGRATION_MODERNIZATION','GENAI','AI_AGENT','DATA_ANALYTICS','AI_INFRA_GPU_NPU','SECURITY','NETWORK','DR_BCP','CORE_SYSTEM','CHANNEL','CONTACT_CENTER','DEVELOPER_PLATFORM','IDC','OTHER'] as const;
export type InitiativeCategory = typeof initiativeCategories[number];
// 근거 Source가 명시한 단계만 기록한다. 원문에 단계가 없으면 undefined (추정 금지).
export const initiativeStatuses = ['ANNOUNCED','REVIEWING','POC','BUILDING','COMPLETED','PRODUCTION','EXPANSION'] as const;
export type InitiativeStatus = typeof initiativeStatuses[number];
export const initiativeStatusLabels: Record<InitiativeStatus, string> = {
  ANNOUNCED: '발표', REVIEWING: '검토', POC: 'PoC', BUILDING: '구축 중', COMPLETED: '구축 완료', PRODUCTION: '운영', EXPANSION: '확대',
};
// 공개된 조직·책임자: 반드시 Source가 있어야 한다. Source 없는 이름·조직명은 UI에 표시하지 않는다.
export interface PublicOrganizationReference { name: string; scope?: string; sourceIds: string[]; lastVerifiedAt: string }
export interface PublicLeaderReference {
  personName: string; title: string; department?: string; scope?: string; asOfDate?: string; historical?: boolean;
  sourceIds: string[]; lastVerifiedAt: string;
}
export interface InstitutionInitiative {
  id: string; institutionId: string;
  title: string; announcedAt?: string;
  domains: ITFootprintDomain[];
  kind?: 'INITIATIVE' | 'MOU' | 'REGULATORY_DESIGNATION'; // MOU·규제특례 지정은 구축이 아니다. 단계(sourceStage)와 별개로 표시한다.
  products?: string[]; // 원문이 명시한 제품명(예: Amazon Bedrock). 원문에 제품명이 없으면 비운다.
  sourceStage?: InitiativeStatus; // Source에 단계가 명시되지 않으면 undefined
  summary: string; workloads?: string[];
  deploymentModels?: DeploymentModel[];
  cspVendors?: string[]; technologyVendors?: string[]; mspSiPartners?: string[];
  ownerDepartments?: PublicOrganizationReference[]; publicLeaders?: PublicLeaderReference[];
  technologyKeywords: string[]; businessOutcome?: string[];
  businessPurpose?: string; targetUsers?: string[]; securityGovernancePoints?: string[]; // Source가 말한 경우에만. 없으면 비워 둔다(UI에서 "공개 확인자료 없음")
  stageReviewedAt?: string; stageEvidenceQuote?: string; // sourceStage 재검증일과 짧은 내부 근거(원문 장문 저장 금지, 120자 이하)
  amTakeaway?: string; // SALES_VIEW: 영업 관점 해석. 사실(FACT)이 아니며 Source의 주장처럼 표시하지 않는다.
  discoveryQuestions?: string[]; // SALES_VIEW: 이 사업을 보고 다음 고객에게 물어볼 질문 2~5개
  relatedCaseIds: string[]; sourceIds: string[]; lastVerifiedAt: string;
}
// 규모: 같은 업권 안에서만, 같은 기준(assetBasis)·같은 기준일(assetAsOf)일 때만 순위를 만든다. 확보하지 못하면 null이다.
export interface InstitutionScale {
  totalAssets: number | null; unit?: string; assetAsOf?: string; assetBasis?: string; assetSourceIds: string[];
  secondaryScaleMetric?: { label: string; value: number; unit: string; asOf: string; sourceIds: string[] }; // 예: 증권사 자기자본
}
export interface FinancialInstitution {
  id: string; name: string; marketGroup: MarketGroup; sector: FinancialSector; subSector?: string; regulatoryCategory: RegulatoryCategory;
  financialGroup?: string; website?: string; priorityTier?: PriorityTier;
  sortNameKo?: string; // 같은 업권 안 이름순 정렬용 한글 표기(KB·NH 같은 영문 약칭이 뒤로 밀리지 않게 한다)
  dbResearchPriority?: boolean; // DB 심층조사 우선순위 대상 여부. 영업 공략 우선순위(salesPriority)가 아니다.
  universeSourceId?: string; // 회사 Universe를 확인한 공식 명부 Source (IT 사업 Source와 별개)
  rosterNote?: string; // 명부로 확인하지 못한 경우의 사유
  scale?: InstitutionScale;
  headOffice?: { region: string; district?: string; sourceIds: string[]; note?: string }; // 본사 소재지(시·도/구). IDC 주소는 Account Detail에서 공개 정보가 있을 때만 다룬다.
  researchCoverage: ResearchCoverage;
  ownerDepartments: PublicOrganizationReference[]; publicLeaders: PublicLeaderReference[]; // 공개 Source로 확인된 것만
  initiatives: InstitutionInitiative[]; relatedCaseIds: string[];
  sourceIds: string[]; // 명부·규모·사업 근거 Source 전체
  lastResearchedAt?: string;
}
