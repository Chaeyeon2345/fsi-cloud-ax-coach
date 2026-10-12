// 금융 IT·규제 Playbook의 확장 데이터: 업무 Scenario 표, 23개 핵심 영역, Cloud 이용 Lifecycle, 망분리 비교, Data 구분, AI Lifecycle.
// 사실은 Knowledge Card(cloud-lifecycle, network, research-network, saas-network-exception, financial-data-basics, ai-governance 등)와 같은 Source에서 가져왔고,
// 이 파일은 "찾기 쉬운 구조"만 더한다. Owner·Evidence 등 실무 항목은 PRACTICE/INTERPRETATION이며 모든 금융회사가 동일하지 않다. 법률 자문이 아니다.
import type { RuleKind } from './regulationPlaybook';

export interface Scenario { id: string; situation: string; rules: string; why: string; aeCheck: string; days: number[]; topics: string[]; caseIds: string[] }
export const scenarios: Scenario[] = [
  { id: 'sc1', situation: 'Public Cloud 신규 이용', rules: '전자금융감독규정 제14조의2(Cloud 이용 절차), 금융보안원 Cloud 이용 가이드(2025 개정)', why: '업무 중요도 평가·CSP 평가·BCP를 정보보호위원회가 심의·의결하고 보고해야 이용할 수 있음', aeCheck: '이용 업무와 중요도 평가 결과, 위원회·보고 일정', days: [1, 3, 4], topics: ['t-cloud'], caseIds: ['jb'] },
  { id: 'sc2', situation: 'Cloud Migration', rules: '제14조의2, 가이드 업무중요도 평가 부록', why: '이전 대상 업무마다 중요도에 따라 CSP 평가·BCP 깊이가 달라지고 동일 CSP 종속도 평가됨', aeCheck: '대상 업무 목록과 중요도, 이전 순서, 종료(Exit) 방안', days: [3, 4, 8], topics: ['t-cloud', 't-exit'], caseIds: [] },
  { id: 'sc3', situation: 'SaaS 이용 (일반)', rules: '정보처리 위탁 규정, Cloud 이용 절차(SaaS도 클라우드컴퓨팅서비스에 해당할 수 있음)', why: '상용 SaaS 이용은 위탁·이용 보고 대상이 될 수 있어 서비스 유형과 데이터 확인이 먼저', aeCheck: '서비스 유형(SaaS/API형 AI), 처리 데이터, 계약 구조', days: [3, 4, 11], topics: ['t-outsourcing', 't-vendor'], caseIds: [] },
  { id: 'sc4', situation: '내부업무망에서 SaaS 이용', rules: '시행세칙 개정(2026-04-20), 금융보안원 SaaS 예외 보안 해설서', why: '조건을 충족한 사무관리·업무지원 SaaS는 별도 혁신금융서비스 심사 없이 이용 가능하나 4가지 보안규율이 따름', aeCheck: '용도(사무지원인지), 처리 데이터(고유식별정보·개인신용정보 여부), 평가·단말 보호 준비', days: [5, 11], topics: ['t-saas'], caseIds: [] },
  { id: 'sc5', situation: '연구개발망 구성', rules: '전자금융감독규정 제15조 개정안(연구개발 예외, 해설서 인용), 시행세칙 별표 7(대체통제)', why: '연구·개발 목적에 한해 망분리 예외를 허용하되 자체 위험성 평가와 정보보호위원회 의결, 대체통제를 요구', aeCheck: '활용 범위, 사용 데이터(가명정보 조건), 반입·반출 승인, 운영 이관 경로', days: [2], topics: ['t-rnd', 't-network'], caseIds: [] },
  { id: 'sc6', situation: 'AI/SaaS를 활용한 연구개발', rules: '연구개발망 해설서(2025.4)', why: '연구개발망은 AI·SaaS를 활용한 연구·개발을 허용하지만 실제 서비스와 내·외부 이용자 대상 서비스는 둘 수 없음', aeCheck: '사용할 AI 도구, 입력 데이터, 코드 저장소, 운영 반영 경로', days: [2, 5], topics: ['t-rnd'], caseIds: [] },
  { id: 'sc7', situation: '직원용 생성형 AI', rules: '금융분야 AI 가이드라인(2026.6), 혁신금융서비스(상용 생성형 AI의 내부망 이용 시)', why: '상용 생성형 AI를 내부망에서 쓰려면 망분리 예외 적용을 위한 지정과 부가 보안조건이 필요하다고 가이드라인이 설명', aeCheck: '관리형 API/자체 운영, 문서 권한, 지정 필요 여부와 단계', days: [5, 10, 13], topics: ['t-ai-gov', 't-sandbox', 't-network'], caseIds: ['kb', 'shinhan'] },
  { id: 'sc8', situation: '대고객 생성형 AI', rules: '금융분야 AI 가이드라인, 인공지능기본법(고영향 AI 여부는 법무와)', why: '고객 권리·의무에 영향이 클수록 위험평가·사람의 개입·설명 요구가 커짐(가이드라인 방향)', aeCheck: '업무 영향도, 사람의 최종 책임, 고객 고지', days: [13], topics: ['t-ai-gov', 't-ai-act'], caseIds: [] },
  { id: 'sc9', situation: 'AI Agent', rules: '금융분야 AI 가이드라인(보조수단성·보안성), 내부 권한통제', why: '읽기뿐 아니라 쓰기·실행 권한이 있으면 사람의 승인·감사·중단 수단이 핵심', aeCheck: '쓰기 권한 범위, 승인 지점, 로그, 중단 수단', days: [10, 13], topics: ['t-ai-gov'], caseIds: ['jeju'] },
  { id: 'sc10', situation: 'Private / On-prem AI', rules: '망분리·데이터·거버넌스 검토는 배포 위치와 별개', why: '내부 배치가 규제 검토를 없애지 않음. 서빙·권한·평가·DR을 함께 설계', aeCheck: '데이터 종류, 접근 경로, 모델 변경 승인, 복구 대상(모델·벡터·문서)', days: [9, 10, 13], topics: ['t-network', 't-ai-gov', 't-bcp'], caseIds: ['jeju', 'ibk', 'ksfc'] },
  { id: 'sc11', situation: '정보처리 위탁', rules: '정보처리위탁규정 제2조제6항·제7조, 업무위수탁 운영기준', why: '클라우드 이용은 위탁에 해당한다고 가이드가 설명하며 재위탁은 사전 서면 동의가 필요', aeCheck: '위탁계약서, 재위탁 범위, 위탁 서류 담당', days: [4], topics: ['t-outsourcing'], caseIds: [] },
  { id: 'sc12', situation: 'MSP · CSP · SI 이용', rules: '전자금융거래법 제11조(가이드 설명), 재위탁 서면 동의', why: 'CSP·수탁자의 고의·과실이 금융회사의 것으로 보이므로 관리·감독 체계가 필요', aeCheck: '책임 분담(RACI), 재위탁 구조, 특권 접근 통제', days: [4, 15], topics: ['t-vendor', 't-outsourcing'], caseIds: ['jb'] },
  { id: 'sc13', situation: '개인정보', rules: '개인정보 관련 법령(법무 확인), 가이드의 국내 설치 요건', why: '데이터 종류에 따라 허용 경로와 적용 규정이 달라짐', aeCheck: '처리·저장·로그 어디에 남는지', days: [4], topics: ['t-data'], caseIds: [] },
  { id: 'sc14', situation: '개인신용정보', rules: '신용정보법, 연구개발망 해설서(활용 불가, 가명 처리 시 예외), Cloud 가이드(국내 설치)', why: '연구개발망·SaaS 예외에서 개인신용정보 처리는 허용되지 않으며 Cloud 계약에서 처리 시스템 국내 설치를 요구', aeCheck: '개인신용정보 포함 여부, 가명 처리 가능성', days: [4], topics: ['t-data'], caseIds: [] },
  { id: 'sc15', situation: '가명정보', rules: '신용정보법 제40조의2(가명처리 행위규칙, 해설서 인용), 금융분야 가명·익명처리 안내서', why: '연구개발 목적에 한해 가명 처리한 개인신용정보 활용이 가능하고 재식별 방지·점검이 따름', aeCheck: '가명 처리 기준, 재식별 가능 정보 관리, 국외이전 제한', days: [4], topics: ['t-data', 't-rnd'], caseIds: [] },
  { id: 'sc16', situation: 'BCP / DR', rules: '전자금융감독규정 백업·이중화 요구(가이드: Cloud에서도 준수)', why: '백업·이중화·DR·종료 계획은 금융회사 책임이며 같은 CSP 안 DR은 동시 장애·거리·국외 이전 확인', aeCheck: '승인된 RTO/RPO, 복구 테스트, 장애 범위', days: [12], topics: ['t-bcp', 't-exit'], caseIds: [] },
  { id: 'sc17', situation: '전자금융기반시설 보안', rules: '2026 전자금융기반시설 보안 취약점 평가기준 안내서', why: '기반시설 연 1회 이상, 공개용 홈페이지 연 2회 이상 점검하고 조치·사후 관리까지 이어져야 함', aeCheck: '최근 평가 범위, 미조치 취약점, 개선 일정', days: [12], topics: ['t-infra'], caseIds: [] },
  { id: 'sc18', situation: 'Vendor Risk', rules: 'Cloud 이용 가이드(CSP 평가, 종속 위험), 금융회사 내부 Vendor Risk 절차(PRACTICE)', why: '동일 CSP 종속·재위탁·보안 수준이 업무 중요도 평가와 CSP 평가에 반영', aeCheck: 'CSP·MSP 평가 결과, 최근 사고, 계약 조항', days: [4], topics: ['t-vendor', 't-exit'], caseIds: [] },
  { id: 'sc19', situation: 'Cloud Exit', rules: 'Cloud 이용 가이드(출구전략, 사업자 변경 시 금융감독원 보고)', why: '종료 시 데이터 이전·파기를 사전 수립한 출구전략대로 수행하고 특정 사업자 집중 리스크를 점검', aeCheck: '종료 시 데이터 반환 방식, 대체 사업자 후보', days: [3, 4], topics: ['t-exit'], caseIds: [] },
  { id: 'sc20', situation: '혁신금융서비스', rules: '혁신금융서비스 제도(지정 기간 2년+연장), 샌드박스 개선방안(2026.6)', why: '한시적 규제 특례이며 지정은 구축·운영의 증거가 아니고 종료 후 전환 계획이 필요', aeCheck: '지정 시점·기간·부가조건, 실제 단계, 만료 후 계획', days: [5], topics: ['t-sandbox'], caseIds: ['bc', 'samsungcard', 'samsungfire', 'koreanre'] },
];

