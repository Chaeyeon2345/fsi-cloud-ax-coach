import { initiativeStatusLabels, type InitiativeStatus, type ITFootprintDomain } from '../domain/types';

// 사업 하나를 "다음 고객에게 물어볼 질문(Discovery)"과 "AM 관점 해석(amTakeaway)"으로 바꾼다.
// 둘 다 SALES_VIEW다: 공개 사실(FACT)이 아니며 Source의 주장도 아니다. 사업의 영역·기술 키워드·원문이 말한 단계에서만 만들고, 모르면 단계를 단정하지 않는다.
interface Input { domains: ITFootprintDomain[]; technologyKeywords: string[]; sourceStage?: InitiativeStatus; targetUsers?: string[] }

const has = (i: Input, ...keys: string[]) => keys.some(k => i.technologyKeywords.includes(k));
const QUESTION_RULES: { when: (i: Input) => boolean; questions: string[] }[] = [
  { when: i => has(i, 'RAG', 'GenAI', 'Agent', 'Contact Center AI') || i.domains.includes('AI_AX'), questions: [
    '현재 내부문서 권한체계는 AI 검색·답변에도 그대로 적용됩니까?',
    '검색·학습 대상 문서는 누가 갱신하고 승인합니까?',
    '답변에 근거 문서(Source citation)를 함께 보여줘야 합니까?',
    '오답·부적절 답변이 나왔을 때 신고·수정·중단 절차는 어떻게 됩니까?',
  ] },
  { when: i => has(i, 'Agent'), questions: [
    '에이전트가 읽기만 합니까, 업무 시스템에 쓰기·실행 권한도 갖습니까?',
    '에이전트 실행 결과를 사람이 승인하는 지점은 어디입니까?',
  ] },
  { when: i => i.domains.includes('PUBLIC_CLOUD') || has(i, 'AWS', 'Azure', 'Google Cloud', 'Naver Cloud', 'KT Cloud'), questions: [
    '이 워크로드의 중요도 평가와 정보보호위원회 심의·이용 보고 일정은 어떻게 됩니까?',
    'Landing Zone·네트워크 연결(전용선/VPN)과 종료(Exit) 계획은 어떻게 됩니까?',
    'CSP 장애에 대비한 백업·DR 위치는 어디입니까?',
  ] },
  { when: i => i.domains.includes('CORE_ONPREM') || has(i, 'GPU', 'NPU', 'Private AI', 'Kubernetes', 'VMware'), questions: [
    '기존 코어·계정계 시스템과의 연계 방식과 허용 지연은 어떻게 됩니까?',
    '가속기(GPU/NPU)나 인프라의 활용률 목표와 운영 인력은 누가 맡습니까?',
    '3~5년 TCO를 CapEx/OpEx로 비교해 본 적이 있습니까?',
  ] },
  { when: i => i.domains.includes('DATA'), questions: [
    '데이터 분류·접근통제 기준과 AI 활용 범위는 어떻게 정해져 있습니까?',
    '데이터 플랫폼의 품질·계보(lineage) 관리는 누가 책임집니까?',
  ] },
  { when: i => i.domains.includes('SECURITY_DR'), questions: [
    '이 업무의 승인된 RTO/RPO와 마지막 복구 테스트 시점은 언제입니까?',
    '보안 사고·장애 시 의사결정과 대체업무 체계는 어떻게 됩니까?',
  ] },
  { when: () => true, questions: [
    '이 사업의 현재 단계(검토/PoC/구축/운영)와 다음 단계 일정은 어떻게 됩니까?',
    '사업의 의사결정자와 예산 주관 조직은 어디입니까?',
  ] },
];

export function discoveryQuestionsFor(i: Input): string[] {
  const picked: string[] = [];
  for (const rule of QUESTION_RULES) if (rule.when(i)) for (const q of rule.questions) if (!picked.includes(q) && picked.length < 5) picked.push(q);
  return picked.slice(0, 5);
}

// 영업 관점 해석. 단계는 원문이 말한 경우에만 언급한다.
export function amTakeawayFor(i: Input): string {
  const stage = i.sourceStage && i.sourceStage !== 'ANNOUNCED' ? initiativeStatusLabels[i.sourceStage] : undefined;
  const stageText = stage ? `원문이 ${stage} 단계라고 밝힌 사례로, ` : '원문에서 구축·운영 단계는 확인되지 않은 발표·협약 수준의 공개 신호이며, ';
  const staff = i.targetUsers?.length ? ` 공개된 대상 사용자는 ${i.targetUsers.join('·')}입니다.` : '';
  if (i.domains.includes('AI_AX')) return `${stageText}이 회사의 AI 활용 영역과 방향을 보여주는 신호로 읽을 수 있다. 확대 시 권한·근거·평가·비용 통제가 논의될 수 있다(영업 해석).${staff}`;
  if (i.domains.includes('PUBLIC_CLOUD')) return `${stageText}Public Cloud 이용 방향을 읽는 신호로 볼 수 있다. 중요도 평가·이용 보고·연결 구조 논의가 이어질 수 있다(영업 해석).${staff}`;
  if (i.domains.includes('CORE_ONPREM')) return `${stageText}코어·온프렘 인프라 투자와 기존 시스템 연계 수요가 있음을 보여주는 공개 신호로 볼 수 있다(영업 해석).${staff}`;
  if (i.domains.includes('DATA')) return `${stageText}데이터 기반 마련이 AI 활용의 전제가 되고 있음을 보여주는 신호로 볼 수 있다(영업 해석).${staff}`;
  if (i.domains.includes('SECURITY_DR')) return `${stageText}보안·복원력 요구가 도입 속도와 구조를 좌우한다는 신호로 볼 수 있다(영업 해석).${staff}`;
  return `${stageText}이 회사의 IT 사업 방향을 읽는 참고 신호이며 직접 확인이 필요하다(영업 해석).${staff}`;
}
