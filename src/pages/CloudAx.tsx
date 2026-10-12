import {Fragment,useEffect,useMemo,useRef,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {PageHeading,TabNav} from '../components/Common';
import {cases,knowledge} from '../content';
import {cloudAxDomains} from '../app/navigation';
import {matrixGroups,matrixRows,models,type MatrixRow,type ModelName} from '../content/cloudAxMatrix';
import {discoveryBank,discoveryCategories,type DiscoveryQ} from '../content/cloudAxDiscovery';
import {modelGuide,patternExtra,patterns,requirements,scenarios} from '../content/cloudAxGuide';
import s from '../styles/App.module.css';

type Tab='matrix'|'requirement'|'discovery'|'patterns';
const TABS:{key:Tab;label:string}[]=[{key:'matrix',label:'배포모델 비교'},{key:'requirement',label:'요건 → Architecture'},{key:'discovery',label:'Discovery 질문'},{key:'patterns',label:'대표 Pattern'}];
const NOTE='이 화면은 교육용 정리(해석)이며 법적 기준·우열 판단이 아닙니다. 어떤 모델이 더 좋다는 뜻이 아니라, 고객 요건에 따라 달라지는 검토 포인트를 옆으로 비교합니다. 배포 위치가 규제 검토를 없애지 않습니다.';

// ── 1) 배포모델 비교: 5개 모델을 옆으로 비교, 긴 설명은 행 이름을 눌러 Drawer로 ──
function RowDrawer({row,onClose}:{row:MatrixRow|null;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const d=ref.current;if(!d)return;if(row&&!d.open)d.showModal();if(!row&&d.open)d.close();},[row]);
 return <dialog ref={ref} className={s.drawer} aria-labelledby="row-title" onCancel={onClose} onClose={onClose}>
  {row&&<><div className={s.row}><h2 id="row-title">{row.label}</h2><button onClick={onClose} aria-label="닫기">닫기</button></div>
   <p>{row.detail}</p>
   <dl className={s.facts}>{models.map((m,i)=><div key={m}><dt>{m}</dt><dd>{row.cells[i]}</dd></div>)}</dl></>}
 </dialog>;
}
function MatrixTab(){
 const [group,setGroup]=useState('전체'),[open,setOpen]=useState<MatrixRow|null>(null);
 const rows=matrixRows.filter(r=>group==='전체'||r.group===group);
 return <>
  <p className={s.note}>{NOTE}</p>
  <div className={s.filters}><label>비교 영역<select value={group} onChange={e=>setGroup(e.target.value)}><option>전체</option>{matrixGroups.map(g=><option key={g}>{g}</option>)}</select></label><span className={s.muted}>{rows.length}개 비교 기준 · 행 이름을 누르면 설명과 5개 모델 요약이 열립니다</span></div>
  <div className={`${s.tableWrap} ${s.matrixWrap}`}><table className={s.matrixTable}>
   <thead><tr><th scope="col" className={s.mx1}>비교 기준</th>{models.map(m=><th scope="col" key={m}>{m}</th>)}</tr></thead>
   <tbody>{rows.map((r,i)=>{const first=i===0||rows[i-1].group!==r.group;return <Fragment key={r.id}>
    {first&&<tr className={s.matrixGroup}><th colSpan={6} scope="colgroup">{r.group}</th></tr>}
    <tr><th scope="row" className={s.mx1}><button className={s.linkButton} onClick={()=>setOpen(r)}>{r.label}</button></th>{r.cells.map((c,n)=><td key={n}>{c}</td>)}</tr></Fragment>})}</tbody>
  </table></div>
  <RowDrawer row={open} onClose={()=>setOpen(null)}/>
 </>;
}

