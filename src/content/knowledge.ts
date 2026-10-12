import { sectionLabels, type KnowledgeCard, type KnowledgeDomain, type SalesLearningExtension, type TimelineEvent } from '../domain/types';
import { regulationMap, cloudProviderResponsibility, networkSeparation, researchNetwork, cloudLifecycle, workloadCriticality, financialDataBasics, informationProcessingOutsourcing } from './knowledgeDay1to4';
import { regulationChange, financialSystemLandscape, bankingBusinessIt, cardBusinessIt, securitiesBusinessIt, insuranceBusinessIt } from './knowledgeDay5to6';
// 카드 ID → Domain·핵심 근거. 카드 ID는 Bookmark/진도 호환을 위해 바꾸지 않는다.
// primary: 카드의 재확인 여부를 계산하는 핵심 근거 Source. 나머지 sourceIds는 보조(supporting)로 개별 배지만 표시한다.
// (Phase B 이후 카드는 cardKit.ts의 card2를 쓰며 여기에 등록하지 않는다.)
const domainTable: Record<string, { domain: KnowledgeDomain; secondaryDomains?: KnowledgeDomain[]; primary: string[] }> = {
  'sandbox-ai': { domain: 'REGULATION', secondaryDomains: ['AX_AI'], primary: ['sandbox-reform'] },
  'ai-governance': { domain: 'AX_AI', secondaryDomains: ['REGULATION'], primary: ['ai-guideline'] },
  'vulnerability': { domain: 'SECURITY_RESILIENCE', primary: ['vulnerability'] },
  'cloud-resilience': { domain: 'SECURITY_RESILIENCE', secondaryDomains: ['CLOUD_ARCHITECTURE'], primary: ['cloud'] },
  'deployment-selection': { domain: 'CLOUD_ARCHITECTURE', primary: ['cloud'] },
};
const domainOf = (id: string) => {
  const d = domainTable[id];
  if (!d) throw new Error(`Knowledge domain 미지정: ${id}`);
  return d;
};
const card = (id:string,title:string,sourceIds:string[],texts:string[],relatedCaseIds:string[]=[],caveats:string[]=[]):KnowledgeCard => ({id,title,contentKind:'VERIFIED',sourceIds,domain:domainOf(id).domain,secondaryDomains:domainOf(id).secondaryDomains,primarySourceIds:domainOf(id).primary,summary:texts[0],relatedCaseIds,caveats,verification:caveats.length?'NEEDS_VERIFICATION':'VERIFIED',sections:sectionLabels.map((label,i)=>({label,text:texts[i],type:i===8?'SALES_VIEW':i===9?'MEETING':i===1||i===3||i===7?'INTERPRETATION':'FACT',sourceIds}))});
import { awsFsiOverview, directConnect, privateConnectivity, iamFinance, encryptionKeyManagement, auditObservability } from './knowledgeDay7';
import { migrationModernization, deploymentSelection, privateAi, jbHybridDeepDive, axStack, rag, agent, mcp, modelServing, gpuNpu } from './knowledgeDay8to10';
import { saasNetworkException, bcpDrRtoRpo, awsResilience, aiBasicAct, highImpactVsHighRiskAi, aiGovernance } from './knowledgeDay11to13';
import { accountIntelligence, solutionMotionsCard, partnerEcosystem, accountPlan, firstMeetingDiscovery } from './knowledgeDay14to16';
export { cloudFlow } from './lifecycle';
const legacyKnowledge:KnowledgeCard[] = [
 card('vulnerability','전자금융기반시설 보안 취약점 평가',['vulnerability'],[
 '취약점 평가는 금융 시스템의 약점을 찾고 개선하는 반복적인 사전 예방 활동입니다.',
 '금융서비스의 안전성과 신뢰성을 저해하는 사이버 위협을 사고 전에 발견하고 조치하기 위해 필요합니다.',
 '기존에도 취약점 분석·평가 의무와 주기가 있었습니다. 2026 안내서가 처음 만든 의무로 설명하지 않습니다.',
 '점검 결과만 보관하고 조치하지 않으면 위험이 남습니다. 신규 자산·설정 변경과 운영 환경을 평가 범위에 반영하는 것이 중요합니다.',
 '2026 평가기준 안내서가 배포됐습니다. 전년 대비 개별 평가항목의 신설·삭제 내역은 별도 비교 확인이 필요합니다.',
 '전자금융 업무를 처리하는 정보처리시스템 등 전자금융기반시설이 대상입니다. 안내서 기준 전자금융기반시설은 연 1회 이상, 공개용 홈페이지는 연 2회 이상 점검합니다.',
 '사전 분석 → 취약점 분석 → 취약점 평가 → 대책 수립 → 사후 관리의 5단계로 이해합니다. 안내서의 절차 예시는 자체 기준에 맞게 적용할 수 있으며 조치계획과 이행 증적을 관리합니다.',
 '클라우드나 온프레미스라는 명칭만으로 점검이 사라지지 않습니다. 자산 범위, 운영 권한, 공급사 협조와 개선 책임을 확인해야 합니다.',
 '최근 평가 범위, 미조치 취약점, 개선 일정과 운영 담당자를 질문하면 보안·운영 과제를 구체화할 수 있습니다.',
 '취약점 평가는 금융 시스템의 잠재 위험을 찾고 개선하는 활동입니다. 2026 안내서는 기반시설 연 1회 이상, 공개 홈페이지 연 2회 이상을 안내합니다. 평가 결과에서 끝내지 않고 조치와 사후 확인까지 이어져야 합니다.'
 ],[],['전년도와의 평가항목 상세 차이는 확인 필요.']),
 card('cloud-resilience','Cloud 계약·연속성·집중리스크·이용 종료',['cloud'],[
 '클라우드를 써도 백업·이중화·재해복구·종료 계획은 금융회사가 책임지고 이용 전에 세워 계약과 운영, 종료까지 이어가야 합니다.',
 '사업자에 장애가 나거나 서비스가 중단돼도 금융서비스는 계속돼야 합니다. 특정 사업자 의존이 커지면 한 번의 사고가 여러 업무로 번질 수 있습니다.',
 '이 카드는 2025.05 가이드를 기준으로 합니다. 개정 이전 조문과의 항목별 비교는 다루지 않으며 확인이 필요합니다.',
 '기능과 비용만 보고 도입하면 DR 위치, 같은 사업자 안의 동시 장애, 종료 시 데이터 이전을 미뤄 두게 되어 사고나 계약 종료 때 선택지가 좁아질 수 있습니다.',
 '개정 전후 차이가 아니라 가이드가 클라우드에 적용해 설명하는 기준입니다. 전자금융감독규정의 백업·이중화 요구는 클라우드 환경에서도 준수해야 하며, 중요 설정파일과 가상 시스템 이미지를 백업에 포함하는 추가 사항을 제시합니다.',
 '백업은 기존 장치, 클라우드 내 백업 서비스, 다른 클라우드 등 여러 방법이 가능합니다. 이중화·DR은 금융회사 내 주센터와 클라우드 DR, 클라우드 주센터와 금융회사 내 DR, A클라우드와 B클라우드 조합 등이 가능합니다. 같은 사업자 안에 DR을 두면 동시 장애 가능성, 센터 간 거리, 데이터 국외 이전 가능 여부를 확인해야 합니다. 업무지속성 확보대책은 매년 1회 이상 점검합니다.',
 '계약에서 처리 정보는 금융회사 소유이며 조회·수정·삭제 권리를 갖는다는 점, 사업자의 재위탁 범위와 중요 변경의 사전 통지, 고유식별정보·개인신용정보 처리 시스템의 국내 설치(예외 있음)를 다룹니다. 종료 시에는 사전에 수립한 출구전략에 따라 데이터 이전·파기를 하며, 사업자를 바꾸면 금융감독원에 보고합니다. 부록은 특정 사업자 집중 리스크를 정기 분석하고 멀티 클라우드 등의 필요성을 검토하도록 권고합니다.',
 'Public, Hybrid, On-premises 어느 쪽이든 구조도에 DR 위치와 종료 시 데이터 경로를 그려야 합니다. 가이드의 DR 예시에는 온프렘 주센터와 클라우드 DR의 조합도 포함됩니다.',
 '첫 미팅에서 DR 위치, 단일 사업자 의존 범위, 종료 시 데이터 이전 방식을 물으세요. 답에 따라 Hybrid나 멀티 클라우드 같은 제안 구조의 검토 범위가 달라집니다.',
 '금융권 Cloud는 쓰는 순간이 아니라 장애와 종료 때 시험받습니다. 백업·DR 위치, 계약상 데이터 권리, 특정 사업자 의존도, 출구전략을 이용 전에 정해 두고 운영 중에도 점검합니다. 세부 의무는 업무 중요도에 따라 다르므로 원문을 확인합니다.'
 ],['jb'],['2025.05 가이드 기준이며 개정 전후 조문별 대조는 확인 필요.','집중 리스크 항목은 권고(고려사항)이며 업무 중요도에 따라 적용 범위가 다릅니다. 개별 업무 적용은 원문 확인.']),
 card('deployment-selection','배포모델 선택: 우열이 아닌 요구사항 적합성',['cloud','research'],[
 '가이드는 백업·DR을 금융회사 내 센터와 클라우드의 여러 조합으로 구성할 수 있다고 설명합니다. 배포모델은 우열이 아니라 업무·데이터·통제 조건에 맞는지로 고릅니다.',
 '업무마다 데이터 처리 위치, 기존 시스템 연계와 지연, 통제 수준, 운영 역량, 가속기 비용, 확장성, 규제 조건이 달라서 하나의 정답이 없습니다.',
 '이 카드는 배포모델의 역사 비교가 아니라 2025.05 가이드의 구성 예시를 사례 라이브러리와 연결하는 학습 카드입니다. 과거 비교는 다루지 않으며 확인이 필요합니다.',
 '한 모델을 정답으로 정해 두면 고객의 질문, 곧 데이터 위치·연계·운영 책임에 답하지 못하고 “온프렘이면 안전하다”, “클라우드면 규제가 해결된다” 같은 과장으로 이어지기 쉽습니다.',
 '가이드가 제시하는 구성 예시는 금융회사 내 주센터와 클라우드 DR, 클라우드 주센터와 금융회사 내 DR, A클라우드 주센터와 B클라우드 DR입니다. 같은 사업자 안에 DR을 두면 동시 장애 가능성, 거리, 데이터 국외 이전 가능 여부를 확인하도록 합니다.',
 '부록은 특정 사업자 집중 리스크를 정기적으로 분석하고 멀티 클라우드 등 다중 공급업체 전략의 필요성을 검토하도록 권고합니다. 컨테이너화·멀티 클라우드·백업·다중화는 단일 장애 지점 위험을 관리하는 전략의 예로 인용됩니다.',
 '개인신용정보·고유식별정보를 처리하는 시스템은 국내 설치를 계약에서 보장받도록 하며 예외가 있습니다. 연구·개발 목적의 망분리 예외는 목적과 데이터 조건, 대체통제 등 별도 조건이 있어 업무별로 근거를 확인합니다.',
 '비교 질문은 데이터 위치, 지연·기존 시스템 연계, 보안 통제, 가속기 경제성, 운영 역량, 확장성, 관리형 서비스 활용, 규제 조건입니다. 비교 화면의 10가지 기준으로 모델별 검토 질문을 확인하세요. 점수나 순위는 매기지 않습니다.',
 '모델을 먼저 권하지 말고 대상 업무, 데이터 위치, 기존 시스템 연계, 운영 책임을 먼저 물으세요. 온프렘·Private AI는 가속기·서빙·모니터링 운영 책임이 고객 쪽에 더 많이 남을 수 있고, Public은 책임 분담과 종료·DR 설명이 핵심이 되는 경향이 있습니다. 구체 사례에서 확인할 부분입니다.',
 '저는 먼저 어떤 업무의 어떤 데이터를 어디에서 처리해야 하는지, 기존 시스템과 어떻게 연결되는지, 운영은 누가 맡는지를 묻습니다. 그 답에 따라 Public, Hybrid, 온프렘·Private AI를 비교해 드리겠습니다.'
 ],['jb','jeju'],['사례별 CSP·가속기·모델·망 구성은 공개된 범위만 사용하며 이 카드가 그것을 보충하지 않습니다.','연구·개발 예외의 세부 조건은 해설서 원문 확인.']),
 card('ai-governance','금융분야 AI 가이드라인: 7대 원칙과 거버넌스',['ai-guideline'],[
 '금융분야 인공지능 가이드라인(2026.6)은 금융회사가 7대 원칙으로 AI 위험을 관리하도록 제시하는 자율 적용 가이드입니다. 거버넌스에서 시작해 보조수단성·보안성까지 이어집니다.',
 '문서는 생성형 AI와 AI 에이전트의 등장, 그리고 인공지능기본법의 제정(2025년 1월)과 시행(2026년 1월)에 맞춰 기존 가이드라인을 개정할 필요가 커졌다고 설명합니다. AI가 금융 업무 전반으로 들어오면서 책임 체계를 먼저 세우라는 취지로 읽을 수 있습니다.',
 '문서는 2021년 AI 운영 가이드라인, 2022년 AI 개발·활용 안내서, 2023년 AI 보안 가이드라인이 먼저 발표되었다고 밝힙니다. 이번 가이드라인은 기술과 제도 변화를 이 내용에 반영했습니다.',
 '문서의 문제의식은 새 기술과 법 제정으로 업무 전반의 위험관리 방향과 원칙을 다시 제시할 필요가 생겼다는 것입니다. 이전 문서와의 조항별 차이는 이 카드에서 다루지 않으며 확인이 필요합니다.',
 '7대 원칙은 거버넌스(경영진의 역할·책임 분담), 합법성(관련 법규 준수), 보조수단성(최종 의사결정과 책임은 임직원), 신뢰성(신뢰할 수 있는 데이터·모델), 금융안정성(금융안정성 위험 최소화), 신의성실(금융소비자 이익 우선), 보안성(보안 기준과 점검·개선 체계)입니다.',
 '금융권이 자율적으로 적용하며 회사별 AI 활용 수준과 영향, 자원을 고려해 적용 수준을 정할 수 있습니다. 인공지능기본법령과 중복되면 법령과 관련 가이드라인을 우선 적용합니다. 대출심사처럼 개인의 권리·의무에 중대한 영향을 주는 판단은 고영향 AI의 예로 제시됩니다. 핀테크 같은 비금융회사도 AI 활용 결과가 금융거래에 영향을 주면 범위에 포함될 수 있습니다. 금융위 공식 발표일은 2026-06-18이며, 법적 시행일은 공식 Source에서 확인되지 않아 기재하지 않습니다.',
 '의사결정기구(예: AI 윤리위원회)와 독립된 위험관리 전담 조직을 두고, 위험평가 후 경감 조치와 잔여 위험 평가, 출시 전 검증과 운영 모니터링을 수행합니다. 오픈소스를 포함해 외부에서 제공받은 AI 모델이나 시스템을 써도 책임소재는 금융회사에 귀속됩니다. 클라우드 AI는 사업자와의 보안책임 분담 모델, 데이터 처리 지역, 암호화, 접근 권한을 명확히 하고, SaaS형 AI는 개발사의 보안 대책을 지속 확인합니다.',
 '배포 위치와 관계없이 통제 체계가 필요하다는 점이 핵심입니다. Public Cloud와 SaaS에서는 책임 분담과 데이터 처리 지역을, 온프렘·Private AI에서는 오픈소스·모델 관리와 로그, 사람의 개입 기준을 설명할 수 있어야 합니다. 어느 쪽이 더 안전하다는 일반화는 하지 않습니다.',
 '첫 미팅에서 AI 의사결정기구와 전담 조직이 있는지, 대상 업무가 고객 권리·의무에 영향을 주는지, 외부 모델·SaaS의 책임소재와 입출력 로그 관리자가 누구인지 물으세요. 기술 제안 전에 이 답이 도입 범위와 일정을 좌우합니다.',
 '금융 AI 가이드라인은 법적 의무를 일률 적용하는 문서가 아니라 회사가 자율 적용하는 위험관리 원칙입니다. 거버넌스로 책임을 정하고, 사람이 최종 판단하며, 보안과 로그를 갖춰야 한다는 방향입니다. 적용 수준은 고객의 업무 영향에 따라 정해집니다.'
 ],[],['법적 시행일은 공식 Source에서 확인되지 않았습니다(발표일 2026-06-18). 확인되면 Source의 effectiveAt에 기록합니다.','AI 위험관리 프레임워크(AI RMF)와 금융분야 AI 보안 실무 안내서의 세부 항목은 읽지 않았습니다. 합법성·신뢰성·금융안정성·신의성실 원칙의 세부는 별도 확인.','학습용 요약이며 법률자문이나 개별 금융회사의 준수 판정이 아닙니다.']),
 card('sandbox-ai','혁신금융서비스(샌드박스)와 AI: 지정은 시작일 뿐',['sandbox-reform','ai-guideline'],[
 '혁신금융서비스는 규제 특례를 한시적으로 받아 새 금융서비스를 시장에서 검증하는 제도입니다. 지정은 특례의 시작이며 구축 완료나 상용 운영의 증거가 아닙니다.',
 '문서는 금융소비자 편익을 높이는 혁신 서비스의 출시를 촉진하려고 2019년 4월부터 이 제도를 운영해 왔다고 설명합니다.',
 '문서가 지적한 현행 제도의 문제는 종료 후 제도권 전환 단계의 출구전략 부재, 모든 안건이 혁신위 심사와 금융위 의결 2단계를 거치는 일률적 절차(평균 78일), 핀테크 비중 감소(2019년 56%에서 2025년 7%)입니다. 2025년 말 누적 승인 중 금융사가 76%입니다.',
 '실증에 성공해도 정식 제도로 이어지는 연결이 약하면 사업자가 불확실성을 안고 서비스를 이어가기 어렵습니다. 문서가 같은 취지로 진단한 내용을 학습용으로 해석한 것입니다.',
 '2026년 6월 개선방안은 3대 분야 9개 과제를 제시합니다. 핀테크 도전 환경 조성, 종료 이후 사후관리와 모니터링 강화, 규제특례 법령 확대와 안건 중요도별 심사 효율화, 금융당국 주도 기획형 샌드박스 활성화가 포함됩니다. 이는 발표된 방향이며 시행령 개정 등은 추진계획상 일정입니다.',
 '지정 기간은 2년 이내이고 1회 2년 연장이 가능하며, 규제개선을 요청하면 6개월 단위로 최대 3회 더 연장해 최대 5.5년입니다. 2026년 4월 말 기준 1,059건이 지정되고 436건이 출시되었다고 문서가 밝힙니다. 개선방안의 과제별 시행 여부는 확인이 필요합니다.',
 'AI 가이드라인은 상용 생성형 AI를 내부망에서 이용하려면 망분리 예외 적용을 위해 혁신금융서비스 지정이 필요하고 강화된 보안대책이 부가조건으로 부과된다고 설명합니다. 예로 AI 관리자 지정, 입출력 로그 기록, 취약점 확인 시 즉시 중단 절차, 직원 교육, 소비자에게 AI 활용 사전 고지, 외부망 연계 구간의 전용회선 또는 VPN, 모델 연계 구간 암호화가 있습니다. 2026년 4월 SaaS 규제 개선과의 적용 범위는 해당 카드와 원문을 함께 확인합니다.',
 '지정 문서만으로는 CSP, 모델, 가속기, 망 구성 같은 배포 구조를 알 수 없는 경우가 많습니다. 그때는 추정하지 않고 UNKNOWN으로 두고, 지정·구축·운영 단계를 분리해 설명합니다.',
 '고객이 지정 서비스를 말하면 지정 시점, 지정 기간과 부가조건, 실제 구축·운영 단계, 기간 만료 후 제도권 전환 계획을 물으세요. 이 답이 제안의 시기와 범위를 정합니다.',
 '혁신금융서비스 지정은 한시적 규제 특례의 시작입니다. 지정만으로 구축이나 운영을 말할 수 없고, 지정 기간과 부가 보안조건, 종료 후 전환 계획을 함께 확인합니다. 그래서 저는 먼저 지금 어느 단계인지 묻습니다.'
 ],['bc','samsungcard','samsungfire','koreanre'],['개선방안은 발표 단계이며 과제별 시행 여부와 법령 개정은 확인이 필요합니다.','AI 가이드라인의 지정 필요 서술과 2026.4 SaaS 규제 개선의 적용 범위 관계는 원문과 해당 카드에서 확인하세요.','개별 지정 서비스의 부가조건과 실제 운영 상태는 사례 카드의 확인 필요 항목을 따릅니다.'])
];

