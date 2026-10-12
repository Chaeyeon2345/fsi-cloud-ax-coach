// Day 14~16 지식 카드: 금융 고객을 읽고 사업기회를 발견하고 첫 미팅과 Account Plan으로 연결하는 AE 방법론.
// 이 카드들은 공개 사실(FACT)이 아니라 교육용 Framework(INTERPRETATION)와 영업 관점(SALES_VIEW)이며, 근거 Source는 Framework가 사용하는 공개 데이터와 규제·기술 자료다.
// 특정 Vendor/MSP 중심이 아니며 Vendor·제품명은 Example로만 언급한다.
import { card2 } from './cardKit';

const I = { 0: 'INTERPRETATION', 2: 'INTERPRETATION', 4: 'INTERPRETATION', 5: 'INTERPRETATION', 6: 'INTERPRETATION' } as const;

export const accountIntelligence = card2({
  id: 'account-intelligence', title: 'Account Intelligence: 금융 고객을 처음 맡았을 때 읽는 순서',
  domain: 'SALES', secondaryDomains: ['FINANCIAL_BUSINESS_IT'],
  primary: ['roster-kfb'], supporting: ['fin-kb-bank', 'cloud'],
  texts: [
    '금융 고객을 처음 맡으면 제품 설명이 아니라 업권, 규모, IT Landscape, 공개 사업, 생태계, 규제 순서로 읽고, 확인된 사실과 내 해석을 분리해 적습니다.',
    '고객 미팅 전에 읽을 정보는 많지만 출처가 섞이면 추정이 사실처럼 굳어집니다. 순서와 구분이 있어야 같은 고객을 누가 읽어도 같은 사실에 도달합니다.',
    '이전에는 회사 소개와 기사 몇 건을 보고 “AI에 적극적인 고객” 같은 인상으로 접근하는 경우가 많았습니다.',
    '인상 평가는 근거를 추적할 수 없고 “AI 기사가 많으면 성숙도가 높다”처럼 임의 판단으로 흐릅니다. 공개 정보가 없는 것을 “하지 않는 것”으로 읽는 실수도 생깁니다.',
    '금융시장 IT·AX Index는 업권, 총자산, 본사, 공개 Keyman, 5개 IT 영역의 공개 사업, 생태계(CSP·MSP/SI·Product), 근거를 한 화면에 모아 사실과 해석을 따로 보이게 합니다.',
    'Account 읽기는 20단계(업권 → 규모 → 사업 → 서비스 특성 → IT Landscape → 영역별 사업 → CSP/MSP/Vendor → 조직·Keyman → 최근 Initiative → 규제 → 유사 Reference → 가설 → 다음 질문)이며 앞 16단계는 FACT, 뒤 단계는 SALES_VIEW입니다.',
    '금융회사 실무에서는 같은 정보가 사업부, IT, 보안, 준법에 나뉘어 있어 고객이 한 번에 설명하기 어렵습니다. 공개 정보로 먼저 윤곽을 잡고 비공개 부분은 질문으로 확인합니다.',
    '공개된 Cloud 사용, 공개 AI 사업, 기존 MSP/SI, 최근 투자 Theme를 읽으면 On-prem, Public, Hybrid, Private AI 중 어떤 대화가 이어질지 가설을 세울 수 있습니다(해석).',
    '“공개 확인자료 없음”은 사업이 없다는 뜻이 아닙니다. 공개 Source가 있는 사실만 FACT로 쓰고, 사업기회 가설은 “내 해석”으로 적어 두세요. 성숙도 점수나 등급은 만들지 않습니다.',
    '저는 고객을 처음 맡으면 업권·규모·공개 사업·생태계·규제를 사실로 정리하고, 그 위에 사업기회 가설을 따로 적습니다. 가설은 첫 미팅에서 질문으로 검증합니다.',
  ],
  types: I,
  caveats: ['공개 Source 기반 Framework이며 고객의 실제 현황을 대신하지 않습니다.', '공개 정보에서 사업이 확인되지 않은 회사는 조사 수준이 낮은 것이며 고객의 성숙도가 낮다는 뜻이 아닙니다.'],
  sales: {
    amMustKnow: ['공개 사실(FACT)과 내 해석(SALES_VIEW)을 분리해 적는다.', '“공개 확인자료 없음”을 “사업 없음”으로 읽지 않는다.', 'AI 사업 건수로 성숙도를 평가하지 않는다.'],
    discoveryQuestions: ['이 고객의 IT 투자 Theme는 무엇입니까?', '현재 CSP·MSP·SI와의 관계는 어떻게 됩니까?', '최근 3년간 추진한 IT·AX 사업의 현재 단계는?', '의사결정자와 예산 주관 조직은?', '규제·보안 검토 일정은 어떻게 됩니까?'],
    architectureMeaning: 'Account의 IT Footprint를 Core·On-prem, Public Cloud, Data, AI·AX, Security·DR로 나누어 보면 고객과의 Architecture 대화가 어디서 시작될지 보입니다.',
    relatedServices: ['Account Assessment', 'IT Landscape 정리', 'Discovery Workshop'],
    saHandoff: ['Landscape 상세 파악', '현행 Architecture 도식화', '규제·보안 검토 연계'],
    nextQuestions: ['이 고객과 유사한 국내 Reference는 어떤 것입니까?', '관련 규제 3개는 무엇입니까?', '첫 미팅에서 가장 먼저 확인할 가설은?'],
    commonMistakes: ['공개 사업이 없는 회사를 “미성숙”으로 단정한다.', '사실과 가설을 한 문장에 섞는다.', 'Vendor 이름부터 확인한다.'],
  },
});

