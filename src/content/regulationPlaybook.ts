// 금융 IT·규제 Playbook 데이터.
// 사실(FACT)은 Knowledge Card가 단일 출처(Single Source)이고, 이 파일은 카드를 "참조"하며 화면에 필요한 구조(적용 시점·핵심 조항 표·실무 통제·잘못 말하면 안 되는 문장)만 추가한다.
// 종류 표기: LAW(법령) / REGULATION(감독규정·시행세칙) / GUIDE(가이드·안내서·해설서) / PRACTICE(금융회사 실무 관행) / INTERPRETATION(교육용 해석).
// 조문 번호는 가이드·해설서·보도자료가 인용한 범위만 적었고 원문 조문 대조 여부는 Source 열과 카드의 caveats를 따른다. 법률 자문이 아니다.
export type RuleKind = 'LAW' | 'REGULATION' | 'GUIDE' | 'PRACTICE' | 'INTERPRETATION';
export const ruleKindLabels: Record<RuleKind, string> = { LAW: 'LAW · 법령', REGULATION: 'REGULATION · 감독규정·시행세칙', GUIDE: 'GUIDE · 가이드·해설서', PRACTICE: 'PRACTICE · 실무 관행', INTERPRETATION: 'INTERPRETATION · 교육용 해석' };

export interface Topic {
  id: string; code: string; title: string; kinds: RuleKind[];
  cardId: string;            // 한 줄 결론·왜 존재하는가·실제 확인·AM이 알아야 할 것·질문·오해·Handoff·Source는 이 카드를 참조
  extraCardIds?: string[];
  when: string;              // 언제 적용되는가
  dealImpact: string;        // Deal에 미치는 영향
  caseIds: string[];
}

