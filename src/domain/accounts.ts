import { daysSince } from './freshness';
import {
  displaySectorOf, displaySectors, itDomains, itDomainLabels, initiativeStatusLabels,
  type DisplaySector, type FinancialInstitution, type InitiativeCategory, type InstitutionInitiative, type ITFootprintDomain, type PublicLeaderReference, type Source,
} from './types';

// 금융시장 IT·AX Index의 계산 도구. 임의의 AI 성숙도 점수는 만들지 않는다 — 공개된 사실의 개수·분류만 센다.

// 사업 분류 → IT 영역(column). 한 사업이 여러 영역에 걸치면 cross-tag 하되 사업 데이터는 하나만 둔다.
export const DOMAIN_OF_CATEGORY: Record<InitiativeCategory, ITFootprintDomain[]> = {
  CLOUD: ['PUBLIC_CLOUD'], MIGRATION_MODERNIZATION: ['CORE_ONPREM'], GENAI: ['AI_AX'], AI_AGENT: ['AI_AX'], CONTACT_CENTER: ['AI_AX'],
  DATA_ANALYTICS: ['DATA'], AI_INFRA_GPU_NPU: ['CORE_ONPREM', 'AI_AX'], SECURITY: ['SECURITY_DR'], DR_BCP: ['SECURITY_DR'],
  NETWORK: ['CORE_ONPREM'], CORE_SYSTEM: ['CORE_ONPREM'], IDC: ['CORE_ONPREM'], CHANNEL: ['OTHER'], DEVELOPER_PLATFORM: ['OTHER'], OTHER: ['OTHER'],
};

// 사업 원문(제목·요약)에 실제로 적힌 기술 용어만 keyword로 뽑는다. 적혀 있지 않은 용어는 만들지 않는다.
const KEYWORD_PATTERNS: [string, RegExp][] = [
  ['AWS', /AWS|아마존/], ['Azure', /Azure|애저/], ['Google Cloud', /Google Cloud|구글 ?클라우드/], ['Naver Cloud', /네이버클라우드|Naver Cloud/], ['KT Cloud', /KT ?클라우드/],
  ['Private AI', /Private AI|프라이빗 AI|온프레미스 AI|온프렘 AI/i], ['GenAI', /생성형/], ['RAG', /RAG/], ['Agent', /에이전트|Agent/i],
  ['GPU', /GPU/], ['NPU', /NPU/], ['Kubernetes', /쿠버네티스|Kubernetes/i], ['VMware', /VMware/i], ['Data Lake', /데이터 ?레이크|Data Lake/i],
  ['DR', /DR센터|재해복구|\bDR\b/], ['제로트러스트', /제로 ?트러스트|Zero Trust/i], ['SOC', /\bSOC\b|관제/], ['Contact Center AI', /컨택센터|콜센터/], ['Coding Assistant', /코딩 ?어시스턴트|코드 ?어시스턴트/], ['MCP', /MCP/], ['LLMOps', /LLMOps/i], ['OCR', /OCR/], ['STT', /STT/],
];
export function extractKeywords(text: string): string[] {
  return KEYWORD_PATTERNS.filter(([, re]) => re.test(text)).map(([k]) => k);
}
// 사업 분류(category)에서 온 일반 용어. 원문에서 뽑은 기술 용어가 없을 때 Chip 라벨로 쓴다.
export const CATEGORY_KEYWORD: Record<InitiativeCategory, string | undefined> = {
  CLOUD: 'Cloud', MIGRATION_MODERNIZATION: 'Modernization', GENAI: 'GenAI', AI_AGENT: 'Agent', DATA_ANALYTICS: 'Data', AI_INFRA_GPU_NPU: 'GPU', SECURITY: 'Security', NETWORK: 'Network',
  DR_BCP: 'DR', CORE_SYSTEM: 'Core system', CHANNEL: undefined, CONTACT_CENTER: 'Contact Center AI', DEVELOPER_PLATFORM: undefined, IDC: 'IDC', OTHER: undefined,
};
export const CSP_NAMES = ['AWS', 'AWS Bedrock', 'Google Cloud', 'Microsoft Azure', 'Azure', '네이버클라우드', 'KT클라우드', 'NHN클라우드'];
export const MSP_SI_NAMES = ['메가존클라우드', '삼성SDS', 'SK AX', 'LG CNS', 'kt ds', '유베이스', 'ECS텔레콤', 'KT', 'SK텔레콤', 'LG유플러스'];