export const solutionMotionsCard = card2({
  id: 'solution-motions', title: 'Solution Motion: 고객 Pain에서 IT·AX 사업으로',
  domain: 'SALES', secondaryDomains: ['CLOUD_ARCHITECTURE'], tech: true,
  primary: ['aws-7r'], supporting: ['aws-rag', 'aws-gpu', 'aws-dr-options', 'aws-backup', 'aws-control-tower'],
  texts: [
    '금융 AE는 특정 제품이 아니라 고객 Pain/Trigger를 듣고 인프라·가상화·Cloud·Hybrid·Data·보안·복원력·AI·Application·서비스 중 어떤 Motion으로 연결될지 구조로 이해합니다.',
    '고객은 “GPU가 없다”, “VMware 비용이 올랐다”, “문서를 못 찾는다”처럼 증상을 말합니다. 증상을 사업 Motion과 Architecture 후보로 바꾸는 구조가 있어야 같은 말을 들어도 올바른 질문으로 이어집니다.',
    '이전에는 Public Cloud 중심의 서비스 목록으로 고객을 설명하거나 Vendor Portfolio를 외워 제안하는 방식이 많았습니다.',
    '포트폴리오 중심 접근은 On-prem 인프라, 가상화, 보안, DR, 데이터 같은 사업기회를 놓치고 특정 Vendor를 정답처럼 말하게 만듭니다.',
    'Motion을 Infrastructure, Virtualization/Private Cloud, Public Cloud, Hybrid, Data, Security, Resilience, AI/AX, Application, Service 10개 영역으로 나누고 각각을 5개 배포모델의 후보와 연결합니다.',
    '대표 Land & Expand 구조: Assessment → 구축 → Migration → Managed Service → Security → Optimization → Expansion, 또는 GPU → AI Platform → RAG → Agent → Operation. 내부 마진·가격은 다루지 않습니다.',
    '금융회사에서는 같은 Pain도 업무 중요도·데이터·규제 절차에 따라 Motion이 달라집니다. 예를 들어 DR 노후화는 Backup, DR 구축, Cloud DR, Multi-site 중 RTO/RPO와 복구 테스트 결과로 갈립니다.',
    '모든 Pain에는 후보 Architecture가 여러 개 있습니다. “이 Pain이면 무조건 Public Cloud”처럼 단정하지 말고 요건 → Architecture 도구에서 조합해 보고 반대 옵션이 가능한 조건을 확인하세요.',
    'Signal을 듣고 Pain → 확인질문 → Architecture 후보 → Solution Motion → Partner → SA Handoff → Expansion 순서로 생각하면 제안이 제품이 아니라 문제에서 출발합니다. Vendor는 Example로만 쓰세요.',
    '고객의 증상을 먼저 질문으로 구체화하고, 후보 Architecture와 사업 Motion을 연결하며, 필요한 파트너와 SA Handoff까지 한 흐름으로 설명하겠습니다. 특정 Vendor를 정답처럼 제시하지 않습니다.',
  ],
  types: { ...I, 6: 'INTERPRETATION' },
  caveats: ['Motion 목록은 교육용 정리이며 모든 금융회사에 같은 순서로 일어나지 않습니다.', '기술 용어의 정의는 AWS 등 공개 문서 기준이며 Vendor 제품 비교가 아닙니다.'],
  sales: {
    amMustKnow: ['Pain → 확인질문 → Architecture 후보 → Motion 순서로 생각한다.', 'Motion은 Public Cloud에 한정되지 않는다.', '배포모델 후보를 단정하지 않는다.'],
    discoveryQuestions: ['이 문제가 지금 생긴 계기(Trigger)는 무엇입니까?', '현재 해결 방법과 한계는 무엇입니까?', '변경하려는 범위와 일정은?', '기존 계약·Vendor 제약이 있습니까?', '의사결정과 예산 경로는?'],
    architectureMeaning: 'Motion은 Architecture 위에 놓이는 사업 단위입니다. 같은 Pain도 요건에 따라 Public/Hybrid/On-prem/Private Cloud/Private AI 후보가 달라집니다.',
    relatedServices: ['Assessment', 'Migration', 'Managed Service', 'Security', 'FinOps', 'AI Platform'],
    saHandoff: ['Pain별 Architecture 후보 상세화', '용량·비용 산정', '파트너 구성 설계'],
    nextQuestions: ['이 Signal에 가장 먼저 확인할 것은?', '어떤 파트너가 함께 들어와야 합니까?', '확장은 어떤 순서로 이어집니까?'],
    commonMistakes: ['제품명부터 말한다.', 'Pain을 하나의 Motion으로만 연결한다.', 'Land & Expand를 가격 정책으로 설명한다.'],
  },
});

