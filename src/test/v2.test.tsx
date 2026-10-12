import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {render,screen,within,fireEvent} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {describe,it,expect} from 'vitest';
import App from '../app/App';
import {content,sources,knowledge,cases,curriculum,timeline} from '../content';
import {validateContent} from '../domain/validate';
import {RECHECK_AFTER_DAYS,freshnessOf,oldestVerifiedAt} from '../domain/freshness';
import {caseTypeStages,knowledgeDomains} from '../domain/types';
import {STORAGE_KEY,migrateState,readState} from '../storage/persistence';
import type {ContentStore} from '../domain/types';

const mount=(path:string)=>render(<MemoryRouter initialEntries={[path]}><App/></MemoryRouter>);
const clone=():ContentStore=>structuredClone(content);
const contentDir=join(__dirname,'..','content');

describe('Phase A · Source freshness',()=>{
 it('has no global verification date constant in any content file',()=>{
  for(const f of readdirSync(contentDir).filter(n=>n.endsWith('.ts'))){
   const text=readFileSync(join(contentDir,f),'utf8');
   expect(text,f).not.toMatch(/export const verifiedAt/);
   expect(text,f).not.toMatch(/lastVerifiedAt:\s*verifiedAt/);
   expect(text,f).not.toMatch(/import \{[^}]*\bverifiedAt\b[^}]*\} from '\.\/sources'/);
  }
 });
 it('stores publish/effective/verified/status independently per source',()=>{
  for(const s of sources){expect(s.lastVerifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);expect(['CURRENT','ANNOUNCED','HISTORICAL','SUPERSEDED']).toContain(s.status);expect(s.kind).toBeTruthy()}
  expect(new Set(sources.map(s=>s.lastVerifiedAt)).size).toBeGreaterThan(1);
 });
 it('uses the approved recheck policy per source kind',()=>{
  expect(RECHECK_AFTER_DAYS).toEqual({REGULATORY_POLICY:90,FSEC_GUIDE:120,TECH_PRODUCT:90,DELIVERY_CASE:180,INSTITUTION_ROSTER:180,FINANCIAL_DISCLOSURE:365});
  const today=new Date('2026-12-31');
  const at=(kind:keyof typeof RECHECK_AFTER_DAYS,days:number,status:'CURRENT'|'HISTORICAL'='CURRENT')=>freshnessOf({kind,status,lastVerifiedAt:new Date(today.getTime()-days*86400000).toISOString().slice(0,10)},today).state;
  expect(at('REGULATORY_POLICY',90)).toBe('FRESH');expect(at('REGULATORY_POLICY',91)).toBe('RECHECK');
  expect(at('FSEC_GUIDE',120)).toBe('FRESH');expect(at('FSEC_GUIDE',121)).toBe('RECHECK');
  expect(at('TECH_PRODUCT',91)).toBe('RECHECK');
  expect(at('DELIVERY_CASE',180)).toBe('FRESH');expect(at('DELIVERY_CASE',181)).toBe('RECHECK');
  expect(at('REGULATORY_POLICY',999,'HISTORICAL')).toBe('HISTORICAL'); // 역사자료는 stale 경고 대신 역사자료 표시
 });
 it('derives content verification date from the oldest linked source',()=>{
  const fake=[{id:'a',lastVerifiedAt:'2026-10-11'},{id:'b',lastVerifiedAt:'2026-09-27'}];
  expect(oldestVerifiedAt(['a','b'],fake)).toBe('2026-09-27');expect(oldestVerifiedAt([],fake)).toBeUndefined();
 });
 it('records the AI guideline with the official announcement date and no invented effective date',()=>{
  const s=sources.find(x=>x.id==='ai-guideline')!;
  expect(s.publishedAt).toBe('2026-06-18');expect(s.effectiveAt).toBeNull();
  const all=JSON.stringify({sources:sources.filter(s=>!s.id.startsWith('acct-')),knowledge,timeline,curriculum});expect(all).not.toContain('2026-06-22');expect(all).not.toMatch(/6월\s*22일/);
 });
 it('rejects invalid source dates and ordering',()=>{
  const d=clone();d.sources[0].lastVerifiedAt='yesterday';expect(validateContent(d)).toContain(`Source verified date: ${d.sources[0].id}`);
  const e=clone();e.sources[0].publishedAt='2030-01-01';expect(validateContent(e)).toContain(`Verified before published: ${e.sources[0].id}`);
 });
});

