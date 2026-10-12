import {useState} from 'react';
import {Link} from 'react-router-dom';
import {institutions} from '../content';
import {sortForDisplay,leaderNeedsRecheck} from '../domain/accounts';
import {displaySectorLabels,displaySectorOf,itDomainLabels,type FinancialInstitution} from '../domain/types';
import {buildBrief,sourceLinks,type Brief} from '../features/accountBrief';
import {accountPlanFields,accountReadingOrder,day14Exercise,day15Exercises,day15Steps,expansionPaths,landscapeQuestions,meetingFlow,meetingLevels,meetingOutputFields,motionDiscovery,partnerRoles,pocChecklist,qualification,selfCheck,simulationFields,solutionMotions,customerSignals,stakeholderRoles} from '../content/dayTools';
import {readDayWork,writeDayWork} from '../storage/persistence';
import s from '../styles/App.module.css';

// Day 14~16 실습 도구. 입력은 모두 이 브라우저(localStorage)에만 저장되며 공개 Seed 데이터와 분리된다. 개인정보·고객 연락처는 입력하지 않는다.
function useWork(){
 const [work,setWork]=useState<Record<string,string>>(()=>readDayWork(window.localStorage));
 const set=(k:string,v:string)=>{setWork(w=>({...w,[k]:v}));writeDayWork(window.localStorage,k,v)};
 return {work,set};
}
type Work=ReturnType<typeof useWork>;
function Field({id,label,hint,w,rows=3}:{id:string;label:string;hint?:string;w:Work;rows?:number}){
 return <label className={s.workField}><span>{label}</span>{hint&&<small className={s.muted}>{hint}</small>}<textarea rows={rows} value={w.work[id]??''} onChange={e=>w.set(id,e.target.value)} aria-label={label}/></label>;
}
function Check({id,label,w}:{id:string;label:string;w:Work}){
 return <label className={s.checkLabel}><input type="checkbox" checked={w.work[id]==='1'} onChange={e=>w.set(id,e.target.checked?'1':'')}/> {label}</label>;
}
const FactBadge=()=><span className={s.badge}>FACT</span>;
const SalesBadge=()=><span className={s.badge}>SALES_VIEW</span>;

function Picker({value,onChange,label='금융회사 선택'}:{value:string;onChange:(id:string)=>void;label?:string}){
 const list=sortForDisplay(institutions);
 return <label>{label}<select value={value} onChange={e=>onChange(e.target.value)}>{list.map(i=><option key={i.id} value={i.id}>{displaySectorLabels[displaySectorOf[i.sector]]} · {i.name}{i.initiatives.length?` (공개 사업 ${i.initiatives.length}건)`:' (공개 확인자료 없음)'}</option>)}</select></label>;
}
const defaultInst=()=>institutions.find(i=>i.researchCoverage==='DEEP'&&i.initiatives.length>=2)?.id??institutions[0].id;

