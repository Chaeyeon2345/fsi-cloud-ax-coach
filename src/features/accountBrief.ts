import { cases, sources } from '../content';
import { topics } from '../content/regulationPlaybook';
import { evidenceSummary, latestInitiative, byLatest, scaleText, publicOrganizations } from '../domain/accounts';
import { institutionEcosystem } from '../domain/ecosystem';
import { displaySectorLabels, displaySectorOf, itDomainLabels, type CaseStudy, type FinancialInstitution, type ITFootprintDomain, type InstitutionInitiative, type PublicLeaderReference } from '../domain/types';
import { amTakeawayFor, discoveryQuestionsFor } from './initiativeInsights';
import { accountDiscovery } from './accountDiscovery';

// Account Intelligence Brief: 공개 DB(FACT)에서 가져온 사실과 영업 해석(SALES_VIEW)을 분리해서 만든다.
// 사실은 Source가 있는 값만, 해석은 항상 "내 해석"으로 표시하며 점수·성숙도 평가를 하지 않는다.
const DOMAIN_TOPICS: Record<ITFootprintDomain, string[]> = {
  AI_AX: ['t-ai-gov', 't-sandbox', 't-ai-act'], PUBLIC_CLOUD: ['t-cloud', 't-outsourcing', 't-exit'], CORE_ONPREM: ['t-network', 't-bcp', 't-infra'],
  DATA: ['t-data', 't-rnd', 't-network'], SECURITY_DR: ['t-infra', 't-bcp', 't-vendor'], OTHER: ['t-cloud'],
};
const industryOf = (i: FinancialInstitution): string => {
  const m = displaySectorLabels[displaySectorOf[i.sector]];
  return m === '금융인프라·신용정보' ? '신용정보·금융인프라' : m;
};
export const relatedRegulations = (inst: FinancialInstitution): { id: string; title: string }[] => {
  const order: ITFootprintDomain[] = [...new Set(inst.initiatives.flatMap(i => i.domains))];
  const ids = [...new Set([...order.flatMap(d => DOMAIN_TOPICS[d]), 't-cloud', 't-data', 't-bcp'])].slice(0, 3);
  return ids.map(id => ({ id, title: topics.find(t => t.id === id)?.title ?? id }));
};
export function similarCases(inst: FinancialInstitution, max = 2): CaseStudy[] {
  const own = new Set(inst.relatedCaseIds);
  const ind = industryOf(inst);
  const domains = new Set(inst.initiatives.flatMap(i => i.domains));
  const pool = cases.filter(c => c.region === 'KR' && !own.has(c.id));
  const score = (c: CaseStudy) => (c.industry === ind ? 2 : 0) + (domains.has('AI_AX') && /AI|RAG|Agent/i.test(c.title + c.technology.value) ? 1 : 0) + (domains.has('PUBLIC_CLOUD') && /AWS|Cloud|클라우드/i.test(c.title + c.csp.value) ? 1 : 0);
  return [...pool].sort((a, b) => score(b) - score(a)).slice(0, max);
}
export interface Brief {
  inst: FinancialInstitution;
  facts: { text: string; sourceIds: string[] }[];
  recent: InstitutionInitiative[];
  keyman?: PublicLeaderReference; pastKeyman: number;
  eco: ReturnType<typeof institutionEcosystem>;
  regulations: { id: string; title: string }[];
  references: CaseStudy[];
  hypotheses: string[];
  questions: string[];
  summary: ReturnType<typeof evidenceSummary>;
  orgs: string[];
}
export function buildBrief(inst: FinancialInstitution): Brief {
  const recent = [...inst.initiatives].sort(byLatest).slice(0, 3);
  const eco = institutionEcosystem(inst);
  const current = inst.publicLeaders.filter(l => !l.historical);
  const keyman = current.find(l => /AX|AI|디지털|DT|데이터/.test(l.title + (l.department ?? ''))) ?? current[0];
  const facts: Brief['facts'] = [];
  facts.push({ text: `${industryOf(inst)}${inst.subSector ? ` · ${inst.subSector}` : ''}`, sourceIds: inst.universeSourceId ? [inst.universeSourceId] : [] });
  if (inst.scale?.totalAssets != null) facts.push({ text: `총자산 ${scaleText(inst)} (${inst.scale.assetBasis})`, sourceIds: inst.scale.assetSourceIds });
  if (inst.headOffice) facts.push({ text: `본사 ${inst.headOffice.region}${inst.headOffice.district ? ` ${inst.headOffice.district}` : ''}`, sourceIds: inst.headOffice.sourceIds });
  if (eco.csp.length) facts.push({ text: `공개된 CSP: ${eco.csp.join(', ')}`, sourceIds: inst.initiatives.filter(i => i.cspVendors?.length).flatMap(i => i.sourceIds).slice(0, 2) });
  if (eco.msp.length) facts.push({ text: `공개된 MSP/SI: ${eco.msp.join(', ')}`, sourceIds: inst.initiatives.filter(i => i.mspSiPartners?.length).flatMap(i => i.sourceIds).slice(0, 2) });
  for (const i of recent) { if (facts.length >= 7) break; facts.push({ text: `${i.announcedAt ?? '날짜 미공개'} ${i.title}${i.sourceStage ? ` (원문 기준 단계: ${i.sourceStage})` : i.kind === 'MOU' ? ' (MOU)' : i.kind === 'REGULATORY_DESIGNATION' ? ' (규제특례 지정)' : ''}`, sourceIds: i.sourceIds }); }
  const hypotheses = recent.length
    ? recent.slice(0, 3).map(i => `(내 해석) ${i.title} → ${amTakeawayFor(i)}`)
    : ['(내 해석) 공개 사업이 확인되지 않았으므로 업권 공통 질문으로 현재 Cloud·AI 이용 현황부터 확인한다.'];
  const sectorQ = accountDiscovery(inst).sector;
  const initQ = recent.flatMap(i => discoveryQuestionsFor(i));
  const questions = [...new Set([...initQ, ...sectorQ, '이 사업의 현재 단계와 다음 단계 일정은 어떻게 됩니까?', '의사결정자와 예산 주관 조직은 어디입니까?'])].slice(0, 10);
  return { inst, facts: facts.slice(0, 5).length < 5 ? facts : facts.slice(0, 5), recent, keyman, pastKeyman: inst.publicLeaders.filter(l => l.historical).length, eco, regulations: relatedRegulations(inst), references: similarCases(inst), hypotheses, questions, summary: evidenceSummary(inst), orgs: publicOrganizations(inst, 3) };
}
export const sourceLinks = (ids: string[]) => sources.filter(s => ids.includes(s.id));
export { latestInitiative, itDomainLabels };