describe('Phase A · Knowledge Domain',()=>{
 it('assigns a valid Domain to every card and keeps the existing card IDs',()=>{
  expect(knowledge.map(k=>k.id)).toEqual(expect.arrayContaining(['ai-governance','ai-saas','cloud-lifecycle','cloud-resilience','deployment-selection','financial-it','network','research-network','sandbox-ai','vulnerability']));
  for(const k of knowledge)expect(knowledgeDomains).toContain(k.domain);
  expect(knowledgeDomains).toEqual(['FINANCIAL_BUSINESS_IT','REGULATION','CLOUD_ARCHITECTURE','AX_AI','SECURITY_RESILIENCE','SALES']);
 });
 it('rejects an unknown or self-duplicated secondary Domain',()=>{
  const d=clone();(d.knowledge[0] as {domain:string}).domain='LEGACY';expect(validateContent(d)).toContain(`Knowledge domain: ${d.knowledge[0].id}`);
  const e=clone();e.knowledge[0].secondaryDomains=[e.knowledge[0].domain];expect(validateContent(e)).toContain(`Knowledge domain: ${e.knowledge[0].id}`);
 });
 it('requires sales extension fields to be complete when present',()=>{
  const d=clone();d.knowledge[0].sales={amMustKnow:[],discoveryQuestions:[],architectureMeaning:'',relatedServices:[],saHandoff:[],nextQuestions:[],commonMistakes:[]};
  expect(validateContent(d)).toContain(`Sales extension incomplete: ${d.knowledge[0].id}`);
 });
});

describe('Phase A · CaseType',()=>{
 it('classifies the existing ten cases without changing their stage',()=>{
  const type=(id:string)=>cases.find(c=>c.id===id)!.caseType;
  expect(type('jb')).toBe('DELIVERY');expect(type('kb')).toBe('PRODUCTION');expect(type('jeju')).toBe('PRODUCTION');expect(type('ibk')).toBe('BUILDING');
  for(const id of ['bc','samsungcard','samsungfire','koreanre'])expect(type(id)).toBe('REGULATORY');
  expect(cases.find(c=>c.id==='bc')!.stage).toBe('혁신금융서비스 지정');
  expect(cases.filter(c=>c.depth==='DEEP_DIVE').map(c=>c.id).sort()).toEqual(['ibk','jb','jeju','kb']);
  expect(cases.every(c=>c.region==='KR')).toBe(true);
 });
 it('never allows a regulatory designation to look like a delivered reference',()=>{
  expect(caseTypeStages.REGULATORY).toEqual(['혁신금융서비스 지정']);
  const d=clone();const bc=d.cases.find(c=>c.id==='bc')!;bc.caseType='DELIVERY';expect(validateContent(d)).toContain('CaseType/Stage mismatch: bc');
  const e=clone();const jb=e.cases.find(c=>c.id==='jb')!;jb.stage='혁신금융서비스 지정';expect(validateContent(e)).toContain('CaseType/Stage mismatch: jb');
 });
 it('ties BENCHMARK to GLOBAL region only',()=>{
  const d=clone();d.cases[0].caseType='BENCHMARK';expect(validateContent(d)).toContain(`BENCHMARK/region: ${d.cases[0].id}`);
 });
});

describe('Phase A · 16-day curriculum shell',()=>{
 it('has sixteen ordered days; only days with written content are READY',()=>{
  expect(curriculum).toHaveLength(16);
  curriculum.forEach((d,i)=>{expect(d.day).toBe(i+1);expect(d.title).toBeTruthy();expect(d.goal).toBeTruthy();expect(d.contentStatus).toBe('READY')});
  expect(curriculum[0].title).toBe('금융 규제 전체 지도');expect(curriculum[15].title).toBe('Account Plan & 금융 고객 미팅');
 });
 it('only links content that exists and keeps the old seven-day content reachable',()=>{
  expect(validateContent(clone())).toEqual([]);
  const linked=new Set(curriculum.flatMap(d=>d.knowledgeIds));
  for(const id of ['financial-it','network','research-network','cloud-lifecycle','ai-saas','deployment-selection','ai-governance','sandbox-ai'])expect(linked.has(id),id).toBe(true);
 });
 it('enforces the minimum structure for a READY day',()=>{
  const d=clone();d.curriculum[13].conclusions=[];expect(validateContent(d)).toContain('Day not ready: day-14');
  const e=clone();e.curriculum[0].nextQuestions=['하나뿐'];expect(validateContent(e)).toContain('Day not ready: day-1');
 });
 it('rejects a broken day reference',()=>{
  const d=clone();d.curriculum[2].knowledgeIds=['no-such-card'];expect(validateContent(d).join()).toContain('day-3: missing no-such-card');
 });
});

