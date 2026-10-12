// Day 14~16 본문. 목표: 금융시장과 고객을 읽고, 고객의 IT·AX 사업기회를 발견하고, 첫 미팅과 Account Plan까지 연결하는 금융 AE.
// 특정 Vendor/MSP 중심이 아니며 해외 Benchmark를 쓰지 않는다. 국내 Example은 현재 DB에서 Source가 충분한 사례만 쓴다.
// 사실(FACT)은 Index 데이터(Source 있는 값)이고 사업기회 가설·Account Plan·미팅 질문은 SALES_VIEW다.
import type { SalesLearningExtension } from '../domain/types';
import type { DayBody } from './days';
import { quizIdsByDay3 } from './quizDay14to16';

type Extra = { amMustKnow: string[]; architectureMeaning: string; saHandoff: string[]; commonMistakes: string[] };
function day(body: Omit<DayBody, 'sales' | 'meetingIds'> & Partial<Pick<DayBody, 'meetingIds'>> & Extra): Omit<DayBody, 'meetingIds'> & Partial<Pick<DayBody, 'meetingIds'>> {
  const { amMustKnow, architectureMeaning, saHandoff, commonMistakes, ...rest } = body;
  const sales: SalesLearningExtension = { amMustKnow, architectureMeaning, saHandoff, commonMistakes, discoveryQuestions: rest.discoveryQuestions, relatedServices: rest.relatedServices, nextQuestions: rest.nextQuestions };
  return { ...rest, sales };
}