// ── 2) 요건 → Architecture: 점수 없이 "우선 검토 후보·이유·반대 조건·추가 질문·Handoff"만 보여준다 ──
function RequirementTab({goDiscovery}:{goDiscovery:()=>void}){
 const [picks,setPicks]=useState<Record<string,string>>({});
 const chosen=requirements.filter(r=>picks[r.id]).map(r=>({r,o:r.options.find(o=>o.id===picks[r.id])!}));
 const candidates=models.filter(m=>chosen.some(c=>c.o.leans.includes(m)));
 const support=(m:ModelName)=>chosen.filter(c=>c.o.leans.includes(m)).length;
 const best=Math.max(0,...candidates.map(support));
 const primary=candidates.filter(m=>support(m)===best).slice(0,2);
 const others=candidates.filter(m=>!primary.includes(m));
 const cats=new Set(chosen.map(c=>c.r.category));
 const unknown=chosen.some(c=>c.o.leans.length===0&&c.o.id==='unknown');
 const questions:DiscoveryQ[]=useMemo(()=>discoveryBank.filter(q=>cats.has(q.category)).slice(0,8),[chosen.length,picks]); // eslint-disable-line react-hooks/exhaustive-deps
 return <>
  <p className={s.note}>{NOTE} 자동 점수나 근거 없는 추천은 만들지 않습니다. 고객이 말한 요건을 고르면 <b>우선 검토할 Architecture와 이유, 추가 확인 질문</b>을 보여줍니다.</p>
  <h2>예시에서 시작</h2>
  <div className={s.chips}>{scenarios.map(sc=><button key={sc.id} onClick={()=>setPicks(sc.picks)} title={sc.text}>{sc.title}</button>)}<button onClick={()=>setPicks({})}>선택 초기화</button></div>
  <div className={s.tableWrap}><table className={s.reqTable}>
   <thead><tr><th scope="col">요건</th><th scope="col">고객의 상황</th></tr></thead>
   <tbody>{requirements.map(r=><tr key={r.id}><th scope="row">{r.label}<div className={s.muted}>{r.question}</div></th>
    <td><div className={s.chips} role="group" aria-label={r.label}>{r.options.map(o=><button key={o.id} aria-pressed={picks[r.id]===o.id} onClick={()=>setPicks(p=>({...p,[r.id]:p[r.id]===o.id?'':o.id}))}>{o.label}</button>)}</div></td></tr>)}</tbody>
  </table></div>
  <h2>우선 검토 Architecture</h2>
  {!chosen.length?<p className={s.muted}>위에서 고객이 말한 요건을 고르면 결과가 나타납니다.</p>:<>
   {primary.length?<div className={s.tableWrap}><table className={s.reqTable}>
    <thead><tr><th scope="col">우선 검토 후보</th><th scope="col">왜 후보인가</th><th scope="col">추가 확인할 점</th><th scope="col">반대 옵션도 가능한 조건</th><th scope="col">주요 Risk</th><th scope="col">SA Handoff</th></tr></thead>
    <tbody>{primary.map(m=>{const why=chosen.filter(c=>c.o.leans.includes(m));return <tr key={m}>
     <th scope="row">{m}<div className={s.muted}>선택한 요건 {why.length}개가 가리킴</div></th>
     <td><ul>{why.map(c=><li key={c.r.id}><b>{c.r.label}</b> · {c.o.label}: {c.o.reason}</li>)}</ul></td>
     <td><ul>{why.filter(c=>c.o.caution).map(c=><li key={c.r.id}>{c.o.caution}</li>)}{!why.some(c=>c.o.caution)&&<li className={s.muted}>해당 요건 외 추가 사항 없음</li>}</ul></td>
     <td>{modelGuide[m].counter}</td>
     <td>{modelGuide[m].risk}</td>
     <td><ul>{modelGuide[m].handoff.map(h=><li key={h}>{h}</li>)}</ul></td></tr>})}</tbody></table></div>
    :<p className={s.muted}>선택한 요건만으로는 특정 Architecture를 우선할 근거가 없습니다. 아래 질문으로 요건을 더 모읍니다.</p>}
   {others.length>0&&<p><b>반대·다른 옵션이 가능한 후보</b>: {others.join(' · ')} <span className={s.muted}>— 선택한 요건 일부가 이 후보도 가리킵니다.</span></p>}
   <p className={s.muted}>“우선 검토”는 선택한 요건과 일치한 항목 수가 많은 후보 1~2개를 가리킬 뿐 점수나 정답이 아닙니다. 요건을 바꾸면 달라지고, 여러 후보가 나오는 것이 정상입니다.</p>
   {chosen.filter(c=>c.o.caution&&c.o.leans.length===0).map(c=><p key={c.r.id} className={s.note}><b>{c.r.label}</b> · {c.o.reason} {c.o.caution}</p>)}
   {unknown&&<p className={s.note}>일부 요건이 “아직 모른다”입니다. 먼저 확인할 질문을 아래에 모았습니다.</p>}
   <h3>이 요건에서 추가로 물어볼 질문</h3>
   <ul>{questions.map(q=><li key={q.id}><b>[{q.category}]</b> {q.q} <span className={s.muted}>— {q.why}</span></li>)}</ul>
   <button className={s.linkButton} onClick={goDiscovery}>Discovery 질문 전체 보기 →</button></>}
 </>;
}

