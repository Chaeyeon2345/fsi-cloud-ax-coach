import {useState,type ReactNode} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {PageHeading,TabNav,SourceButton,SourceRows,claimLabel} from '../components/Common';
import {TimelineBody} from './Learning';
import {cases,knowledge} from '../content';
import {cardFreshnessOf} from '../content';
import {regulationDomains} from '../app/navigation';
import {clauses,misstatements,practices,ruleKindLabels,topics,workloadRows,type RuleKind,type Topic} from '../content/regulationPlaybook';
import {aeLevel,aiLifecycle,areas,cloudLifecycle,dataKinds,networkZones,scenarios} from '../content/regulationExtra';
import s from '../styles/App.module.css';

type Tab='map'|'clauses'|'workload'|'practice'|'changes';
const TABS:{key:Tab;label:string}[]=[{key:'map',label:'규제 지도'},{key:'clauses',label:'핵심 조항'},{key:'workload',label:'업무별 적용'},{key:'practice',label:'실무 통제'},{key:'changes',label:'변화·FAQ'}];
const NOTE='금융 고객의 IT·Cloud·AI 사업을 추진할 때 왜 특정 검토가 필요하고 어떤 규정·통제가 Deal에 영향을 주는지 빠르게 보는 Playbook입니다. 법률 자문이나 개별 금융회사의 준수 판정이 아닙니다. 조문은 가이드·해설서·보도자료가 인용한 범위만 적었고 원문 대조는 Source와 카드의 확인 범위를 따릅니다. 최종 해석은 고객의 법무·보안·컴플라이언스 확인이 필요합니다.';
const topicOf=(id:string)=>topics.find(t=>t.id===id);
const card=(id:string)=>knowledge.find(k=>k.id===id);
const KindBadges=({kinds}:{kinds:RuleKind[]})=><>{kinds.map(k=><span className={s.badge} key={k}>{k}</span>)}</>;
const List=({items,empty='—'}:{items?:string[];empty?:string})=>items?.length?<ul>{items.map(x=><li key={x}>{x}</li>)}</ul>:<p className={s.muted}>{empty}</p>;
const caseLinks=(ids:string[])=>ids.length?ids.map(c=>{const x=cases.find(z=>z.id===c);return x?<Link className={s.chip} key={c} to={`/cases/${c}`}>{x.company}</Link>:null}):<span className={s.muted}>—</span>;

// 규제 Topic 하나를 14개 항목으로 읽는다. 사실 본문은 Knowledge Card를 참조하고 복사하지 않는다(Single Source).
function TopicDetail({topic}:{topic:Topic}){
 const k=card(topic.cardId);
 if(!k)return null;
 const why=k.sections[1],practice=k.sections[6],summary=k.sections[0];
 const rows=clauses.filter(c=>c.topic===topic.id);
 const wrong=misstatements.filter(m=>m.topic===topic.id);
 const fresh=cardFreshnessOf(k);
 const sec=(n:number,title:string,body:ReactNode,tag?:string)=><section className={s.readSection}><span className={s.eyebrow}>{String(n).padStart(2,'0')}{tag?` · ${tag}`:''}</span><h3>{title}</h3>{body}</section>;
 return <article className={s.card} id={topic.id} aria-label={`${topic.title} 상세`}>
  <div className={s.row}><h2>{topic.code}. {topic.title}</h2><KindBadges kinds={topic.kinds}/></div>
  <p className={s.muted}>본문은 <Link to={`/knowledge/${k.id}`}>학습 카드: {k.title}</Link>(Single Source)를 참조합니다. 핵심 근거 확인일 {fresh.verifiedAt??'미확인'}</p>
  {sec(1,'한 줄 결론',<p>{summary.text}</p>,claimLabel(summary.type))}
  {sec(2,'왜 존재하는가',<p>{why.text}</p>,claimLabel(why.type))}
  {sec(3,'적용 Trigger (언제 적용되는가)',<p>{topic.when}</p>)}
  {sec(4,'핵심 Requirement (중요한 조항)',rows.length?<ul>{rows.map(c=><li key={c.ref}><b>{c.ref}</b> <span className={s.badge}>{c.kind}</span> — {c.meaning}</li>)}</ul>:<p className={s.muted}>별도 조항 항목이 없습니다. 「핵심 조항」 탭을 참고하세요.</p>)}
  {sec(5,'금융회사 실무에서 무엇을 준비하는가',<p>{practice.text}</p>,claimLabel(practice.type))}
  {sec(6,'Cloud/AX 사업 영향',<p>{topic.dealImpact}</p>,'SALES_VIEW')}
  {sec(7,'고객에게 물을 질문',<List items={k.sales?.discoveryQuestions}/>,'SALES_VIEW')}
  {sec(8,'흔한 오해',<>{wrong.length>0&&<ul>{wrong.map(m=><li key={m.wrong}><b>X</b> {m.wrong} <b>O</b> {m.right}</li>)}</ul>}<List items={k.sales?.commonMistakes}/></>)}
  {sec(9,'AE가 알아야 할 수준',<><p>{aeLevel[topic.id]}</p><List items={k.sales?.amMustKnow}/></>,'SALES_VIEW')}
  {sec(10,'SA / Security / Legal Handoff',<List items={k.sales?.saHandoff}/>)}
  {sec(11,'관련 Case',topic.caseIds.length?<p>{caseLinks(topic.caseIds)}</p>:<p className={s.muted}>연결된 공개 사례가 없습니다.</p>)}
  {sec(12,'공식 Source',<><SourceRows ids={k.primarySourceIds} title="핵심 근거"/><SourceButton ids={k.sourceIds}/></>)}
  {sec(13,'lastVerifiedAt',<p>{fresh.verifiedAt??'미확인'} <span className={s.muted}>(핵심 근거 Source 중 가장 오래된 확인일 기준)</span></p>)}
  {k.caveats.length>0&&<aside className={s.note}><strong>확인 범위와 추가 확인</strong><ul>{k.caveats.map(c=><li key={c}>{c}</li>)}</ul></aside>}
 </article>;
}

