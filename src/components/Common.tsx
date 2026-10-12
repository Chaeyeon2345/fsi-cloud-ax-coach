import {useEffect,useRef} from 'react';
import {Link} from 'react-router-dom';
import {sources,knowledge,cases} from '../content';
import {useApp} from '../app/Context';
import {freshnessOf,freshnessLabel,sourceKindLabels,sourceStatusLabels,type CardFreshness} from '../domain/freshness';
import type {ClaimType,SalesLearningExtension,Source} from '../domain/types';
import s from '../styles/App.module.css';
export function SourceButton({ids}:{ids:string[]}){const {showSources}=useApp();return <button className={s.sourceButton} onClick={()=>showSources(ids)}>출처 {ids.length} ↗</button>}

// 자료별 날짜·상태. "재확인 필요"는 틀린 자료라는 뜻이 아니라 확인한 지 오래됐다는 표시다.
export function SourceDates({source}:{source:Source}){
 const f=freshnessOf(source);
 const effective=source.effectiveAt===null?'시행일: 공식 Source에서 확인되지 않음':source.effectiveAt?`시행: ${source.effectiveAt}`:null;
 return <>
  <p>발행: {source.publishedAt??'날짜 미공개'}{effective&&<> · {effective}</>} · 확인: {source.lastVerifiedAt}</p>
  <p className={f.state==='RECHECK'?s.recheck:s.muted}>{freshnessLabel(f)}</p>
 </>;
}
// 출처 목록: 출처마다 자료 종류·확인일과 재확인 배지를 개별로 보여준다. (재확인 필요 = 틀렸다는 뜻이 아니라 다시 확인할 때)
export function SourceRows({ids,title}:{ids:string[];title:string}){
 const rows=sources.filter(x=>ids.includes(x.id));
 if(!rows.length)return null;
 return <section className={s.sourceRows}><h3>{title}</h3><ul>{rows.map(x=>{const f=freshnessOf(x);return <li key={x.id}><span>{x.title}</span> <span className={s.badge}>{sourceKindLabels[x.kind]} · Tier {x.tier}</span> <span className={f.state==='RECHECK'?s.recheckBadge:s.badge}>{freshnessLabel(f)}</span> <SourceButton ids={[x.id]}/></li>})}</ul></section>;
}
// 카드 재확인 배지: 핵심 근거 기준. HISTORICAL 핵심 근거만 있으면 역사자료로 표시한다.
export function CardFreshnessBadge({freshness}:{freshness:CardFreshness}){
 if(freshness.state==='RECHECK')return <span className={s.recheckBadge}>재확인 필요 (핵심 근거 기준)</span>;
 if(freshness.state==='SUPERSEDED')return <span className={s.recheckBadge}>대체된 자료 포함</span>;
 if(freshness.state==='HISTORICAL')return <span className={s.badge}>역사자료</span>;
 return null;
}
export function SourceDrawer(){const {sourceIds,showSources}=useApp();const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{if(sourceIds&&!ref.current?.open)ref.current?.showModal();if(!sourceIds&&ref.current?.open)ref.current?.close();},[sourceIds]);
 return <dialog ref={ref} className={s.drawer} aria-labelledby="source-title" onCancel={()=>showSources(null)} onClose={()=>showSources(null)}><div className={s.row}><h2 id="source-title">출처와 확인 범위</h2><button onClick={()=>showSources(null)} aria-label="출처 닫기">닫기 ×</button></div><p>자료마다 발행일·시행일·확인일이 다릅니다. 표시된 근거 시점과 최신 적용 여부를 구분하세요. 원문은 새 탭에서 열립니다.</p>{sources.filter(x=>sourceIds?.includes(x.id)).map(x=><article className={s.sourceCard} key={x.id}><span className={s.badge}>Tier {x.tier} · {x.publisher} · {sourceKindLabels[x.kind]}</span> <span className={s.badge}>{sourceStatusLabels[x.status]}</span><h3><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title} ↗</a></h3><SourceDates source={x}/>{x.locator&&<p>{x.locator}</p>}{x.notes&&<p className={s.note}>{x.notes}</p>}</article>)}</dialog>
}
export function BookmarkButton({id,kind,label}:{id:string;kind:'knowledge'|'case'|'institution';label?:string}){const {state,update}=useApp();const selected=state.bookmarks.some(b=>b.contentId===id&&b.kind===kind);return <button aria-pressed={selected} onClick={()=>update(x=>({...x,bookmarks:selected?x.bookmarks.filter(b=>!(b.contentId===id&&b.kind===kind)):[...x.bookmarks,{contentId:id,kind,createdAt:new Date().toISOString()}]}))}>{selected?'★ 저장됨':label??'☆ 북마크'}</button>}
export function CompleteButton({id}:{id:string}){const {state,update}=useApp();const done=state.progress.some(p=>p.contentId===id);return <button className={s.primary} aria-pressed={done} onClick={()=>update(x=>({...x,progress:done?x.progress.filter(p=>p.contentId!==id):[...x.progress,{contentId:id,completedAt:new Date().toISOString()}]}))}>{done?'✓ 학습 완료 · 취소':'학습 완료 표시'}</button>}
export function Related({knowledgeIds=[],caseIds=[]}:{knowledgeIds?:string[];caseIds?:string[]}){return <div className={s.related}>{knowledge.filter(k=>knowledgeIds.includes(k.id)).map(k=><Link key={k.id} to={`/knowledge/${k.id}`}>학습 · {k.title} →</Link>)}{cases.filter(c=>caseIds.includes(c.id)).map(c=><Link key={c.id} to={`/cases/${c.id}`}>사례 · {c.company} →</Link>)}</div>}
export function PageHeading({eyebrow,title,description}:{eyebrow:string;title:string;description:string}){return <header className={s.heading}><span className={s.eyebrow}>{eyebrow}</span><h1>{title}</h1><p>{description}</p></header>}