// 신규 조사 사업의 IT 영역: 제목·요약·키워드에서 원문에 적힌 용어로만 판단한다. 맞는 영역이 없으면 기타.
export function inferDomains(text: string, hasCsp: boolean): ITFootprintDomain[] {
  const d = new Set<ITFootprintDomain>();
  if (/AI|생성형|GenAI|RAG|에이전트|Agent|LLM|챗봇|AICC|HyperCLOVA|코파일럿|Copilot|NPU|GPU/i.test(text)) d.add('AI_AX');
  if (hasCsp || /클라우드|Cloud|AWS|Azure|OCI/i.test(text)) d.add('PUBLIC_CLOUD');
  if (/차세대|코어|계정계|정보계|IDC|데이터센터|GPU|NPU|온프레미스|온프렘|가상화|쿠버네티스|Kubernetes|OpenShift|VMware|인프라|전산/i.test(text)) d.add('CORE_ONPREM');
  if (/데이터|DW|Lake|Lakehouse|분석|Snowflake|플랫폼 통합/i.test(text)) d.add('DATA');
  if (/보안|DR|백업|재해|제로트러스트|FDS|피싱|이상거래|관제/i.test(text)) d.add('SECURITY_DR');
  return d.size ? [...d] : ['OTHER'];
}
// 최신 사업이 앞에 오도록 정렬 (날짜 없는 사업은 뒤로)
export const byLatest = (a: InstitutionInitiative, b: InstitutionInitiative) => (b.announcedAt ?? '').localeCompare(a.announcedAt ?? '');
export const latestInitiative = (inst: Pick<FinancialInstitution, 'initiatives'>) => [...inst.initiatives].sort(byLatest)[0];
export const initiativeYear = (i: Pick<InstitutionInitiative, 'announcedAt'>) => i.announcedAt?.slice(0, 4);
// 최근 3년(2024~2026) 밖의 사업은 역사자료로 표시한다.
export const RECENT_YEARS = ['2026', '2025', '2024'];
export const isHistoricalInitiative = (i: Pick<InstitutionInitiative, 'announcedAt'>) => !!i.announcedAt && !RECENT_YEARS.includes(i.announcedAt.slice(0, 4));

// 공개된 Vendor·CSP·MSP/SI·배포모델 (공개된 범위만. 없으면 빈 배열)
export function disclosedPartners(inst: Pick<FinancialInstitution, 'initiatives'>) {
  const uniq = (pick: (i: InstitutionInitiative) => string[] | undefined) => [...new Set(inst.initiatives.flatMap(i => pick(i) ?? []))];
  return {
    csp: uniq(i => i.cspVendors), vendors: uniq(i => i.technologyVendors), msp: uniq(i => i.mspSiPartners), models: uniq(i => i.deploymentModels),
  };
}

// Matrix Cell의 Chip. 사업 하나가 영역마다 Chip 하나가 된다. 라벨은 원문에서 확인된 keyword(없으면 사업 제목)이고 단계는 Source가 명시한 경우만 붙인다.
export interface InitiativeChipData { initiative: InstitutionInitiative; label: string }
export function chipLabel(i: InstitutionInitiative, domain: ITFootprintDomain): string {
  const domainKeywords: Record<ITFootprintDomain, string[]> = {
    PUBLIC_CLOUD: ['AWS', 'Azure', 'Google Cloud', 'Naver Cloud', 'KT Cloud', 'Cloud'], AI_AX: ['Private AI', 'RAG', 'Agent', 'GenAI', 'Contact Center AI', 'Coding Assistant'],
    CORE_ONPREM: ['Private AI', 'GPU', 'NPU', 'Kubernetes', 'VMware', 'Core system', 'IDC', 'Modernization', 'Network'], DATA: ['Data Lake', 'Data'], SECURITY_DR: ['DR', '제로트러스트', 'SOC', 'Security'], OTHER: [],
  };
  const k = i.technologyKeywords.find(x => domainKeywords[domain].includes(x)) ?? i.technologyKeywords[0] ?? itDomainLabels[domain];
  const short = k.length > 18 ? `${k.slice(0, 17)}…` : k;
  const year = initiativeYear(i);
  const stage = i.sourceStage && i.sourceStage !== 'ANNOUNCED' ? initiativeStatusLabels[i.sourceStage] : i.kind === 'MOU' ? 'MOU' : i.kind === 'REGULATORY_DESIGNATION' ? '지정' : undefined;
  return [short, stage ?? year].filter(Boolean).join(' · ') + (stage && year ? ` ${year}` : '');
}
export const chipsFor = (inst: Pick<FinancialInstitution, 'initiatives'>, domain: ITFootprintDomain) =>
  [...inst.initiatives].sort(byLatest).filter(i => i.domains.includes(domain)).map(i => ({ initiative: i, label: chipLabel(i, domain) }));