export const partnerEcosystem = card2({
  id: 'partner-ecosystem', title: '금융 Deal의 파트너 구조: Customer·CSP·MSP·SI·ISV·Vendor',
  domain: 'SALES', secondaryDomains: ['REGULATION'],
  primary: ['cloud'], supporting: ['aws-shared-responsibility'],
  texts: [
    '하나의 금융 Deal에는 금융회사, CSP, MSP, SI, ISV, 인프라·보안 Vendor, 컨설팅이 함께 들어갈 수 있고, 책임은 위탁해도 금융회사에 남습니다.',
    '누가 무엇을 맡는지 모르면 제안서의 책임 구조, 재위탁 동의, 계약 범위가 비어 일정과 협상이 지연됩니다.',
    '이전에는 한 회사가 모든 것을 맡는 단일 공급자 구조로 사업을 이해하는 경우가 많았습니다.',
    '실제 금융 사업은 CSP는 인프라, MSP는 운영, SI는 통합·개발, Vendor는 제품으로 나뉘고 재위탁 단계가 늘어나면 책임 관리가 어려워집니다.',
    '파트너 역할을 9개(Customer, CSP, MSP, SI, ISV, Infra Vendor, Security Vendor, Consulting, Application Vendor)로 나누어 책임 분담과 Handoff 지점을 명확히 합니다.',
    'Cloud 이용 가이드는 CSP의 고의·과실을 금융회사의 것으로 보고 재위탁은 사전 서면 동의를 요구한다고 설명합니다. 공동 책임 모델은 인프라와 고객 설정 책임을 구분합니다.',
    '금융회사는 위탁 계약, 업무위수탁 운영기준, 재위탁 통제로 파트너 구조를 관리합니다. 파트너가 늘면 보고와 서류 부담도 늘어납니다.',
    '파트너 구성은 제안의 실행 가능성을 좌우합니다. 어느 영역을 누가 맡고 누구에게 Handoff하는지가 Deal Timeline에 들어가야 합니다.',
    '고객이 이미 쓰는 CSP·MSP·SI가 있는지 먼저 확인하세요. 새 파트너를 추가할 때 재위탁·동의·책임 구조가 어떻게 바뀌는지 질문하는 것이 신뢰를 줍니다. 파트너 이름은 Example이며 특정 회사를 추천하지 않습니다.',
    '금융 사업은 고객이 책임을 지고 CSP, MSP, SI, Vendor가 역할을 나누는 구조입니다. 제안 전에 누가 무엇을 맡고 재위탁 동의가 어떻게 되는지부터 확인하겠습니다.',
  ],
  types: { 0: 'INTERPRETATION', 2: 'INTERPRETATION', 4: 'INTERPRETATION', 5: 'FACT', 6: 'INTERPRETATION' },
  caveats: ['역할 구분은 교육용 정리입니다. 책임·재위탁 요건의 근거는 Cloud 이용 가이드이며 개별 계약은 법무 확인 영역입니다.'],
  sales: {
    amMustKnow: ['위탁해도 책임은 금융회사에 남는다(가이드 설명).', '재위탁·변경은 사전 서면 동의가 필요하다.', '하나의 Deal에 여러 역할의 회사가 들어갈 수 있다.'],
    discoveryQuestions: ['현재 CSP·MSP·SI는 어디입니까?', '재위탁 구조와 동의 절차는 어떻게 됩니까?', '특권 접근은 누가 갖습니까?', '책임 분담(RACI)은 문서화돼 있습니까?', '신규 파트너 도입 절차는?'],
    architectureMeaning: '구조도에 파트너별 책임 경계(인프라/운영/애플리케이션/보안)를 함께 표시하면 책임 논의가 구체화됩니다.',
    relatedServices: ['파트너 구조 설계', 'RACI 정의', '운영 인수인계'],
    saHandoff: ['책임 경계와 운영 모델', '재위탁 구조 검토(법무)', '특권 접근 통제'],
    nextQuestions: ['어느 파트너가 어느 단계를 맡습니까?', '재위탁 동의는 누가 합니까?', '종료 시 인수인계는 어떻게 합니까?'],
    commonMistakes: ['단일 공급자 구조로 가정한다.', '재위탁 동의를 빠뜨린다.', '책임이 위탁처로 이전된다고 설명한다.'],
  },
});

