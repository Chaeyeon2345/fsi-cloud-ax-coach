// Phase B · Day 1~6 본문. 기준: 07_PHASE_B_DAY1_6_CONTENT_MASTER.md (원본 구조·사실관계 유지).
// 규제 FACT는 지정된 Source(가이드·해설서·금융위 자료)와 대조했고, 업권·시스템계 설명(Day 6)은 ARCHITECTURE_GUIDE로 표시한 카드를 참조한다.
// 중복 Fact는 Knowledge Card에 두고 Day는 학습 순서·질문·요약을 담는다.
// 대조 후 마스터 표현을 바꾼 곳: Day 2 결론 1("현업 표현" → 조항 번호 표기). 해설서에서 "현업 표현"이라는 문구를 확인하지 못했고 §15①3·5 표기만 확인했다.
import type { CurriculumDay, SalesLearningExtension } from '../domain/types';
import { quizIdsByDay } from './quizDay1to6';
import { dayBodies7to13 } from './days7to13';
import { dayBodies14to16 } from './days14to16';

export type DayBody = Omit<CurriculumDay, 'id' | 'day' | 'title' | 'goal' | 'sourceIds' | 'contentStatus'>;

const salesOf = (
  d: Pick<DayBody, 'discoveryQuestions' | 'relatedServices' | 'nextQuestions'>,
  rest: Pick<SalesLearningExtension, 'amMustKnow' | 'architectureMeaning' | 'saHandoff' | 'commonMistakes'>,
): SalesLearningExtension => ({ ...rest, discoveryQuestions: d.discoveryQuestions, relatedServices: d.relatedServices, nextQuestions: d.nextQuestions });

function day(body: Omit<DayBody, 'sales'> & { amMustKnow: string[]; architectureMeaning: string; saHandoff: string[]; commonMistakes: string[] }): DayBody {
  const { amMustKnow, architectureMeaning, saHandoff, commonMistakes, ...rest } = body;
  return { ...rest, sales: salesOf(rest, { amMustKnow, architectureMeaning, saHandoff, commonMistakes }) };
}

