// 신규 조사 사업 중 "Case 최소요건"(고객·목적·Workload·단계·배포/Architecture 단서·기술·보안/거버넌스·Source)을 충족한 것만 Case(LIGHT)로 올린다.
// 요건을 못 채운 사업은 Case가 아니라 시장 모판의 Initiative로 남는다. Deep Dive는 수작업으로 검토한 사례만 해당한다.
// 단계는 원문이 명시한 것만 쓰고 MOU·수주·도입 계획은 Case가 아니다.
import type { CaseStudy, CaseType, DeploymentModel, Evidence, Industry } from '../domain/types';
import { newInitiatives, type NewInitiative } from './accountUniverse';

const INDUSTRY: Record<string, Industry> = {
  BANK: '은행', INTERNET_BANK: '은행', CARD: '카드', SECURITIES: '증권', LIFE_INSURANCE: '보험', NON_LIFE_INSURANCE: '보험', CAPITAL: '캐피탈', SAVINGS_BANK: '저축은행',
  FINTECH_ELECTRONIC_FINANCE: '핀테크·전자금융', MUTUAL_FINANCE: '상호금융·협동조합', ASSET_MANAGEMENT: '자산운용·투자', FINANCIAL_INFRA: '신용정보·금융인프라',
};
const CASE_STAGE: Record<string, { type: CaseType; stage: CaseStudy['stage'] }> = {
  PRODUCTION: { type: 'PRODUCTION', stage: '상용 운영' }, COMPLETED: { type: 'DELIVERY', stage: '구축 완료' }, BUILDING: { type: 'BUILDING', stage: '구축 중' }, POC: { type: 'BUILDING', stage: 'PoC' },
};
const ev = (value: string, ids: string[]): Evidence => (value ? { value, status: 'DISCLOSED', sourceIds: ids } : { value: '미공개', status: 'UNKNOWN', sourceIds: [] });

export function toCase(x: NewInitiative): CaseStudy {
  const cs = x.kind === 'REGULATORY_DESIGNATION' && !x.stage ? { type: 'REGULATORY' as CaseType, stage: '혁신금융서비스 지정' as CaseStudy['stage'] } : CASE_STAGE[x.stage ?? ''];
  const ids = x.srcs;
  const tech = [...x.keywords, ...x.vendors, ...x.products].filter((v, n, a) => a.indexOf(v) === n).join(', ');
  return {
    id: x.caseId!, company: x.company, industry: INDUSTRY[x.sector] ?? '기타', title: x.title, date: x.date ?? '날짜 미공개', stage: cs.stage,
    stageNote: '표시 단계는 아래 출처가 입증한 시점 기준입니다. 이후 완료·변경 여부는 별도 확인하세요.', stageSourceIds: ids,
    contentKind: 'VERIFIED', sourceIds: ids, caseType: cs.type, region: 'KR', depth: 'LIGHT',
    problem: x.purpose ?? x.summary,
    deploymentModels: x.models as DeploymentModel[], deploymentSourceIds: x.models.length ? ids : [],
    csp: ev(x.csp.join(', '), ids), model: ev('', ids), technology: ev(tech, ids), security: ev(x.security.join(' · '), ids), architecture: ev('', ids), partner: ev([...x.msp, ...x.vendors].join(', '), ids),
    outcome: x.outcome.length ? ev(x.outcome.join(' · '), ids) : undefined,
    salesView: '이 사례는 공개된 목적과 단계를 기준으로 유사 고객에게 가져갈 Reference입니다. 구축 범위와 운영 책임은 고객 환경에서 다시 확인하세요.',
    meetingLine: `${x.company}의 ${x.title} 사례는 공개된 단계(${cs.stage})부터 확인하고 고객 환경에 맞춰 검토할 수 있습니다.`,
    relatedKnowledgeIds: ['cloud-lifecycle', 'ai-saas'], caveats: ['Light 사례입니다. 공개 자료에 없는 CSP·Architecture·모델·금액은 추정하지 않았습니다.', ...(x.quote ? [] : [])],
    sales: {
      amMustKnow: [`공개된 단계는 “${cs.stage}”이며 그 이상을 단정하지 않는다.`, '공개되지 않은 Architecture·CSP는 추정하지 않는다.', '유사 Reference로 쓸 때 고객의 데이터·규제 조건을 먼저 확인한다.'],
      discoveryQuestions: ['이 사례와 같은 업무에서 고객의 현재 상태는 어떻습니까?', '데이터와 접근 통제 요건은 무엇입니까?', '현재 단계와 다음 단계 일정은?'],
      architectureMeaning: '공개된 구성 단서만 구조도에 표시하고 나머지는 “미공개”로 둡니다.',
      relatedServices: ['Reference 기반 Discovery', 'Architecture Assessment'],
      saHandoff: ['공개 구성 단서 검토', '고객 환경 요건 정리'],
      nextQuestions: ['고객의 규제·보안 검토 일정은?', '유사 구조가 가능한 조건은?'],
      commonMistakes: ['MOU·수주·지정을 구축 완료로 설명한다.', '공개되지 않은 구성을 사례에 덧붙인다.'],
    },
  };
}
export const autoCases: CaseStudy[] = newInitiatives.filter(x => x.caseId).map(toCase);