export const accountPlan = card2({
  id: 'account-plan', title: 'Account Plan: 산업분류가 아니라 한 고객의 전략',
  domain: 'SALES',
  primary: ['cloud'], supporting: ['ai-guideline'],
  texts: [
    'Account Plan은 업권 분류가 아니라 한 고객의 Business, IT 전략, Stakeholder, Landscape, 규제, Pain, 가설, 예산, 일정, 다음 Action, 확장 경로를 한 문서로 정리한 것입니다.',
    '금융 고객은 의사결정에 보안·준법·구매·IT·사업부가 모두 관여해 한 번의 미팅으로 결론이 나지 않습니다. 정리된 계획이 있어야 팀이 같은 방향으로 움직입니다.',
    '이전에는 고객 이름과 영업 단계만 적은 파이프라인으로 관리하는 경우가 많았습니다.',
    '파이프라인만으로는 왜 이 고객이 지금 이 사업을 하는지, 누가 결정하는지, 규제 절차가 얼마나 걸리는지가 보이지 않아 일정이 반복적으로 밀립니다.',
    'Account Plan 20항목은 고객 Business부터 Expansion Path까지를 포함하고, Stakeholder는 Role 중심 Template으로 기록합니다. 개인 정보는 공개 Seed에 저장하지 않습니다.',
    '사실(공개 Source)과 가설(내 해석)을 구분하고, Opportunity는 Problem·Owner·Value·Technical fit·Timing·Budget path·Decision process·Next action이 확인된 것만 올립니다.',
    '금융회사에서는 정보보호위원회·보안성 검토·구매 일정이 Timeline의 큰 부분을 차지합니다. Account Plan의 Timeline과 Regulation 항목이 이 절차를 반영해야 합니다.',
    'Cloud/AX 사업은 Pilot 이후 운영·확장 단계에서 규모가 커집니다. 계획에 Expansion Path와 PoC → Production 조건(실제 Data·User·KPI·운영 책임)을 함께 적어 두세요.',
    '“관심 있습니다”만으로 Opportunity로 올리지 마세요. 8개 기준을 확인하고 Next action에 담당과 시점을 적으세요. 실제 이름은 공식 공개 정보나 본인의 로컬 메모에서만 사용합니다.',
    '저는 고객 한 곳의 Business와 IT 전략, 이해관계자, 규제·예산·일정, 다음 행동까지 한 계획으로 정리해 팀과 같은 방향으로 움직이겠습니다.',
  ],
  types: { 0: 'INTERPRETATION', 2: 'INTERPRETATION', 4: 'INTERPRETATION', 5: 'INTERPRETATION', 6: 'INTERPRETATION' },
  caveats: ['Account Plan은 영업 방법론이며 규제 사실이 아닙니다. 개인정보·연락처는 앱에 저장하지 않습니다(로컬 메모 제외).'],
  sales: {
    amMustKnow: ['Opportunity는 8가지 기준을 확인한 것만 올린다.', 'Stakeholder는 Role 중심으로 기록한다.', 'PoC → Production은 실제 Data·User·KPI·운영 책임이 조건이다.'],
    discoveryQuestions: ['누가 어떤 순서로 결정합니까?', '예산은 어느 조직에서 어떤 구조로 집행됩니까?', '규제·보안 검토 일정은 어떻게 됩니까?', '성공을 판단하는 KPI는 무엇입니까?', '다음 단계의 담당과 시점은?'],
    architectureMeaning: 'Account Plan의 IT Landscape와 Regulation 항목은 구조도와 Handoff 계획의 입력입니다.',
    relatedServices: ['Account Planning Workshop', 'PoC 설계', 'Roadmap'],
    saHandoff: ['PoC 설계와 성공 기준', '규제·보안 검토 연계', '운영 이관 계획'],
    nextQuestions: ['Opportunity Qualification을 통과했습니까?', 'PoC 이후 운영 책임은 누구입니까?', '확장 경로는 무엇입니까?'],
    commonMistakes: ['관심 표명을 Opportunity로 본다.', '개인정보를 공유 문서에 적는다.', '규제 일정을 Timeline에서 빠뜨린다.'],
  },
});