export const dayBodies14to16: Record<number, Omit<DayBody, 'meetingIds'> & Partial<Pick<DayBody, 'meetingIds'>>> = {
  14: day({
    conclusions: [
      '금융 고객을 처음 맡으면 업권 → 규모 → 주요 사업 → IT Landscape → 공개 사업 → 생태계 → 규제 순서로 읽는다.',
      'Account Intelligence는 확인된 사실(FACT)과 내 해석(SALES_VIEW)을 분리해서 적는 것이다.',
      '“공개 확인자료 없음”은 사업이 없다는 뜻이 아니며, 공개 사업 건수로 성숙도를 평가하지 않는다.',
      '공개 Keyman은 공식 현재 페이지로 확인된 경우만 현재 인물로 쓰고 과거 보도의 직책은 HISTORICAL로 구분한다.',
      '1-page Account Brief에는 사실 5개, 최근 IT·AX 3건, CSP/MSP·SI, 관련 규제, 국내 유사 Reference와 함께 가설 3개, 질문 10개가 들어간다.',
    ],
    whyLearn: '금융 고객 미팅의 품질은 미팅 전에 고객을 얼마나 정확히 읽었는지로 갈린다. 출처가 섞이면 추정이 사실처럼 굳어지므로 Index 데이터(FACT)와 내 해석(SALES_VIEW)을 분리하는 습관이 필요하다. 이 Day는 국내 Reference를 “무슨 기술을 썼는가”가 아니라 “Account를 어떻게 읽었는가”로 읽는다.',
    prerequisites: ['Day 1~13 (규제·Cloud·AX 기본)', '시장 모판과 국내 사업 사례 화면 훑어보기'],
    knowledgeIds: ['account-intelligence', 'financial-it'], caseIds: ['kb', 'jeju', 'jb', 'ibk', 'samsungfire'], architectureIds: [],
    discoveryQuestions: ['이 고객의 IT 투자 Theme는 무엇입니까?', '현재 CSP·MSP·SI와의 관계는 어떻게 됩니까?', '최근 3년간 추진한 IT·AX 사업의 현재 단계는?', '의사결정자와 예산 주관 조직은 어디입니까?', '규제·보안 검토 일정은 어떻게 됩니까?'],
    relatedServices: ['Account Assessment', 'IT Landscape 정리', 'Discovery Workshop'],
    meeting30s: '“금융 고객을 맡으면 먼저 업권과 규모, 공개된 IT·AX 사업, 기존 CSP·MSP·SI, 관련 규제를 사실로 정리합니다. 그 위에 제가 보는 사업기회 가설을 따로 적고 첫 미팅에서 질문으로 검증합니다. 공개 정보가 없는 부분은 없다고 보지 않고 질문으로 확인하겠습니다.”',
    nextQuestions: ['이 고객과 유사한 국내 Reference는 어떤 것입니까?', '관련 규제 3개는 무엇입니까?', '첫 미팅에서 가장 먼저 확인할 가설은?'],
    confusionPairs: ['FACT ≠ SALES_VIEW', '공개 확인자료 없음 ≠ 사업 없음', '사업 건수 ≠ 성숙도', 'HISTORICAL 직책 ≠ 현재 Keyman'],
    quizIds: quizIdsByDay3(14),
    memorize: ['Account는 업권·규모·공개 사업·생태계·규제 순서로 읽는다.', '확인된 사실과 내 해석은 반드시 분리한다.', '공개 확인자료 없음은 사업 없음이 아니다.', '과거 보도의 직책은 HISTORICAL이며 현재 인물처럼 쓰지 않는다.', 'Account Brief = 사실 5 + 최근 Initiative 3 + 가설 3 + 질문 10.'],
    amMustKnow: ['공개 Source가 있는 사실만 FACT로 쓴다.', '성숙도 점수·등급을 만들지 않는다.', '가설은 질문으로 검증한다.'],
    architectureMeaning: 'Account의 IT Footprint(Core·On-prem, Public Cloud, Data, AI·AX, Security·DR)는 고객 Architecture 대화가 어디서 시작될지 보여주는 지도입니다.',
    saHandoff: ['Landscape 상세 파악', '현행 Architecture 도식화', '규제·보안 검토 연계'],
    commonMistakes: ['AI 기사 수로 성숙도를 평가한다.', '과거 보도 직책을 현재처럼 쓴다.', '사실과 가설을 한 문장에 섞는다.'],
  }),
  15: day({
    conclusions: [
      '금융 AE는 특정 제품이 아니라 고객 Pain/Trigger를 듣고 어떤 IT·AX 사업 Motion으로 이어질지 구조로 이해한다.',
      'Solution Motion은 Infrastructure, Virtualization/Private Cloud, Public Cloud, Hybrid, Data, Security, Resilience, AI/AX, Application, Service 10개 영역이다.',
      '각 Motion은 Public Cloud·Hybrid·On-premises·Private Cloud·Private AI 중 여러 후보와 연결되며 “무조건 어느 하나”라고 단정하지 않는다.',
      '하나의 Deal에는 CSP·MSP·SI·ISV·Vendor·Consulting이 함께 들어갈 수 있고 금융회사의 책임은 위탁해도 남는다.',
      '사업은 Assessment → 구축 → Migration → Managed Service → Security → Optimization처럼, 또는 GPU → AI Platform → RAG → Agent → Operation처럼 확장된다.',
    ],
    whyLearn: '고객은 증상(GPU가 없다, VMware 비용이 올랐다, 문서를 못 찾는다)으로 말한다. 증상을 Motion과 Architecture 후보로 바꾸는 구조가 있어야 제품이 아니라 문제에서 출발하는 제안이 가능하다. 기본 학습은 Vendor-neutral이며 AWS·Azure·MSP/SI 이름은 Example일 뿐이다.',
    prerequisites: ['Day 7~10 (Cloud Architecture·Migration·배포모델·AX Stack)', 'Day 12 (BCP/DR)'],
    knowledgeIds: ['solution-motions', 'partner-ecosystem', 'deployment-selection'], caseIds: ['jb', 'jeju', 'ibk'], architectureIds: [],
    discoveryQuestions: ['이 문제가 지금 생긴 계기(Trigger)는 무엇입니까?', '현재 해결 방법과 한계는 무엇입니까?', '변경하려는 범위와 일정은?', '기존 계약·Vendor 제약이 있습니까?', '의사결정과 예산 경로는?'],
    relatedServices: ['Assessment', 'Migration', 'Managed Service', 'Security', 'FinOps', 'AI Platform'],
    meeting30s: '“고객의 말은 제품이 아니라 문제입니다. 저는 Pain을 듣고 확인질문으로 구체화한 뒤 후보 Architecture와 사업 Motion을 연결합니다. 같은 문제도 요건에 따라 Public, Hybrid, On-prem, Private AI 후보가 달라지고, 필요한 파트너와 SA Handoff까지 한 흐름으로 설명하겠습니다. 특정 Vendor는 예시로만 말씀드립니다.”',
    nextQuestions: ['이 Signal에 가장 먼저 확인할 것은?', '어떤 파트너가 함께 들어와야 합니까?', '확장은 어떤 순서로 이어집니까?'],
    confusionPairs: ['Motion ≠ 제품', 'MSP ≠ SI', '위탁 ≠ 책임 이전', 'Land & Expand ≠ 가격 정책'],
    quizIds: quizIdsByDay3(15),
    memorize: ['Pain → 확인질문 → Architecture 후보 → Solution Motion → Partner → SA Handoff → Expansion.', 'Motion은 10개 영역이며 Public Cloud에 한정되지 않는다.', '“이 Pain이면 무조건 Public Cloud”라고 말하지 않는다.', '위탁해도 책임은 금융회사에 남고 재위탁은 사전 서면 동의가 필요하다.', 'Vendor는 Example이며 특정 회사 Portfolio를 외우지 않는다.'],
    amMustKnow: ['Signal을 질문으로 바꾼다.', '배포모델 후보를 단정하지 않는다.', '파트너 역할과 재위탁 구조를 확인한다.'],
    architectureMeaning: 'Motion은 Architecture 위에 놓이는 사업 단위입니다. 같은 Pain도 요건에 따라 후보 배포모델이 달라집니다.',
    saHandoff: ['Pain별 Architecture 후보 상세화', '용량·비용 산정', '파트너 구성 설계'],
    commonMistakes: ['제품명부터 말한다.', 'Pain을 하나의 Motion으로만 연결한다.', '내부 마진·가격 정책을 설명한다.'],
  }),
  16: day({
    conclusions: [
      'Account Plan은 업권 분류가 아니라 한 고객의 Business·전략·Stakeholder·Landscape·규제·Pain·가설·예산·일정·Next Action·Expansion을 한 문서로 정리한 것이다.',
      '첫 미팅은 Business Pain → User → 현재 절차·시스템 → Data → Network → Security → Regulation → … → 결정 과정 순으로 묻고 제품부터 설명하지 않는다.',
      '질문은 Level 1(Business) → Level 2(IT/Architecture) → Level 3(Deal) 순서로 내려간다.',
      '“관심 있습니다”만으로 Opportunity로 보지 않고 Problem·Owner·Value·Technical fit·Timing·Budget path·Decision process·Next action을 확인한다.',
      'PoC → Production은 실제 User·Data·KPI·보안 검토·운영 책임·예산·일정이 있는지로 점검하고, 미팅 후에는 확인된 Fact와 미확인사항을 분리해 기록한다.',
    ],
    whyLearn: 'Day 1~15의 지식은 한 고객의 전략으로 통합될 때 가치가 생긴다. 금융 Deal은 보안·준법·구매·IT·사업부가 함께 결정하고 규제 절차가 일정을 좌우하므로 정리된 Account Plan과 질문 순서가 필요하다. 입력은 이 브라우저에만 저장되며 개인 연락처는 다루지 않는다.',
    prerequisites: ['Day 14 (Account Intelligence)', 'Day 15 (사업기회 구조)'],
    knowledgeIds: ['account-plan', 'first-meeting-discovery', 'account-intelligence'], caseIds: ['kb', 'jb'], architectureIds: [],
    discoveryQuestions: ['이 사업을 왜 추진하십니까?', '현재 어떤 시스템·절차로 처리하고 있습니까?', '데이터와 망·보안 제약은 무엇입니까?', '성공을 어떤 지표로 판단합니까?', '누가 어떤 순서로 어떤 예산으로 결정합니까?'],
    relatedServices: ['Discovery Workshop', 'Account Planning Workshop', 'PoC 설계', 'Architecture Assessment'],
    meeting30s: '“저는 제품 소개 대신 고객이 왜 이 사업을 하는지부터 묻습니다. 그다음 현재 시스템과 데이터, 규제·보안 검토, 가용성 목표를 확인하고 마지막에 예산과 결정 구조를 묻습니다. 미팅 후에는 확인된 사실과 미확인사항을 나눠 정리하고 다음 행동의 담당과 시점을 합의하겠습니다.”',
    nextQuestions: ['Opportunity Qualification을 통과했습니까?', 'PoC 이후 운영 책임은 누구입니까?', '확장 경로는 무엇입니까?'],
    confusionPairs: ['관심 표명 ≠ Opportunity', 'PoC 성공 ≠ Production 준비 완료', '미확인 ≠ 추정으로 채움', '규제 질문 ≠ AE의 법적 판단'],
    quizIds: quizIdsByDay3(16),
    memorize: ['Account Plan 20항목은 고객 Business에서 Expansion Path까지다.', '첫 미팅 질문은 Business → IT/Architecture → Deal 순서다.', 'Opportunity는 8가지 기준을 확인한 것만 올린다.', 'PoC → Production은 실제 Data·User·KPI·운영 책임·예산·일정이 조건이다.', '미확인은 추정하지 않고 다음 미팅 과제로 남긴다.'],
    amMustKnow: ['제품부터 설명하지 않는다.', 'Stakeholder는 Role 중심으로 기록하고 개인정보는 공개 데이터에 넣지 않는다.', '규제 판단은 법무·보안에 Handoff한다.'],
    architectureMeaning: '미팅에서 모은 Data·Network·Security·RTO/RPO 답변은 요건 → Architecture 판단과 SA Handoff의 입력입니다.',
    saHandoff: ['미팅 결과 기반 요건 정리', 'PoC 설계와 성공 기준', '규제·보안 검토 연계'],
    commonMistakes: ['제품 소개로 시작한다.', 'Deal 질문을 첫 질문으로 한다.', '사실과 가설을 구분하지 않고 적는다.'],
  }),
};