export const topics: Topic[] = [
  { id: 't-cloud', code: 'A', title: '금융 Cloud 이용', kinds: ['LAW', 'REGULATION', 'GUIDE'], cardId: 'cloud-lifecycle', extraCardIds: ['regulation-map'],
    when: '금융회사가 CSP와 계약해 상용 클라우드컴퓨팅서비스를 이용할 때(감독규정 제14조의2). 직접 개발·구축·운영하는 경우 등은 가이드의 적용범위 예시를 따로 확인합니다.',
    dealImpact: '업무 중요도 평가 → CSP 평가 → BCP·안전성 확보조치 → 정보보호위원회 심의 → 보고 일정이 사업 일정에 들어갑니다. 중요 업무일수록 요구 증적이 늘어납니다.', caseIds: ['jb'] },
  { id: 't-network', code: 'B', title: '망분리', kinds: ['REGULATION', 'GUIDE'], cardId: 'network',
    when: '금융회사 내부 업무·전산실·개발 환경의 네트워크 구성과 외부 서비스 접속을 설계할 때. 3호망·5호망은 보안 등급이 아니라 감독규정 제15조 제1항의 호 번호입니다.',
    dealImpact: '사용자·데이터·접속 경로에 따라 쓸 수 있는 서비스와 구조도가 달라집니다. AI·SaaS 도입 일정이 망 구분 검토에 좌우됩니다.', caseIds: [] },
  { id: 't-rnd', code: 'C', title: '연구개발망', kinds: ['REGULATION', 'GUIDE'], cardId: 'research-network',
    when: '개발(코딩·테스트)과 AI·SaaS를 활용한 연구·개발 목적에 한해, 자체 위험성 평가와 정보보호위원회 의결을 거쳐 연구개발망을 구성할 때.',
    dealImpact: 'AI 개발 PoC가 연구개발망 범위인지 운영 서비스인지에 따라 일정과 구조가 갈립니다. 실제 서비스 시스템은 연구개발망에 둘 수 없습니다.', caseIds: [] },
  { id: 't-saas', code: 'D', title: 'SaaS 예외', kinds: ['REGULATION', 'GUIDE'], cardId: 'saas-network-exception',
    when: '2026-04-20부터 조건을 충족한 사무관리·업무지원 SaaS를 내부업무망에서 이용할 때. 고유식별정보·개인신용정보 처리에는 허용되지 않습니다.',
    dealImpact: '문서작성·협업 같은 SaaS 도입 경로가 단축되지만 평가·단말 보호·반기 평가·보고 체계가 필요합니다. 모든 SaaS·AI의 자유 사용이 아닙니다.', caseIds: [] },
  { id: 't-outsourcing', code: 'E', title: '정보처리 위탁', kinds: ['REGULATION', 'GUIDE'], cardId: 'information-processing-outsourcing',
    when: 'CSP와 계약해 클라우드서비스를 이용하는 행위는 정보처리위탁규정 제2조제6항에 따른 위탁에 해당한다고 가이드가 설명합니다.',
    dealImpact: '위탁계약서, 업무위수탁 운영기준, 재위탁 서면 동의, 위탁 서류와 이용 보고가 함께 따라옵니다.', caseIds: [] },
  { id: 't-data', code: 'F', title: '개인정보 · 개인신용정보', kinds: ['LAW', 'GUIDE', 'INTERPRETATION'], cardId: 'financial-data-basics',
    when: '처리하는 데이터가 개인정보·개인신용정보·고유식별정보·가명정보 중 무엇인지에 따라 허용 경로와 적용 규정이 달라질 때.',
    dealImpact: '데이터 종류가 외부 처리 가능 범위와 연구개발망·SaaS 예외 적용 여부를 정합니다. 법적 최종 판단은 법무·보안 영역입니다.', caseIds: [] },
  { id: 't-bcp', code: 'G', title: 'BCP / DR', kinds: ['REGULATION', 'GUIDE', 'INTERPRETATION'], cardId: 'bcp-dr-rto-rpo', extraCardIds: ['aws-resilience'],
    when: '중요 업무의 백업·이중화·재해복구와 업무지속성 확보대책을 정할 때. 클라우드에서도 감독규정의 백업·이중화 요구를 준수해야 한다고 가이드가 설명합니다.',
    dealImpact: 'RTO/RPO와 복구 테스트 증적이 제안 구조와 비용을 좌우합니다. Multi-AZ·Snapshot 보유는 DR 입증이 아닙니다.', caseIds: [] },
  { id: 't-infra', code: 'H', title: '전자금융기반시설 보안', kinds: ['REGULATION', 'GUIDE'], cardId: 'vulnerability',
    when: '전자금융업무를 처리하는 정보처리시스템 등 전자금융기반시설의 취약점을 분석·평가할 때(2026 평가기준 안내서).',
    dealImpact: '평가 범위·미조치 취약점·개선 책임이 운영과 보안 사업의 기회이자 일정 제약이 됩니다.', caseIds: [] },
  { id: 't-ai-gov', code: 'I', title: '금융 AI Governance', kinds: ['GUIDE'], cardId: 'ai-governance', extraCardIds: ['high-impact-vs-high-risk-ai'],
    when: '금융회사가 AI를 개발·도입·운영할 때 금융권이 자율적으로 적용하는 위험관리 원칙으로 참고합니다. 법령과 중복되면 법령이 우선합니다.',
    dealImpact: '책임 체계·평가·모니터링·중단 수단·사람의 개입 설계가 AI 도입 승인 속도를 좌우합니다. 거버넌스 제품이 법적 준수를 보장하지 않습니다.', caseIds: ['kb', 'shinhan'] },
  { id: 't-ai-act', code: 'J', title: 'AI기본법', kinds: ['LAW', 'INTERPRETATION'], cardId: 'ai-basic-act',
    when: '인공지능 발전과 신뢰 기반 조성 등에 관한 기본법(법률 제20676호, 공포 2025-01-21, 시행 2026-01-22)의 대상 사업자·AI인지 판단할 때. 조문 본문은 이 앱에서 확인하지 못했습니다.',
    dealImpact: '고영향 AI 해당 여부에 따라 위험관리·설명·이용자 보호 검토가 늘 수 있어 법무와 함께 분류합니다.', caseIds: [] },
  { id: 't-sandbox', code: 'K', title: '혁신금융서비스', kinds: ['GUIDE', 'REGULATION'], cardId: 'sandbox-ai',
    when: '규제 특례가 필요한 새 금융서비스를 한시적으로 시장에서 검증할 때. 상용 생성형 AI를 내부망에서 쓰려면 지정과 부가 보안조건이 필요하다고 AI 가이드라인이 설명합니다.',
    dealImpact: '지정은 시작일 뿐이며 구축·운영과 구분해 단계를 확인합니다. 지정 기간과 종료 후 전환 계획이 제안 시기를 정합니다.', caseIds: ['bc', 'samsungcard', 'samsungfire', 'koreanre'] },
  { id: 't-vendor', code: 'L', title: 'Outsourcing / Vendor Risk', kinds: ['LAW', 'GUIDE'], cardId: 'cloud-provider-responsibility', extraCardIds: ['workload-criticality'],
    when: 'CSP·SaaS·MSP·SI에 업무나 정보처리를 맡길 때. CSP를 써도 전자금융사고에 대한 금융회사의 책임은 면제되지 않는다고 가이드가 설명합니다.',
    dealImpact: 'CSP·MSP 평가, 계약 조항, 관리·감독 체계가 제안서의 책임 구조에 들어가야 합니다.', caseIds: [] },
  { id: 't-exit', code: 'M', title: 'Cloud Exit / Concentration Risk', kinds: ['GUIDE'], cardId: 'cloud-resilience',
    when: '이용 계약 전에 출구전략·백업·DR 위치·특정 사업자 의존도를 정하고 운영 중 점검할 때(집중 리스크 항목은 권고 성격).',
    dealImpact: '종료 시 데이터 이전 방식과 단일 CSP 의존이 Hybrid·멀티 클라우드 검토 범위를 정합니다.', caseIds: [] },
];