// 회사별 Evidence Summary (객관적 개수만. 점수·등급 없음)
export function evidenceSummary(inst: Pick<FinancialInstitution, 'initiatives' | 'lastResearchedAt'>) {
  const byDomain = Object.fromEntries(itDomains.map(d => [d, inst.initiatives.filter(i => i.domains.includes(d)).length])) as Record<ITFootprintDomain, number>;
  const last = inst.initiatives.map(i => i.lastVerifiedAt).sort().at(-1) ?? inst.lastResearchedAt;
  return { total: inst.initiatives.length, byDomain, lastVerifiedAt: last };
}
// 공식 출처 비중: 사업 근거 Source 중 금융회사·금융당국·공시·공식 CSP/MSP/SI·협회 자료의 비율 (전문언론·기타 제외). 품질 점수가 아니라 근거 구성의 설명이다.
const OFFICIAL_TYPES = ['CUSTOMER_OFFICIAL', 'REGULATOR_OFFICIAL', 'DISCLOSURE', 'VENDOR_OFFICIAL', 'ASSOCIATION_OFFICIAL'];
export function officialSourceShare(inst: Pick<FinancialInstitution, 'initiatives'>, all: Source[]): { official: number; total: number } {
  const ids = [...new Set(inst.initiatives.flatMap(i => i.sourceIds))];
  const rows = all.filter(s => ids.includes(s.id));
  return { official: rows.filter(s => OFFICIAL_TYPES.includes(s.sourceType ?? 'OTHER')).length, total: rows.length };
}
// Source Library 분류 (회사별 화면)
export const SOURCE_CATEGORIES: { key: string; label: string; types: string[] }[] = [
  { key: 'company', label: '공식 회사', types: ['CUSTOMER_OFFICIAL'] },
  { key: 'disclosure', label: '공시·금융당국', types: ['REGULATOR_OFFICIAL', 'DISCLOSURE'] },
  { key: 'vendor', label: 'CSP·MSP·SI 공식', types: ['VENDOR_OFFICIAL'] },
  { key: 'association', label: '협회', types: ['ASSOCIATION_OFFICIAL'] },
  { key: 'media', label: '전문언론', types: ['PROFESSIONAL_MEDIA', 'OTHER'] },
];
// 각 Source가 이 회사의 어떤 Fact를 뒷받침하는지
export function sourceSupports(inst: FinancialInstitution): Map<string, string[]> {
  const m = new Map<string, string[]>();
  const add = (id: string, text: string) => m.set(id, [...(m.get(id) ?? []), text]);
  if (inst.universeSourceId) add(inst.universeSourceId, '회사 명부(Universe)');
  inst.scale?.assetSourceIds.forEach(id => add(id, `총자산${inst.scale?.assetAsOf ? ` (${inst.scale.assetAsOf})` : ''}`));
  inst.scale?.secondaryScaleMetric?.sourceIds.forEach(id => add(id, inst.scale!.secondaryScaleMetric!.label));
  inst.ownerDepartments.forEach(o => o.sourceIds.forEach(id => add(id, `조직: ${o.name}`)));
  inst.publicLeaders.forEach(l => l.sourceIds.forEach(id => add(id, `책임자: ${l.personName} ${l.title}`)));
  for (const i of inst.initiatives) {
    i.sourceIds.forEach(id => add(id, `사업: ${i.title}`));
    (i.ownerDepartments ?? []).forEach(o => o.sourceIds.forEach(id => add(id, `조직: ${o.name}`)));
    (i.publicLeaders ?? []).forEach(l => l.sourceIds.forEach(id => add(id, `책임자: ${l.personName} ${l.title}`)));
  }
  for (const [k, v] of m) m.set(k, [...new Set(v)]);
  return m;
}