function MapTab({selected,select}:{selected:string|null;select:(id:string|null)=>void}){
 const topic=selected?topicOf(selected):undefined;
 return <>
  <p className={s.note}>{NOTE}</p>
  <h2>업무 상황에서 규제 찾기 ({scenarios.length})</h2>
  <div className={s.tableWrap}><table className={s.questionTable}>
   <thead><tr><th scope="col">업무 상황</th><th scope="col">주요 규정/가이드</th><th scope="col">핵심 이유</th><th scope="col">AE 확인사항</th><th scope="col">관련 Day</th><th scope="col">관련 Case</th></tr></thead>
   <tbody>{scenarios.map(sc=><tr key={sc.id}><th scope="row">{sc.situation}<div>{sc.topics.map(t=><button key={t} className={s.chip} onClick={()=>select(t)}>{topicOf(t)?.code}</button>)}</div></th><td>{sc.rules}</td><td>{sc.why}</td><td>{sc.aeCheck}</td><td>{sc.days.map(d=><Link key={d} className={s.chip} to={`/learn/curriculum/${d}`}>Day {d}</Link>)}</td><td>{caseLinks(sc.caseIds)}</td></tr>)}</tbody>
  </table></div>
  <h2>규범의 층</h2>
  <ol className={s.flow} aria-label="규범의 층">
   <li><span className={s.flowLayer}>LAW 법령</span><span className={s.flowNode}>전자금융거래법</span><span className={s.flowNode}>신용정보법</span><span className={s.flowNode}>클라우드컴퓨팅법</span><span className={s.flowNode}>인공지능기본법</span></li>
   <li><span className={s.flowLayer}>REGULATION 감독규정</span><span className={s.flowNode}>전자금융감독규정</span><span className={s.flowNode}>시행세칙</span><span className={s.flowNode}>정보처리위탁규정</span></li>
   <li><span className={s.flowLayer}>GUIDE 가이드·해설서</span><span className={s.flowNode}>금융보안원 가이드·해설서</span><span className={s.flowNode}>금융위 안내·가이드라인</span></li>
   <li><span className={s.flowLayer}>PRACTICE 실무 관행</span><span className={s.flowNode}>보안성 검토·Architecture Review 등 (회사마다 다름)</span></li>
  </ol>
  <p className={s.muted}>위 순서는 교육용 정리(INTERPRETATION)입니다. 가이드와 법규가 충돌하면 법규가 우선하며, 가이드에 있어도 법규에 없는 내용은 준수 의무가 없다고 가이드가 밝힙니다.</p>
  <h2>핵심 규제 영역 ({areas.length})</h2>
  <div className={s.tableWrap}><table className={s.questionTable}>
   <thead><tr><th scope="col">#</th><th scope="col">영역</th><th scope="col">종류</th><th scope="col">한 줄</th><th scope="col">상세</th></tr></thead>
   <tbody>{areas.map(a=><tr key={a.n}><td>{a.n}</td><th scope="row">{a.name}</th><td><span className={s.badge}>{a.kind}</span></td><td>{a.oneLine}</td><td><button className={s.linkButton} onClick={()=>select(a.topic)}>{topicOf(a.topic)?.code}. {topicOf(a.topic)?.title} →</button></td></tr>)}</tbody>
  </table></div>
  {topic?<TopicDetail topic={topic}/>:<p className={s.muted}>영역이나 상황의 상세 버튼을 누르면 결론·이유·Trigger·Requirement·질문·Handoff·Source를 한 번에 볼 수 있습니다. (주제 {topics.length}개)</p>}
 </>;
}

