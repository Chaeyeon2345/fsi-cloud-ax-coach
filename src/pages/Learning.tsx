import {Link,useParams,useSearchParams} from 'react-router-dom';
import {useState} from 'react';
import {cases,knowledge,timeline,architectures,cardFreshnessOf,sources,institutions} from '../content';
import {freshnessOf,freshnessLabel,sourceKindLabels,sourceStatusLabels,RECHECK_AFTER_DAYS} from '../domain/freshness';
import {industries,deployments,stages,caseTypes,caseTypeLabels,domainLabels,type CaseRegion,type CaseType,type DeploymentModel,type KnowledgeDomain} from '../domain/types';
import {SourceButton,SourceRows,CardFreshnessBadge,BookmarkButton,CompleteButton,PageHeading,Related,SalesBlock,TabNav,claimLabel} from '../components/Common';
import {AccountMap} from './Accounts';
import {ALWAYS_PRODUCTS,caseEcosystem} from '../domain/ecosystem';
import {LifecycleFlow} from '../components/Visuals';
import {hubForDomain} from '../app/navigation';
import {useApp} from '../app/Context';
import {searchContent} from '../features/search';
import s from '../styles/App.module.css';

// ── 지식 카드 ──
// 허브(금융 IT·규제 / Cloud·AX)에서 Domain별로 카드 목록을 보여준다.
export function KnowledgeGrid({domains}:{domains:KnowledgeDomain[]}){
 const items=knowledge.filter(k=>domains.includes(k.domain));
 return <div className={s.grid}>{items.map(k=><article className={s.card} key={k.id}><span className={s.badge}>{domainLabels[k.domain]}</span><h2><Link to={`/knowledge/${k.id}`}>{k.title}</Link></h2><p>{k.summary}</p><div className={s.row}><SourceButton ids={k.sourceIds}/><BookmarkButton id={k.id} kind="knowledge"/></div></article>)}{!items.length&&<p className={s.empty}>아직 이 영역의 학습 카드가 없습니다.</p>}</div>;
}
export function KnowledgeDetail(){
 const {id}=useParams();const k=knowledge.find(k=>k.id===id);
 if(!k)return <NotFound/>;
 const hub=hubForDomain(k.domain);
 const fresh=cardFreshnessOf(k);
 const hubName=hub==='/cloud-ax'?'Cloud·AX':hub==='/meeting/playbook'?'영업 Playbook':'금융 IT·규제';
 return <>
  <Link to={hub}>← {hubName}</Link>
  <PageHeading eyebrow={`${domainLabels[k.domain]} · 핵심 근거 확인 ${fresh.verifiedAt??'날짜 미확인'}`} title={k.title} description={k.summary}/>
  <div className={s.actions}><SourceButton ids={k.sourceIds}/><BookmarkButton id={k.id} kind="knowledge"/><CompleteButton id={k.id}/><CardFreshnessBadge freshness={fresh}/></div>
  {k.id==='cloud-lifecycle'&&<LifecycleFlow/>}
  <div className={s.reading}>{k.sections.map((section,i)=><section className={s.readSection} key={section.label}><span className={s.eyebrow}>{String(i+1).padStart(2,'0')} · {claimLabel(section.type)}</span><h2>{section.label}</h2><p>{section.text}</p><SourceButton ids={section.sourceIds}/></section>)}</div>
  <SalesBlock sales={k.sales}/>
  {k.caveats.length>0&&<aside className={s.note}><strong>확인 범위와 추가 확인</strong><ul>{k.caveats.map(c=><li key={c}>{c}</li>)}</ul></aside>}
  <h2>출처</h2>
  <SourceRows ids={k.primarySourceIds} title="핵심 근거 (카드의 재확인 여부는 이 출처로 판단)"/>
  <SourceRows ids={k.sourceIds.filter(id=>!k.primarySourceIds.includes(id))} title="보조 근거 (개별 확인일 표시)"/>
  <h2>사례와 연습으로 연결</h2><Related caseIds={k.relatedCaseIds}/>
  <div className={s.actions}><Link to="/quiz">퀴즈 →</Link><Link to="/meeting">미팅 연습 →</Link></div>
 </>;
}