// ── 3) Discovery 질문은행: 고객 Requirement 기준으로 한 번만 둔다 ──
function DiscoveryTab(){
 const [cat,setCat]=useState('전체'),[q,setQ]=useState(''),[model,setModel]=useState('전체');
 const words=q.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 const list=discoveryBank.filter(d=>(cat==='전체'||d.category===cat)&&(model==='전체'||d.related.includes('All')||d.related.includes(model as ModelName))&&words.every(w=>(d.q+d.why+d.impact).toLocaleLowerCase().includes(w)));
 return <>
  <p className={s.note}>질문은 배포모델별로 반복하지 않고 고객 요건(Category) 기준으로 한 번만 둡니다. 모든 질문에 “왜 묻는가”와 “답변에 따라 달라지는 것”이 있습니다.</p>
  <div className={s.filters}>
   <label>Category<select value={cat} onChange={e=>setCat(e.target.value)}><option>전체</option>{discoveryCategories.map(c=><option key={c}>{c}</option>)}</select></label>
   <label>관련 Architecture<select value={model} onChange={e=>setModel(e.target.value)}><option>전체</option>{models.map(m=><option key={m}>{m}</option>)}</select></label>
   <label>검색<input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="질문·이유 검색"/></label>
   <span className={s.muted} aria-live="polite">{list.length} / {discoveryBank.length}개</span>
  </div>
  <div className={s.tableWrap}><table className={s.questionTable}>
   <thead><tr><th scope="col">Category</th><th scope="col">질문</th><th scope="col">왜 묻는가</th><th scope="col">답변에 따라 달라지는 것</th><th scope="col">관련 Architecture</th></tr></thead>
   <tbody>{list.map(d=><tr key={d.id}><td>{d.category}</td><th scope="row">{d.q}</th><td>{d.why}</td><td>{d.impact}</td><td>{d.related.includes('All')?'공통':d.related.join(' · ')}</td></tr>)}</tbody>
  </table></div>
  {!list.length&&<div className={s.empty}>조건에 맞는 질문이 없습니다.</div>}
 </>;
}