function ClausesTab({open}:{open:(id:string)=>void}){
 const [kind,setKind]=useState('전체'),[q,setQ]=useState('');
 const words=q.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 const rows=clauses.filter(c=>(kind==='전체'||c.kind===kind)&&words.every(w=>(c.ref+c.meaning+c.biz).toLocaleLowerCase().includes(w)));
 return <>
  <p className={s.note}>{NOTE}</p>
  <div className={s.filters}>
   <label>종류<select value={kind} onChange={e=>setKind(e.target.value)}><option>전체</option>{(Object.keys(ruleKindLabels) as RuleKind[]).filter(k=>clauses.some(c=>c.kind===k)).map(k=><option key={k} value={k}>{ruleKindLabels[k]}</option>)}</select></label>
   <label>검색<input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="조항·키워드"/></label>
   <span className={s.muted} aria-live="polite">{rows.length} / {clauses.length}개</span>
  </div>
  <div className={s.tableWrap}><table className={s.questionTable}>
   <thead><tr><th scope="col">규정/조항</th><th scope="col">한줄 의미</th><th scope="col">언제 중요</th><th scope="col">AE 체크</th><th scope="col">관련 사업</th><th scope="col">Source</th></tr></thead>
   <tbody>{rows.map(c=><tr key={c.ref}><th scope="row">{c.ref}<div><span className={s.badge}>{c.kind}</span> <button className={s.linkButton} onClick={()=>open(c.topic)}>{topicOf(c.topic)?.title} →</button></div></th><td>{c.meaning}</td><td>{c.when}</td><td>{c.amCheck}</td><td>{c.biz}</td><td><SourceButton ids={c.sourceIds}/></td></tr>)}</tbody>
  </table></div>
  {!rows.length&&<div className={s.empty}>조건에 맞는 조항이 없습니다.</div>}
 </>;
}