export interface Area { n: number; name: string; kind: RuleKind; oneLine: string; topic: string }
export const areas: Area[] = [
  { n: 1, name: '전자금융감독규정 전체 구조', kind: 'REGULATION', oneLine: '법→감독규정→시행세칙→가이드·FAQ→내부 정책의 순으로 이해하고, 가이드와 법규가 충돌하면 법규가 우선', topic: 't-cloud' },
  { n: 2, name: 'Cloud 이용절차', kind: 'REGULATION', oneLine: '제14조의2: 중요도 평가·CSP 평가·BCP를 정보보호위원회가 심의·의결, 정해진 사유 시 3개월 내 보고', topic: 't-cloud' },
  { n: 3, name: '업무 중요도 평가', kind: 'REGULATION', oneLine: '규모·복잡성, 중단 영향, 침해 영향, 동일 CSP 종속, 내부통제 역량을 함께 보며 최종 판단은 금융회사', topic: 't-cloud' },
  { n: 4, name: 'CSP 안전성 평가', kind: 'GUIDE', oneLine: '가이드 부록의 세부기준으로 평가하며 중요 업무는 필수·대체 항목을 모두 평가', topic: 't-vendor' },
  { n: 5, name: '업무연속성 / BCP', kind: 'GUIDE', oneLine: '백업·이중화·DR을 이용 전에 정하고 Cloud에서도 감독규정의 백업·이중화 요구를 준수', topic: 't-bcp' },
  { n: 6, name: '안전성 확보조치', kind: 'GUIDE', oneLine: '중요도에 따라 BCP·안전성 조치의 깊이가 달라지고(비중요는 필수만) 위원회가 함께 심의', topic: 't-cloud' },
  { n: 7, name: '정보보호위원회', kind: 'REGULATION', oneLine: '평가 결과와 보호대책을 심의·의결하는 기구. 연구개발망·SaaS 예외에서도 보고·의결 단계가 있음', topic: 't-cloud' },
  { n: 8, name: 'Cloud 계약', kind: 'GUIDE', oneLine: '정보는 금융회사 소유, 재위탁 범위·중요 변경 사전 통지, 고유식별·개인신용정보 처리 시스템 국내 설치(예외 있음)', topic: 't-exit' },
  { n: 9, name: '이용 / 보고 / 운영 리스크', kind: 'REGULATION', oneLine: '이용 보고와 서류 최신 유지, 사후보고는 위탁 보고로 간주(가이드 설명)', topic: 't-outsourcing' },
  { n: 10, name: 'Exit / 공급자 집중리스크', kind: 'GUIDE', oneLine: '출구전략에 따라 데이터 이전·파기, 사업자 변경 시 금감원 보고, 특정 사업자 집중은 권고 성격의 점검 항목', topic: 't-exit' },
  { n: 11, name: '망분리', kind: 'REGULATION', oneLine: '외부 침해와 내부 확산을 줄이는 통제. 배포 위치와 별개로 검토', topic: 't-network' },
  { n: 12, name: '3호망 / 5호망', kind: 'REGULATION', oneLine: '보안 등급이 아니라 감독규정 제15조 제1항의 호 번호(내부업무망 3호, 전산실 5호)', topic: 't-network' },
  { n: 13, name: '연구개발망', kind: 'GUIDE', oneLine: '연구·개발 목적에 한해 독립 구성, 가명정보 조건, 실제 서비스·내외부 이용자 대상 서비스는 불가', topic: 't-rnd' },
  { n: 14, name: 'SaaS 망분리 예외', kind: 'REGULATION', oneLine: '2026-04-20부터 사무관리·업무지원 SaaS 예외, 4가지 보안규율, 고유식별·개인신용정보 처리는 불허', topic: 't-saas' },
  { n: 15, name: '정보처리 위탁', kind: 'REGULATION', oneLine: 'CSP 이용은 정보처리 위탁에 해당(가이드 설명), 재위탁은 사전 서면 동의', topic: 't-outsourcing' },
  { n: 16, name: '개인정보', kind: 'LAW', oneLine: '개인정보·개인신용정보 등을 나눠 묻고 종류별 허용 경로를 확인(최종 판단은 법무)', topic: 't-data' },
  { n: 17, name: '개인신용정보', kind: 'LAW', oneLine: '연구개발망·SaaS 예외에서 활용 불가(가명 처리 예외는 연구개발망), Cloud 계약에서 국내 설치 요구', topic: 't-data' },
  { n: 18, name: '가명정보', kind: 'LAW', oneLine: '신용정보법 가명처리 행위규칙을 지킨 경우 연구·개발 목적 활용 가능(해설서)', topic: 't-data' },
  { n: 19, name: '전자금융기반시설 취약점 평가', kind: 'GUIDE', oneLine: '기반시설 연 1회 이상, 공개용 홈페이지 연 2회 이상 점검하고 조치까지 관리', topic: 't-infra' },
  { n: 20, name: '금융 AI Governance', kind: 'GUIDE', oneLine: '7대 원칙을 수명주기 전체 통제로 연결, 금융권 자율 적용, 법령과 중복 시 법령 우선', topic: 't-ai-gov' },
  { n: 21, name: 'AI기본법', kind: 'LAW', oneLine: '법률 제20676호, 2025-01-21 공포·2026-01-22 시행. 조문 본문은 이 앱에서 대조하지 못함', topic: 't-ai-act' },
  { n: 22, name: '고영향 AI / 고위험 AI', kind: 'GUIDE', oneLine: '고영향은 AI기본법상 개념, 고위험은 금융 가이드라인의 자체 위험평가 분류. 서로 같지 않음', topic: 't-ai-act' },
  { n: 23, name: '혁신금융서비스', kind: 'GUIDE', oneLine: '한시적 규제 특례. 지정은 구축·운영의 증거가 아니며 기간·부가조건·전환 계획을 확인', topic: 't-sandbox' },
];

