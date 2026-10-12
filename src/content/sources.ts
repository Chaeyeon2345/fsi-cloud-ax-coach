import type { Source } from '../domain/types';
import { source, V0927, V1011 } from './sourceKit';
import { accountSources, assignSourceTypes } from './accountData';
import { techSources } from './techSources';

// 전역 확인일은 없다. 자료마다 "실제로 확인한 날(verified)"을 직접 적는다.
// - 2026-09-27: MVP 1.0 콘텐츠 확인 기록(CONTENT_REVIEW.md)에서 실제로 확인한 자료
// - 2026-10-11: V2 작업 중 새로 읽거나 다시 확인한 자료
// 확인하지 않은 자료의 날짜·상태를 임의로 갱신하지 않는다.

export const sources: Source[] = [
 source('financial-architecture','금융 아키텍처에서 프레임워크의 역할','LG CNS','B','TECH_PRODUCT','https://solution.lgcns.com/kr/solution/devon/tech/financial-architecture-framework-role/',{verified:V0927}),
 source('financial-domains','2024년 2분기 실적발표 — 금융 업무시스템 설명','삼성SDS','B','TECH_PRODUCT','https://image.samsungsds.com/kr/investor/ir_events/ear_rele/__icsFiles/afieldfile/2024/07/26/SDS_2Q24%20%EC%8B%A4%EC%A0%81%EB%B0%9C%ED%91%9C%20%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8_1.pdf',{published:'2024-07',verified:V0927}),
 source('financial-channel','금융권 AX 구축 발표 — 대내·대외 채널 정의','삼성SDS','B','TECH_PRODUCT','https://www.samsungsds.com/kr/news/wr-260407.html',{published:'2026-04-07',verified:V0927}),
 source('cloud','금융분야 클라우드컴퓨팅서비스 이용 가이드 (2025 개정)','금융보안원','A','FSEC_GUIDE','https://www.fsec.or.kr/bbs/detail?bbsNo=11691&menuNo=222',{published:'2025-05-22',verified:V0927,locator:'로컬 제공 PDF 제2장 및 제3~9장',notes:'2025 개정 가이드 기준. 2026 개별 예외는 별도 출처를 함께 확인합니다.'}),
 source('research','연구·개발 목적의 망분리 예외 적용에 따른 보안 해설서 (2025.4)','금융보안원','A','FSEC_GUIDE','https://www.fsec.or.kr/bbs/222',{published:'2025-04',verified:V0927,locator:'references/ (붙임) 연구·개발 목적의 망분리 예외 적용에 따른 보안 해설서(변경) (1).pdf · 본문 1~17쪽',notes:'로컬 PDF 확인. 링크는 발행기관 자료실이며 상세 게시물 URL은 확인 필요.'}),
 source('vulnerability','2026년 전자금융기반시설 보안 취약점 평가기준 안내서','금융보안원','A','FSEC_GUIDE','https://www.fsec.or.kr/bbs/detail?bbsNo=11885&menuNo=222',{verified:V0927,locator:'로컬 제공 PDF 본문 1~5쪽',notes:'평가 방법·절차는 안내서의 참고 예시와 법정 기준을 구분합니다.'}),
 source('roadmap','금융분야 망분리 개선 로드맵 설명회','금융위원회','A','REGULATORY_POLICY','https://fsc.go.kr/no010101/82937',{published:'2024-08-22',verified:V0927,status:'HISTORICAL',notes:'2024-08-13 발표 로드맵의 1단계 과제를 설명한 자료. 타임라인에서 HISTORICAL로 분류한 근거 자료입니다.'}),
 // 2024-08-13 금융위 보도자료 원문. 'roadmap'(2024-08-22)은 같은 로드맵의 1단계 과제 설명 자료로 별도 Source다.
 source('roadmap-release','「금융분야 망분리 개선 로드맵」 발표 (보도자료)','금융위원회','A','REGULATORY_POLICY','https://www.fsc.go.kr/po010101/82885',{published:'2024-08-13',verified:V1011,status:'HISTORICAL',notes:'발표 당시의 계획을 담은 자료입니다. 중장기 "디지털 금융보안법(가칭)" 등은 발표 시점의 추진 계획이며 제정·시행 여부는 이 Source로 확인하지 않았습니다.'}),
 // 금융위 공식 보도자료 (2026-10-11 직접 확인). 제2차 신청 대상 75곳(금융회사 59·전자금융업자 16), 선정 15곳 이내, 1차 테스트 중간점검 내용 포함.
 source('security-ai-2','제2차 망분리 규제 긴급 완화 조치 추진 (금융위 보도자료)','금융위원회','A','REGULATORY_POLICY','https://www.fsc.go.kr/no010101/87646',{published:'2026-09-03',verified:V1011,status:'ANNOUNCED',notes:'발표·추진 단계입니다. 개별 선정회사·적용기간·비조치 세부 조건은 추가 확인 필요. 1차 테스트는 중간점검 내용만 언급되며 최종 결과가 아닙니다.'}),
 source('saas','내부 업무망 SaaS 망분리 예외 시행','금융위원회','A','REGULATORY_POLICY','https://www.fsc.go.kr/po010106/86745',{published:'2026-04-20',effective:'2026-04-20',verified:V0927}),
 source('saas-guide','내부업무망 SaaS 망분리 예외 적용 보안 해설서','금융보안원','A','FSEC_GUIDE','https://www.fsec.or.kr/bbs/detail?bbsNo=11929&menuNo=222',{published:'2026-04-20',verified:V0927}),
 source('simplify','생성형 AI 혁신금융서비스 지정 절차 간소화','금융위원회','A','REGULATORY_POLICY','https://www.fsc.go.kr/po010101/86712',{published:'2026-04-15',verified:V0927}),
 source('security-ai','고성능 AI 관련 금융권 보안위협 대응 간담회','금융위원회','A','REGULATORY_POLICY','https://www.fsc.go.kr/po010102/86972',{published:'2026-05-26',verified:V0927,status:'ANNOUNCED',notes:'정책 발표 기준. 개별 참여기관과 비조치 적용 조건은 추가 확인 필요.'}),
 // 금융위 공식 발표일은 2026-06-18. 법적 시행일은 공식 Source에서 확인되지 않아 effectiveAt은 null로 둔다.
 source('ai-guideline','금융분야 인공지능 가이드라인 (2026.6)','금융위원회','A','REGULATORY_POLICY','https://www.fsc.go.kr/po010101/87142',{published:'2026-06-18',effective:null,verified:V1011,status:'ANNOUNCED',locator:'로컬 제공 PDF Ⅰ 개요, Ⅱ 7대 원칙 중 1·3·7장',notes:'발표일은 금융위 게시 페이지 기준. 법적 시행일은 공식 Source에서 확인되지 않았습니다. 금융권이 자율적으로 적용하는 가이드라인입니다.'}),
 source('sandbox-reform','금융규제 샌드박스 제도의 혁신친화적 개선방안 (2026.6)','금융위원회','A','REGULATORY_POLICY','https://www.fsc.go.kr/po010101/87156',{published:'2026-06-19',verified:V1011,status:'ANNOUNCED',locator:'로컬 제공 PDF Ⅰ~Ⅴ',notes:'발표된 개선방안입니다. 과제별 시행 시기와 법령 개정은 추진계획 기준이며 시행 여부는 확인이 필요합니다.'}),
 source('sandbox-july','혁신금융서비스 지정사례 목록 — 2026.7.1','한국핀테크지원센터','A','REGULATORY_POLICY','https://sandboxkorea.com/business/enterprise_intro.do?lang=ko&pageIndex=2',{published:'2026-07-01',verified:V0927,notes:'목록의 지정 사실만 확인. 페이지 이동에 따라 목록 위치가 바뀔 수 있습니다.'}),
 source('sandbox-march','코리안리 기업성 보험 요율산정 AI Assistant 지정','한국핀테크지원센터','A','REGULATORY_POLICY','https://fintechcenter.or.kr/result/appoint_service.do?lang=ko&pageIndex=5',{published:'2026-03-18',verified:V0927}),
 source('kb','KB국민은행 직원용 생성형 AI 상담 챗봇 운영','KB국민은행','B','DELIVERY_CASE','https://omoney.kbstar.com/quics?articleId=139931&bbsMode=view&boardId=647&page=C017648',{published:'2025-07',verified:V0927,notes:'공식 보도자료 검색 색인 확인. 원문 사이트의 자동 접근 제한이 있습니다.'}),
 source('shinhan','신한은행 GPT 연계 금융지식 Q&A 서비스 오픈','뉴스핌','C','DELIVERY_CASE','https://ir.newspim.com/news/view/20250512000346',{published:'2025-05-12',verified:V0927,notes:'은행 발표 인용 보도. 은행 원문 추가 확보 필요.'}),
 source('jeju','제주은행 사내 생성형 AI 플랫폼 구축·운영 사례','플래티어 AI Labs','B','DELIVERY_CASE','https://labs.plateer.com/customers/case/jeju-bank-genai-platform',{verified:V0927,notes:'공급사 공개 사례 기준 운영 중. 정확한 운영 개시일은 미공개.'}),
 source('jeju-award','플래티어·KT 제주은행 GenAI 플랫폼 사업 수주','플래티어','B','DELIVERY_CASE','https://www.plateer.com/ko/board/news/view/plateer-kt-to-build-genai-platform-for-jejubank',{published:'2026-03',verified:V0927}),
 source('jb','JB우리캐피탈 생성형 AI 플랫폼 구축','메가존클라우드','B','DELIVERY_CASE','https://www.megazone.com/resources/newsroom/89',{published:'2026-03-18',verified:V0927}),
 source('ibk-bid','IBK투자증권 생성형 AI 내재화 인프라 물품 입찰','IBK시스템','B','DELIVERY_CASE','https://www.ibksystem.co.kr/board/read?atclNo=8a85ff2d-d28e-4eb9-a846-c01f269b6eaf&brdId=BRD002',{published:'2026-02-24',verified:V0927}),
 source('ibk','핑거 IBK투자증권 생성형 AI 내재화 사업 수주','지디넷코리아','C','DELIVERY_CASE','https://v.daum.net/v/20260325165944240',{published:'2026-03-25',verified:V0927,notes:'공급사 발표 인용 보도. 구축 완료나 상용 운영을 입증하지 않습니다.'}),
 source('ksfc','올거나이즈 한국증권금융 생성형 AI 플랫폼 구축 착수','이데일리','C','DELIVERY_CASE','https://www.edaily.co.kr/News/Read?mediaCodeNo=257&newsId=03457126645514848',{published:'2026-07-15',verified:V0927,notes:'2026년 6~12월 사업 계획 보도. 완료 여부는 추가 확인 필요.'}),
 source('koreanre','코리안리 재보험 AI Assistant 공급사 사례','3SOFTPLUS','B','DELIVERY_CASE','https://3softplus.com/cases.html',{verified:V0927,notes:'사업 기간 2025.12~2026.07과 기술 공개. 명시적 검수 완료·상용 운영일은 확인 필요.'}),
 ...techSources,
 ...accountSources,
];

// 금융시장 IT·AX Index가 참조하는 Source에 출처 등급(sourceType)을 부여한다.
assignSourceTypes(sources);