function WorkloadTab({open}:{open:(id:string)=>void}){
 return <>
  <p className={s.note}>업무 유형별로 먼저 볼 규제 영역입니다. 교육용 해석이며 모든 금융회사에 동일하지 않습니다.</p>
  <h2>업무별 먼저 볼 영역</h2>
  <div className={s.tableWrap}><table className={s.questionTable}>
   <thead><tr><th scope="col">업무</th><th scope="col">먼저 볼 규제 영역</th><th scope="col">고객에게 먼저 확인할 것</th></tr></thead>
   <tbody>{workloadRows.map(w=><tr key={w.id}><th scope="row">{w.workload}</th><td>{w.topics.map(t=><button key={t} className={s.chip} onClick={()=>open(t)}>{topicOf(t)?.code}. {topicOf(t)?.title}</button>)}</td><td>{w.first}</td></tr>)}</tbody>
  </table></div>
  <h2>Cloud 이용 Lifecycle</h2>
  <p className={s.muted}>업무 선정부터 종료(Exit)까지 10단계. Owner는 예시이며 회사마다 다릅니다(PRACTICE). 규정 칸은 가이드·감독규정이 설명하는 근거입니다.</p>
  <ol className={s.flow} aria-label="Cloud 이용 Lifecycle">{cloudLifecycle.map(l=><li key={l.n}><span className={s.flowLayer}>{l.n}. {l.step}</span></li>)}</ol>
  <div className={s.tableWrap}><table className={s.questionTable}>
   <thead><tr><th scope="col">단계</th><th scope="col">What</th><th scope="col">Why</th><th scope="col">Main Owner</th><th scope="col">AE Check</th><th scope="col">Deal Risk</th><th scope="col">필요한 Evidence</th><th scope="col">관련 규정</th></tr></thead>
   <tbody>{cloudLifecycle.map(l=><tr key={l.n}><th scope="row">{l.n}. {l.step}</th><td>{l.what}</td><td>{l.why}</td><td>{l.owner}</td><td>{l.aeCheck}</td><td>{l.dealRisk}</td><td>{l.evidence}</td><td>{l.rule}</td></tr>)}</tbody>
  </table></div>
  <h2>망분리 Playbook</h2>
  <p className={s.note}><b>3호망 / 5호망은 보안등급이 아닙니다.</b> 전자금융감독규정 제15조 제1항의 호 번호(제3호·제5호)에서 온 망 구분 표기입니다. 아래는 사용자·단말·망·시스템·Data 이동·운영 반영의 관계를 한 화면에서 비교합니다.</p>
  <div className={`${s.tableWrap} ${s.matrixWrap}`}><table className={s.matrixTable}>
   <thead><tr><th scope="col" className={s.mx1}>구분</th>{networkZones.map(z=><th scope="col" key={z.zone}>{z.zone}</th>)}</tr></thead>
   <tbody>{([['용도·사용자','use'],['단말','terminal'],['시스템','system'],['Data 이동','move'],['운영 반영','reflect'],['핵심 조건','condition'],['흔한 오해','misread']] as const).map(([label,key])=><tr key={key}><th scope="row" className={s.mx1}>{label}</th>{networkZones.map(z=><td key={z.zone}>{z[key]}</td>)}</tr>)}</tbody>
  </table></div>
  <p className={s.muted}>근거: 연구개발망 해설서(2025.4), 금융위 SaaS 예외 보도자료(2026-04-20), 금융분야 AI 가이드라인·긴급 완화 보도자료. 개별 금융사 적용은 담당 부서·법무 확인.</p>
  <h2>Data Playbook</h2>
  <div className={s.tableWrap}><table className={s.questionTable}>
   <thead><tr><th scope="col">구분</th><th scope="col">쉬운 설명</th><th scope="col">금융에서 왜 중요</th><th scope="col">Cloud/AI 질문</th><th scope="col">Handoff</th></tr></thead>
   <tbody>{dataKinds.map(d=><tr key={d.kind}><th scope="row">{d.kind}</th><td>{d.easy}</td><td>{d.why}</td><td>{d.ask}</td><td>{d.handoff}</td></tr>)}</tbody>
  </table></div>
  <p className={s.muted}>학습용 구분이며 법적 정의와 최종 적용 판단은 법무·보안 영역입니다. 앱은 법적 판단을 하지 않습니다.</p>
 </>;
}

