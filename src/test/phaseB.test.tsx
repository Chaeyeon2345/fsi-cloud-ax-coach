import {render,screen,within} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {describe,it,expect} from 'vitest';
import App from '../app/App';
import {content,sources,knowledge,cases,curriculum,timeline,quiz} from '../content';
import {lifecycleSteps} from '../content/lifecycle';
import {cardFreshness,freshnessOf,RECHECK_AFTER_DAYS} from '../domain/freshness';
import {validateContent} from '../domain/validate';
import type {ContentStore} from '../domain/types';

const mount=(path:string)=>render(<MemoryRouter initialEntries={[path]}><App/></MemoryRouter>);
const clone=():ContentStore=>structuredClone(content);
const card=(id:string)=>knowledge.find(k=>k.id===id)!;
const day=(n:number)=>curriculum[n-1];
const dayQuiz=(n:number)=>quiz.filter(q=>q.id.startsWith(`qb${n}-`));

describe('Phase B · Phase A review fixes',()=>{
 it('classifies sources: designation lists are regulatory policy (90d), vendor case studies are delivery cases (180d)',()=>{
  const kind=(id:string)=>sources.find(s=>s.id===id)!.kind;
  expect(kind('sandbox-july')).toBe('REGULATORY_POLICY');expect(kind('sandbox-march')).toBe('REGULATORY_POLICY');
  for(const id of ['jb','jeju','kb','ksfc','ibk'])expect(kind(id)).toBe('DELIVERY_CASE');
  expect(kind('financial-architecture')).toBe('TECH_PRODUCT');expect(kind('cloud')).toBe('FSEC_GUIDE');
  expect(RECHECK_AFTER_DAYS).toEqual({REGULATORY_POLICY:90,FSEC_GUIDE:120,TECH_PRODUCT:90,DELIVERY_CASE:180,INSTITUTION_ROSTER:180,FINANCIAL_DISCLOSURE:365});
  expect(JSON.stringify(sources)).not.toMatch(/REGULATION_POLICY|VENDOR_TECH|CASE_REFERENCE/);
 });
 it('computes card freshness from primary sources only and excludes HISTORICAL',()=>{
  const today=new Date('2026-12-31');
  const src=[
   {id:'primary',kind:'REGULATORY_POLICY' as const,status:'CURRENT' as const,lastVerifiedAt:'2026-12-01'},
   {id:'support-old',kind:'REGULATORY_POLICY' as const,status:'CURRENT' as const,lastVerifiedAt:'2025-01-01'},
   {id:'hist-old',kind:'REGULATORY_POLICY' as const,status:'HISTORICAL' as const,lastVerifiedAt:'2024-01-01'},
  ];
  // 보조 출처가 오래돼도 카드는 stale이 아니다
  expect(cardFreshness({primarySourceIds:['primary']},src,today)).toEqual({state:'FRESH',verifiedAt:'2026-12-01'});
  // 핵심 근거가 오래되면 stale
  expect(cardFreshness({primarySourceIds:['support-old']},src,today).state).toBe('RECHECK');
  // HISTORICAL은 카드 계산에서 제외 (핵심 근거에 섞여 있어도)
  expect(cardFreshness({primarySourceIds:['primary','hist-old']},src,today)).toEqual({state:'FRESH',verifiedAt:'2026-12-01'});
  // 핵심 근거가 전부 HISTORICAL이면 역사자료
  expect(cardFreshness({primarySourceIds:['hist-old']},src,today).state).toBe('HISTORICAL');
  // 개별 출처 판정은 그대로 (보조 출처의 개별 배지)
  expect(freshnessOf(src[1],today).state).toBe('RECHECK');
 });
 it('requires a non-empty primary source subset on every card',()=>{
  for(const k of knowledge){expect(k.primarySourceIds.length).toBeGreaterThan(0);for(const id of k.primarySourceIds)expect(k.sourceIds).toContain(id)}
  const d=clone();d.knowledge[0].primarySourceIds=['no-such'];expect(validateContent(d)).toContain(`Primary sources: ${d.knowledge[0].id}`);
 });
});