export interface Clause { ref: string; kind: RuleKind; meaning: string; when: string; amCheck: string; biz: string; sourceIds: string[]; topic: string }
// 핵심 조항 표: 카드·보도자료가 인용한 범위만. 원문 조문을 직접 대조하지 않은 항목은 Source 열의 자료를 근거로 하며 추가 확인이 필요하다.
export const clauses: Clause[] = [
  { ref: '전자금융거래법 제11조', kind: 'LAW', meaning: 'CSP의 고의·과실은 금융회사의 고의·과실로 봄(가이드 설명)', when: '장애·사고 책임을 논의할 때', amCheck: '“CSP 인증이 있으니 책임이 없다”는 전제가 없는가', biz: 'Public·Hybrid 전반', sourceIds: ['cloud'], topic: 't-vendor' },
  { ref: '전자금융감독규정 제14조의2 (절차)', kind: 'REGULATION', meaning: '중요도 평가·CSP 평가·BCP/안전성 확보를 정보보호위원회가 심의·의결하고 정해진 사유 발생 시 3개월 이내 금융감독원장에게 보고', when: '클라우드를 이용하기 전·후', amCheck: '심의·보고 일정이 사업 일정에 들어 있는가', biz: 'Cloud 이용 전반', sourceIds: ['cloud'], topic: 't-cloud' },
  { ref: '전자금융감독규정 제14조의2 제1항 제1호', kind: 'REGULATION', meaning: '업무 중요도 평가 시 규모·복잡성, 중단 영향, 침해 영향, 동일 CSP 종속, 내부통제 역량을 봄', when: '이용 대상 업무를 정할 때', amCheck: '고객의 평가 결과와 기준표를 받았는가', biz: 'Migration, 신규 서비스', sourceIds: ['cloud'], topic: 't-cloud' },
  { ref: '전자금융감독규정 제14조의2 제4항 / 정보처리위탁규정 제7조', kind: 'REGULATION', meaning: '사후보고를 한 경우 위탁 보고로 간주(가이드 설명)', when: '이용 보고 시', amCheck: '위탁 관련 서류 준비 담당이 정해졌는가', biz: 'Cloud 이용 전반', sourceIds: ['cloud'], topic: 't-outsourcing' },
  { ref: '정보처리위탁규정 제2조제6항', kind: 'REGULATION', meaning: 'CSP와 계약한 클라우드 이용은 정보처리 위탁에 해당(가이드 설명)', when: '계약 구조를 정할 때', amCheck: '위탁계약·운영기준·재위탁 동의 체계', biz: 'Public·Hybrid, MSP', sourceIds: ['cloud'], topic: 't-outsourcing' },
  { ref: '클라우드컴퓨팅법 제2조제3호', kind: 'LAW', meaning: '상용으로 타인에게 정보통신자원을 제공하는 서비스가 클라우드컴퓨팅서비스', when: '제14조의2 적용 범위를 가를 때', amCheck: '자체 구축·비상용 클라우드는 별도 근거로 검토했는가', biz: 'Private Cloud, On-prem', sourceIds: ['cloud'], topic: 't-cloud' },
  { ref: '전자금융감독규정 제15조 제1항 제3호·제5호', kind: 'REGULATION', meaning: '내부업무망(3호)·전산실(5호) 표기의 근거. 보안 등급이 아님', when: '망 구성·접속 경로를 설계할 때', amCheck: '사용자·데이터·망 구분이 구조도에 표시되었는가', biz: '망 설계, AI·SaaS 도입', sourceIds: ['research'], topic: 't-network' },
  { ref: '감독규정 개정안 제15조 (연구개발 예외)', kind: 'REGULATION', meaning: '고유식별정보·개인신용정보를 처리하지 않는 연구·개발 목적에 한해 망분리 예외, 자체 위험성 평가·대체통제 적용(해설서 인용)', when: '연구개발망 구성 시', amCheck: '사용 데이터가 가명정보 조건을 충족하는가', biz: 'AI 개발 PoC, 개발 환경', sourceIds: ['research'], topic: 't-rnd' },
  { ref: '전자금융감독규정 시행세칙 별표 7', kind: 'REGULATION', meaning: '연구개발망 대체통제(접근통제, 소스코드 반출 방지, 단방향 전송 등)(해설서 인용)', when: '연구개발망 보안대책을 정할 때', amCheck: '대체통제 이행 담당과 증적이 있는가', biz: '개발·테스트 환경', sourceIds: ['research'], topic: 't-rnd' },
  { ref: '신용정보법 제40조의2', kind: 'LAW', meaning: '가명처리 행위규칙(해설서가 가명정보 활용 조건으로 인용)', when: '개인신용정보를 가명 처리해 활용할 때', amCheck: '가명 처리 기준과 재식별 방지 관리', biz: '데이터 분석, AI 학습', sourceIds: ['research'], topic: 't-data' },
  { ref: '전자금융감독규정 시행세칙 개정 (2026-04-20)', kind: 'REGULATION', meaning: '조건을 충족한 사무관리·업무지원 SaaS는 내부업무망 망분리 예외, 별도 혁신금융서비스 심사 불필요', when: '내부업무망에서 SaaS를 쓸 때', amCheck: '용도·처리 데이터·평가 여부·반기 이행 평가', biz: '협업·문서 SaaS', sourceIds: ['saas', 'saas-guide'], topic: 't-saas' },
  { ref: 'SaaS 예외의 4가지 보안규율', kind: 'REGULATION', meaning: '평가를 거친 SaaS만 이용, 단말 보호대책, 반기 1회 이행 평가, 정보보호위원회 보고', when: 'SaaS 예외 적용 시', amCheck: '네 가지 중 준비 안 된 항목은 무엇인가', biz: 'SaaS 도입 지원', sourceIds: ['saas'], topic: 't-saas' },
  { ref: '고유식별정보·개인신용정보 처리 시스템의 국내 설치 (가이드)', kind: 'GUIDE', meaning: '계약에서 해당 정보가 처리되는 모든 시스템이 국내에 설치되도록 CSP가 보장(예외 있음)', when: 'CSP 계약·리전 선택 시', amCheck: '처리·일시 처리·백업 위치', biz: 'Public Cloud, SaaS', sourceIds: ['cloud'], topic: 't-data' },
  { ref: '전자금융감독규정 백업·이중화 요구 (가이드: 클라우드에서도 준수)', kind: 'REGULATION', meaning: '클라우드 환경에서도 백업·이중화 요구를 준수, 가상 시스템 이미지·설정파일 백업 포함', when: 'DR·백업 설계 시', amCheck: '복구 테스트 증적과 DR 위치', biz: 'DR, Backup', sourceIds: ['cloud'], topic: 't-bcp' },
  { ref: '재위탁·변경 사전 서면 동의 (업무위수탁 운영기준)', kind: 'GUIDE', meaning: '원수탁자가 재위탁하거나 변경할 때 실시 전 금융회사의 서면 동의', when: 'MSP·SI 구조 설계 시', amCheck: '재위탁 범위와 통지 체계', biz: 'MSP, 다층 파트너 구조', sourceIds: ['cloud'], topic: 't-outsourcing' },
  { ref: '출구전략 · 사업자 변경 보고 (가이드)', kind: 'GUIDE', meaning: '종료 시 사전 수립한 출구전략에 따라 데이터 이전·파기, 사업자 변경 시 금융감독원에 보고', when: '계약 협상·종료 시', amCheck: '종료 시 데이터 이전 방식', biz: 'Public Cloud, SaaS', sourceIds: ['cloud'], topic: 't-exit' },
  { ref: '2026 전자금융기반시설 취약점 평가기준 안내서', kind: 'GUIDE', meaning: '기반시설 연 1회 이상, 공개용 홈페이지 연 2회 이상 점검(안내서 기준)', when: '보안 점검 계획 시', amCheck: '최근 평가 범위와 미조치 항목', biz: '보안 운영, Managed 보안', sourceIds: ['vulnerability'], topic: 't-infra' },
  { ref: '금융분야 인공지능 가이드라인 (2026-06-18 발표)', kind: 'GUIDE', meaning: '7대 원칙(거버넌스·합법성·보조수단성·신뢰성·금융안정성·신의성실·보안성), 금융권 자율 적용, 법적 시행일은 확인되지 않음', when: 'AI 도입·운영 설계 시', amCheck: '책임 체계와 평가·중단 수단', biz: 'GenAI, Agent, AI 플랫폼', sourceIds: ['ai-guideline'], topic: 't-ai-gov' },
  { ref: 'AI 가이드라인: 법령 중복 시 법령 우선', kind: 'GUIDE', meaning: '인공지능기본법령과 중복되면 법령과 관련 가이드라인을 우선 적용', when: 'AI 규범 충돌을 논의할 때', amCheck: '법무가 적용 규범을 정리했는가', biz: 'AI 전반', sourceIds: ['ai-guideline'], topic: 't-ai-gov' },
  { ref: '인공지능기본법 (법률 제20676호)', kind: 'LAW', meaning: '2025-01-21 공포, 2026-01-22 시행. 조문 본문은 이 앱에서 직접 대조하지 않음', when: 'AI 사업자 책무를 검토할 때', amCheck: '적용 대상 판단을 법무에 넘겼는가', biz: 'AI 전반', sourceIds: ['ai-basic-act'], topic: 't-ai-act' },
  { ref: '인공지능기본법 제2조 제4호 (고영향 AI)', kind: 'LAW', meaning: '고영향 AI 정의(가이드라인이 인용). 고위험 AI와 다른 개념', when: '업무 영향도 분류 시', amCheck: '고객 권리·의무에 영향을 주는 업무인가', biz: '심사·채용 등 AI', sourceIds: ['ai-guideline'], topic: 't-ai-act' },
  { ref: '상용 생성형 AI 내부망 이용: 혁신금융서비스 지정 + 부가 보안조건 (AI 가이드라인)', kind: 'GUIDE', meaning: '망분리 예외 적용을 위해 지정이 필요하고 AI 관리자·로그·즉시 중단·교육·고지·전용회선/VPN 등 부가조건', when: '상용 생성형 AI를 내부망에서 쓸 때', amCheck: '지정 시점·기간·부가조건·실제 단계', biz: 'GenAI 업무 서비스', sourceIds: ['ai-guideline'], topic: 't-sandbox' },
  { ref: '혁신금융서비스 지정 기간', kind: 'GUIDE', meaning: '2년 이내, 1회 2년 연장 가능, 규제개선 요청 시 6개월 단위 최대 3회 추가(최대 5.5년)(개선방안 문서)', when: '지정 서비스 상용화 계획을 볼 때', amCheck: '기간 만료 후 제도권 전환 계획', biz: '샌드박스 연계 사업', sourceIds: ['sandbox-reform'], topic: 't-sandbox' },
  { ref: '생성형 AI 모델 변경 절차 간소화 (2026-04-15)', kind: 'GUIDE', meaning: '단순 모델 변경을 보안 영향도별로 간소화, 서면확인서 제출', when: '지정 서비스의 모델을 바꿀 때', amCheck: '영향도 평가와 서면확인서 준비', biz: 'GenAI 운영', sourceIds: ['simplify'], topic: 't-sandbox' },
];

