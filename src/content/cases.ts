import type { CaseDepth, CaseStudy, CaseType, Evidence } from '../domain/types';
import { autoCases } from './casesAuto';
import { promotedCases } from './casesPromo';
export const unknown = ():Evidence => ({value:'미공개',status:'UNKNOWN',sourceIds:[]});
const disclosed=(value:string,...sourceIds:string[]):Evidence=>({value,status:'DISCLOSED',sourceIds});
// 사례 ID → 레퍼런스 성격(CaseType)과 학습 깊이. Stage와 별개이며 허용 조합은 validate.ts가 검사한다.
// 혁신금융서비스 지정(REGULATORY)은 구축 레퍼런스가 아니라 "규제특례 지정 사실"이다.
const caseClass: Record<string, { caseType: CaseType; depth: CaseDepth }> = {
  jb: { caseType: 'DELIVERY', depth: 'DEEP_DIVE' },
  jeju: { caseType: 'PRODUCTION', depth: 'DEEP_DIVE' },
  kb: { caseType: 'PRODUCTION', depth: 'DEEP_DIVE' },
  ibk: { caseType: 'BUILDING', depth: 'DEEP_DIVE' },
  shinhan: { caseType: 'PRODUCTION', depth: 'LIGHT' },
  ksfc: { caseType: 'BUILDING', depth: 'LIGHT' },
  bc: { caseType: 'REGULATORY', depth: 'LIGHT' },
  samsungcard: { caseType: 'REGULATORY', depth: 'LIGHT' },
  samsungfire: { caseType: 'REGULATORY', depth: 'LIGHT' },
  koreanre: { caseType: 'REGULATORY', depth: 'LIGHT' },
};
const base=(id:string,company:string,industry:CaseStudy['industry'],title:string,date:string,stage:CaseStudy['stage'],sourceIds:string[],problem:string,salesView:string):CaseStudy=>({id,company,industry,title,date,stage,stageNote:'표시 단계는 아래 출처가 입증한 시점 기준입니다. 이후 완료·변경 여부는 별도 확인하세요.',stageSourceIds:sourceIds,contentKind:'VERIFIED',sourceIds,...caseClass[id],region:'KR',problem,deploymentModels:[],deploymentSourceIds:[],csp:unknown(),model:unknown(),technology:unknown(),security:unknown(),architecture:unknown(),partner:unknown(),salesView,meetingLine:`${company}의 ${title} 사례는 업무 목적과 공개된 단계부터 확인하고 고객 환경에 맞춰 검토할 수 있습니다.`,relatedKnowledgeIds:['cloud-lifecycle','ai-saas'],caveats:[]});
export const cases:CaseStudy[]=[
 {...base('kb','KB국민은행','은행','직원용 생성형 AI 상담 챗봇','2025-07','상용 운영',['kb'],'직원의 고객 상담 과정에서 업무정보 확인을 지원','직원 지원 도구와 고객에게 직접 답하는 서비스를 구분하고 답변 확인 책임을 질문합니다.'),technology:disclosed('기존 ML 기반 직원 챗봇에 생성형 AI 결합','kb'),security:disclosed('2024년 11월 혁신금융서비스 지정 서비스 중 금융상담 에이전트 활용','kb'),caveats:['CSP·모델·네트워크·구축사는 확인한 공식 발표 범위에서 미공개. 원문 사이트 자동 접근 제한으로 검색 색인 확인.']},
 {...base('shinhan','신한은행','은행','AI ONE / GPT 연계 금융지식 Q&A','2025-05-12','상용 운영',['shinhan'],'직원 업무지식 검색과 고객 상담 지원','서비스 연결뿐 아니라 지식 문서의 최신성과 답변 근거 관리가 필요합니다.'),deploymentModels:['Public Cloud'],deploymentSourceIds:['shinhan'],csp:disclosed('Microsoft Azure','shinhan'),model:disclosed('GPT (세부 버전 미공개)','shinhan'),technology:disclosed('AI ONE에 금융지식 Q&A 탑재, 업무지식 정비·문서 반영 자동화','shinhan'),security:disclosed('혁신금융서비스 지정 및 금융보안원 보안 평가 통과 보도','shinhan'),caveats:['은행 발표를 인용한 Tier C 보도 기준. 전체 시스템이 Public Cloud라는 의미는 아니며 상세 연결 구조는 미공개.']},
 {...base('jeju','제주은행','은행','On-premises 생성형 AI / Agent 플랫폼','2026-03 수주 / 운영 개시일 미공개','상용 운영',['jeju','jeju-award'],'보안·망분리 환경에서 직원이 업무 AI Agent를 만들고 활용','온프레미스 도입에도 현업 활용, 내부 연계, 모니터링과 운영 지원이 필요합니다.'),stageNote:'2026.3 수주 자료와 별개로 공급사 고객사례의 “운영 중” 표현 확인. 정확한 운영 개시일 미공개.',deploymentModels:['On-premises'],deploymentSourceIds:['jeju'],technology:disclosed('XGEN, AI Agent, RAG, MCP·API 연계','jeju'),security:disclosed('망분리 환경, PII 마스킹·금칙어 필터·활용 모니터링을 공급사가 공개','jeju'),architecture:disclosed('은행 인프라에 XGEN을 온프레미스로 구축. 상세 GPU·서빙·망 구성은 미공개','jeju'),partner:disclosed('플래티어·KT 컨소시엄','jeju-award'),relatedKnowledgeIds:['network','research-network'],caveats:['공급사 공개 설명이며 고객이 직접 공개한 상세 Reference Architecture는 미확보. Private AI로 별도 분류하는 근거와 모델·GPU 사양은 미공개.']},
 {...base('jb','JB우리캐피탈','캐피탈','AWS 기반 생성형 AI 업무 플랫폼','2026-03-18','구축 완료',['jb'],'영업승인신청서·심사의견서 작성의 반복 작업 단축','문서 유형, 내부 문서 접근권한, 초안 검토자와 업무 포털 연결을 함께 설계합니다.'),stageNote:'공급사가 구축 완료와 업무 활용 성과를 발표. 별도 운영 개시일은 미공개.',deploymentModels:['Public Cloud','Hybrid'],deploymentSourceIds:['jb'],csp:disclosed('AWS','jb'),model:disclosed('Anthropic Claude Sonnet 4.5','jb'),technology:disclosed('Amazon Bedrock, RAG, 업무 포털 연계','jb'),security:disclosed('VPN, 토큰·IP 권한 제어, OTP, Kill Switch','jb'),architecture:disclosed('핵심 데이터 내부 보관 + 클라우드 AI의 Hybrid 구조 (공급사 설명)','jb'),partner:disclosed('메가존클라우드','jb'),caveats:['공급사가 공개한 요약 구조입니다. 고객 공식 상세 구조도·리전·GPU는 미공개.']},
 {...base('bc','BC카드','카드','생성형 AI를 활용한 데이터 분석 플랫폼','2026-07-01','혁신금융서비스 지정',['sandbox-july'],'데이터 분석에 생성형 AI 활용 — 상세 업무 범위 확인 필요','같은 회사의 다른 AI·빅데이터 서비스와 지정 건을 혼동하지 않고 서비스 단위로 확인합니다.'),stageNote:'지정 목록으로 2026.7.1 지정만 확인. 구축·운영 상태 확인 필요.',caveats:['별도 AI 금융빅데이터플랫폼 운영 보도를 이 지정 건의 운영 증거로 합치지 않았습니다. 상세 기술·보안 부가조건 확인 필요.']},
 {...base('samsungcard','삼성카드','카드','모니모 AI 서비스','2026-07-01','혁신금융서비스 지정',['sandbox-july'],'모니모 내 AI 서비스 — 세부 업무 문제 확인 필요','대고객 AI는 제공 범위, 답변 검증, 개인정보와 소비자 안내를 먼저 질문합니다.'),stageNote:'지정 사실만 확인. 실제 출시·운영과 세부 부가조건은 확인 필요.',caveats:['서비스 명칭을 넘어서는 CSP·모델·배포방식·운영 상태는 미공개.']},
 {...base('ibk','IBK투자증권','증권','On-premises 생성형 AI 내재화','2026-03-25','구축 중',['ibk','ibk-bid'],'사내 지식 검색·회의록·투자정보 작성 지원','PoC 성과에서 운영으로 넘어갈 때 인증·문서보안·개인정보 통제와 운영 인수 기준을 확인합니다.'),deploymentModels:['On-premises'],deploymentSourceIds:['ibk'],model:disclosed('원라인에이아이 OLA-F (금융 특화 LLM)','ibk'),technology:disclosed('RAG, STT, 투자정보 리포트 생성 — 구축 범위','ibk'),security:disclosed('DRM·SSO·개인정보 필터링 연계 계획','ibk'),partner:disclosed('핑거·원라인에이아이','ibk'),stageNote:'공급사 수주·구축 범위 보도 기준. 6개월 예정 기간이 지났다는 이유로 완료 처리하지 않음.',relatedKnowledgeIds:['network','financial-it'],caveats:['Tier C 보도에 기반한 구축 계획. 최신 검수·상용 운영 상태와 상세 아키텍처는 확인 필요.']},
 {...base('ksfc','한국증권금융','신용정보·금융인프라','On-premises 생성형 AI 활용 플랫폼','2026-07-15','구축 중',['ksfc'],'임직원의 자료 조사·내규 검색·반복 업무 지원','전사 AI 비서에는 문서 권한, 데이터 연계와 모델 운영 관리가 함께 필요합니다.'),deploymentModels:['On-premises'],deploymentSourceIds:['ksfc'],technology:disclosed('AI 비서 빌더, LLMOps, RAG, OCR, AI 가드레일 — 도입 계획','ksfc'),security:disclosed('DRM·SSO·비식별화·내부망 연계 계획','ksfc'),partner:disclosed('올거나이즈','ksfc'),stageNote:'2026.6~12 사업 착수 보도 기준. 구축 완료·상용 운영을 의미하지 않음.',relatedKnowledgeIds:['network','financial-it'],caveats:['공급사 발표를 인용한 Tier C 보도. 고객·공급사 공식 원문과 최신 진행상황은 추가 확인 필요.']},
 {...base('samsungfire','삼성화재','보험','임직원용 지능형 업무지식 챗봇','2026-07-01','혁신금융서비스 지정',['sandbox-july'],'임직원 업무지식 활용 — 상세 구현 범위 확인 필요','직원별 열람권한과 답변의 원문 추적, 지식 갱신 담당자를 확인합니다.'),stageNote:'지정 사실만 확인. 구축 완료·서비스 개시 증거 미확보.',caveats:['지정 건의 CSP·모델·배포방식·구축사는 미공개.']},
 {...base('koreanre','코리안리재보험','보험','기업성 보험 요율산정 AI Assistant','2026-03-18 지정','혁신금융서비스 지정',['sandbox-march','koreanre'],'요율산정 과정에서 상품 식별·유사 UW 탐색 지원','AI가 산출한 결과의 검토자와 요율 결정 책임, 기존 심사 시스템 연계 범위를 확인합니다.'),stageSourceIds:['sandbox-march'],stageNote:'지정 확인. 공급사에 2025.12~2026.07 사업 기간과 도입 설명이 있으나 명시적 완료·상용 개시 확인은 필요.',model:disclosed('Claude, Gemini (세부 버전 미공개)','koreanre'),technology:disclosed('AI Agent, MCP, OCR 처리 데이터 활용, 프롬프트 관리','koreanre'),partner:disclosed('3SOFTPLUS (공개 도입사례 기준)','koreanre'),caveats:['공급사 사업 기간 종료만으로 구축 완료·상용 운영을 판정하지 않았습니다. CSP·배포모델·상세 구조는 미공개.']},
];
const meetingLines:Record<string,string>={
 kb:'KB국민은행은 직원 상담을 지원하는 생성형 AI 챗봇 운영을 발표했으며, 고객에게 직접 답하는 서비스와 직원의 판단을 돕는 서비스를 구분해 검토할 수 있습니다.',
 shinhan:'신한은행의 AI ONE 금융지식 Q&A는 업무지식을 외부 GPT와 연결한 사례로, 고객 환경에서도 문서 최신성과 답변 근거 관리를 함께 확인하겠습니다.',
 jeju:'제주은행은 온프레미스 XGEN 플랫폼에서 현업의 Agent 활용을 공개했으며, 자체 배포에서도 업무 연계와 지속 운영이 핵심이라는 점을 배울 수 있습니다.',
 jb:'JB우리캐피탈은 내부 데이터와 AWS 기반 AI를 연결해 보고서 작성을 지원한 Hybrid 사례로, 저희도 문서 권한과 업무 포털 연계부터 확인하겠습니다.',
 bc:'BC카드의 생성형 AI 데이터 분석 플랫폼은 2026년 7월 혁신금융서비스 지정이 확인되며, 실제 운영 상태와 고객 데이터 처리 범위는 추가 확인하겠습니다.',
 samsungcard:'모니모 AI는 혁신금융서비스 지정 단계의 근거가 있으며, 출시 여부를 단정하기보다 대고객 AI의 정보 범위와 검증 책임을 확인하겠습니다.',
 ibk:'IBK투자증권의 온프레미스 AI 내재화 사업은 구축 단계로 확인되며, PoC에서 운영으로 넘어갈 때 인증·문서보안·운영 인수 조건을 함께 검토할 수 있습니다.',
 ksfc:'한국증권금융의 온프레미스 AI 플랫폼은 구축 착수 사례로, 전사 AI 비서를 위해 문서 권한과 모델 운영 관리가 함께 필요함을 보여줍니다.',
 samsungfire:'삼성화재의 임직원용 업무지식 챗봇은 지정이 확인된 사례이며, 고객에게도 문서 접근권한과 지식 갱신 책임부터 질문하겠습니다.',
 koreanre:'코리안리의 요율산정 AI Assistant는 지정과 공급사 기술 공개가 확인되며, AI 지원 결과와 최종 요율 판단의 책임을 구분해 논의할 수 있습니다.',
};
cases.forEach(c=>{c.meetingLine=meetingLines[c.id]});
cases.push(...autoCases,...promotedCases);