export const dayBodies: Record<number, DayBody> = {
  ...dayBodies7to13,
  ...dayBodies14to16,
  1: day({
    conclusions: [
      '금융 IT 규제는 Cloud 자체를 금지하기 위한 것이 아니라 전자금융의 안전성, 소비자 보호, 복원력과 책임체계를 확보하기 위한 통제다.',
      '실무에서는 법 → 감독규정 → 시행세칙 → 가이드/FAQ → 금융회사 내부 정책의 계층으로 이해하면 된다(교육용 정리).',
      '금융보안원 가이드는 법령 자체가 아니며, 가이드와 관련 법규가 충돌하면 법규가 우선한다.',
      'Cloud 이용은 단순 구매가 아니라 업무 중요도, CSP 평가, BCP, 보안조치, 정보보호위원회, 계약, 이용·보고, 리스크관리, Exit까지 본다.',
      'AM의 역할은 법률판단을 직접 하는 것이 아니라, 어떤 규제 이슈가 있고 누구와 언제 확인해야 하는지를 사업 일정에 포함하는 것이다.',
    ],
    whyLearn: '금융 고객은 제품 기능과 가격만으로 Cloud/AX 도입을 결정하지 않는다. 보안, 업무 중요도, 내부 승인, 데이터, 운영 책임, 공급업체 리스크가 Deal Timeline을 좌우한다.',
    prerequisites: ['금융 규제에 대한 사전 지식은 필요하지 않습니다. 이 과정의 출발점입니다.'],
    knowledgeIds: ['regulation-map', 'cloud-provider-responsibility'], caseIds: [], architectureIds: [],
    discoveryQuestions: ['이 Workload는 전자금융업무와 어떤 관계가 있습니까?', '어떤 데이터를 처리하고 저장합니까?', '업무 중요도 평가는 완료됐습니까?', '정보보호/리스크/법무 담당자는 언제 참여합니까?', '목표 오픈일 전에 필요한 내부 심의 일정은 무엇입니까?'],
    relatedServices: ['Cloud readiness assessment', '규제 검토 일정을 포함한 Account Plan', '보안·컴플라이언스 아키텍처 검토(SA·보안 협업)'],
    meeting30s: '“금융권 Cloud는 AWS를 쓸 수 있느냐보다 어떤 업무와 데이터를 처리하는지가 출발점입니다. 중요도 평가와 CSP 평가, BCP·안전성 확보, 정보보호위원회, 계약과 이용보고, Exit까지 하나의 Lifecycle로 봐야 합니다. 그래서 영업도 기술검토와 규제·심의 일정을 함께 관리해야 합니다.”',
    nextQuestions: ['중요업무는 어떤 기준으로 판단합니까?', 'Cloud 이용보고는 언제 합니까?', 'CSP 평가를 생략할 수 있는 경우가 있습니까?', '공급자 집중 리스크는 왜 봅니까?', 'Exit Plan은 왜 계약 전에 고민합니까?'],
    confusionPairs: ['금융보안원 가이드 ≠ 법률 (충돌하면 법규 우선)', 'Cloud 이용 ≠ 무조건 사전승인 (사유 발생일부터 3개월 이내 사후·수시 보고)', '외부 위탁 ≠ 책임 이전 (금융회사의 관리·감독 책임이 남음)'],
    quizIds: quizIdsByDay(1), meetingIds: ['m1', 'm2'],
    memorize: ['금융 Cloud는 기술도입이 아니라 규제·운영 Lifecycle이다.', '가이드보다 법규가 우선한다.', '업무와 데이터가 규제 검토의 출발점이다.', 'CSP를 써도 금융회사의 관리·감독 책임은 남는다.', 'AM은 규제의 결론을 내리는 사람이 아니라 검토 경로를 설계하는 사람이다.'],
    amMustKnow: ['“가이드 = 법”이라고 말하지 않는다.', '“AWS를 쓰면 규제를 만족한다”고 말하지 않는다.', 'CSP/MSP를 쓰더라도 금융사의 최종 관리·감독 책임이 남는 구조를 이해한다.'],
    architectureMeaning: '규제는 구조도에 넣어야 할 통제와 증적, 책임 경계의 근거입니다. 기능 나열이 아니라 어떤 업무·데이터를 어떤 통제 아래 두는지를 그려야 합니다.',
    saHandoff: ['특정 법률 적용 여부', '정보처리 위탁 해당성의 최종 판단', '데이터 국외이전', '개별 업무의 중요도 최종 판정', '예외 적용 여부'],
    commonMistakes: ['가이드를 법률처럼 인용한다.', 'CSP 이용을 곧 규제 충족으로 설명한다.', '규제 일정을 사업 일정에 넣지 않는다.'],
  }),
  2: day({
    conclusions: [
      '3호망과 5호망은 보안등급이 아니라 전자금융감독규정 제15조 제1항의 호(제3호·제5호)에서 온 표기다.',
      '3호망은 내부통신망과 연결된 내부 업무용 시스템, 5호망은 전산실 정보처리시스템과 운영·개발 목적으로 직접 접속하는 단말을 가리킨다.',
      '연구개발망은 내부업무망·전산실·외부망과 독립적으로 구성된 연구개발 환경이다.',
      '연구개발망에서는 개발, 테스트, AI, SaaS 활용 연구개발이 가능하지만 실제 운영 서비스와는 구분해야 한다.',
      '규제개선의 핵심은 “망분리 폐지”가 아니라 개발 효율을 높이는 대신 소스코드 유출, 오픈소스 공급망, 내부침투 위험을 대체통제로 관리하는 것이다.',
    ],
    whyLearn: '3호망/5호망을 외우는 것이 목적이 아니다. 고객의 사용자가 어느 망의 단말에서 어떤 시스템에 어떤 경로로 접속하는지 이해해야 AI·SaaS 개발환경 제안이 가능한지 판단할 수 있다.',
    prerequisites: ['Day 1: 법규 우선 원칙과 규제 계층'],
    knowledgeIds: ['network', 'research-network'], caseIds: [], architectureIds: [], visuals: ['NETWORK_MAP'],
    discoveryQuestions: ['사용자는 현재 어느 망의 단말에서 업무합니까?', '개발 대상 시스템은 운영계와 어떻게 연결됩니까?', '테스트 데이터에 개인신용정보가 포함됩니까?', 'GitHub/오픈소스/외부 SaaS 접근이 필요합니까?', '산출물을 운영으로 반영하는 승인·전송 절차는 어떻게 됩니까?'],
    relatedServices: ['개발환경 보안 아키텍처 검토(연구개발망 설계 지원)', '접근통제·로그·망연계 구조 검토', 'Security assessment'],
    meeting30s: '“3호망과 5호망은 보안등급이 아니라 규정 조항 기반의 업무환경 구분입니다. 연구개발망 예외는 운영망을 개방하는 것이 아니라 AI·SaaS 개발환경을 별도로 만들고 내부업무망과 논리적으로 분리하면서 산출물 이동을 통제하는 구조입니다. 따라서 AM은 사용자, 데이터, 개발환경, 운영 반영 경로를 먼저 확인해야 합니다.”',
    nextQuestions: ['연구개발망에서 AI·SaaS는 어디까지 쓸 수 있습니까?', '개발산출물은 어떻게 전산실로 옮깁니까?', '가명정보는 연구개발망에서 어떻게 쓸 수 있습니까?', '연구개발망 구성 절차에는 어떤 단계가 있습니까?'],
    confusionPairs: ['3호망/5호망 ≠ 3등급/5등급', '연구개발망 ≠ 운영망', '논리적 연결 허용 ≠ 자유로운 상호접속', '가명정보 허용 ≠ 원본 개인신용정보 자유사용'],
    quizIds: quizIdsByDay(2), meetingIds: ['m3', 'm4', 'm5'],
    memorize: ['3호망·5호망은 등급이 아니라 규정 조항의 호 번호 표기다.', '연구개발망은 내부업무망·전산실·외부망과 독립된 별도 환경이다.', '연구개발망은 개발과 AI·SaaS 연구개발용이며 운영 서비스를 두지 않는다.', '전산실 전송은 인가된 서버를 통한 단방향·한시적 전송이다.', '허용되는 것은 가명 처리한 개인신용정보뿐이며 원본 정보는 아니다.'],
    amMustKnow: ['3호망/5호망을 등급으로 설명하지 않는다.', '연구개발망은 운영망을 개방하는 것이 아니다.', '첫 질문은 “누가, 어느 망의 단말에서, 어떤 데이터로, 어떤 경로를 거치는가”다.'],
    architectureMeaning: '구조도에는 인터넷망, 연구개발망, 내부업무망, 전산실을 구분하고 논리적 분리 구간과 연구개발망→전산실 전송 구간의 통제(인가 서버·단방향·검증)를 표시해야 합니다.',
    saHandoff: ['고객별 연구개발망 구성안과 대체통제 설계', '망간 전송 방식과 시큐어코딩·무결성 검증 구현', '가명정보 활용 조건의 법적·보안 검토'],
    commonMistakes: ['연구개발망 예외를 운영망 개방으로 설명한다.', '가명정보 허용을 개인신용정보 자유 사용으로 설명한다.', '실 서비스 시스템을 연구개발망에 두는 구성을 제안한다.'],
  }),
  3: day({
    conclusions: [
      '금융 Cloud 도입은 “계약부터”가 아니라 업무선정과 중요도 평가부터 시작한다.',
      '중요도에 따라 공급자 평가, BCP, 보안조치와 계약 통제의 깊이가 달라질 수 있다.',
      '정보보호위원회는 중요도 평가, CSP 평가, BCP·안전성 확보조치를 보고 이용 여부를 심의한다.',
      'Go-live 이후에도 이용보고, 위수탁 운영, 리스크관리가 이어진다.',
      '종료 시 데이터 반환·이전·삭제와 공급자 종속 리스크까지 고려해야 한다.',
    ],
    whyLearn: '기술 PoC 성공만으로 계약이 나지 않는다. 보안평가, 내부 심의, 계약조항, 리스크 검토가 Forecast를 밀어낼 수 있어 영업이 고객의 내부 승인단계와 담당부서를 Pipeline에 넣어야 한다.',
    prerequisites: ['Day 1: 규제 계층과 CSP 책임', 'Day 2: 망 구분(Public/Private 논의의 배경)'],
    knowledgeIds: ['cloud-lifecycle'], caseIds: [], architectureIds: [], visuals: ['LIFECYCLE_FLOW'],
    discoveryQuestions: ['중요도 평가가 끝났습니까?', 'CSP 평가 담당부서는 어디입니까?', '정보보호위원회 일정은 언제입니까?', '계약서에 재위탁/감사/사고/Exit 조항이 있습니까?', '종료 시 데이터 회수·삭제를 어떻게 보장합니까?'],
    relatedServices: ['Cloud readiness / assessment', 'Landing Zone', 'Security architecture', 'Migration', 'BCP/DR', 'Managed Service', 'Exit planning'],
    meeting30s: '“금융권 Cloud는 기술검토 이후 바로 계약하는 구조가 아닙니다. 업무선정과 중요도 평가, CSP 평가, BCP와 안전성 확보, 정보보호위원회, 계약, 이용보고와 리스크관리, 종료계획까지 이어집니다. 그래서 영업도 고객의 내부 승인단계와 담당부서를 Pipeline 일정에 같이 넣어야 합니다.”',
    nextQuestions: ['중요업무는 어떤 기준으로 판단합니까?', 'CSP 평가를 생략할 수 있는 경우가 있습니까?', '이용보고에는 어떤 서류가 필요합니까?', '공급자 집중 리스크는 어떻게 관리합니까?'],
    confusionPairs: ['Cloud 이용보고 ≠ 사전 승인 (사유 발생일부터 3개월 이내 사후·수시 보고)', '중요 업무 ≠ 비중요 업무 (비중요에도 필수 사항은 남음)', '정보보호위원회 심의·의결 = 금융회사 내부 절차, 이용보고 = 금융감독원장에 대한 보고'],
    quizIds: quizIdsByDay(3), meetingIds: ['m2'],
    memorize: ['Cloud 도입은 업무선정과 중요도 평가에서 시작한다.', '중요도는 이후 평가·BCP·안전성·계약의 깊이를 정한다.', '정보보호위원회가 평가 결과와 계획을 심의·의결해 이용 여부를 결정한다.', '이용보고는 사유 발생일부터 3개월 이내의 사후·수시 보고다.', '종료는 이용 전에 세운 출구 전략으로 데이터를 이전·파기한다.'],
    amMustKnow: ['기술 PoC 성공은 계약 완료가 아니다.', '고객의 내부 승인 단계와 담당부서를 Pipeline 일정에 넣는다.', '이용보고를 사전 승인으로 말하지 않는다.'],
    architectureMeaning: 'Lifecycle 각 단계의 산출물(중요도 평가서, CSP 평가 결과, BCP·안전성 조치, 심의 자료, 계약서)이 Architecture 설명과 증적의 입력이 됩니다.',
    saHandoff: ['CSP 안전성 평가 항목별 증적 작성', 'BCP·DR 설계', '안전성 확보조치 구현 방안', '계약서 주요 기재사항 검토(법무)'],
    commonMistakes: ['계약을 먼저 추진하고 중요도 평가를 나중에 한다.', '정보보호위원회 일정을 사업 일정에 넣지 않는다.', '종료 계획을 계약 후로 미룬다.'],
  }),
  4: day({
    conclusions: [
      '중요업무 여부는 ‘금융회사 핵심업무인가’ 한 가지로만 판단하지 않는다.',
      '업무 중단 영향, 침해 시 고객 영향, 공급자 종속위험, 내부통제 역량 등을 종합해 본다.',
      '개인정보, 개인신용정보, 고유식별정보, 가명정보는 서로 다른 개념이다(학습용 구분이며 법적 정의가 아니다).',
      'Cloud 사용은 정보처리 위탁 문제와 연결되며, 외부사업자를 사용해도 금융회사의 책임과 관리·감독 의무가 남는다.',
      'AM은 데이터 종류를 정확히 묻되 법적 최종판단은 보안/법무와 협업해야 한다.',
    ],
    whyLearn: '“민감해서 안 됩니다” 수준에서 벗어나 업무와 데이터의 위험을 구분해야 한다. 그래야 고객의 중요도 평가와 데이터 질문에 맞춰 제안 구조의 깊이를 정할 수 있다.',
    prerequisites: ['Day 3: Lifecycle 9단계(특히 중요도 평가와 계약 단계)'],
    knowledgeIds: ['workload-criticality', 'financial-data-basics', 'information-processing-outsourcing', 'cloud-provider-responsibility'], caseIds: [], architectureIds: [],
    discoveryQuestions: ['입력·저장·로그에 어떤 정보가 남습니까?', '거래 처리와 직접 연결됩니까?', '장애가 고객에게 미치는 영향은 무엇입니까?', '재위탁 또는 제3자 Subprocessor가 있습니까?', '계약 종료 시 데이터 반환·삭제를 보장할 수 있습니까?'],
    relatedServices: ['데이터·업무 분류와 중요도 평가 준비 지원(고객 주도)', 'Security·Compliance assessment', 'BCP/DR 설계', '계약·Exit 지원'],
    meeting30s: '“중요업무 여부는 핵심업무인지 하나로 판단하지 않습니다. 업무 특성, 중단 영향, 고객 영향, 동일 CSP 종속 위험, 내부통제 역량을 함께 보고, 데이터도 개인정보·개인신용정보·고유식별정보·가명정보로 구분해서 묻습니다. 최종 법적 판단은 고객의 보안·법무와 함께 합니다.”',
    nextQuestions: ['중요업무로 분류되면 CSP 평가는 어떻게 달라집니까?', '가명정보 활용 조건은 무엇입니까?', '재위탁은 어떻게 통제합니까?', '자체 구축에는 어떤 규정이 남습니까?'],
    confusionPairs: ['개인정보 ≠ 개인신용정보 ≠ 고유식별정보 ≠ 가명정보', '중요업무 ≠ 계정계', 'CSP가 보안을 운영 ≠ 금융회사 책임 면제', 'On-prem ≠ 데이터·위탁 규정 면제'],
    quizIds: quizIdsByDay(4), meetingIds: [],
    memorize: ['중요도는 업무 특성·중단 영향·침해 시 고객 영향·CSP 종속 위험·내부통제 역량으로 본다.', '중요업무와 비중요업무는 평가·BCP·계약의 깊이가 다르다.', '데이터는 개인정보냐 아니냐가 아니라 종류별로 구분해 묻는다.', '클라우드 이용은 정보처리 위탁에 해당하며 책임은 이전되지 않는다.', '법적 최종판단은 보안·법무에 Hand-off 한다.'],
    amMustKnow: ['“개인정보니까 Cloud 불가”라고 단정하지 않는다.', '“On-prem이면 규제 문제 없음”이라고 말하지 않는다.', '“중요업무 = 계정계”로 단순화하지 않는다.'],
    architectureMeaning: '중요도와 데이터 종류는 구조도의 DR·이중화 수준, 데이터 경계와 위치, CSP 의존도 관리, 증적 범위를 정합니다.',
    saHandoff: ['개별 업무의 중요도 최종 판정', '데이터 분류의 법적 해석과 국외이전 판단', '위탁 해당성의 최종 판단', '계약서 주요 기재사항의 법무 검토'],
    commonMistakes: ['“CSP가 보안을 책임지니 금융사는 책임 없음”이라고 말한다.', '중요도 판정을 영업이 대신 내린다.', '가명정보와 익명정보를 같은 개념으로 설명한다.'],
  }),
  5: day({
    conclusions: [
      '2024년 8월 망분리 개선 로드맵은 중장기적으로 “자율보안-결과책임” 원칙의 새 금융보안체계를 지향한다고 밝혔고, 최근 개선은 조건별·위험기반 절차로 이어지고 있다.',
      '2024년 8월 로드맵은 생성형 AI, SaaS, 연구개발환경 개선을 중요한 과제로 제시했다.',
      '2026년 4월에는 생성형 AI 모델 변경 관련 혁신금융서비스 절차가 간소화됐다.',
      '2026년 4월 20일부터 일정한 보안규율을 전제로 내부업무망에서 사무관리·업무지원 SaaS 활용이 확대됐다.',
      '연구개발망, SaaS 예외, 생성형 AI 혁신금융서비스, 보안목적 AI 긴급완화는 서로 다른 제도경로다.',
    ],
    whyLearn: '새로운 규제 변화는 곧 신규 Use Case의 진입장벽 변화다. 하지만 “모든 AI가 허용됐다”가 아니라 용도별로 검토경로가 달라졌다는 뜻이므로 경로를 구분해서 설명할 수 있어야 한다.',
    prerequisites: ['Day 2: 망분리와 연구개발망', 'Day 3: Cloud 이용 Lifecycle'],
    knowledgeIds: ['ai-saas', 'sandbox-ai'], caseIds: ['bc', 'samsungcard', 'samsungfire', 'koreanre'], architectureIds: [],
    timelineIds: ['tl-roadmap', 'tl-research', 'tl-simplify', 'tl-saas', 'tl-security', 'tl-ai-guideline', 'tl-security-2'],
    discoveryQuestions: ['목적이 연구개발입니까, 내부업무 생산성입니까, 외부 고객서비스입니까?', 'SaaS입니까, 생성형 AI 모델 API입니까, 보안목적 AI입니까?', '실제 고객정보나 거래정보를 처리합니까?', '운영 서비스입니까, 테스트 환경입니까?', '어떤 규제 예외/심의경로를 이미 검토했습니까?'],
    relatedServices: ['규제 경로별 Use Case 분류 워크숍', 'AI 도입 Readiness·Security assessment', '대체통제 구조 설계 지원(SA·보안 협업)'],
    meeting30s: '“최근 규제 변화는 모든 AI가 허용됐다는 뜻이 아니라 용도별로 검토 경로가 달라졌다는 뜻입니다. 연구개발망, 내부업무망 SaaS 예외, 생성형 AI 혁신금융서비스, 보안목적 AI 긴급완화는 서로 다른 경로여서 먼저 고객의 용도와 데이터, 운영 여부를 확인하겠습니다.”',
    nextQuestions: ['생성형 AI 모델 변경 시 어떤 절차가 필요합니까?', '내부업무망 SaaS 예외 조건은 무엇입니까?', '혁신금융서비스 지정과 실제 운영은 어떻게 구분합니까?', '금융분야 AI 가이드라인은 법적 의무입니까?'],
    confusionPairs: ['혁신금융서비스 ≠ 일반 망분리 예외', '연구개발망 ≠ SaaS 예외', '보안목적 AI 긴급완화 ≠ 일반 업무용 AI 전면 허용', '로드맵 발표 ≠ 모든 세부규정 즉시 시행', '혁신금융서비스 지정 ≠ 구축 완료·상용 운영'],
    quizIds: quizIdsByDay(5), meetingIds: ['m6', 'm7', 'm13'],
    memorize: ['규제 변화는 Use Case별로 검토경로가 달라졌다는 뜻이다.', '로드맵 발표는 계획의 공표이고 개별 시행은 별도로 확인한다.', '연구개발망·SaaS 예외·혁신금융서비스·보안목적 AI는 서로 다른 경로다.', '혁신금융서비스 지정은 구축 완료나 상용 운영이 아니다.', '금융분야 AI 가이드라인은 금융권이 자율적으로 적용한다.'],
    amMustKnow: ['“AI 규제가 풀렸다”가 아니라 “경로가 달라졌다”로 말한다.', '발표·시행·추진 상태를 구분해서 말한다.', '혁신금융서비스 지정과 구축·운영을 구분한다.'],
    architectureMeaning: '같은 AI 기능도 적용 경로에 따라 허용되는 망 위치, 데이터 종류, 대체통제와 증적이 달라져 구조도와 일정이 달라집니다.',
    saHandoff: ['Use Case별 적용 제도경로의 법적 판단', '혁신금융서비스 지정·모델 변경 절차 검토', '보안목적 AI 테스트 대상 여부 확인'],
    commonMistakes: ['로드맵 발표일을 시행일로 설명한다.', '보안목적 AI 긴급완화를 업무용 AI 전면 허용으로 설명한다.', 'AI 가이드라인의 법적 시행일을 단정한다.'],
  }),
  6: day({
    conclusions: [
      '금융사의 시스템은 기능별로 계정계, 정보계, 채널계, 대외계 등으로 나누어 이해하면 큰 그림을 잡기 쉽다(업계 학습용 분류, 법적 분류 아님).',
      '계정계는 거래와 원장·잔액 같은 핵심 처리를 담당한다.',
      '정보계는 데이터웨어하우스, 분석, 리포팅 등 정보 활용을 담당한다.',
      '채널계는 고객/직원이 접하는 모바일·웹·영업점·콜센터 접점이고, 대외계는 외부기관·공동망·제휴사 연계다.',
      'Cloud/AI 도입 적합성은 “계정계라서 안 됨, 채널계라서 됨”이 아니라 업무 중요도, 데이터, Latency, 복원력, Legacy 결합도를 함께 본다.',
    ],
    whyLearn: 'AWS와 AI가 실제 금융업무의 어디에 붙는지 이해해야 고객 요청을 올바른 업무계와 권한 수준에서 논의할 수 있다. 이 Day의 설명은 법적 FACT가 아니라 교육용 구조 해설이다.',
    prerequisites: ['Day 1~5 (규제 구조와 변화에 대한 기본 이해)'],
    knowledgeIds: ['financial-it', 'banking-business-it', 'card-business-it', 'securities-business-it', 'insurance-business-it'], caseIds: [], architectureIds: [], visuals: ['SYSTEM_LAYERS'],
    discoveryQuestions: ['이 요청은 어느 업무계와 연결됩니까?', 'Read-only입니까, 실제 거래 변경도 합니까?', '실시간입니까, Batch입니까?', '외부기관과 연계합니까?', '장애가 고객 거래를 중단시킵니까?'],
    relatedServices: ['업무계 기준 Account Mapping', 'Architecture assessment(SA 협업)', '데이터·연계 구조 분석'],
    meeting30s: '“금융 IT는 계정계, 정보계, 채널계, 대외계로 나눠 보면 이해가 쉽습니다. 하지만 Cloud 적합성은 단순히 어느 계인지로 정하지 않습니다. 거래 정합성, 데이터 민감도, Latency, 외부연계, RTO/RPO와 Legacy 결합도를 같이 봐야 합니다. 그래서 AM은 먼저 업무 위치와 중요도를 확인한 뒤 SA와 Architecture를 설계해야 합니다.”',
    nextQuestions: ['고객의 Legacy 연계 방식은 무엇입니까?', '이 업무의 RTO/RPO는 얼마입니까?', '외부기관 연계의 보안 통제는 어떻게 됩니까?', 'AI가 읽기만 합니까, 거래 변경 권한도 가집니까?'],
    confusionPairs: ['채널계 = 항상 비핵심 아님', '계정계 = 무조건 Cloud 불가 아님', '정보계 = 단순 조회 시스템만 의미하지 않음', '대외계 = 인터넷망과 같은 말 아님'],
    quizIds: quizIdsByDay(6), meetingIds: ['m8'],
    memorize: ['시스템계 구분은 업계의 학습용 분류이며 법적 분류가 아니다.', '계정계는 거래·원장·잔액, 정보계는 분석·보고, 채널계는 접점, 대외계는 외부 연계다.', '적합성은 계 이름이 아니라 중요도·데이터·Latency·복원력·Legacy 결합도로 본다.', '업권마다 관심사가 다르지만 개별 금융사의 실제 구조는 확인해야 한다.', 'AI가 읽기만 하는지 거래 변경까지 하는지가 위험을 가른다.'],
    amMustKnow: ['시스템계 구분은 학습용 분류임을 밝히고 말한다.', '“계정계라 불가, 채널계라 가능”으로 단순화하지 않는다.', '고객 요청이 어느 업무계에 붙는지부터 확인한다.'],
    architectureMeaning: '시스템계는 구조도의 업무 위치와 데이터 흐름의 출발점입니다. 요청이 어느 계에 붙고 어떤 권한과 지연 조건으로 연결되는지를 그려야 Cloud·AI 구조를 설계할 수 있습니다.',
    saHandoff: ['기존 시스템 연계 방식과 지연 요구 분석', '복원력(RTO/RPO) 요구 정의', 'Legacy 결합도 평가'],
    commonMistakes: ['업권 이름만으로 시스템계를 단정한다.', '채널계 AI도 거래 변경 권한을 가지면 위험이 달라짐을 놓친다.', '교육용 분류를 개별 고객의 구조처럼 설명한다.'],
  }),
};