export interface Practice { id: string; name: string; what: string; when: string; topics: string[]; ask: string }
// 법적 의무와 구분되는 금융회사 실무 관행. 회사마다 명칭·절차·시기·강도가 다르며 "모든 금융회사가 동일하게 한다"는 뜻이 아니다.
export const practices: Practice[] = [
  { id: 'pr1', name: '보안성 검토', what: '신규 시스템·서비스의 보안 요건과 위험을 내부 보안 조직이 검토', when: '도입 결정 전후, 구축 전', topics: ['t-cloud', 't-network', 't-saas'], ask: '보안성 검토 기준과 소요 기간, 담당 조직은?' },
  { id: 'pr2', name: 'Architecture Review', what: '구조도의 데이터 흐름·망 구분·연계를 내부 아키텍처 조직이 검토', when: '설계 단계', topics: ['t-cloud', 't-network', 't-ai-gov'], ask: '리뷰 단계와 제출 산출물, 승인 주체는?' },
  { id: 'pr3', name: '개인정보·신용정보 검토', what: '처리 데이터 종류와 활용 범위를 법무·정보보호 조직이 검토', when: '데이터를 다루는 모든 사업', topics: ['t-data'], ask: '어떤 데이터가 포함되고 누가 최종 확인합니까?' },
  { id: 'pr4', name: 'Vendor Risk 평가', what: 'CSP·SI·SaaS 공급사의 보안·재무·운영 위험을 평가', when: '공급사 선정·갱신 시', topics: ['t-vendor', 't-cloud'], ask: '평가 항목과 최근 평가 결과는?' },
  { id: 'pr5', name: '권한 검토(Access review)', what: '사용자·관리자 권한을 주기적으로 점검', when: '정기, 인사 변경 시', topics: ['t-infra'], ask: '특권 계정 검토 주기와 승인 체계는?' },
  { id: 'pr6', name: '로그·감사 대응', what: '접속·변경·API 활동 기록을 보관하고 감사에 대응', when: '운영 전반', topics: ['t-infra', 't-ai-gov'], ask: '로그 보관 기간과 열람 권한은?' },
  { id: 'pr7', name: '취약점 점검', what: '정기 점검과 조치 이행 관리', when: '정기, 신규 자산 반영 시', topics: ['t-infra'], ask: '최근 점검 범위와 미조치 항목은?' },
  { id: 'pr8', name: 'Change Management', what: '변경 요청·승인·이력·롤백 절차 운영', when: '운영 변경 시', topics: ['t-ai-gov', 't-infra'], ask: '변경 승인 단계와 긴급 변경 절차는?' },
  { id: 'pr9', name: 'DR 훈련·복구 테스트', what: '복구 절차를 실제로 시험하고 결과를 기록', when: '정기', topics: ['t-bcp'], ask: '마지막 복구 테스트 시점과 결과는?' },
  { id: 'pr10', name: 'Incident Process', what: '장애·보안 사고의 탐지·보고·대응·재발방지', when: '사고 발생 시, 훈련', topics: ['t-bcp', 't-infra'], ask: '사고 등급 기준과 대응 책임자는?' },
  { id: 'pr11', name: '위수탁·재위탁 검토', what: '위탁 범위, 재위탁, 변경에 대한 내부 검토와 승인', when: '계약 체결·변경 시', topics: ['t-outsourcing', 't-vendor'], ask: '재위탁 구조와 동의 절차는?' },
  { id: 'pr12', name: '계약 검토', what: '법무·준법 조직의 계약 조건 검토(데이터 권리, 책임, 종료)', when: '계약 전', topics: ['t-vendor', 't-exit'], ask: '표준 계약 조건과 협상 가능 범위는?' },
  { id: 'pr13', name: 'Exit Plan 수립', what: '서비스 종료·사업자 변경 시 데이터 이전·파기 계획', when: '이용 전, 갱신 시', topics: ['t-exit'], ask: '종료 시 데이터 이전 방식과 소요 기간은?' },
  { id: 'pr14', name: 'AI Model Change 승인', what: '모델·프롬프트 변경의 평가·승인·롤백 절차', when: 'AI 서비스 변경 시', topics: ['t-ai-gov', 't-sandbox'], ask: '모델 변경 승인자와 평가 기준은?' },
  { id: 'pr15', name: 'AI Evaluation', what: '정확도·오답·편향·보안 등을 출시 전후 평가하고 기록', when: '출시 전, 운영 중 정기', topics: ['t-ai-gov'], ask: '평가 기준·주기·결과 보고 대상은?' },
  { id: 'pr17', name: 'Cost / FinOps 관리', what: '사용량·약정·자원 낭비를 점검하고 비용 책임을 정함', when: '운영 중 정기', topics: ['t-cloud', 't-bcp'], ask: '비용 책임 조직과 점검 주기, 예산 초과 시 절차는?' },
  { id: 'pr16', name: '정보보호위원회 안건 준비', what: '이용 결정에 필요한 평가 결과·증적을 위원회 안건으로 정리', when: '이용 결정·보고 전', topics: ['t-cloud', 't-saas', 't-rnd'], ask: '위원회 일정과 사전 제출 서류는?' },
];