// ── 규제 타임라인 (금융 IT·규제 허브의 '변화' 탭 + 기존 /timeline 주소에서 redirect) ──
export function TimelineBody({ids}:{ids?:string[]}={}){
 return <div className={s.timeline}>{timeline.filter(t=>!ids||ids.includes(t.id)).map(t=><article id={t.id} key={t.id} className={s.card}><div className={s.row}><strong>{t.date}</strong><span className={s.badge}>{t.eventType} · {t.status}</span></div><h2>{t.title}</h2><p><b>이전</b> · {t.previous}</p><p><b>변화</b> · {t.change}</p><p><b>미팅 포인트</b> · {t.implication}</p><div className={s.actions}><SourceButton ids={t.sourceIds}/><Link to={`/knowledge/${t.knowledgeId}`}>배경 학습 →</Link></div></article>)}</div>;
}
export function Timeline(){
 return <><PageHeading eyebrow="REGULATION TIMELINE" title="무엇이, 언제 달라졌나요?" description="발표·가이드·시행을 구분합니다. 현재 상태는 표시된 출처에서 확인한 범위입니다."/><TimelineBody/></>;
}

// ── 국내 사업 사례 Library: 국내 금융사의 공개 사례만 (해외 Benchmark는 제품에서 다루지 않는다) ──
// 필터 옵션은 실제 사례에 있는 값만 만든다(0건 필터 없음). 얕은 사례는 Deep Case로 만들지 않고 시장 모판의 Initiative로 둔다.
const LIB_TYPES:CaseType[]=['PRODUCTION','DELIVERY','BUILDING','REGULATORY'];
function CaseLibrary(){
 const [industry,setIndustry]=useState('전체'),[csp,setCsp]=useState('전체'),[msp,setMsp]=useState('전체'),[deployment,setDeployment]=useState('전체'),[tech,setTech]=useState('전체'),[product,setProduct]=useState('전체'),[caseType,setCaseType]=useState('전체'),[year,setYear]=useState('전체'),[market,setMarket]=useState('전체');
 const domestic=cases.filter(c=>c.region==='KR'&&c.caseType!=='BENCHMARK');
 const eco=domestic.map(c=>({c,e:caseEcosystem(c)}));
 const marketOf=(id:string)=>institutions.find(i=>i.relatedCaseIds.includes(id))?.marketGroup;
 const yearOf=(d:string)=>/^\d{4}/.test(d)?d.slice(0,4):'미공개';
 const uniq=(a:string[])=>[...new Set(a)].sort((x,y)=>x.localeCompare(y,'ko'));
 const industryOpts=uniq(domestic.map(c=>c.industry)),cspOpts=uniq(eco.flatMap(x=>x.e.csp)),mspOpts=uniq(eco.flatMap(x=>x.e.msp)),deployOpts=uniq(domestic.flatMap(c=>c.deploymentModels)),techOpts=uniq(eco.flatMap(x=>x.e.tech)),productOpts=uniq([...ALWAYS_PRODUCTS,...eco.flatMap(x=>x.e.products)]);
 const typeOpts=LIB_TYPES.filter(t=>domestic.some(c=>c.caseType===t));
 const filtered=eco.filter(({c,e})=>(industry==='전체'||c.industry===industry)&&(csp==='전체'||e.csp.includes(csp))&&(msp==='전체'||e.msp.includes(msp))&&(deployment==='전체'||c.deploymentModels.includes(deployment as DeploymentModel))&&(tech==='전체'||e.tech.includes(tech))&&(product==='전체'||e.products.includes(product))&&(caseType==='전체'||c.caseType===caseType)&&(year==='전체'||yearOf(c.date)===year)&&(market==='전체'||marketOf(c.id)===market));
 const reset=()=>{setIndustry('전체');setCsp('전체');setMsp('전체');setDeployment('전체');setTech('전체');setProduct('전체');setCaseType('전체');setYear('전체');setMarket('전체')};
 const yearOpts=[...new Set(domestic.map(c=>yearOf(c.date)))].sort().reverse();
 const sel=(label:string,value:string,set:(v:string)=>void,opts:string[],suffix?:(o:string)=>string)=><label>{label}<select value={value} onChange={e=>set(e.target.value)}><option>전체</option>{opts.map(o=><option key={o} value={o}>{o}{suffix?.(o)??''}</option>)}</select></label>;
 return <>
  <PageHeading eyebrow="CASE LIBRARY" title="국내 금융 사업 사례, 공개된 범위만" description={`국내 금융사 ${domestic.length}개 프로젝트를 근거 시점과 단계로 구분합니다. 규제특례·지정은 구축 사례가 아니고, 구축 진행은 운영 사례가 아니며, MOU는 구축이 아니고, 수주는 구축 완료가 아닙니다.`}/>
  <div className={`${s.filters} ${s.compactFilters}`}>
   {sel('업권',industry,setIndustry,industryOpts)}{sel('CSP',csp,setCsp,cspOpts)}{sel('MSP/SI',msp,setMsp,mspOpts)}{sel('Deployment',deployment,setDeployment,deployOpts)}{sel('Technology',tech,setTech,techOpts)}
   {sel('Product',product,setProduct,productOpts,o=>eco.some(x=>x.e.products.includes(o))?'':' (공식 확인 사례 없음)')}
   <label>CaseType<select value={caseType} onChange={e=>setCaseType(e.target.value)}><option>전체</option>{typeOpts.map(t=><option key={t} value={t}>{caseTypeLabels[t]}</option>)}</select></label>
   {sel('연도',year,setYear,yearOpts)}
   <label title="제1·제2금융권은 시장에서 흔히 사용하는 관행적 구분이며, 법률상 공식 업권분류와 동일하지 않습니다.">금융권(시장관행)<select value={market} onChange={e=>setMarket(e.target.value)}><option>전체</option><option value="FIRST_FINANCIAL_SECTOR">제1금융권</option><option value="SECOND_FINANCIAL_SECTOR">제2금융권</option><option value="OTHER">기타</option></select></label>
   <button onClick={reset}>필터 초기화</button>
  </div>
  <p aria-live="polite">{filtered.length} / {domestic.length}개 사례</p>
  <div className={s.tableWrap}><table className={s.questionTable}>
   <thead><tr><th scope="col">고객 · 사례</th><th scope="col">CaseType · 단계</th><th scope="col">Deployment</th><th scope="col">CSP</th><th scope="col">MSP/SI</th><th scope="col">Technology · Product</th><th scope="col">근거 시점</th><th scope="col">Source</th></tr></thead>
   <tbody>{filtered.map(({c,e})=><tr key={c.id}>
    <th scope="row"><Link to={`/cases/${c.id}`}>{c.company}</Link><div className={s.muted}>{c.industry} · {c.title}</div></th>
    <td><span className={s.badge}>{caseTypeLabels[c.caseType]}</span><div className={s.muted}>{c.stage}{c.depth==='DEEP_DIVE'?' · Deep Dive':''}</div></td>
    <td>{c.deploymentModels.join(' · ')||<span className={s.muted}>미공개</span>}</td>
    <td>{e.csp.join(', ')||<span className={s.muted}>미공개</span>}</td><td>{e.msp.join(', ')||<span className={s.muted}>미공개</span>}</td>
    <td>{[...e.tech,...e.products].join(', ')||<span className={s.muted}>미공개</span>}</td>
    <td>{c.date}</td><td><SourceButton ids={c.sourceIds}/> <BookmarkButton id={c.id} kind="case"/></td></tr>)}</tbody>
  </table></div>
  {!filtered.length&&<div className={s.empty}>{product==='AIR Studio'?'AIR Studio를 직접 명시한 공개 금융 사례가 확인되지 않았습니다. Source에 직접 명시된 경우에만 태깅합니다.':'해당 조건의 검증 사례가 없습니다. 다른 필터를 선택해 주세요.'}</div>}
  <p className={s.muted}>Deep Case의 최소 요건(고객·Pain·Workload·Architecture 단서·Technology·단계·Security/Governance·Outcome 또는 목적·Source)에 못 미치는 사례는 이 목록이 아니라 <Link to="/cases">시장 모판</Link>의 Initiative로 둡니다.</p>
 </>;
}
// 금융 사례 = [시장 모판 | 국내 사업 사례]. 처음 들어오면 시장 모판이 먼저 보인다.
export function Cases(){
 const [params]=useSearchParams();const tab=params.get('tab')==='cases'||params.get('tab')==='library'?'cases':'board'; // 예전 ?tab=index · map 은 시장 모판
 return <>
  <TabNav label="금융 사례 탭" items={[{to:'/cases',label:'시장 모판',active:tab==='board'},{to:'/cases?tab=cases',label:'국내 사업 사례',active:tab==='cases'}]}/>
  {tab==='board'?<AccountMap/>:<CaseLibrary/>}
 </>;
}
export function CaseDetail(){
 const {id}=useParams();const c=cases.find(c=>c.id===id);
 if(!c)return <NotFound/>;
 const fields=([['CSP',c.csp],['AI Model',c.model],['주요 기술',c.technology],['규제·보안',c.security],['공개 Architecture',c.architecture],['구축사 / MSP / SI',c.partner],...(c.data?[['데이터',c.data] as const]:[]),...(c.outcome?[['성과',c.outcome] as const]:[])] as const);
 return <>
  <Link to="/cases?tab=cases">← 국내 사업 사례</Link>
  {institutions.filter(i=>i.relatedCaseIds.includes(c.id)).map(i=><p key={i.id}><Link to={`/cases/accounts/${i.id}`}>시장 모판에서 {i.name} 보기 →</Link></p>)}
  <PageHeading eyebrow={`${c.industry} · ${c.stage} · ${caseTypeLabels[c.caseType]}`} title={`${c.company} · ${c.title}`} description={c.problem}/>
  <div className={s.actions}><SourceButton ids={c.sourceIds}/><BookmarkButton id={c.id} kind="case"/></div>
  {c.caseType==='REGULATORY'&&<p className={s.note}><b>규제특례·지정 사실</b> · 혁신금융서비스 지정은 규제 특례의 시작이며 구축 완료나 상용 운영을 뜻하지 않습니다. 구축 레퍼런스로 설명하지 마세요.</p>}
  <section className={s.note}><b>단계 확인 · {c.date}</b><p>{c.stageNote}</p><SourceButton ids={c.stageSourceIds}/></section>
  <section className={s.card}><h2>FACT · 공개 정보</h2><dl className={s.facts}><div><dt>배포모델</dt><dd>{c.deploymentModels.join(' · ')||'미공개'}{c.deploymentSourceIds.length>0&&<SourceButton ids={c.deploymentSourceIds}/>}</dd></div>{fields.map(([label,f])=><div key={label}><dt>{label}</dt><dd>{f.value}{f.sourceIds.length>0&&<SourceButton ids={f.sourceIds}/>}</dd></div>)}</dl><p className={s.muted}>공개 Architecture의 서술은 출처가 공개한 범위입니다. 일반 학습용 패턴을 실제 고객 구조로 대신 표시하지 않습니다.</p></section>
  <div className={s.grid}><section className={s.card}><span className={s.eyebrow}>SALES_VIEW</span><h2>영업담당자가 배울 점</h2><p>{c.salesView}</p></section><section className={s.card}><span className={s.eyebrow}>MEETING</span><h2>고객 미팅에서 한 문장</h2><p>{c.meetingLine}</p></section></div>
  <SalesBlock sales={c.sales}/>
  <aside className={s.note}><b>미공개·확인 필요</b><ul>{c.caveats.map(x=><li key={x}>{x}</li>)}</ul></aside>
  <Related knowledgeIds={c.relatedKnowledgeIds}/>
 </>;
}