describe('Phase A · localStorage compatibility',()=>{
 const legacy={version:1,progress:[{contentId:'cloud-lifecycle',completedAt:'2026-09-30T00:00:00.000Z'},{contentId:'removed-card',completedAt:'2026-09-30T00:00:00.000Z'}],bookmarks:[{contentId:'jb',kind:'case',createdAt:'2026-09-30T00:00:00.000Z'}],reviews:[{questionId:'q1',dueAt:'2026-10-01T00:00:00.000Z',confidence:'확실',correct:true}],meetingPracticed:['m3']};
 it('loads a state saved before V2 unchanged',()=>{
  const store={getItem:()=>JSON.stringify(legacy)};
  const {state,warning}=readState(store);expect(warning).toBe('');expect(state).toEqual(legacy);
 });
 it('migrateState dedupes and refuses unknown shapes without throwing',()=>{
  const dup={...legacy,progress:[...legacy.progress,legacy.progress[0]],meetingPracticed:['m3','m3']};
  const m=migrateState(dup)!;expect(m.progress).toHaveLength(2);expect(m.meetingPracticed).toEqual(['m3']);
  expect(migrateState({version:99})).toBeNull();expect(migrateState('x')).toBeNull();
 });
 it('keeps a future-version value in storage and starts a fresh session with a warning',()=>{
  const {state,warning}=readState({getItem:()=>JSON.stringify({version:2,progress:[]})});
  expect(warning).toContain('호환되지 않아');expect(state.progress).toEqual([]);
 });
 it('shows progress only for cards that still exist',()=>{
  localStorage.setItem(STORAGE_KEY,JSON.stringify(legacy));mount('/learn');
  expect(screen.getByText(/완료한 Day/).closest('div')!.textContent).toMatch(/\d+ \/ 16/);
 });
});

describe('Phase A · Navigation and routes',()=>{
 it('shows exactly five main menu items and tools in the header',()=>{
  mount('/learn');
  const nav=within(screen.getByRole('navigation',{name:'주 메뉴'}));
  expect(nav.getAllByRole('link').map(a=>a.textContent)).toEqual(['16일 학습','금융 IT·규제','Cloud·AX','금융 사례','실전 미팅']);
  const tools=within(screen.getByRole('navigation',{name:'도구'}));
  expect(tools.getByRole('link',{name:'검색'})).toHaveAttribute('href','/search');
  expect(tools.getByRole('link',{name:'북마크'})).toHaveAttribute('href','/bookmarks');
  expect(tools.getByRole('link',{name:'출처·검증일'})).toHaveAttribute('href','/about#sources');
  expect(document.body.textContent).not.toContain('2026.09.27');
 });
 it.each([['/home','전체 Curriculum 진행상태'],['/','전체 Curriculum 진행상태'],['/knowledge','금융 IT·규제 Playbook'],['/timeline','무엇이, 언제 달라졌나'],['/compare','배포모델 비교']])('redirects legacy %s',(path,text)=>{
  mount(path);expect(screen.getAllByText(new RegExp(text)).length).toBeGreaterThan(0);
 });
 it('lands /timeline on the timeline tab and /compare on the comparison tab',()=>{
  mount('/timeline#tl-saas');expect(screen.getByText('내부업무망 SaaS 예외 시행')).toBeInTheDocument();
  mount('/compare');expect(screen.getByRole('columnheader',{name:'비교 기준'})).toBeInTheDocument();
 });
 it('keeps every previous route working',()=>{
  for(const p of ['/knowledge/network','/cases','/cases/jb','/quiz','/quiz/daily','/meeting','/meeting/quick','/search','/bookmarks','/about','/learn/curriculum/1','/learn/curriculum/16']){
   const {unmount}=mount(p);expect(screen.getByRole('main')).toBeInTheDocument();unmount();
  }
 });
 it('marks the menu a detail page belongs to',()=>{
  mount('/knowledge/deployment-selection');expect(within(screen.getByRole('navigation',{name:'주 메뉴'})).getByRole('link',{name:'Cloud·AX'})).toHaveAttribute('aria-current','page');
 });
 it('lists regulation and Cloud·AX cards by Domain',()=>{
  mount('/regulation');expect(screen.getByText('금융권 Cloud 이용 전체 절차')).toBeInTheDocument();expect(screen.queryByText('배포모델 선택: 우열이 아닌 요구사항 적합성')).not.toBeInTheDocument();
  mount('/cloud-ax');expect(screen.getByText('배포모델 선택: 우열이 아닌 요구사항 적합성')).toBeInTheDocument();
 });
 it('puts quiz and sales playbook inside the 실전 미팅 tabs',()=>{
  mount('/meeting');const tabs=within(screen.getByRole('navigation',{name:'실전 미팅 탭'}));
  expect(tabs.getAllByRole('link').map(a=>a.textContent)).toEqual(['미팅 연습','퀴즈·복습','영업 Playbook']);
  expect(within(screen.getByRole('navigation',{name:'주 메뉴'})).getByRole('link',{name:'실전 미팅'})).toHaveAttribute('aria-current','page');
 });
 it('renders the sales playbook tab and every sales field block on cards',()=>{
  mount('/meeting/playbook');expect(screen.getByRole('heading',{name:'영업 Playbook',level:1})).toBeInTheDocument();
 });
});