export interface LifecycleStep { n: number; step: string; what: string; why: string; owner: string; aeCheck: string; dealRisk: string; evidence: string; rule: string }
export const cloudLifecycle: LifecycleStep[] = [
  { n: 1, step: '업무 선정', what: '클라우드로 이용할 업무와 처리 정보를 정함', why: '이후 평가의 범위와 깊이가 이 선택에서 시작됨', owner: '사업부·IT(예시)', aeCheck: '대상 업무, 처리 데이터 종류, 이용 목적', dealRisk: '범위가 자주 바뀌어 평가가 반복됨', evidence: '업무·데이터 목록', rule: '제14조의2(이용 업무)' },
  { n: 2, step: '중요도 평가', what: '규모·복잡성, 중단 영향, 침해 영향, 동일 CSP 종속, 내부통제 역량으로 평가', why: '중요 업무일수록 CSP 평가·BCP 요구가 깊어짐', owner: '금융회사 자체 평가(예시: IT·준법)', aeCheck: '평가 기준표와 결과, 최종 판정자', dealRisk: '중요 업무로 분류되어 요구 증적과 일정이 늘어남', evidence: '평가 기준과 결과(이용 보고에 첨부)', rule: '제14조의2 제1항 제1호' },
  { n: 3, step: 'CSP 평가', what: 'CSP의 안전성을 가이드 부록의 기준으로 평가', why: '중요 업무는 필수·대체 항목을 모두 평가', owner: '정보보호·IT(예시)', aeCheck: 'CSP 평가 완료 여부, 인증 활용 범위', dealRisk: 'CSP 증적 수집 지연', evidence: 'CSP 평가 결과와 제출 자료', rule: '가이드 부록(CSP 안전성 평가)' },
  { n: 4, step: 'BCP', what: '백업·이중화·DR과 업무지속성 확보대책을 정함', why: 'CSP 장애·종료에도 업무를 지속해야 하므로 이용 전에 정함', owner: 'IT·업무 연속성 조직(예시)', aeCheck: 'RTO/RPO, DR 위치, 복구 테스트 계획', dealRisk: 'DR 구조가 비용·일정을 키움', evidence: 'BCP·복구 계획서', rule: '감독규정 백업·이중화 요구(가이드)' },
  { n: 5, step: '안전성 확보', what: '중요도에 따른 안전성 확보조치와 보호대책을 마련', why: '비중요는 필수만, 중요는 더 깊게 요구', owner: '정보보호(예시)', aeCheck: '암호화·접근통제·로그 대책', dealRisk: '요구 통제가 구조도에 빠져 있음', evidence: '보호대책 문서, 구조도', rule: '제14조의2 · 가이드' },
  { n: 6, step: '정보보호위원회', what: '중요도 평가·CSP 평가·BCP·안전성 조치를 심의·의결', why: '이용 결정의 승인 단계', owner: '정보보호위원회(예시: CISO 주관)', aeCheck: '위원회 일정, 사전 제출 서류', dealRisk: '일정 지연이 계약 시점을 밀어냄', evidence: '의결 기록', rule: '제14조의2' },
  { n: 7, step: '계약', what: '데이터 소유·권리, 재위탁, 중요 변경 통지, 국내 설치, 종료 조건을 계약에 반영', why: '책임과 종료 시 선택지를 계약으로 확보', owner: '법무·구매(예시)', aeCheck: '표준 계약 조건, 재위탁 범위, 종료 조항', dealRisk: '계약 협상 장기화', evidence: '위탁계약서(안), 업무위수탁 운영기준', rule: '가이드(계약) · 정보처리위탁규정' },
  { n: 8, step: '이용 / 보고', what: '이용 보고와 서류 구비·최신 유지', why: '정해진 사유 발생 시 그 날로부터 3개월 이내 금융감독원장에게 보고', owner: '준법·IT(예시)', aeCheck: '보고 시점과 담당, 서류 최신성', dealRisk: '보고 누락·서류 불일치', evidence: '이용 보고서와 첨부', rule: '제14조의2 · 정보처리위탁규정 제7조(가이드 설명)' },
  { n: 9, step: '지속적 리스크 관리', what: '운영 중 평가·점검·변경 관리', why: '사업자 변경·장애·집중 리스크를 관리', owner: '운영·정보보호(예시)', aeCheck: '정기 점검 주기, 변경 승인', dealRisk: '운영 이관 이후 책임 공백', evidence: '점검 결과, 변경 이력', rule: '가이드(운영)' },
  { n: 10, step: '종료 / Exit', what: '사전 수립한 출구전략으로 데이터 이전·파기', why: '종료 시 선택지를 이용 전에 확보', owner: 'IT·법무(예시)', aeCheck: '종료 시 데이터 이전 방식과 소요, 사업자 변경 보고', dealRisk: '이전 불가·락인이 협상 약점이 됨', evidence: '출구전략 문서', rule: '가이드(종료)' },
];