export function Search(){const [params,setParams]=useSearchParams();const query=params.get('q')??'';const results=searchContent(query);return <><PageHeading eyebrow="SEARCH" title="학습 내용을 연결해서 찾기" description="규제, 사례, 미팅 질문, 퀴즈를 한 번에 검색합니다."/><label className={s.searchLabel}>검색어<input autoFocus type="search" value={query} placeholder="예: 연구개발망, Bedrock, 삼성카드" onChange={e=>setParams({q:e.target.value},{replace:true})}/></label><p aria-live="polite">{query.trim()?`${results.length}개 결과`:'검색어를 입력해 주세요.'}</p><div className={s.grid}>{results.map(r=><Link className={s.card} key={r.id} to={r.path}><span className={s.badge}>{r.kind}</span><h3>{r.title}</h3><span>내용 열기 →</span></Link>)}</div>{query.trim()&&!results.length&&<p className={s.empty}>일치하는 내용이 없습니다.</p>}</>}
export function Bookmarks(){
 const {state}=useApp();
 return <>
  <PageHeading eyebrow="BOOKMARKS" title="저장한 학습" description="이 브라우저에 저장한 카드, 사례, 관심계정입니다."/>
  {!state.bookmarks.length&&<p className={s.empty}>카드의 ☆ 북마크 버튼으로 저장해 보세요.</p>}
  <div className={s.grid}>{state.bookmarks.map(b=>{
   const item=b.kind==='case'?cases.find(x=>x.id===b.contentId):b.kind==='institution'?institutions.find(x=>x.id===b.contentId):knowledge.find(x=>x.id===b.contentId);
   const path=b.kind==='case'?`/cases/${b.contentId}`:b.kind==='institution'?`/cases/accounts/${b.contentId}`:`/knowledge/${b.contentId}`;
   if(!item)return null;
   const name='name' in item?item.name:'company' in item?`${item.company} · ${item.title}`:item.title;
   return <article className={s.card} key={`${b.kind}-${b.contentId}`}>{b.kind==='institution'&&<span className={s.badge}>관심계정</span>}<Link to={path}><h2>{name}</h2></Link><BookmarkButton id={b.contentId} kind={b.kind}/></article>;
  })}</div>
 </>;
}