export const firstMeetingDiscovery = card2({
  id: 'first-meeting-discovery', title: '첫 미팅 Discovery Flow: 제품부터 설명하지 않는다',
  domain: 'SALES',
  primary: ['cloud'], supporting: ['aws-dr-bcp'],
  texts: [
    '첫 미팅은 Business Pain, User, 현재 절차·시스템, Data, Network, Security, Regulation, 가용성, RTO/RPO, 연계, 운영, 비용, 예산, 일정, KPI, 의사결정 순으로 묻고 제품 설명은 그 뒤에 합니다.',
    '고객이 아직 문제를 구조화하지 않은 첫 미팅에서 제품부터 설명하면 요구사항이 아니라 기능 비교로 흐릅니다. 질문의 순서가 신뢰와 정보량을 정합니다.',
    '이전에는 회사·제품 소개 자료를 먼저 보여주고 고객 반응에 따라 질문하는 방식이 많았습니다.',
    '소개가 길어지면 고객의 현재 상태와 결정 구조를 알지 못한 채 미팅이 끝나 다음 Action이 정해지지 않습니다.',
    '질문을 Level 1(Business: 왜 하는가), Level 2(IT/Architecture: 현재 어떻게 되어 있는가), Level 3(Deal: 누가·언제·어떤 예산으로 결정하는가) 세 단계로 나누어 순서를 익힙니다.',
    '미팅 직전에는 Account Brief로 사실을 정리하고, 미팅 후에는 Pain·확인된 Fact·미확인사항·기술/규제 검토·Stakeholder·Budget/Timing·Next Action을 정리합니다.',
    '금융 고객은 보안·규제 검토를 이미 알고 있어 이를 AE가 정확히 묻는 것만으로도 신뢰가 생깁니다. 다만 규제 판단은 법무·보안에 넘기세요.',
    'PoC에서 Production으로 넘어갈 때는 실제 User·Data·KPI, 보안 검토, 운영 책임, 예산, 일정이 있는지 점검합니다. 이 질문이 Architecture와 비용 가정을 바꿉니다.',
    'Level 1 질문에서 Pain이 확인되면 Level 2로 내려가고, Level 3은 관계가 만들어진 뒤에 묻습니다. 고객이 모른다고 답한 항목은 “미확인”으로 기록하고 다음 미팅 과제로 남기세요.',
    '저는 제품 설명 대신 고객이 왜 이 사업을 하는지, 현재 시스템과 데이터, 규제·보안 검토, 예산과 결정 구조를 순서대로 묻고 다음 행동을 합의하겠습니다.',
  ],
  types: { 0: 'INTERPRETATION', 2: 'INTERPRETATION', 4: 'INTERPRETATION', 5: 'INTERPRETATION', 6: 'INTERPRETATION' },
  caveats: ['미팅 Flow는 영업 방법론이며 규제 사실이 아닙니다.'],
  sales: {
    amMustKnow: ['질문은 Business → IT → Deal 순서로 한다.', '제품 설명은 요구사항 확인 뒤에 한다.', '모르는 항목은 미확인으로 기록해 다음 과제로 남긴다.'],
    discoveryQuestions: ['이 사업을 왜 추진하십니까?', '현재 어떤 시스템·절차로 처리하고 있습니까?', '데이터와 망·보안 제약은 무엇입니까?', '성공을 어떤 지표로 판단합니까?', '누가 어떤 순서로 결정합니까?'],
    architectureMeaning: '미팅에서 모은 Data·Network·Security·RTO/RPO 답변이 요건 → Architecture 판단의 입력이 됩니다.',
    relatedServices: ['Discovery Workshop', 'Architecture Assessment', 'PoC 설계'],
    saHandoff: ['미팅 결과 기반 요건 정리', '기술 검토 항목 인계', '규제·보안 검토 연계'],
    nextQuestions: ['미팅 후 확인해야 할 미확인사항은?', '다음 미팅에 누구를 데려갑니까?', '고객이 합의한 Next action은?'],
    commonMistakes: ['제품 소개로 시작한다.', 'Deal 질문을 첫 질문으로 한다.', '미팅 후 사실과 가설을 구분하지 않고 적는다.'],
  },
});