export interface NetworkZone { zone: string; use: string; terminal: string; system: string; move: string; reflect: string; condition: string; misread: string }
export const networkZones: NetworkZone[] = [
  { zone: '내부업무망(3호망)', use: '문서 작성·인트라넷·민원 등 사무 업무', terminal: '직원 업무 단말', system: '내부통신망과 연결된 내부 업무용 시스템', move: '인터넷망과는 분리되어 자료 이동을 통제', reflect: '해당 없음(사무 환경)', condition: '규정 제15조 제1항 제3호 표기. 보안 등급이 아님', misread: '“3호망은 높은 보안등급”' },
  { zone: '전산실(5호망)', use: '운영·보안 관련 업무', terminal: '전산실 정보처리시스템에 직접 접속하는 단말', system: '전산실 내 정보처리시스템', move: '연구개발망에서는 필수 개발산출물만 단방향·한시적으로 허용', reflect: '운영 반영은 사전 점검·무결성 검증을 거친 경로', condition: '제15조 제1항 제5호 표기', misread: '“5호망은 가장 낮은 등급”' },
  { zone: '연구개발망', use: '개발(코딩·테스트)과 AI·SaaS를 활용한 연구·개발', terminal: '개발 전용 단말', system: '내부업무망·전산실·외부망에서 독립 구성', move: '내부업무망과는 논리적 분리 허용, 전산실 전송은 필수 개발산출물 한정', reflect: '인가된 서버(형상관리)를 통한 단방향 전송, 사전 시큐어코딩 점검', condition: '자체 위험성 평가·정보보호위원회 의결, 가명정보 조건, 실제 서비스·내외부 이용자 대상 서비스 불가', misread: '“연구개발망이면 운영 서비스도 가능”' },
  { zone: '인터넷망', use: '인터넷 검색·e-mail 확인', terminal: '인터넷용 단말', system: '외부 인터넷', move: '내부망과 분리', reflect: '해당 없음', condition: '업무 시스템과 분리 유지', misread: '“인터넷망에서 업무 AI를 써도 된다”' },
  { zone: 'SaaS 예외', use: '사무관리·업무지원 SaaS(문서·협업·화상회의·성과관리 등)', terminal: '보호대책을 적용한 접속 단말', system: '평가를 거친 클라우드 SaaS', move: '고유식별정보·개인신용정보 처리는 불허', reflect: '해당 없음', condition: '평가 SaaS 이용·단말 보호·반기 1회 이행 평가·정보보호위원회 보고', misread: '“모든 SaaS·AI 자유 사용”' },
  { zone: 'AI 관련 Sandbox/예외', use: '상용 생성형 AI의 내부망 이용 등 규제 특례가 필요한 서비스', terminal: '지정 서비스 조건에 따른 단말', system: '지정된 혁신금융서비스', move: '입출력 로그·외부 연계 구간 전용회선/VPN 등 부가조건(가이드라인 예시)', reflect: '지정·변경 절차를 따름(모델 변경은 영향도별 간소화)', condition: '혁신금융서비스 지정과 부가 보안조건, 기간 내 운영', misread: '“지정 = 구축·운영 완료”' },
  { zone: '보안목적 AI 규제완화', use: '보안 취약점 탐지·개선 테스트(긴급 완화 조치)', terminal: '선정 회사가 정한 통제 단말', system: '선정된 회사의 테스트 환경', move: '대체통제를 마련한 조건에서 테스트', reflect: '테스트 결과에 따른 개선', condition: '선정된 회사에 한해 적용, 모든 회사·용도의 일괄 해제가 아님', misread: '“AI 규제가 전부 풀렸다”' },
];