// 공개 추진조직: 최근 사업에서 Source로 확인된 조직 최대 2개 (회사 전체의 "담당부서"로 통합하지 않는다)
export function publicOrganizations(inst: Pick<FinancialInstitution, 'initiatives' | 'ownerDepartments'> & Partial<Pick<FinancialInstitution, 'publicLeaders'>>, max = 2): string[] {
  const names = [...inst.ownerDepartments.map(o => o.name), ...[...inst.initiatives].sort(byLatest).flatMap(i => (i.ownerDepartments ?? []).map(o => o.name)), ...(inst.publicLeaders ?? []).filter(l => l.department).map(l => l.department!)];
  return [...new Set(names)].slice(0, max);
}
// 책임자 직책은 바뀌므로 90일 이상 재확인되지 않으면 "재확인 필요"
export const LEADER_RECHECK_DAYS = 90;
export const leaderNeedsRecheck = (l: Pick<PublicLeaderReference, 'lastVerifiedAt' | 'historical'>, today: Date = new Date()) => !l.historical && daysSince(l.lastVerifiedAt, today) > LEADER_RECHECK_DAYS;

// 출처 등급 순서(금융회사 공식 → 금융당국 → 공시 → CSP/MSP/SI → 협회 → 언론)로 정렬
export function sortSourcesByType(list: Source[]): Source[] {
  const order = ['CUSTOMER_OFFICIAL', 'REGULATOR_OFFICIAL', 'DISCLOSURE', 'VENDOR_OFFICIAL', 'ASSOCIATION_OFFICIAL', 'PROFESSIONAL_MEDIA', 'OTHER'];
  return [...list].sort((a, b) => order.indexOf(a.sourceType ?? 'OTHER') - order.indexOf(b.sourceType ?? 'OTHER'));
}

// 규모 순위: 같은 업권 안에서만, 모든 회사가 같은 기준(assetBasis)·같은 기준일(assetAsOf)로 총자산을 갖고 있을 때만 계산한다.
// 하나라도 다르거나 비어 있으면 순위를 추정하지 않고 null이다.
export function assetRanks(list: FinancialInstitution[]): Map<string, number | null> {
  const ranks = new Map<string, number | null>();
  for (const ds of displaySectors) {
    const group = list.filter(i => displaySectorOf[i.sector] === ds);
    const scaled = group.filter(i => i.scale?.totalAssets != null);
    const comparable = group.length > 1 && scaled.length === group.length
      && new Set(group.map(i => `${i.scale!.assetBasis}|${i.scale!.assetAsOf}|${i.scale!.unit}`)).size === 1 && !!group[0].scale!.assetBasis && !!group[0].scale!.assetAsOf;
    const sorted = [...group].sort((a, b) => (b.scale?.totalAssets ?? 0) - (a.scale?.totalAssets ?? 0));
    group.forEach(i => ranks.set(i.id, comparable ? sorted.indexOf(i) + 1 : null));
  }
  return ranks;
}
// 화면 정렬: 업권 순서 → 같은 업권 안에서는 총자산 내림차순(자산이 없는 회사는 뒤, 이름순)
const nameKey = (i: Pick<FinancialInstitution, 'name' | 'sortNameKo'>) => i.sortNameKo ?? i.name;
export function sortForDisplay(list: FinancialInstitution[]): FinancialInstitution[] {
  const sectorIndex = (i: FinancialInstitution) => displaySectors.indexOf(displaySectorOf[i.sector] as DisplaySector);
  return [...list].sort((a, b) => sectorIndex(a) - sectorIndex(b)
    || (b.scale?.totalAssets ?? -1) - (a.scale?.totalAssets ?? -1)
    || nameKey(a).localeCompare(nameKey(b), 'ko'));
}
// 금액 표시: 원 단위 값은 조원으로 보여준다 (예: 563.6조원). 값이 없으면 "미확보".
export function formatWon(value: number, unit = '원'): string {
  const won = unit === '원' ? value : unit === '억원' ? value * 1e8 : unit === '조원' ? value * 1e12 : value;
  return `${(won / 1e12).toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}조원`;
}
export function scaleText(inst: Pick<FinancialInstitution, 'scale'>): string {
  const s = inst.scale;
  if (s?.totalAssets == null) return '미확보';
  return `${formatWon(s.totalAssets, s.unit)}${s.assetAsOf ? ` (${s.assetAsOf})` : ''}`;
}