describe('Phase A · Day page, cases and about',()=>{
 it('renders the seventeen-section day shell with a table of contents',()=>{
  mount('/learn/curriculum/14');
  expect(within(screen.getByRole('navigation',{name:'Day 목차'})).getAllByRole('listitem')).toHaveLength(17);
  expect(document.getElementById('workbench')).toBeTruthy();
  expect(screen.getByRole('heading',{name:'이 Day의 영업 학습'})).toBeInTheDocument();
 });
 it('shows the sales learning fields on cards and cases even before they are written',()=>{
  mount('/knowledge/network');expect(screen.getByRole('heading',{name:'영업 학습'})).toBeInTheDocument();
  mount('/cases/jb');expect(screen.getAllByRole('heading',{name:'영업 학습'}).length).toBeGreaterThan(0);
 });
 it('labels regulatory designations as not being delivery references',()=>{
  mount('/cases/bc');expect(screen.getByText(/구축 레퍼런스로 설명하지 마세요/)).toBeInTheDocument();
  expect(screen.getAllByText(/규제특례·지정 사실/).length).toBeGreaterThan(0);
 });
 it('shows only domestic cases (no overseas benchmark in the product) and filters by CaseType',()=>{
  mount('/cases?tab=cases');const dom=cases.filter(c=>c.region==='KR');expect(screen.getByText(`${dom.length} / ${dom.length}개 사례`)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('CaseType'),{target:{value:'REGULATORY'}});expect(screen.getByText(`${dom.filter(c=>c.caseType==='REGULATORY').length} / ${dom.length}개 사례`)).toBeInTheDocument();
  expect(document.body.textContent).not.toContain('해외 Benchmark');
 });
 it('lists every source with its own dates and a recheck column',()=>{
  mount('/about');const rows=screen.getAllByRole('row').slice(1);expect(rows).toHaveLength(sources.length);
  expect(screen.getAllByText(/재확인 필요/).length).toBeGreaterThan(0);
  expect(screen.getAllByText('공식 Source 미확인').length).toBeGreaterThan(0);
 });
 it('shows per-source dates and status in the source drawer',()=>{
  mount('/cases/jb');fireEvent.click(screen.getAllByRole('button',{name:/출처/})[0]);
  const dialog=screen.getByRole('dialog');expect(within(dialog).getByText(/발행: 2026-03-18/)).toBeInTheDocument();expect(within(dialog).getByText(/확인: 2026-09-27/)).toBeInTheDocument();
 });
 it('has no forbidden interview terminology on new routes',()=>{
  for(const p of ['/regulation','/cloud-ax','/meeting/playbook','/learn/curriculum/1','/about']){const {container,unmount}=mount(p);expect(container.textContent).not.toContain('면접');unmount()}
 });
});