export interface DataKind { kind: string; easy: string; why: string; ask: string; handoff: string }
export const dataKinds: DataKind[] = [
  { kind: '개인정보', easy: '개인을 알아볼 수 있는 정보를 가리키는 가장 넓은 개념(학습용 구분)', why: '“개인정보인가”만 물으면 데이터 종류별로 달라지는 조건을 놓침', ask: '사용자 입력·검색 문서·로그에 개인정보가 들어갑니까?', handoff: '법무·개인정보 보호 조직' },
  { kind: '개인신용정보', easy: '금융거래 등에서 개인의 신용을 판단할 수 있는 정보로 신용정보법의 규율을 받는 영역', why: '연구개발망·SaaS 예외에서 활용 불가, Cloud 계약에서 처리 시스템 국내 설치 요구', ask: '개인신용정보가 포함됩니까? 가명 처리가 가능합니까?', handoff: '법무·정보보호' },
  { kind: '고유식별정보', easy: '주민등록번호처럼 개인을 고유하게 식별하는 번호 계열', why: '연구개발·SaaS 예외 대상에서 제외, 국내 설치 요건과 연결', ask: '고유식별정보가 일시적으로라도 처리됩니까?', handoff: '정보보호' },
  { kind: '가명정보', easy: '추가 정보 없이는 특정 개인을 알아볼 수 없도록 가명 처리한 정보', why: '신용정보법 행위규칙 준수 시 연구·개발 목적 활용 가능, 재식별 방지·점검 필요', ask: '가명 처리 기준과 재식별 가능 정보 관리는 누가 합니까?', handoff: '법무·데이터 거버넌스' },
  { kind: '익명정보', easy: '가명정보와 구분되는 개념(가명정보와 같은 것으로 다루지 않음)', why: '가명정보와 혼동하면 적용 규정을 잘못 설명하게 됨', ask: '익명 처리의 기준과 검증 방법은 무엇입니까?', handoff: '법무' },
];