function PracticeTab({open}:{open:(id:string)=>void}){
 return <>
  <p className={s.note}><b>PRACTICE</b> — 법적 의무와 구분되는 금융회사 실무 관행입니다. 회사마다 명칭·절차·시기·강도가 다르며 “모든 금융회사가 동일하게 한다”는 뜻이 아닙니다. 고객에게 확인하는 질문으로 쓰세요. 아래 배지로 법·규정·가이드·실무·해석을 구분합니다: <span className={s.badge}>LAW</span> <span className={s.badge}>REGULATION</span> <span className={s.badge}>GUIDE</span> <span className={s.badge}>PRACTICE</span> <span className={s.badge}>INTERPRETATION</span></p>
  <h2>금융사 실무 통제 ({practices.length})</h2>
  <div className={s.tableWrap}><table className={s.questionTable}>
   <thead><tr><th scope="col">실무 통제</th><th scope="col">종류</th><th scope="col">무엇을 하는가</th><th scope="col">언제</th><th scope="col">관련 규제 영역</th><th scope="col">AE 확인 질문</th></tr></thead>
   <tbody>{practices.map(p=><tr key={p.id}><th scope="row">{p.name}</th><td><span className={s.badge}>PRACTICE</span></td><td>{p.what}</td><td>{p.when}</td><td>{p.topics.map(t=><button key={t} className={s.chip} onClick={()=>open(t)}>{topicOf(t)?.code}</button>)}</td><td>{p.ask}</td></tr>)}</tbody>
  </table></div>
  <h2>금융 AI Governance Lifecycle</h2>
  <p className={s.muted}>7대 원칙(거버넌스·합법성·보조수단성·신뢰성·금융안정성·신의성실·보안성)을 수명주기 단계별 통제로 연결한 교육용 구성(ARCHITECTURE_GUIDE)입니다. 가이드라인의 요구사항 목록이 아니며 Owner·Evidence는 예시입니다.</p>
  <ol className={s.flow} aria-label="AI Lifecycle">{aiLifecycle.map(a=><li key={a.n}><span className={s.flowLayer}>{a.n}. {a.step}</span></li>)}</ol>
  <div className={s.tableWrap}><table className={s.questionTable}>
   <thead><tr><th scope="col">단계</th><th scope="col">Control</th><th scope="col">Owner</th><th scope="col">Evidence</th><th scope="col">AE Question</th></tr></thead>
   <tbody>{aiLifecycle.map(a=><tr key={a.n}><th scope="row">{a.n}. {a.step}</th><td>{a.control}</td><td>{a.owner}</td><td>{a.evidence}</td><td>{a.ask}</td></tr>)}</tbody>
  </table></div>
 </>;
}

function ChangesTab(){
 return <>
  <h2>무엇이, 언제 달라졌나</h2>
  <TimelineBody/>
  <h2>잘못 말하면 안 되는 문장 ({misstatements.length})</h2>
  <p className={s.muted}>고객 앞에서 자주 나오는 오해입니다. X는 피하고 O로 말하세요. 근거는 관련 학습 카드에서 확인할 수 있습니다.</p>
  <div className={s.tableWrap}><table className={s.questionTable}>
   <thead><tr><th scope="col">X 이렇게 말하지 않기</th><th scope="col">O 이렇게 말하기</th><th scope="col">영역</th></tr></thead>
   <tbody>{misstatements.map(m=><tr key={m.wrong}><th scope="row">{m.wrong}</th><td>{m.right}</td><td>{topicOf(m.topic)?.title}</td></tr>)}</tbody>
  </table></div>
 </>;
}

export function RegulationPage(){
 const [params,setParams]=useSearchParams();
 const raw=params.get('tab');
 const tab:Tab=raw==='clauses'||raw==='workload'||raw==='practice'||raw==='changes'?raw:raw==='timeline'?'changes':'map'; // 예전 ?tab=timeline 은 변화·FAQ
 const selected=params.get('topic');
 const open=(id:string|null)=>setParams(id?{topic:id}:{});
 const cards=knowledge.filter(k=>regulationDomains.includes(k.domain));
 const hrefTab=(t:Tab)=>t==='map'?'/regulation':`/regulation?tab=${t}`;
 return <>
  <PageHeading eyebrow="FINANCIAL IT · REGULATION" title="금융 IT·규제 Playbook" description="금융 고객의 IT·Cloud·AI 사업을 추진할 때 왜 특정 검토가 필요하고 어떤 규정·통제가 Deal에 영향을 주는지 AE가 빠르게 이해합니다."/>
  <TabNav label="금융 IT·규제 탭" items={TABS.map(t=>({to:hrefTab(t.key),label:t.label,active:tab===t.key}))}/>
  {tab==='map'&&<MapTab selected={selected} select={open}/>}
  {tab==='clauses'&&<ClausesTab open={open}/>}
  {tab==='workload'&&<WorkloadTab open={open}/>}
  {tab==='practice'&&<PracticeTab open={open}/>}
  {tab==='changes'&&<ChangesTab/>}
  <details className={s.moreCards}><summary>배경 지식 카드 {cards.length}개 (금융 IT 구조·규제·보안·복원력)</summary>
   <ul>{cards.map(k=><li key={k.id}><Link to={`/knowledge/${k.id}`}>{k.title}</Link></li>)}</ul></details>
 </>;
}