export interface Misstatement { wrong: string; right: string; topic: string }
export const misstatements: Misstatement[] = [
  { wrong: '금융사는 Public Cloud를 못 씁니다.', right: '업무·데이터·중요도·통제에 따라 이용 가능 여부와 절차가 달라집니다.', topic: 't-cloud' },
  { wrong: '3호망, 5호망은 보안등급입니다.', right: '전자금융감독규정 제15조 제1항의 호 번호에서 유래한 망 구분 표기입니다.', topic: 't-network' },
  { wrong: 'On-prem AI면 망분리 규제를 신경 안 써도 됩니다.', right: '배포 위치와 별개로 데이터·망·내부통제 검토가 필요합니다.', topic: 't-network' },
  { wrong: 'SaaS 예외가 생겨 모든 SaaS를 자유롭게 씁니다.', right: '조건을 충족한 사무관리·업무지원 SaaS가 대상이고 평가·단말 보호·반기 평가·보고 등 보안규율을 확인해야 합니다.', topic: 't-saas' },
  { wrong: '연구개발망 예외면 운영 서비스도 올릴 수 있습니다.', right: '연구개발망은 연구·개발 목적에 한하며 실제 서비스 시스템과 내·외부 이용자 대상 서비스는 둘 수 없습니다.', topic: 't-rnd' },
  { wrong: '망분리 예외를 받으면 개인정보·신용정보 규정도 면제됩니다.', right: '망분리 예외와 개인정보·신용정보 규정은 별개입니다. SaaS 예외는 고유식별정보·개인신용정보 처리에 허용되지 않습니다.', topic: 't-data' },
  { wrong: 'AWS를 쓰면 금융 규제를 만족합니다.', right: '서비스 사용이 규제 준수를 자동 보장하지 않습니다. 이용 절차·위탁·통제는 고객이 별도로 충족해야 합니다.', topic: 't-cloud' },
  { wrong: 'CSP 보안인증이 있으면 금융회사 책임은 없습니다.', right: '클라우드 이용으로 금융회사의 책임이 면제되지 않으며 CSP의 고의·과실은 금융회사의 것으로 봅니다(가이드 설명).', topic: 't-vendor' },
  { wrong: '금융보안원 가이드는 법입니다.', right: '가이드는 법령이 아니며 법규와 충돌하면 법규가 우선합니다. 법규에 없는 가이드 내용은 준수 의무가 없다고 가이드가 밝힙니다.', topic: 't-cloud' },
  { wrong: '자체 구축이라 위탁이나 보안 규정 검토가 필요 없습니다.', right: '제14조의2 적용 여부와 별개로 망분리·정보보호 규정은 따로 확인합니다. 적용 규정은 법무·보안이 판단합니다.', topic: 't-outsourcing' },
  { wrong: '이중화돼 있으니 DR은 됐습니다.', right: '이중화·Multi-AZ·Snapshot은 DR 입증이 아닙니다. 승인된 RTO/RPO와 복구 테스트가 필요합니다.', topic: 't-bcp' },
  { wrong: '혁신금융서비스로 지정됐으니 이미 운영 중입니다.', right: '지정은 한시적 특례의 시작이며 구축 완료나 상용 운영의 증거가 아닙니다.', topic: 't-sandbox' },
  { wrong: '금융 AI 가이드라인은 법적 의무입니다.', right: '금융권이 자율 적용하는 위험관리 원칙입니다. 법령과 중복되면 법령이 우선하고 법적 시행일은 공식 Source에서 확인되지 않았습니다.', topic: 't-ai-gov' },
  { wrong: '고영향 AI와 고위험 AI는 같은 말입니다.', right: '고영향은 AI기본법상 개념, 고위험은 금융 가이드라인의 자체 위험평가 분류입니다. 고영향은 고위험에 해당하나 그 반대는 아닐 수 있습니다.', topic: 't-ai-act' },
  { wrong: 'AI 보안·거버넌스 솔루션을 쓰면 AI기본법을 준수합니다.', right: '솔루션은 구현을 도울 뿐 법적 준수를 보장하지 않습니다. 적용 여부는 법무·컴플라이언스가 판단합니다.', topic: 't-ai-act' },
  { wrong: '외부·오픈소스 모델을 쓰면 책임은 제공사에 있습니다.', right: '외부·오픈소스 모델을 써도 책임소재는 금융회사에 귀속된다고 AI 가이드라인이 설명합니다.', topic: 't-ai-gov' },
  { wrong: '전용선(Direct Connect)을 쓰면 암호화 요구가 해결됩니다.', right: '전용 연결은 기본 암호화가 아닙니다. 구간 암호화 방식은 별도로 확인합니다.', topic: 't-cloud' },
  { wrong: '중요 업무는 계정계니까 Cloud가 안 됩니다.', right: '중요도는 규모·중단 영향·침해 영향·동일 CSP 종속·내부통제 역량을 함께 보며 최종 판단은 고객 평가 결과입니다.', topic: 't-cloud' },
  { wrong: '개인정보가 있으니 무조건 불가입니다.', right: '개인정보·개인신용정보·고유식별정보·가명정보를 나눠 묻고, 종류별 허용 경로와 법무 판단을 확인합니다.', topic: 't-data' },
  { wrong: '연구개발망 예외로 고객 실 데이터를 마음껏 테스트에 쓸 수 있습니다.', right: '연구·개발 목적 외 실 데이터 테스트는 수행할 수 없고 가명 처리한 개인신용정보에 한해 연구·개발 목적으로 활용할 수 있습니다(해설서).', topic: 't-rnd' },
  { wrong: 'AI기본법의 조문과 의무를 영업이 단정해서 설명합니다.', right: '법률번호·공포·시행일 외 조문은 원문 확인이 필요하며 적용 여부는 법무·컴플라이언스가 판단합니다.', topic: 't-ai-act' },
  { wrong: '취약점 평가는 2026 안내서로 새로 생긴 의무입니다.', right: '기존에도 분석·평가 의무와 주기가 있었으며 2026 안내서는 평가기준을 안내한 것입니다.', topic: 't-infra' },
];