// ── 출처·이용 안내: 자료별 검증일 목록(#sources)을 포함한다 ──
export function About(){
 const rows=[...sources].sort((a,b)=>a.lastVerifiedAt.localeCompare(b.lastVerifiedAt));
 return <>
  <PageHeading eyebrow="SOURCE & TRUST" title="근거를 확인하는 학습" description="FSI Cloud & AX Coach · V2 (16일 과정 구조)"/>
  <section className={s.card}><h2>출처와 해석을 구분합니다</h2>
   <p>FACT는 공개된 사실, INTERPRETATION은 학습용 해석, ARCHITECTURE_GUIDE는 금융 요구사항을 기술 구성에 연결하는 교육용 분석(법적 의무가 아님), SALES_VIEW는 영업 관점, MEETING은 설명 연습입니다. VERIFIED는 연결된 출처를 확인했다는 뜻이며 모든 필드가 공개됐거나 최신 운영 상태를 보증한다는 뜻은 아닙니다.</p>
   <p>Tier A는 규제·공공기관, B는 금융사·공급사 공식 자료, C는 전문언론, D는 탐색용 자료입니다. 법률자문이나 규제 충족 자동 판정을 제공하지 않습니다.</p>
   <p>원본 PDF와 개인 자료는 앱에 번들링하지 않습니다. 학습 기록은 localStorage에 저장되며 서버 전송·로그인·LLM API를 사용하지 않습니다.</p>
   <p>16일 과정의 구조는 준비되어 있으며, 각 Day의 본문은 근거 확인을 거쳐 단계적으로 추가됩니다. 본문이 없는 Day는 &lsquo;작성 중&rsquo;으로 표시합니다.</p>
  </section>
  <section className={s.card} id="sources"><h2>자료별 검증일</h2>
   <p>모든 자료를 같은 날 확인한 것으로 표시하지 않습니다. 자료마다 발행일·시행일·확인일을 따로 기록하고, 확인 후 일정 기간이 지나면 <b>재확인 필요</b>로 표시합니다. 이는 자료가 틀렸다는 뜻이 아니라 다시 확인할 때가 됐다는 뜻입니다.</p>
   <p className={s.muted}>재확인 기준: {(Object.keys(RECHECK_AFTER_DAYS) as (keyof typeof RECHECK_AFTER_DAYS)[]).map(k=>`${sourceKindLabels[k]} ${RECHECK_AFTER_DAYS[k]}일`).join(' · ')} · 역사자료는 재확인 경고 대신 &lsquo;역사자료&rsquo;로 표시</p>
   <div className={s.tableWrap}><table className={s.sourceTable}><thead><tr><th>자료</th><th>종류·등급</th><th>상태</th><th>발행</th><th>시행</th><th>확인</th><th>재확인</th></tr></thead><tbody>{rows.map(x=>{const f=freshnessOf(x);return <tr key={x.id}><td><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title}</a></td><td>{sourceKindLabels[x.kind]} · Tier {x.tier}</td><td>{sourceStatusLabels[x.status]}</td><td>{x.publishedAt??'미공개'}</td><td>{x.effectiveAt===null?'공식 Source 미확인':x.effectiveAt??'해당 없음'}</td><td>{x.lastVerifiedAt}</td><td className={f.state==='RECHECK'?s.recheck:undefined}>{freshnessLabel(f)}</td></tr>})}</tbody></table></div>
  </section>
 </>;
}
export function NotFound(){return <><PageHeading eyebrow="404" title="페이지를 찾을 수 없습니다" description="주소를 확인하거나 16일 학습에서 다시 시작해 주세요."/><Link to="/learn">16일 학습으로 →</Link></>}