// 1-page Account Intelligence Brief
export function BriefView({brief,extra}:{brief:Brief;extra?:boolean}){
 const {inst}=brief;
 const src=(ids:string[])=>sourceLinks(ids).slice(0,2).map(x=><a key={x.id} href={x.url} target="_blank" rel="noopener noreferrer" className={s.chip}>출처 ↗</a>);
 return <article className={s.card} aria-label={`${inst.name} Brief`}>
  <h3>{inst.name} · Account Intelligence Brief</h3>
  <p className={s.muted}>{displaySectorLabels[displaySectorOf[inst.sector]]}{inst.subSector?` · ${inst.subSector}`:''}{inst.headOffice?` · 본사 ${inst.headOffice.region}${inst.headOffice.district?` ${inst.headOffice.district}`:''}`:''} · <Link to={`/cases/accounts/${inst.id}`}>시장 모판에서 보기</Link></p>
  <h4><FactBadge/> 확인된 사실 (Source 있는 것만)</h4>
  <ul>{brief.facts.map((f,n)=><li key={n}>{f.text} {src(f.sourceIds)}</li>)}</ul>
  <h4><FactBadge/> 최근 IT·AX Initiative 3건</h4>
  {brief.recent.length?<ol>{brief.recent.map(i=><li key={i.id}>{i.announcedAt??'날짜 미공개'} · {i.title} {src(i.sourceIds)}</li>)}</ol>:<p className={s.muted}>공개 확인자료 없음 / 추가 조사 필요 (사업이 없다는 뜻이 아닙니다)</p>}
  <h4><FactBadge/> Landscape · Ecosystem</h4>
  <p>{(['CORE_ONPREM','PUBLIC_CLOUD','DATA','AI_AX','SECURITY_DR'] as const).map(d=>`${itDomainLabels[d]} ${brief.summary.byDomain[d]}건`).join(' · ')}</p>
  <p>CSP {brief.eco.csp.join(', ')||'공개 확인자료 없음'} · MSP/SI {brief.eco.msp.join(', ')||'공개 확인자료 없음'} · Product/Vendor {[...brief.eco.products,...brief.eco.vendors].join(', ')||'공개 확인자료 없음'}</p>
  <h4><FactBadge/> People · 조직</h4>
  <p>{brief.keyman?<>{brief.keyman.personName} · {brief.keyman.title} <span className={s.muted}>({brief.keyman.asOfDate} 기준{leaderNeedsRecheck(brief.keyman)?' · 재확인 필요':''})</span></>:<span className={s.muted}>공개 확인자료 없음{brief.pastKeyman>0?` · 과거 보도 기반 ${brief.pastKeyman}명은 회사 상세에서 HISTORICAL로 확인`:''}</span>} {brief.orgs.length>0&&<span className={s.muted}> · 공개 조직 {brief.orgs.join(', ')}</span>}</p>
  <h4><FactBadge/> 관련 Regulation 3개</h4>
  <ul>{brief.regulations.map(r=><li key={r.id}><Link to={`/regulation?topic=${r.id}`}>{r.title}</Link></li>)}</ul>
  <h4><FactBadge/> 국내 유사 Reference 2개</h4>
  {brief.references.length?<ul>{brief.references.map(c=><li key={c.id}><Link to={`/cases/${c.id}`}>{c.company} · {c.title}</Link> <span className={s.muted}>({c.stage})</span></li>)}</ul>:<p className={s.muted}>유사 사례 없음</p>}
  <h4><SalesBadge/> Opportunity Hypothesis (내 해석 · 사실이 아님)</h4>
  <ol>{brief.hypotheses.map(h=><li key={h}>{h}</li>)}</ol>
  <h4><SalesBadge/> Discovery Question 10개</h4>
  <ol>{brief.questions.map(q=><li key={q}>{q}</li>)}</ol>
  {extra&&<>
   <h4><SalesBadge/> Internal — 누구를 데려갈까</h4>
   <p>{[brief.summary.byDomain.AI_AX>0&&'AI/SA',brief.summary.byDomain.PUBLIC_CLOUD>0&&'Cloud SA',brief.summary.byDomain.CORE_ONPREM>0&&'Infra SA',brief.summary.byDomain.SECURITY_DR>0&&'Security',brief.summary.byDomain.DATA>0&&'Data'].filter(Boolean).join(' · ')||'Cloud SA · Security'} <span className={s.muted}>(공개 사업 영역 기준 제안, 내 해석)</span></p>
   <h4><SalesBadge/> Next — 미팅 후 받아야 할 것</h4>
   <ul><li>현재 단계와 다음 단계 일정</li><li>의사결정 구조와 예산 경로</li><li>규제·보안 검토 담당과 일정</li></ul></>}
 </article>;
}

function BriefPicker({extra,w}:{extra?:boolean;w?:Work}){
 const [id,setId]=useState(defaultInst);
 const inst=institutions.find(i=>i.id===id) as FinancialInstitution;
 const brief=buildBrief(inst);
 return <>
  <div className={s.filters}><Picker value={id} onChange={setId}/></div>
  <BriefView brief={brief} extra={extra}/>
  {w&&<p className={s.muted}>선택한 회사: {inst.name}</p>}
 </>;
}

