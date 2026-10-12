// 16일 FSI AM 과정 (V2). 제목·목표는 V2 Upgrade Pack 03_DAY01_16_CONTENT_MASTER.md를 기준으로 한다.
// Phase A: 구조(shell)만 만든다. 각 Day의 본문(결론·Discovery·외울 문장 등)은 Phase B~D에서 채우며,
// 그 전까지는 contentStatus 'SKELETON'으로 표시하고 가짜 내용을 넣지 않는다.
// 중복 Fact는 Knowledge Card를 참조하고 Day에는 학습 순서·요약만 둔다.
import { CURRICULUM_LENGTH, type CurriculumDay, type MeetingMode } from '../domain/types';
import { knowledge } from './knowledge';
import { quiz, meeting } from './practice';
import { dayBodies } from './days';

interface DaySeed {
  title: string; goal: string;
  knowledgeIds?: string[];
  deriveFrom?: string[];      // 이 카드들에 연결된 기존 퀴즈·미팅을 임시로 가져온다 (Phase B~D에서 명시값으로 대체)
  quizIds?: string[]; meetingIds?: string[];
  caseIds?: string[]; architectureIds?: string[];
}

// Day 1~16 (배열 순서 = Day 번호). knowledgeIds에는 이미 있는 카드만 연결하고, 새 카드는 해당 Phase에서 추가한다.
const seeds: DaySeed[] = [
  { title: '금융 규제 전체 지도', goal: '“금융권은 왜 일반 기업보다 IT를 더 까다롭게 도입하는가?”를 구조적으로 설명한다.' },
  { title: '망분리, 3호망·5호망·연구개발망', goal: '3호망/5호망을 외우는 것이 아니라 “어느 사용자가, 어느 시스템에, 어떤 경로로 접속하는가”를 이해한다.', knowledgeIds: ['network', 'research-network'] },
  { title: '금융 Cloud 이용 Lifecycle', goal: 'Cloud 사업의 규제 검토 Flow를 순서대로 말한다.', knowledgeIds: ['cloud-lifecycle'] },
  { title: '중요업무, 데이터, 위탁, 책임', goal: '“민감해서 안 됩니다” 수준이 아니라 업무와 데이터의 위험을 구분한다.', knowledgeIds: ['cloud-lifecycle'], deriveFrom: [] },
  { title: '2024~2026 망분리·AI·SaaS 규제 변화', goal: '“규제가 풀렸다”가 아니라 무엇이 왜 바뀌었는지 설명한다.', knowledgeIds: ['ai-saas', 'sandbox-ai'] },
  { title: '금융업무와 IT: 계정계·정보계·채널계·대외계', goal: 'AWS/AI가 실제 금융업무 어디에 붙는지 이해한다.', knowledgeIds: ['financial-it'] },
  { title: 'AWS FSI Architecture 기본', goal: 'AWS 서비스 정의가 아니라 “금융 요구조건 → AWS 기능”으로 설명한다.' },
  { title: '금융 Cloud Migration & Modernization', goal: '“전부 Cloud로 옮기자”가 아니라 Migration 우선순위를 이해한다.' },
  { title: 'Public vs Hybrid vs On-prem / Private AI', goal: '배포모델을 종교처럼 고르지 않는다.', knowledgeIds: ['deployment-selection'], deriveFrom: [],
    meetingIds: ['m9', 'm10', 'm11', 'm12'], caseIds: ['jb', 'jeju'], architectureIds: ['pattern-private-ai'],
    quizIds: quiz.filter(q => q.category === '아키텍처').map(q => q.id) },
  { title: '금융 AX Stack: LLM, RAG, Agent, MCP, GPU/NPU', goal: '“ChatGPT 같은 것”이 아니라 Enterprise AI Stack을 설명한다.', architectureIds: ['pattern-private-ai'] },
  { title: '2026 내부업무망 SaaS 망분리 예외', goal: 'SaaS 예외를 생성형 AI/연구개발망/샌드박스와 구분한다.', knowledgeIds: ['ai-saas'], deriveFrom: [] },
  { title: 'BCP, DR, RTO, RPO', goal: '“이중화돼 있습니다”를 복원력 답변으로 착각하지 않는다.', knowledgeIds: ['cloud-resilience', 'vulnerability'] },
  { title: '금융 AI Governance / AI기본법 / 고영향·고위험 AI', goal: 'AI를 기술만이 아니라 책임/통제 체계로 이해한다.', knowledgeIds: ['ai-governance', 'sandbox-ai'], deriveFrom: ['ai-governance'] },
  { title: '금융 고객 Account Intelligence', goal: '금융시장 IT·AX Index와 국내 사례로 고객을 처음 맡았을 때 무엇부터 파악하는지 배운다. 사실(FACT)과 내 해석(SALES_VIEW)을 분리한다.', caseIds: ['jb', 'jeju', 'kb', 'ibk'] },
  { title: '금융 고객의 IT·AX 사업기회 구조', goal: '고객 Pain에서 배포모델, Solution Motion, 기술, Vendor·Partner, 구축·운영·확장까지 사업기회의 구조로 설명한다. 특정 Vendor는 Reference로만 다룬다.' },
  { title: 'Account Plan & 금융 고객 미팅', goal: 'Day 1~15의 지식을 한 고객의 Account Plan과 첫 미팅 Discovery, PoC→Production 점검으로 통합한다.', meetingIds: ['m15'] },
];

