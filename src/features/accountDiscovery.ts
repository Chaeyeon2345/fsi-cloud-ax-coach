import type { FinancialInstitution, FinancialSector, ITFootprintDomain } from '../domain/types';

// 회사 상세의 "이 회사에 물어볼 Discovery Question".
// 회사의 공식 계획이 아니라 영업 관점의 질문 템플릿(SALES_VIEW)이다. 공개된 사업 분야와 업권에 맞춰 고른다.
const bySector: Partial<Record<FinancialSector, string[]>> = {
  BANK: ['핵심 계정계와 채널·AI 서비스의 연계는 어떤 구조입니까?', '직원용 AI와 고객 대면 AI 중 어디부터 확대할 계획입니까?', '복원력(RTO/RPO)과 DR 요구수준은 어떻게 정의돼 있습니까?'],
  INTERNET_BANK: ['클라우드 기반 서비스와 규제 대응(중요도 평가·이용보고)은 어떻게 운영합니까?', 'AI 서비스를 고객 대면에 적용할 때 검증·고지 체계는 무엇입니까?', '장애 대응과 DR 체계는 어떻게 설계돼 있습니까?'],
  CARD: ['승인 경로와 분석·상담 영역 중 AI·Cloud 적용 범위는 어디까지입니까?', 'FDS·데이터 분석 플랫폼의 현재 구성과 개선 계획은 무엇입니까?', '대고객 AI 서비스의 답변 검증과 개인정보 통제는 어떻게 합니까?'],
  SECURITIES: ['장중 거래 경로와 리서치·내부 Knowledge 영역 중 우선 적용 대상은 어디입니까?', '허용 지연(Latency)과 장중 DR 요구수준은 어느 정도입니까?', '온프렘과 Cloud의 역할 분담 기준은 무엇입니까?'],
  LIFE_INSURANCE: ['문서·상담·심사 보조 중 우선 Use Case는 무엇입니까?', 'AI 결과의 최종 검토 책임자와 근거 추적 방식은 무엇입니까?', '약관·상품 Knowledge의 권한 관리는 어떻게 합니까?'],
  NON_LIFE_INSURANCE: ['보상·심사 보조와 문서·상담 중 우선 Use Case는 무엇입니까?', 'AI 결과의 최종 검토 책임자와 근거 추적 방식은 무엇입니까?', '혁신금융서비스 등 적용 제도 경로는 어디까지 검토했습니까?'],
  CAPITAL: ['심사·영업 지원 업무에서 AI 적용 후보는 무엇입니까?', '그룹 공통 인프라와 자체 인프라의 경계는 어디입니까?', '업무 문서와 개인신용정보의 보관·접근 통제는 어떻게 합니까?'],
  SAVINGS_BANK: ['IT 운영은 자체 수행입니까, 공동 인프라·위탁을 이용합니까?', 'Cloud·AI 도입 시 규제 검토를 담당하는 조직은 어디입니까?', '우선순위가 높은 업무(심사·영업·상담)는 무엇입니까?'],
  FINANCIAL_INFRA: ['기관 업무의 연속성 요구와 외부 연계 구조는 어떻게 됩니까?', '내부 업무 AI의 데이터 통제 기준은 무엇입니까?'],
};
const byDomain: Record<ITFootprintDomain, string> = {
  AI_AX: 'AI 서비스의 현재 단계(PoC/운영)와 확대 계획은 무엇입니까? 에이전트라면 읽기만 합니까, 업무 시스템에 쓰기·실행 권한도 갖습니까?',
  PUBLIC_CLOUD: '클라우드 전환 대상 업무의 중요도 평가와 심의 일정은 어떻게 됩니까?',
  CORE_ONPREM: '코어·온프렘 인프라 변경 계획(전산센터, 가속기, 현대화)과 주변 시스템(채널·분석·AI)의 연계는 무엇입니까?',
  DATA: '데이터 플랫폼의 데이터 분류·접근통제와 AI 연계 계획은 무엇입니까?',
  SECURITY_DR: '보안·DR 사업의 우선순위와 RTO/RPO, 복구 테스트 주기는 어떻게 됩니까?',
  OTHER: '해당 사업의 목표와 현재 단계, 의사결정자는 누구입니까?',
};

export interface AccountDiscovery { sector: string[]; initiative: { title: string; question: string }[]; fallback: string[] }
export function accountDiscovery(inst: Pick<FinancialInstitution, 'sector' | 'initiatives'>): AccountDiscovery {
  const seen = new Set<ITFootprintDomain>();
  const initiative = inst.initiatives.flatMap(i => i.domains.filter(d => !seen.has(d) && seen.add(d)).map(d => ({ title: i.title, question: byDomain[d] })));
  const fallback = inst.initiatives.length ? [] : [
    '현재 Cloud·AI 이용 현황과 검토 중인 Use Case는 무엇입니까? (공개자료로 확인되지 않아 직접 확인이 필요합니다)',
    '의사결정 구조와 규제 검토(중요도 평가·정보보호위원회) 담당 조직은 어디입니까?',
  ];
  return { sector: bySector[inst.sector] ?? ['현재 Cloud·AI 이용 현황과 우선 Use Case는 무엇입니까?'], initiative, fallback };
}