export function Day14Workbench(){
 const w=useWork();const [id,setId]=useState(defaultInst);
 const inst=institutions.find(i=>i.id===id) as FinancialInstitution;
 return <section className={s.daySection} id="workbench">
  <span className={s.eyebrow}>PRACTICE</span><h2>Account를 읽는 순서와 Account Brief</h2>
  <p className={s.note}>FACT(공개 Source가 있는 사실)와 SALES_VIEW(내 해석)는 배지로 구분됩니다. 공개자료만으로 “AI가 많으니 성숙도가 높다” 같은 평가는 하지 않습니다.</p>
  <h3>20단계 Framework</h3>
  <div className={s.tableWrap}><table className={s.questionTable}><thead><tr><th scope="col">#</th><th scope="col">읽는 순서</th><th scope="col">어디서 보나</th><th scope="col">구분</th></tr></thead>
   <tbody>{accountReadingOrder.map(r=><tr key={r.n}><td>{r.n}</td><th scope="row">{r.step}</th><td>{r.where}</td><td>{r.kind==='FACT'?<FactBadge/>:<SalesBadge/>}</td></tr>)}</tbody></table></div>
  <h3>고객 IT Landscape 읽기 — 8가지 질문</h3>
  <ul>{landscapeQuestions.map(q=><li key={q}>{q}</li>)}</ul>
  <h3>Account Brief 만들기</h3>
  <div className={s.filters}><Picker value={id} onChange={setId}/></div>
  <BriefView brief={buildBrief(inst)}/>
  <h3>Day 14 Exercise — {inst.name}</h3>
  <p className={s.muted}>선택한 금융회사를 기준으로 작성하세요. 이 브라우저에만 저장됩니다.</p>
  {day14Exercise.map(f=><Field key={f.key} id={`d14:${id}:${f.key}`} label={f.label} hint={f.hint} w={w}/>)}
 </section>;
}

export function Day15Workbench(){
 const w=useWork();
 return <section className={s.daySection} id="workbench">
  <span className={s.eyebrow}>PRACTICE</span><h2>Solution Motion 지도와 Customer Signal</h2>
  <p className={s.note}>Vendor-neutral입니다. AWS·Azure·국내 Cloud·각 MSP/SI/Vendor는 Example일 뿐이며, “이 Pain이면 무조건 Public Cloud”처럼 단정하지 않습니다.</p>
  <h3>Solution Motion 전체 지도 ({solutionMotions.reduce((a,m)=>a+m.items.length,0)}개 Motion)</h3>
  <div className={s.tableWrap}><table className={s.questionTable}><thead><tr><th scope="col">영역</th><th scope="col">Motion</th><th scope="col">후보가 될 수 있는 배포모델</th></tr></thead>
   <tbody>{solutionMotions.map(m=><tr key={m.group}><th scope="row">{m.group}</th><td>{m.items.join(' · ')}</td><td>{m.models.join(' · ')}</td></tr>)}</tbody></table></div>
  <h3>Customer Signal → Opportunity ({customerSignals.length})</h3>
  <div className={s.tableWrap}><table className={s.questionTable}><thead><tr><th scope="col">고객 Signal/Pain</th><th scope="col">확인할 것</th><th scope="col">가능한 사업 Motion</th><th scope="col">Deployment 후보</th><th scope="col">다음 질문</th><th scope="col">Handoff</th></tr></thead>
   <tbody>{customerSignals.map(c=><tr key={c.signal}><th scope="row">{c.signal}</th><td>{c.check}</td><td>{c.motions}</td><td>{c.models}</td><td>{c.ask}</td><td>{c.handoff}</td></tr>)}</tbody></table></div>
  <p className={s.muted}>Deployment 후보는 “이 조건이면 이 후보도 검토한다”는 의미입니다. 요건에 따라 달라지며 <Link to="/cloud-ax?tab=requirement">요건 → Architecture</Link>에서 조합해 볼 수 있습니다.</p>
  <h3>Partner Ecosystem — 역할 구분</h3>
  <div className={s.tableWrap}><table className={s.questionTable}><thead><tr><th scope="col">역할</th><th scope="col">맡는 일</th></tr></thead><tbody>{partnerRoles.map(p=><tr key={p.role}><th scope="row">{p.role}</th><td>{p.does}</td></tr>)}</tbody></table></div>
  <p className={s.muted}>하나의 Deal에 여러 역할의 회사가 함께 들어갈 수 있습니다. 책임은 금융회사가 지며 재위탁은 사전 동의가 필요합니다.</p>
  <h3>사업 확장 구조 (Land &amp; Expand)</h3>
  <ul>{expansionPaths.map(e=><li key={e.name}><b>{e.name}</b>: {e.steps.join(' → ')}</li>)}</ul>
  <p className={s.muted}>특정 회사의 내부 마진·가격 정책은 다루지 않습니다.</p>
  <h3>Motion별 Discovery ({motionDiscovery.length}개 Set)</h3>
  <div className={s.tableWrap}><table className={s.questionTable}><thead><tr><th scope="col">Motion</th><th scope="col">질문</th></tr></thead><tbody>{motionDiscovery.map(m=><tr key={m.motion}><th scope="row">{m.motion}</th><td><ol>{m.questions.map(q=><li key={q}>{q}</li>)}</ol></td></tr>)}</tbody></table></div>
  <h3>Day 15 Exercise — Customer Signal 5개</h3>
  <p className={s.muted}>{day15Steps.join(' → ')} 순서로 적어 보세요. 이 브라우저에만 저장됩니다.</p>
  {day15Exercises.map(e=><fieldset key={e.id} className={s.workSet}><legend>{e.signal}</legend>{day15Steps.map(st=><Field key={st} id={`d15:${e.id}:${st}`} label={st} w={w} rows={2}/>)}</fieldset>)}
 </section>;
}