const pickByKnowledge = <T extends { id: string; relatedKnowledgeIds: string[] }>(items: T[], ids: string[]) =>
  items.filter(i => i.relatedKnowledgeIds.some(k => ids.includes(k))).map(i => i.id);

export const curriculum: CurriculumDay[] = seeds.map((s, i) => {
  const n = i + 1;
  const body = dayBodies[n];
  // Phase B로 본문이 작성된 Day(1~6)는 READY. 나머지는 구조만 있는 SKELETON이며 임시로 기존 연결을 파생한다.
  const knowledgeIds = body?.knowledgeIds ?? s.knowledgeIds ?? [];
  const from = s.deriveFrom ?? knowledgeIds;
  const sourceIds = [...new Set(knowledge.filter(k => knowledgeIds.includes(k.id)).flatMap(k => k.sourceIds))];
  const base: CurriculumDay = {
    id: `day-${n}`, day: n, title: s.title, goal: s.goal, contentStatus: 'SKELETON',
    conclusions: [], whyLearn: '', prerequisites: [],
    knowledgeIds, caseIds: s.caseIds ?? [], architectureIds: s.architectureIds ?? [],
    discoveryQuestions: [], relatedServices: [], meeting30s: '', nextQuestions: [], confusionPairs: [],
    quizIds: s.quizIds ?? pickByKnowledge(quiz, from),
    meetingIds: s.meetingIds ?? pickByKnowledge(meeting, from),
    memorize: [], sourceIds,
  };
  return body ? { ...base, ...body, contentStatus: 'READY', sourceIds } : base;
});
if (curriculum.length !== CURRICULUM_LENGTH) throw new Error(`커리큘럼은 ${CURRICULUM_LENGTH}일이어야 합니다`);

export const meetingModes: { id: MeetingMode; label: string; description: string; questionIds: string[] }[] = [
  { id: 'quick', label: 'Quick Meeting', description: '엘리베이터 대화처럼 개념을 30초로 정리합니다.', questionIds: ['m1', 'm3', 'm8', 'm13', 'm14'] },
  { id: 'customer', label: 'Customer Meeting', description: '고객 앞에서 규제와 배포모델을 설명합니다.', questionIds: ['m2', 'm4', 'm6', 'm7', 'm9', 'm10', 'm11', 'm12', 'm17', 'm18'] },
  { id: 'deep-dive', label: 'Deep Dive Q&A', description: '세부 조건과 꼬리질문에 정확히 답합니다.', questionIds: ['m4', 'm5', 'm7', 'm12', 'm14', 'm16', 'm17'] },
  { id: 'account-manager', label: 'Account Manager Meeting', description: '첫 미팅의 Discovery 질문과 사업기회 연결을 연습합니다.', questionIds: ['m1', 'm2', 'm9', 'm10', 'm15', 'm16', 'm18'] },
];