// Phase B 카드(Day 1~6)를 학습 순서대로 앞에, 기존 카드를 뒤에 둔다. 영업 학습 필드가 없던 sandbox-ai는 Day 5에서 쓰므로 여기서 채운다.
const sandboxAiSales: SalesLearningExtension = {
  amMustKnow: ['혁신금융서비스 지정은 한시적 규제 특례의 시작이며 구축·운영 완료의 증거가 아니다.', '지정 기간(2년 이내, 1회 연장, 규제개선 요청 시 추가 연장)과 부가 보안조건을 확인한다.', '혁신금융서비스는 연구개발망 예외나 내부업무망 SaaS 예외와 다른 경로다.'],
  discoveryQuestions: ['지정 시점과 지정 기간은 언제입니까?', '부가조건(보안대책)은 무엇이고 이행 상태는 어떻습니까?', '실제 구축·운영 단계는 어디입니까?', '기간 만료 후 제도권 전환 계획이 있습니까?', '운영 서비스입니까, 테스트 환경입니까?'],
  architectureMeaning: '지정 문서만으로는 CSP·모델·가속기·망 구성 같은 배포 구조를 알 수 없는 경우가 많습니다. 구조는 공개된 범위만 쓰고 나머지는 미공개로 둡니다.',
  relatedServices: ['AI 도입 Readiness assessment', '보안 대책(부가조건) 이행 구조 검토', 'PoC → Production 전환 설계'],
  saHandoff: ['부가 보안조건별 구현 방안', '지정·변경 절차의 법적 검토', '운영 전환 시 통제 구조 설계'],
  nextQuestions: ['지정 서비스의 구축 단계는 어디서 확인합니까?', '지정 기간이 끝나면 어떻게 됩니까?', '상용 생성형 AI를 내부망에서 쓰려면 무엇이 필요합니까?'],
  commonMistakes: ['지정을 구축 완료나 상용 운영으로 설명한다.', '지정 기간을 무기한으로 설명한다.', '혁신금융서비스를 일반 망분리 예외로 설명한다.'],
};
export const knowledge: KnowledgeCard[] = [
  regulationMap, cloudProviderResponsibility, networkSeparation, researchNetwork, cloudLifecycle,
  workloadCriticality, financialDataBasics, informationProcessingOutsourcing,
  regulationChange, financialSystemLandscape, bankingBusinessIt, cardBusinessIt, securitiesBusinessIt, insuranceBusinessIt,
  awsFsiOverview, directConnect, privateConnectivity, iamFinance, encryptionKeyManagement, auditObservability,
  migrationModernization, deploymentSelection, privateAi, jbHybridDeepDive, axStack, rag, agent, mcp, modelServing, gpuNpu,
  accountIntelligence, solutionMotionsCard, partnerEcosystem, accountPlan, firstMeetingDiscovery,
  saasNetworkException, bcpDrRtoRpo, awsResilience, aiBasicAct, highImpactVsHighRiskAi, aiGovernance,
  ...legacyKnowledge.filter(k => k.id !== 'deployment-selection' && k.id !== 'ai-governance').map(k => (k.id === 'sandbox-ai' ? { ...k, sales: sandboxAiSales } : k)),
];
const timelineRow=(id:string,date:string,title:string,eventType:TimelineEvent['eventType'],status:TimelineEvent['status'],previous:string,change:string,implication:string,sourceIds:string[],knowledgeId='ai-saas'):TimelineEvent=>({id,date,title,eventType,status,previous,change,implication,sourceIds,knowledgeId,contentKind:'VERIFIED'});
export const timeline:TimelineEvent[]=[
 timelineRow('tl-roadmap','2024-08-13','금융분야 망분리 개선 로드맵 발표','발표','HISTORICAL','망분리로 업무 비효율이 크고 신기술 활용·연구개발이 어렵다는 개선 요청이 계속됨. SaaS는 문서관리·인사관리 등 비중요 업무에만 허용','생성형 AI는 샌드박스 특례, SaaS 이용 범위 확대, 연구·개발 결과물 이관 완화와 가명정보 활용을 단계적으로 추진. 중장기적으로 “자율보안-결과책임” 원칙의 새 금융보안체계 지향(발표 당시 계획)','로드맵 발표는 계획의 공표이며 모든 세부규정이 즉시 시행된 것이 아님. 개별 시행은 별도로 확인',['roadmap-release','roadmap']),
 timelineRow('tl-research','2025-04','연구개발망 보안 해설서 변경','가이드','CURRENT','개발망 간 이동·활용 제약','논리적 분리·개발산출물 전송·가명정보 활용 조건 설명','개발망 목적·대체통제를 먼저 점검',['research'],'research-network'),
 timelineRow('tl-genai','2025-05-12','신한은행 GPT 금융지식 Q&A 오픈 사례','개선','HISTORICAL','혁신금융서비스 지정 후 준비','지정과 보안 평가를 거친 서비스 오픈 보도','지정과 실제 운영은 별도 근거로 확인',['shinhan']),
 timelineRow('tl-simplify','2026-04-15','생성형 AI 모델 변경 절차 간소화','개선','CURRENT','단순 모델 변경도 재지정 부담','보안 영향도에 따라 경미·보통·상당으로 처리 경로 구분','신규 서비스 전체 면제가 아님',['simplify']),
 timelineRow('tl-saas','2026-04-20','내부업무망 SaaS 예외 시행','시행','CURRENT','일부 SaaS에 혁신금융서비스 절차 활용','보안규율을 준수하는 SaaS에 조건부 예외','입력 정보 제한과 반기 통제 평가 확인',['saas']),
 timelineRow('tl-security','2026-05-26','보안목적 AI 망분리 긴급완화 발표','발표','ANNOUNCED','고성능 AI 보안위협 대응 수요','보안목적 활용 테스트·완화 방안 발표','개별 대상·세부 적용 조건은 확인 필요',['security-ai']),
 timelineRow('tl-ai-guideline','2026-06-18','금융분야 AI 가이드라인 개정안 발표','발표','ANNOUNCED','AI 운영(2021)·개발·활용(2022)·보안(2023) 가이드가 각각 발표되어 있었음','생성형 AI·AI 에이전트 등 기술 변화와 인공지능기본법(2025.1 제정·2026.1 시행)을 반영한 금융분야 인공지능 가이드라인 발표. 금융권이 자율적으로 적용하는 7대 원칙 제시','법적 시행일은 공식 Source에서 확인되지 않음. 자율 적용 가이드라인이므로 “법적 의무”로 설명하지 않음',['ai-guideline'],'ai-governance'),
 timelineRow('tl-security-2','2026-09-03','제2차 보안목적 AI 망분리 긴급완화 추진','추진','ANNOUNCED','5.26 발표한 보안목적 AI 긴급완화 테스트가 진행 중','금융위 「프런티어 AI 상황대응반」 5차 회의에서 확정. 신청 기준 완화로 금융회사 59곳·전자금융업자 16곳(75곳)이 대상, 선정 15곳 이내. 선정 회사는 망분리 대체 통제수단을 마련한 뒤 프런티어 AI·보안 SaaS로 취약점을 탐지·개선하고 결과를 정부에 보고. 3차 테스트 시기·규모는 추후 확정','보안목적 테스트이며 일반 업무용 AI 전면 허용이 아님. 개별 선정회사·적용기간·비조치 조건은 확인 필요',['security-ai-2','security-ai']),
];