export function Day16Workbench(){
 const w=useWork();const [simId,setSimId]=useState(defaultInst);
 const simInst=institutions.find(i=>i.id===simId) as FinancialInstitution;
 const [checked,setChecked]=useState(false);
 return <section className={s.daySection} id="workbench">
  <span className={s.eyebrow}>PRACTICE</span><h2>Account Plan · 첫 미팅 · Final Simulation</h2>
  <p className={s.note}>아래 입력은 이 브라우저에만 저장되며 공개 Seed 데이터와 분리됩니다. 개인 연락처는 입력하지 마세요. 이름은 공식 공개 정보나 본인의 로컬 메모에서만 사용합니다.</p>
  <h3>Account Plan Template (20항목)</h3>
  {accountPlanFields.map(f=><Field key={f.key} id={`d16:plan:${f.key}`} label={f.label} w={w} rows={2}/>)}
  <h3>Stakeholder Map — Role 중심 Template</h3>
  <div className={s.tableWrap}><table className={s.questionTable}><thead><tr><th scope="col">Role</th><th scope="col">내 메모(로컬 전용)</th></tr></thead>
   <tbody>{stakeholderRoles.map(r=><tr key={r}><th scope="row">{r}</th><td><input aria-label={`${r} 메모`} value={w.work[`d16:role:${r}`]??''} onChange={e=>w.set(`d16:role:${r}`,e.target.value)} placeholder="공식 공개 정보 또는 내 메모"/></td></tr>)}</tbody></table></div>
  <h3>첫 미팅 Discovery Flow — 제품부터 설명하지 않는다</h3>
  {([1,2,3] as const).map(l=><div key={l}><h4>{meetingLevels[l]}</h4><ol>{meetingFlow.filter(m=>m.level===l).map(m=><li key={m.n} value={m.n}><b>{m.step}</b> — {m.ask}</li>)}</ol></div>)}
  <h3>PoC → Production Checklist</h3>
  <div className={s.checkGrid}>{pocChecklist.map(p=><Check key={p} id={`d16:poc:${p}`} label={p} w={w}/>)}</div>
  <h3>사업기회 Qualification <SalesBadge/></h3>
  <p className={s.muted}>“관심 있습니다”만으로 Opportunity로 보지 않습니다. 8가지를 모두 확인합니다.</p>
  <div className={s.checkGrid}>{qualification.map(q=><Check key={q.key} id={`d16:qual:${q.key}`} label={q.label} w={w}/>)}</div>
  <h3>First Meeting Brief (미팅 직전 10분)</h3>
  <BriefPicker extra/>
  <h3>Meeting Output — 미팅 후 정리</h3>
  {meetingOutputFields.map(f=><Field key={f.key} id={`d16:out:${f.key}`} label={f.label} w={w} rows={2}/>)}
  <h3>Final Simulation — “내일 금융 고객과 첫 미팅이 있다”</h3>
  <div className={s.filters}><Picker value={simId} onChange={setSimId} label="미팅 상대 금융회사"/></div>
  <BriefView brief={buildBrief(simInst)} extra/>
  {simulationFields.map(f=><Field key={f.key} id={`d16:sim:${simId}:${f.key}`} label={f.label} w={w}/>)}
  <button onClick={()=>setChecked(c=>!c)} aria-expanded={checked}>Self-check {checked?'닫기':'열기'}</button>
  {checked&&<ul className={s.note}>{selfCheck.map(c=><li key={c}>{c}</li>)}</ul>}
 </section>;
}

export function DayWorkbench({day}:{day:number}){
 if(day===14)return <Day14Workbench/>;
 if(day===15)return <Day15Workbench/>;
 if(day===16)return <Day16Workbench/>;
 return null;
}