export interface AiStep { n: number; step: string; control: string; owner: string; evidence: string; ask: string }
export const aiLifecycle: AiStep[] = [
  { n: 1, step: 'Plan', control: '업무 목적·범위·책임 정의', owner: '사업부·AI 의사결정기구(예시)', evidence: '기획서, 책임자 지정', ask: 'AI가 추천만 합니까, 최종결정도 합니까?' },
  { n: 2, step: 'Risk Classification', control: '업무 영향도에 따른 위험 분류(고영향·고위험 검토는 법무와)', owner: '위험관리·준법', evidence: '위험 분류 결과', ask: '고객 권리·의무에 영향을 줍니까?' },
  { n: 3, step: 'Data', control: '데이터 분류·접근통제·품질', owner: '데이터·정보보호', evidence: '데이터 목록, 권한 설계', ask: '어떤 데이터가 입력·검색·저장·로그에 남습니까?' },
  { n: 4, step: 'Model', control: '모델·제3자 모델 위험 검토(책임소재는 금융회사)', owner: 'AI·구매', evidence: '모델 선정 근거, 공급사 평가', ask: '외부·오픈소스 모델의 책임소재와 변경은 누가 관리합니까?' },
  { n: 5, step: 'Build', control: 'Prompt/모델 버전 관리, Guardrail, PII 마스킹', owner: '개발', evidence: '버전 이력, 설계서', ask: '프롬프트·모델 변경의 승인 체계가 있습니까?' },
  { n: 6, step: 'Evaluation', control: '출시 전 검증, 정확성·근거(groundedness)·안전성 평가', owner: 'AI·독립 검증', evidence: '평가 결과', ask: '평가 기준과 합격선은 누가 정합니까?' },
  { n: 7, step: 'Approval', control: '위험 수준별 승인, 사람의 개입 기준 확립', owner: 'AI 의사결정기구', evidence: '승인 기록', ask: '사람이 Review/override할 수 있습니까?' },
  { n: 8, step: 'Deploy', control: 'RBAC, API key·secret 관리, 접근 통제', owner: 'IT 운영', evidence: '배포·권한 기록', ask: '운영 권한과 키는 누가 관리합니까?' },
  { n: 9, step: 'Monitor', control: '운영 모니터링, 오답·비용·Token 관리, 재평가', owner: '운영·AI', evidence: '모니터링 보고', ask: '오답·부적절 응답을 어떻게 탐지합니까?' },
  { n: 10, step: 'Incident / Rollback', control: '중단(Kill switch)·롤백·사고 대응', owner: '운영·정보보호', evidence: '사고 대응 절차, 훈련 기록', ask: '장애·오답·보안사고 시 중단/rollback 절차가 있습니까?' },
  { n: 11, step: 'Retire', control: '모델·데이터 폐기와 이력 보존', owner: 'AI·정보보호', evidence: '폐기 기록', ask: '서비스 종료 시 데이터·모델은 어떻게 처리합니까?' },
];

