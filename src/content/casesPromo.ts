// 이미 시장 모판에 있는 사업 중 Case 최소요건을 충족한 것을 Case(LIGHT)로 만든다. 데이터는 사업(Initiative)에서 참조한다.
import type { CaseStudy } from '../domain/types';
import { institutions, PROMOTED_IDS } from './accountData';
import { toCase } from './casesAuto';

export const promotedCases: CaseStudy[] = PROMOTED_IDS.flatMap(id => {
  const inst = institutions.find(i => i.initiatives.some(x => x.id === id));
  const x = inst?.initiatives.find(z => z.id === id);
  if (!inst || !x) return [];
  return [toCase({
    inst: inst.id, company: inst.name, sector: inst.sector, caseId: `promo-${id}`, title: x.title, date: x.announcedAt ?? null, summary: x.summary, kind: x.kind ?? 'INITIATIVE', stage: x.sourceStage ?? null, quote: x.stageEvidenceQuote ?? '',
    models: x.deploymentModels ?? [], csp: x.cspVendors ?? [], msp: x.mspSiPartners ?? [], vendors: x.technologyVendors ?? [], products: x.products ?? [], keywords: x.technologyKeywords, workloads: x.workloads ?? [], targetUsers: x.targetUsers ?? [],
    purpose: x.businessPurpose ?? null, security: x.securityGovernancePoints ?? [], outcome: x.businessOutcome ?? [], depts: [], caseCandidate: true, srcs: x.sourceIds,
  })];
});