// 업무별 적용: 어떤 업무에서 어떤 규제 영역(Topic)을 먼저 보는지 (교육용 해석, 모든 회사에 동일하지 않음)
export interface WorkloadRow { id: string; workload: string; topics: string[]; first: string }
export const workloadRows: WorkloadRow[] = [
  { id: 'w1', workload: '신규 고객 채널·웹 서비스', topics: ['t-cloud', 't-data', 't-outsourcing', 't-bcp'], first: '업무 중요도와 처리 데이터(개인신용정보 포함 여부)를 먼저 확인' },
  { id: 'w2', workload: '계정계·핵심 거래 시스템 현대화', topics: ['t-cloud', 't-bcp', 't-exit', 't-infra'], first: '중요 업무 평가 결과, RTO/RPO, 종료·이전 방식' },
  { id: 'w3', workload: '내부 지식검색 AI (직원용)', topics: ['t-ai-gov', 't-data', 't-sandbox', 't-network'], first: '사용 모델의 경로(관리형 API/자체 운영), 문서 권한, 혁신금융서비스 필요 여부' },
  { id: 'w4', workload: '고객 대면 AI·상담 Agent', topics: ['t-ai-gov', 't-ai-act', 't-data', 't-sandbox'], first: '업무 영향도 분류와 사람의 최종 책임, 고객 고지' },
  { id: 'w5', workload: '개발·테스트·AI 개발 PoC', topics: ['t-rnd', 't-network', 't-data'], first: '연구개발망 범위인지 운영 서비스인지, 사용 데이터의 종류' },
  { id: 'w6', workload: '협업·문서 SaaS', topics: ['t-saas', 't-vendor', 't-data'], first: '용도(사무지원인지)·처리 데이터·SaaS 평가 여부' },
  { id: 'w7', workload: '데이터 분석·DW·AI 학습 데이터', topics: ['t-data', 't-rnd', 't-cloud'], first: '데이터 종류(가명정보 포함 여부)와 처리 위치' },
  { id: 'w8', workload: 'DR·백업 구축', topics: ['t-bcp', 't-exit', 't-cloud'], first: '승인된 RTO/RPO, 같은 CSP 안 DR 한계, 복구 테스트' },
  { id: 'w9', workload: '보안 운영·관제·취약점 점검', topics: ['t-infra', 't-vendor'], first: '평가 범위·미조치 취약점과 공급사 협조 책임' },
  { id: 'w10', workload: 'MSP·SI에 운영을 맡기는 사업', topics: ['t-outsourcing', 't-vendor', 't-exit'], first: '재위탁 범위, 특권 접근, 계약상 책임과 종료' },
];