// AE가 알아야 할 수준 (영역별): 용어와 구조를 설명할 수 있는 수준과 법무·보안에 넘길 지점
export const aeLevel: Record<string, string> = {
  't-cloud': '절차의 순서(중요도 평가→CSP 평가→BCP→위원회→보고)와 일정 영향을 설명하고, 평가 결과는 고객 것을 받는다. 조문 해석은 하지 않는다.',
  't-network': '3호망·5호망이 호 번호 표기임을 설명하고 사용자·데이터·망을 질문한다. 적용 판단은 보안·법무.',
  't-rnd': '연구개발 예외의 범위와 한계(실제 서비스 불가)를 설명한다. 위험성 평가와 대체통제 설계는 SA·보안.',
  't-saas': 'SaaS 예외의 대상과 4가지 규율을 말할 수 있다. 특정 SaaS 적용 가능 여부는 고객 보안 평가.',
  't-outsourcing': 'Cloud 이용이 위탁에 해당한다는 가이드 설명과 재위탁 동의를 안다. 위탁 해당성 판단은 법무.',
  't-data': '데이터 종류를 나눠 묻는다. 법적 정의와 국외이전 판단은 하지 않는다.',
  't-bcp': 'HA·DR·BCP·RTO·RPO를 구분해 설명한다. DR 구조 설계는 SA.',
  't-infra': '평가 주기(연 1회·홈페이지 연 2회)와 5단계를 설명한다. 점검 수행은 보안 조직.',
  't-ai-gov': '7대 원칙과 수명주기 통제를 설명한다. 위험 분류와 승인은 고객의 AI 의사결정기구.',
  't-ai-act': '법률번호·공포·시행일과 고영향/고위험 구분만 말한다. 조문 해석은 법무.',
  't-sandbox': '지정≠구축·운영, 지정 기간과 부가조건을 안다. 지정 신청 전략은 다루지 않는다.',
  't-vendor': '책임이 면제되지 않는다는 원칙과 관리·감독 체계를 설명한다. 계약 조항 협상은 법무.',
  't-exit': '출구전략과 집중 리스크를 질문한다. 이전 설계는 SA.',
};