// 같은 화면 안의 탭 (허브·실전 미팅). 주소의 ?tab= 또는 경로로 상태를 표현해 새로고침·공유가 가능하다.
export function TabNav({label,items}:{label:string;items:{to:string;label:string;active:boolean}[]}){
 return <nav className={s.chips} aria-label={label}>{items.map(i=><Link key={i.to} to={i.to} aria-current={i.active?'page':undefined} className={i.active?s.primary:''}>{i.label}</Link>)}</nav>;
}
export function MeetingTabs({active}:{active:'meeting'|'quiz'|'playbook'}){
 return <TabNav label="실전 미팅 탭" items={[
  {to:'/meeting',label:'미팅 연습',active:active==='meeting'},
  {to:'/quiz',label:'퀴즈·복습',active:active==='quiz'},
  {to:'/meeting/playbook',label:'영업 Playbook',active:active==='playbook'},
 ]}/>;
}

// FACT와 교육용 분석을 같은 수준으로 보이지 않게 구분한다.
const claimNames:Record<ClaimType,string>={FACT:'FACT',TECH_FACT:'TECH FACT · 공식 기술 문서',INTERPRETATION:'INTERPRETATION',ARCHITECTURE_GUIDE:'ARCHITECTURE GUIDE · 교육용 구성 분석',SALES_VIEW:'SALES_VIEW',MEETING:'MEETING'};
export const claimLabel=(type:ClaimType)=>claimNames[type];

// 영업 학습 7개 필드. 영업 Playbook 탭뿐 아니라 모든 Day·Knowledge·Case 상세에서 같은 모양으로 보인다.
export function SalesBlock({sales,title='영업 학습',omit=[]}:{sales?:SalesLearningExtension;title?:string;omit?:(keyof SalesLearningExtension)[]}){
 if(!sales)return <aside className={s.salesBlock}><h2>{title}</h2><p className={s.muted}>AM 필수 지식·Discovery 질문·Architecture 의미·관련 Service·SA Hand-off·다음 질문·흔한 실수는 이 항목에 대해 준비 중입니다.</p></aside>;
 const list=(items:string[])=>items.length?<ul>{items.map(x=><li key={x}>{x}</li>)}</ul>:<p className={s.muted}>준비 중</p>;
 return <section className={s.salesBlock}><span className={s.eyebrow}>SALES_VIEW</span><h2>{title}</h2>
  {!omit.includes('amMustKnow')&&<><h3>AM 필수</h3>{list(sales.amMustKnow)}</>}
  {!omit.includes('discoveryQuestions')&&<><h3>Discovery Questions</h3>{list(sales.discoveryQuestions)}</>}
  {!omit.includes('architectureMeaning')&&<><h3>Architecture 의미</h3><p>{sales.architectureMeaning}</p></>}
  {!omit.includes('relatedServices')&&<><h3>관련 Service</h3>{list(sales.relatedServices)}</>}
  {!omit.includes('saHandoff')&&<><h3>SA Hand-off</h3>{list(sales.saHandoff)}</>}
  {!omit.includes('nextQuestions')&&<><h3>다음 질문</h3>{list(sales.nextQuestions)}</>}
  {!omit.includes('commonMistakes')&&<><h3>흔한 실수</h3>{list(sales.commonMistakes)}</>}
 </section>;
}