describe('Phase B · Day 1~6 are READY with the required structure',()=>{
 it.each([1,2,3,4,5,6])('Day %i satisfies the READY minimum',n=>{
  const d=day(n);
  expect(d.contentStatus).toBe('READY');
  expect(d.conclusions).toHaveLength(5);expect(d.memorize).toHaveLength(5);
  expect(d.whyLearn).toBeTruthy();expect(d.prerequisites.length).toBeGreaterThanOrEqual(1);
  expect(d.knowledgeIds.length).toBeGreaterThanOrEqual(1);
  expect(d.discoveryQuestions.length).toBeGreaterThanOrEqual(5);
  expect(d.relatedServices.length).toBeGreaterThanOrEqual(1);
  expect(d.meeting30s).toBeTruthy();expect(d.nextQuestions.length).toBeGreaterThanOrEqual(3);
  expect(d.confusionPairs.length).toBeGreaterThanOrEqual(1);
  expect(d.quizIds.length).toBeGreaterThanOrEqual(5);expect(d.sourceIds.length).toBeGreaterThan(0);
  expect(d.sales!.amMustKnow.length).toBeGreaterThan(0);expect(d.sales!.saHandoff.length).toBeGreaterThan(0);
  for(const id of d.knowledgeIds)expect(card(id).sales,`${d.id}/${id} sales`).toBeTruthy();
 });
 it('has all sixteen days READY',()=>{
  for(const d of curriculum)expect(d.contentStatus).toBe('READY');
 });
 it('uses the Content Master titles',()=>{
  expect(curriculum.slice(0,6).map(d=>d.title)).toEqual(['금융 규제 전체 지도','망분리, 3호망·5호망·연구개발망','금융 Cloud 이용 Lifecycle','중요업무, 데이터, 위탁, 책임','2024~2026 망분리·AI·SaaS 규제 변화','금융업무와 IT: 계정계·정보계·채널계·대외계']);
 });
});

describe('Phase B · Knowledge cards',()=>{
 const required=['regulation-map','cloud-provider-responsibility','network','research-network','cloud-lifecycle','workload-criticality','financial-data-basics','information-processing-outsourcing','ai-saas','financial-it','banking-business-it','card-business-it','securities-business-it','insurance-business-it'];
 it('has every required card; existing cards were extended, not duplicated under new IDs',()=>{
  for(const id of required)expect(card(id),id).toBeTruthy();
  expect(new Set(knowledge.map(k=>k.id)).size).toBe(knowledge.length);
  for(const forbidden of ['network-separation-overview','rd-network','cloud-use-lifecycle','regulation-change-2024-2026','financial-system-landscape'])expect(knowledge.some(k=>k.id===forbidden),forbidden).toBe(false);
 });
 it('states the law-over-guide rule as a source-backed FACT and the hierarchy as INTERPRETATION',()=>{
  const m=card('regulation-map');
  expect(m.sections[0].type).toBe('FACT');expect(m.sections[0].text).toContain('법규가 우선');expect(m.sections[0].text).toContain('준수할 의무가 없');
  expect(m.sections[5].type).toBe('INTERPRETATION');expect(m.sections[5].text).toContain('교육용');
  expect(m.primarySourceIds).toEqual(['cloud']);
 });
 it('keeps the Day 6 cards as ARCHITECTURE_GUIDE and never labels them FACT',()=>{
  for(const id of ['financial-it','banking-business-it','card-business-it','securities-business-it','insurance-business-it']){
   const k=card(id);
   expect(k.sections.some(s=>s.type==='FACT'),id).toBe(false);
   for(const i of [0,2,4,5,6])expect(k.sections[i].type,`${id}[${i}]`).toBe('ARCHITECTURE_GUIDE');
   expect(k.caveats.join(' ')).toMatch(/교육용|학습용/);
  }
 });
 it('covers the criticality criteria, data distinctions, research-network rules and outsourcing definition',()=>{
  const wc=card('workload-criticality').sections[0].text;
  for(const w of ['규모·복잡성','서비스 중단','전자적 침해행위','종속 위험','내부통제·법규 준수'])expect(wc).toContain(w);
  const data=card('financial-data-basics');
  for(const w of ['개인정보','개인신용정보','고유식별정보','가명정보','익명정보'])expect(data.sections[3].text).toContain(w);
  expect(data.sections[3].type).toBe('INTERPRETATION');expect(data.caveats.join(' ')).toContain('법적 정의');
  const rd=card('research-network').sections.map(s=>s.text).join(' ');
  for(const w of ['단방향','가명','시큐어코딩','소스코드 등 정보 유출','오픈소스','내부망으로의 침해위협 전파','정보보호위원회'])expect(rd).toContain(w);
  expect(card('network').sections[0].text).toContain('제15조 제1항');
  expect(card('information-processing-outsourcing').sections[0].text).toContain('정보처리위탁규정 제2조제6항');
 });
 it('never states an effective date for the AI guideline and never calls designation a delivery',()=>{
  const all=JSON.stringify({sources:sources.filter(s=>!s.id.startsWith('acct-')),knowledge,timeline,curriculum});expect(all).not.toContain('2026-06-22');expect(all).not.toMatch(/6월\s*22일/);
  expect(card('ai-saas').caveats.join(' ')).toContain('법적 시행일은 공식 Source에서 확인되지 않아');
  expect(cases.filter(c=>c.caseType==='REGULATORY').every(c=>c.stage==='혁신금융서비스 지정')).toBe(true);
 });
});