// ── 4) 대표 Pattern: 7개만 깊게 ──
function PatternsTab(){
 const [id,setId]=useState(patterns[0].id);
 const p=patterns.find(x=>x.id===id)!;
 const qs=p.discoveryIds.map(i=>discoveryBank.find(d=>d.id===i)).filter((x):x is DiscoveryQ=>!!x);
 return <>
  <p className={s.note}>특정 Vendor의 Architecture를 정답으로 제시하지 않습니다. 예시로 든 서비스명은 개념을 설명하기 위한 것이며 다른 CSP/제품도 같은 역할의 구성요소가 있습니다. 교육용 구조(ARCHITECTURE_GUIDE)입니다.</p>
  <div className={s.chips} role="tablist" aria-label="대표 Pattern">{patterns.map(x=><button key={x.id} role="tab" aria-selected={x.id===id} aria-pressed={x.id===id} onClick={()=>setId(x.id)}>{x.title}</button>)}</div>
  <section className={s.card}>
   <h2>{p.title}</h2>
   <h3>고객 상황</h3><p>{p.situation}</p>
   <h3>Architecture 개념도</h3>
   <ol className={s.flow} aria-label="개념도">{p.flow.map(l=><li key={l.layer}><span className={s.flowLayer}>{l.layer}</span>{l.nodes.map(n=><span className={s.flowNode} key={n}>{n}</span>)}</li>)}</ol>
   <h3>왜 이런 구조인가</h3><p>{p.why}</p>
   <h3>Data flow</h3><ol>{patternExtra[p.id]?.dataFlow.map(c=><li key={c}>{c}</li>)}</ol>
   <h3>주요 구성요소</h3><ul>{p.components.map(c=><li key={c}>{c}</li>)}</ul>
   <h3>Security Point</h3><ul>{p.security.map(c=><li key={c}>{c}</li>)}</ul>
   <h3>규제 Point <span className={s.muted}>(검토 항목, 법률 자문 아님)</span></h3><ul>{p.regulation.map(c=><li key={c}>{c}</li>)}</ul>
   <h3>Operations</h3><ul>{patternExtra[p.id]?.operations.map(c=><li key={c}>{c}</li>)}</ul>
   <h3>Discovery</h3><ul>{qs.map(d=><li key={d.id}>{d.q} <span className={s.muted}>— {d.why}</span></li>)}</ul>
   <h3>Anti-pattern (잘못 쓰면 안 되는 경우)</h3><ul>{p.avoid.map(c=><li key={c}>{c}</li>)}</ul>
   <h3>관련 국내 Case와 학습 카드</h3>
   <p>{p.caseIds.length?p.caseIds.map(c=>{const x=cases.find(z=>z.id===c);return x?<Link key={c} to={`/cases/${c}`} className={s.chip}>{x.company} · {x.title}</Link>:null}):<span className={s.muted}>공개 사례 없음</span>}</p>
   <p>{p.knowledgeIds.map(k=>{const x=knowledge.find(z=>z.id===k);return x?<Link key={k} to={`/knowledge/${k}`} className={s.chip}>{x.title}</Link>:null})}</p>
  </section>
 </>;
}

export function CloudAxPage(){
 const [params,setParams]=useSearchParams();
 const raw=params.get('tab');
 const tab:Tab=raw==='requirement'||raw==='discovery'||raw==='patterns'?raw:'matrix'; // 예전 ?tab=compare · cards 는 비교표로 이어진다
 const go=(t:Tab)=>setParams(t==='matrix'?{}:{tab:t});
 const cards=knowledge.filter(k=>cloudAxDomains.includes(k.domain));
 return <>
  <PageHeading eyebrow="CLOUD · AX ARCHITECTURE" title="Cloud·AX Architecture" description="고객 요구사항을 듣고 어떤 배포모델과 Architecture를 검토해야 할지 판단하는 도구입니다."/>
  <TabNav label="Cloud·AX 탭" items={TABS.map(t=>({to:t.key==='matrix'?'/cloud-ax':`/cloud-ax?tab=${t.key}`,label:t.label,active:tab===t.key}))}/>
  {tab==='matrix'&&<MatrixTab/>}
  {tab==='requirement'&&<RequirementTab goDiscovery={()=>go('discovery')}/>}
  {tab==='discovery'&&<DiscoveryTab/>}
  {tab==='patterns'&&<PatternsTab/>}
  <details className={s.moreCards}><summary>배경 지식 카드 {cards.length}개 (Single Source — 근거와 출처는 카드에서 확인)</summary>
   <ul>{cards.map(k=><li key={k.id}><Link to={`/knowledge/${k.id}`}>{k.title}</Link> <span className={s.muted}>· {k.summary.slice(0,70)}…</span></li>)}</ul></details>
 </>;
}