describe('Phase B · Lifecycle, timeline and quiz',()=>{
 it('has the nine lifecycle steps in the required order with what/why/AM check',()=>{
  expect(lifecycleSteps.map(s=>s.title)).toEqual(['이용대상 업무 선정','업무 중요도 평가','CSP 안전성·건전성 평가','업무 연속성 계획(BCP)','안전성 확보조치','정보보호위원회 심의·의결','계약','이용·보고 및 운영 리스크 관리','이용 종료 / Exit']);
  for(const s of lifecycleSteps){expect(s.what.length).toBeGreaterThan(20);expect(s.why.length).toBeGreaterThan(10);expect(s.amCheck.length).toBeGreaterThan(10)}
  expect(lifecycleSteps[7].what).toContain('3개월');
 });
 it('has the seven required Day 5 events with status and the roadmap kept distinct from implementation',()=>{
  const ids=day(5).timelineIds!;expect(ids).toHaveLength(7);
  const ev=(id:string)=>timeline.find(t=>t.id===id)!;
  expect(ev('tl-roadmap').date).toBe('2024-08-13');expect(ev('tl-roadmap').eventType).toBe('발표');expect(ev('tl-roadmap').implication).toContain('즉시 시행된 것이 아님');
  expect(ev('tl-research').date).toBe('2025-04');
  expect(ev('tl-simplify').date).toBe('2026-04-15');
  expect(ev('tl-saas').date).toBe('2026-04-20');expect(ev('tl-saas').eventType).toBe('시행');
  expect(ev('tl-security').date).toBe('2026-05-26');expect(ev('tl-security').eventType).toBe('발표');
  expect(ev('tl-ai-guideline').date).toBe('2026-06-18');expect(ev('tl-ai-guideline').status).toBe('ANNOUNCED');expect(ev('tl-ai-guideline').implication).toContain('확인되지 않음');
  expect(ev('tl-security-2').date).toBe('2026-09-03');expect(ev('tl-security-2').eventType).toBe('추진');
  expect(ev('tl-roadmap').sourceIds).toContain('roadmap-release');
  expect(sources.find(s=>s.id==='roadmap-release')!.publishedAt).toBe('2024-08-13');
 });
 it.each([1,2,3,4,5,6])('Day %i has at least five quiz questions with a mix of formats, per-option reasons and links',n=>{
  const qs=dayQuiz(n);expect(qs.length).toBeGreaterThanOrEqual(5);
  expect(new Set(qs.map(q=>q.format)).size).toBeGreaterThanOrEqual(3);
  for(const q of qs){
   expect(q.reasons).toHaveLength(q.options.length);expect(q.correctIndex).toBeLessThan(q.options.length);
   expect(q.sourceIds.length+q.relatedKnowledgeIds.length).toBeGreaterThan(0);
   expect(q.format==='OX'?q.options.join('|'):'맞다|틀리다').toBe('맞다|틀리다');
  }
 });
 it('marks educational-only questions with an internal ARCHITECTURE_GUIDE/INTERPRETATION basis',()=>{
  for(const q of dayQuiz(6))expect(q.basis).toBe('ARCHITECTURE_GUIDE');
  for(const q of quiz.filter(x=>x.basis==='FACT'))expect(q.sourceIds.length,q.id).toBeGreaterThan(0);
  expect(new Set(quiz.map(q=>q.format))).toEqual(new Set(['SINGLE','OX','CONFUSION','SCENARIO']));
 });
});

describe('Phase B · UI',()=>{
 it.each([1,2,3,4,5,6])('Day %i shows no unfinished placeholder in its core sections',n=>{
  const {container}=mount(`/learn/curriculum/${n}`);
  expect(container.textContent).not.toContain('작성 예정');expect(container.textContent).not.toContain('작성 중입니다');expect(container.textContent).not.toContain('준비 중');
  expect(container.textContent).not.toContain('면접');
 });
 it('renders the visual lifecycle with what/why/AM checkpoint for each of nine steps on Day 3',()=>{
  mount('/learn/curriculum/3');
  expect(screen.getByText('금융 Cloud 이용 Lifecycle 9단계')).toBeInTheDocument();
  expect(screen.getAllByText('AM 체크포인트')).toHaveLength(9);
  expect(screen.getAllByText('무엇을')).toHaveLength(9);expect(screen.getAllByText('왜 필요한가')).toHaveLength(9);
 });
 it('renders the network map on Day 2 and the system layers with an educational label on Day 6',()=>{
  mount('/learn/curriculum/2');expect(screen.getByRole('img',{name:/연구개발망, 내부업무망, 전산실/})).toBeInTheDocument();
  mount('/learn/curriculum/6');expect(screen.getByRole('img',{name:/채널계, 계정계, 대외계/})).toBeInTheDocument();
  expect(screen.getAllByText(/ARCHITECTURE GUIDE/).length).toBeGreaterThan(0);expect(screen.getAllByText(/법적 분류/).length).toBeGreaterThan(0);
 });
 it('shows the seven-event timeline inside Day 5 with distinct labels',()=>{
  mount('/learn/curriculum/5');
  for(const t of ['금융분야 망분리 개선 로드맵 발표','내부업무망 SaaS 예외 시행','금융분야 AI 가이드라인 개정안 발표','제2차 보안목적 AI 망분리 긴급완화 추진'])expect(screen.getByText(t)).toBeInTheDocument();
 });
 it('lists the day sources with individual freshness',()=>{
  mount('/learn/curriculum/1');
  const rows=screen.getByText('이 Day의 출처 (자료별 확인일)').closest('section')!;
  expect(within(rows).getAllByRole('listitem').length).toBeGreaterThan(0);
  expect(rows.textContent).toMatch(/확인 \d+일 전|재확인 필요/);
 });
 it('separates core and supporting sources on a card page',()=>{
  mount('/knowledge/ai-saas');
  expect(screen.getByRole('heading',{name:/^핵심 근거/})).toBeInTheDocument();expect(screen.getByRole('heading',{name:/^보조 근거/})).toBeInTheDocument();
 });
 it('shows the sales fields on every card referenced by Day 1~6',()=>{
  for(const id of new Set(curriculum.slice(0,6).flatMap(d=>d.knowledgeIds))){
   const {unmount}=mount(`/knowledge/${id}`);
   expect(screen.getByRole('heading',{name:'영업 학습'})).toBeInTheDocument();
   for(const h of ['AM 필수','Discovery Questions','Architecture 의미','관련 Service','SA Hand-off','다음 질문','흔한 실수'])expect(screen.getByRole('heading',{name:h})).toBeInTheDocument();
   unmount();
  }
 });
 it('keeps the lifecycle visual on the cloud-lifecycle card page',()=>{
  mount('/knowledge/cloud-lifecycle');expect(screen.getByText('금융 Cloud 이용 Lifecycle 9단계')).toBeInTheDocument();
 });
});
