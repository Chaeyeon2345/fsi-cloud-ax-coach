import {useEffect,useRef,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {cases,institutions,sources} from '../content';
import {ALWAYS_PRODUCTS,institutionEcosystem} from '../domain/ecosystem';
import {assetRanks,chipsFor,evidenceSummary,officialSourceShare,formatWon,sourceSupports,SOURCE_CATEGORIES,initiativeYear,isHistoricalInitiative,leaderNeedsRecheck,publicOrganizations,scaleText,sortForDisplay,sortSourcesByType,disclosedPartners,byLatest,latestInitiative,RECENT_YEARS} from '../domain/accounts';
import {freshnessLabel,freshnessOf} from '../domain/freshness';
import {displaySectorLabels,displaySectorOf,displaySectors,initiativeStatusLabels,itDomainLabels,itDomainScope,itDomains,marketGroupLabels,regulatoryCategories,researchCoverageLabels,researchCoverages,sourceTypeLabels,sourceTypes,type FinancialInstitution,type InstitutionInitiative,type ITFootprintDomain,type PublicLeaderReference} from '../domain/types';
import {accountDiscovery} from '../features/accountDiscovery';
import {readAccountNotes,writeAccountNote} from '../storage/persistence';
import {BookmarkButton,PageHeading} from '../components/Common';
import {useApp} from '../app/Context';
import s from '../styles/App.module.css';

export const INDEX_NAME='금융시장 IT·AX Index';
const NO_PUBLIC='공개 확인자료 없음 / 추가 조사 필요';
const regulatoryLabels:Record<(typeof regulatoryCategories)[number],string>={BANKING:'은행업',CAPITAL_MARKET:'금융투자업',INSURANCE:'보험업',NON_BANK:'비은행 금융업',OTHER:'기타'};
const MATRIX_DOMAINS:ITFootprintDomain[]=['CORE_ONPREM','PUBLIC_CLOUD','DATA','AI_AX','SECURITY_DR'];

// ── 사업 상세 Drawer: Chip을 눌렀을 때 외부 사이트로 바로 가지 않고 이 Drawer를 먼저 연다. 원문 링크는 여기서 한 번 더 클릭해 연다. ──
function InitiativeDrawer({initiative,institution,onClose}:{initiative:InstitutionInitiative|null;institution?:FinancialInstitution;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const d=ref.current;if(!d)return;if(initiative&&!d.open)d.showModal();if(!initiative&&d.open)d.close();},[initiative]);
 const i=initiative;const src=i?sortSourcesByType(sources.filter(x=>i.sourceIds.includes(x.id))):[];
 const none=<span className={s.muted}>{NO_PUBLIC}</span>;
 const list=(v?:string[])=>v?.length?v.join(', '):none;
 return <dialog ref={ref} className={s.drawer} aria-labelledby="initiative-title" onCancel={onClose} onClose={onClose}>
  {i&&<>
   <div className={s.row}><h2 id="initiative-title">{i.title}</h2><button onClick={onClose} aria-label="사업 상세 닫기">닫기</button></div>
   <p className={s.muted}>{institution?.name}{i.domains.length?` · ${i.domains.map(d=>itDomainLabels[d]).join(' · ')}`:''}</p>
   <dl className={s.facts}>
    <div><dt>발표·공개일</dt><dd>{i.announcedAt??'날짜 미공개'}</dd></div>
    <div><dt>공개된 단계</dt><dd>{i.sourceStage?initiativeStatusLabels[i.sourceStage]:<span className={s.muted}>원문에 단계 명시 없음</span>}</dd></div>
    {i.stageEvidenceQuote&&<div><dt>단계 근거(재검증 {i.stageReviewedAt})</dt><dd>“{i.stageEvidenceQuote}”</dd></div>}
    <div><dt>사업 내용</dt><dd>{i.summary}</dd></div>
    <div><dt>사업 목적</dt><dd>{i.businessPurpose??none}</dd></div>
    <div><dt>적용 업무</dt><dd>{list(i.workloads)}</dd></div>
    <div><dt>대상 사용자</dt><dd>{list(i.targetUsers)}</dd></div>
    <div><dt>보안·거버넌스 포인트</dt><dd>{list(i.securityGovernancePoints)}</dd></div>
    <div><dt>배포 모델</dt><dd>{list(i.deploymentModels)}</dd></div>
    <div><dt>기술 키워드(원문 기재)</dt><dd>{list(i.technologyKeywords)}</dd></div>
    <div><dt>공개된 CSP</dt><dd>{list(i.cspVendors)}</dd></div>
    <div><dt>공개된 Vendor</dt><dd>{list(i.technologyVendors)}</dd></div>
    <div><dt>공개된 MSP·SI</dt><dd>{list(i.mspSiPartners)}</dd></div>
    <div><dt>공개 추진부서</dt><dd>{i.ownerDepartments?.length?i.ownerDepartments.map(o=>o.name).join(', '):none}</dd></div>
    <div><dt>공개 책임자</dt><dd>{i.publicLeaders?.length?i.publicLeaders.map(l=>`${l.personName} ${l.title}${l.asOfDate?` (${l.asOfDate} 기준)`:''}`).join(', '):none}</dd></div>
    <div><dt>공개 성과</dt><dd>{list(i.businessOutcome)}</dd></div>
    <div><dt>관련 내부 Case</dt><dd>{i.relatedCaseIds.length?i.relatedCaseIds.map(id=>{const c=cases.find(x=>x.id===id);return <Link key={id} to={`/cases/${id}`} onClick={onClose}>{c?.title??id} </Link>}):none}</dd></div>
   </dl>
   {(i.amTakeaway||i.discoveryQuestions?.length)&&<div className={s.salesBlock}><span className={s.eyebrow}>SALES_VIEW</span>
    <p className={s.note}>영업 관점의 해석과 질문입니다. 공개 사실이나 Source의 주장이 아닙니다.</p>
    {i.amTakeaway&&<p><b>AM Takeaway</b> · {i.amTakeaway}</p>}
    {i.discoveryQuestions?.length?<><b>다음 고객에게 물어볼 질문</b><ul>{i.discoveryQuestions.map(q=><li key={q}>{q}</li>)}</ul></>:null}
   </div>}
   <h3>근거 Source (금융회사 공식 → 금융당국·공시 → 공식 CSP·MSP·SI → 협회 → 전문언론 순)</h3>
   <ul className={s.sourceRows}>{src.map(x=><li key={x.id}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title} ↗</a> <span className={s.badge}>{sourceTypeLabels[x.sourceType??'OTHER']}</span> <span className={s.muted}>{x.publisher} · 확인 {x.lastVerifiedAt}</span></li>)}</ul>
   <p className={s.muted}>단계·기술·Vendor·조직은 위 Source가 말한 것만 적습니다. 원문에 없는 내용은 추정하지 않습니다.</p>
  </>}
 </dialog>;
}

// People Drawer: 이름·직책·조직·담당 Scope·기준일·CURRENT/HISTORICAL·Source URL. 과거 정보는 현재처럼 보이지 않게 HISTORICAL로 표시한다.
function PeopleDrawer({person,institution,onClose}:{person:PublicLeaderReference|null;institution?:FinancialInstitution;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const d=ref.current;if(!d)return;if(person&&!d.open)d.showModal();if(!person&&d.open)d.close();},[person]);
 const src=person?sortSourcesByType(sources.filter(x=>person.sourceIds.includes(x.id))):[];
 return <dialog ref={ref} className={s.drawer} aria-labelledby="person-title" onCancel={onClose} onClose={onClose}>
  {person&&<><div className={s.row}><h2 id="person-title">{person.personName}</h2><button onClick={onClose} aria-label="닫기">닫기</button></div>
   <p>{institution?.name} · {person.title}</p>
   <dl className={s.facts}>
    <div><dt>조직</dt><dd>{person.department??'—'}</dd></div><div><dt>담당 Scope</dt><dd>{person.scope??'—'}</dd></div>
    <div><dt>기준일</dt><dd>{person.asOfDate??'—'}</dd></div>
    <div><dt>상태</dt><dd>{person.historical?<span className={s.badge}>HISTORICAL · 해당 시점의 직책</span>:<span className={s.badge}>CURRENT</span>}{leaderNeedsRecheck(person)&&<span className={s.recheckBadge}>재확인 필요</span>} <span className={s.muted}>확인일 {person.lastVerifiedAt}</span></dd></div>
   </dl>
   <h3>Source</h3>
   <ul className={s.sourceRows}>{src.map(x=><li key={x.id}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title} ↗</a> <span className={s.badge}>{sourceTypeLabels[x.sourceType??'OTHER']}</span> <span className={s.muted}>{x.publisher}</span></li>)}</ul>
   <p className={s.muted}>공개 Source에서 확인된 직책만 저장합니다. 개인 연락처는 수집하지 않습니다.</p></>}
 </dialog>;
}

function Chips({inst,domain,open}:{inst:FinancialInstitution;domain:ITFootprintDomain;open:(i:InstitutionInitiative)=>void}){
 const chips=chipsFor(inst,domain);
 if(!chips.length)return <span className={s.muted} aria-label={NO_PUBLIC}>·</span>;
 return <span className={s.chips}>{chips.slice(0,3).map(c=><button key={c.initiative.id+domain} className={s.chip} onClick={()=>open(c.initiative)} title={c.initiative.title}>{c.label}</button>)}{chips.length>3&&<Link className={s.chip} to={`/cases/accounts/${inst.id}`}>+{chips.length-3}</Link>}</span>;
}

// ── 시장 모판 (금융시장 IT·AX Index) ──
const MARKET_THEMES:ITFootprintDomain[]=['CORE_ONPREM','PUBLIC_CLOUD','DATA','AI_AX','SECURITY_DR'];
// Board의 Keyman: 현재 확인된(공식 현재 페이지) 인물만 최대 1명. 과거 보도 기반 직책은 현재 인물처럼 보이지 않게 숨기고 건수만 알린다.
const KEY_ROLE=/AX|AI|디지털|DT|데이터/;
function keymanOf(inst:FinancialInstitution){
 const current=inst.publicLeaders.filter(l=>!l.historical);
 const pick=current.find(l=>KEY_ROLE.test(l.title+l.department))??current[0];
 return {pick,past:inst.publicLeaders.filter(l=>l.historical).length};
}
// 최근 근거: 가장 최근 사업의 공개일과 그 근거 중 우선순위가 가장 높은 출처 등급
function latestEvidence(inst:FinancialInstitution){
 const last=latestInitiative(inst);
 if(!last)return null;
 const types=sortSourcesByType(sources.filter(x=>last.sourceIds.includes(x.id)));
 return {date:last.announcedAt??'날짜 미공개',type:types[0]?.sourceType?sourceTypeLabels[types[0].sourceType]:'—',title:last.title};
}
function EcosystemChips({inst}:{inst:FinancialInstitution}){
 const e=institutionEcosystem(inst);
 const items=[...e.csp,...e.msp,...e.products,...e.vendors].filter((x,n,a)=>a.indexOf(x)===n);
 if(!items.length)return <span className={s.muted} aria-label={NO_PUBLIC}>·</span>;
 return <span className={s.chips}>{items.slice(0,4).map(x=><span className={s.chip} key={x}>{x}</span>)}{items.length>4&&<Link className={s.chip} to={`/cases/accounts/${inst.id}`}>+{items.length-4}</Link>}</span>;
}
// 시장 모판은 163개사를 매번 다시 계산하지 않도록 한 번만 만든다 (필터 변경 때마다 재계산하면 느려진다).
const ECO=new Map(institutions.map(i=>[i.id,institutionEcosystem(i)]));
const SORTED=sortForDisplay(institutions);
const RANKS=assetRanks(institutions);
const SRC_TYPES=new Map(institutions.map(i=>[i.id,new Set(i.initiatives.flatMap(x=>x.sourceIds).map(id=>sources.find(s=>s.id===id)?.sourceType??'OTHER'))]));
const uniqSorted=(a:string[])=>[...new Set(a)].sort((x,y)=>x.localeCompare(y,'ko'));
const CSP_OPTS=uniqSorted([...ECO.values()].flatMap(e=>e.csp)),MSP_OPTS=uniqSorted([...ECO.values()].flatMap(e=>e.msp)),DEPLOY_OPTS=uniqSorted([...ECO.values()].flatMap(e=>e.deployments));
const PRODUCT_OPTS=[...new Set([...ALWAYS_PRODUCTS,...uniqSorted([...ECO.values()].flatMap(e=>e.products))])];
const EVIDENCE_TYPES=sourceTypes.filter(x=>[...SRC_TYPES.values()].some(s=>s.has(x)));
export function AccountMap(){
 const {state}=useApp();
 const [q,setQ]=useState(''),[sector,setSector]=useState('전체'),[market,setMarket]=useState('전체'),[csp,setCsp]=useState('전체'),[msp,setMsp]=useState('전체'),[deploy,setDeploy]=useState('전체'),[theme,setTheme]=useState('전체'),[product,setProduct]=useState('전체'),[evidence,setEvidence]=useState('전체'),[coverage,setCoverage]=useState('전체'),[watch,setWatch]=useState(false);
 const [drawer,setDrawer]=useState<{initiative:InstitutionInitiative;institution:FinancialInstitution}|null>(null);
 const [person,setPerson]=useState<{p:PublicLeaderReference;i:FinancialInstitution}|null>(null);
 const watched=new Set(state.bookmarks.filter(b=>b.kind==='institution').map(b=>b.contentId));
 const productCount=(p:string)=>[...ECO.values()].filter(e=>e.products.includes(p)).length;
 const ranks=RANKS;
 const words=q.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 const filtered=SORTED.filter(i=>{
  const e=ECO.get(i.id)!;
  return (sector==='전체'||displaySectorOf[i.sector]===sector)&&(market==='전체'||i.marketGroup===market)&&(csp==='전체'||e.csp.includes(csp))&&(msp==='전체'||e.msp.includes(msp))&&(deploy==='전체'||e.deployments.includes(deploy))&&
   (theme==='전체'||e.themes.includes(theme as ITFootprintDomain))&&(product==='전체'||e.products.includes(product))&&
   (evidence==='전체'||SRC_TYPES.get(i.id)!.has(evidence as never))&&(coverage==='전체'||i.researchCoverage===coverage)&&(!watch||watched.has(i.id))&&
   words.every(w=>(i.name+' '+(i.financialGroup??'')+' '+i.initiatives.map(x=>x.title+' '+x.technologyKeywords.join(' ')).join(' ')+' '+[...e.csp,...e.msp,...e.products,...e.vendors].join(' ')).toLocaleLowerCase().includes(w));
 });
 const reset=()=>{setQ('');setSector('전체');setMarket('전체');setCsp('전체');setMsp('전체');setDeploy('전체');setTheme('전체');setProduct('전체');setEvidence('전체');setCoverage('전체');setWatch(false)};
 const open=(initiative:InstitutionInitiative,institution:FinancialInstitution)=>setDrawer({initiative,institution});
 const scaled=institutions.filter(i=>i.scale?.totalAssets!=null).length;
 const firstOfSector=(i:FinancialInstitution,n:number)=>n===0||displaySectorOf[filtered[n-1].sector]!==displaySectorOf[i.sector];
 return <>
  <PageHeading eyebrow="MARKET BOARD" title={INDEX_NAME} description="금융시장을 한 화면에 펼쳐 업권별 회사, 규모, 공개된 On-prem·Cloud·Data·AI·보안 사업과 생태계(CSP·MSP/SI·Product), 근거를 비교합니다."/>
  <p className={s.note}><b>읽는 법</b> · 점수나 등급 없이 공개된 사실과 근거만 보여줍니다. <b>“{NO_PUBLIC}”은 사업이 없다는 뜻이 아닙니다.</b> 업권은 영업 학습 순서이며 공식 인허가 분류와 다릅니다. 같은 업권 안에서 총자산 순으로 정렬하고(확보 {scaled}/{institutions.length}개사) 순위는 같은 재무기준·기준일일 때만 표시하며 Index 수록 회사 기준입니다. 칩의 단계(PoC·운영 등)는 원문이 말한 경우에만 붙습니다. Keyman은 공식 현재 페이지로 확인된 경우만 표시합니다.</p>
  <div className={`${s.filters} ${s.compactFilters}`}>
   <label>검색<input type="search" value={q} placeholder="회사·그룹·사업·기술·파트너" onChange={e=>setQ(e.target.value)}/></label>
   <label>업권<select value={sector} onChange={e=>setSector(e.target.value)}><option>전체</option>{displaySectors.map(x=><option key={x} value={x}>{displaySectorLabels[x]}</option>)}</select></label>
   <label title="제1·제2금융권은 시장에서 흔히 사용하는 관행적 구분이며, 법률상 공식 업권분류와 동일하지 않습니다.">금융권(시장관행)<select value={market} onChange={e=>setMarket(e.target.value)}><option>전체</option>{(['FIRST_FINANCIAL_SECTOR','SECOND_FINANCIAL_SECTOR','OTHER'] as const).map(x=><option key={x} value={x}>{marketGroupLabels[x]}</option>)}</select></label>
   <label>CSP<select value={csp} onChange={e=>setCsp(e.target.value)}><option>전체</option>{CSP_OPTS.map(x=><option key={x}>{x}</option>)}</select></label>
   <label>MSP/SI<select value={msp} onChange={e=>setMsp(e.target.value)}><option>전체</option>{MSP_OPTS.map(x=><option key={x}>{x}</option>)}</select></label>
   <label>Deployment<select value={deploy} onChange={e=>setDeploy(e.target.value)}><option>전체</option>{DEPLOY_OPTS.map(x=><option key={x}>{x}</option>)}</select></label>
   <label>IT Theme<select value={theme} onChange={e=>setTheme(e.target.value)}><option>전체</option>{itDomains.filter(d=>d!=='OTHER').map(x=><option key={x} value={x}>{itDomainLabels[x]}</option>)}</select></label>
   <label>Product<select value={product} onChange={e=>setProduct(e.target.value)}><option>전체</option>{PRODUCT_OPTS.map(x=><option key={x} value={x}>{x}{productCount(x)===0?' (공식 확인 사례 없음)':''}</option>)}</select></label>
   <label>Evidence Type<select value={evidence} onChange={e=>setEvidence(e.target.value)}><option value="전체">전체</option>{EVIDENCE_TYPES.map(x=><option key={x} value={x}>{sourceTypeLabels[x]}</option>)}</select></label>
   <label>조사수준<select value={coverage} onChange={e=>setCoverage(e.target.value)}><option>전체</option>{researchCoverages.map(x=><option key={x} value={x}>{researchCoverageLabels[x]}</option>)}</select></label>
   <label className={s.checkLabel}><input type="checkbox" checked={watch} onChange={e=>setWatch(e.target.checked)}/> 관심계정만</label>
   <button onClick={reset}>필터 초기화</button>
  </div>
  <p aria-live="polite">{filtered.length} / {institutions.length}개 금융회사</p>
  <div className={`${s.tableWrap} ${s.indexTableWrap}`}><table className={s.indexTable}>
   <thead><tr>
    <th scope="col" className={s.st1}>업권</th><th scope="col" className={s.st3}>회사</th><th scope="col" className={s.st4} title="별도 재무상태표 자산총계. #은 Index 수록 회사 중 같은 업권 내 순위(같은 재무기준·기준일일 때만)입니다.">총자산</th><th scope="col" className={s.st5}>본사 지역</th>
    <th scope="col" className={s.st2}>공개 Keyman</th>
    {MARKET_THEMES.map(d=><th scope="col" key={d} title={itDomainScope[d]}>{itDomainLabels[d]}</th>)}<th scope="col">Ecosystem</th><th scope="col">최근 Initiative</th>
   </tr></thead>
   <tbody>{filtered.map((i,n)=>{const rank=ranks.get(i.id);const key=keymanOf(i);const ev=latestEvidence(i);return <tr key={i.id}>
    <td className={s.st1}>{firstOfSector(i,n)?<b>{displaySectorLabels[displaySectorOf[i.sector]]}</b>:''}{i.subSector&&<div className={s.muted}>{i.subSector}</div>}</td>
    <th scope="row" className={s.st3}><Link to={`/cases/accounts/${i.id}`}>{i.name}</Link>{i.financialGroup&&<div className={s.muted}>{i.financialGroup}</div>}</th>
    <td className={s.st4}>{scaleText(i)}{rank!=null&&<span className={s.muted}> · 수록사 내 {rank}위</span>}</td>
    <td className={s.st5}>{i.headOffice?`${i.headOffice.region}${i.headOffice.district?` ${i.headOffice.district}`:''}`:<span className={s.muted}>미확인</span>}</td>
    <td className={s.st2}>{key.pick?<><button className={s.linkButton} onClick={()=>setPerson({p:key.pick!,i})}>{key.pick.personName}</button><div className={s.muted}>{key.pick.title}</div></>:<span className={s.muted}>공개 확인자료 없음{key.past>0&&<> · 과거 보도 {key.past}명</>}</span>}</td>
    {i.initiatives.length===0?<td colSpan={5} className={s.muted}>{NO_PUBLIC}</td>:MARKET_THEMES.map(d=><td key={d}><Chips inst={i} domain={d} open={x=>open(x,i)}/></td>)}
    <td><EcosystemChips inst={i}/></td>
    <td>{ev?<>{ev.title.length>34?`${ev.title.slice(0,33)}…`:ev.title}<div className={s.muted}>{ev.date} · {ev.type}</div></>:'—'}</td>
   </tr>})}</tbody>
  </table></div>
  <div className={s.indexCards} aria-label="모바일 카드 목록">{filtered.map(i=><article className={s.card} key={i.id}>
   <p className={s.muted}>{displaySectorLabels[displaySectorOf[i.sector]]}{i.subSector?` · ${i.subSector}`:''}{i.headOffice?` · ${i.headOffice.region}`:''}</p>
   <h2><Link to={`/cases/accounts/${i.id}`}>{i.name}</Link></h2>
   <p className={s.muted}>총자산 {scaleText(i)}{keymanOf(i).pick?` · Keyman ${keymanOf(i).pick!.personName}`:''}</p>
   {i.initiatives.length===0?<p className={s.muted}>{NO_PUBLIC}</p>:MARKET_THEMES.filter(d=>chipsFor(i,d).length).map(d=><div key={d}><b>{itDomainLabels[d]}</b> <Chips inst={i} domain={d} open={x=>open(x,i)}/></div>)}
   <EcosystemChips inst={i}/>
  </article>)}</div>
  {!filtered.length&&<div className={s.empty}>{product==='AIR Studio'?'AIR Studio를 직접 명시한 공개 금융 사례가 확인되지 않았습니다. Source에 직접 명시된 경우에만 태깅합니다.':'조건에 맞는 금융회사가 없습니다. 필터를 바꿔 보세요.'}</div>}
  <InitiativeDrawer initiative={drawer?.initiative??null} institution={drawer?.institution} onClose={()=>setDrawer(null)}/>
  <PeopleDrawer person={person?.p??null} institution={person?.i} onClose={()=>setPerson(null)}/>
 </>;
}

// 내 메모: 이 브라우저(localStorage)에만 저장한다. 공개 Seed 데이터에 포함되지 않으며 Source가 필요 없는 개인 영업 메모다.
function AccountMemo({id}:{id:string}){
 const [text,setText]=useState(()=>readAccountNotes(window.localStorage)[id]??'');
 return <section className={s.card}><h2>11. 내 메모</h2>
  <p className={s.muted}>개인 영업 메모입니다. 이 브라우저에만 저장되며 공개 데이터에 포함되지 않습니다. 근거(Source)가 필요 없습니다.</p>
  <textarea aria-label="내 메모" rows={5} value={text} placeholder="고객 Pain, 관계자, 다음 미팅, Opportunity idea, Next action 등" onChange={e=>{setText(e.target.value);writeAccountNote(window.localStorage,id,e.target.value)}}/>
 </section>;
}

// ── 금융회사 Account Overview ──
export function AccountDetail(){
 const {id}=useParams();const inst=institutions.find(x=>x.id===id);
 const [drawer,setDrawer]=useState<InstitutionInitiative|null>(null);
 if(!inst)return <><PageHeading eyebrow="404" title="금융회사를 찾을 수 없습니다" description={`${INDEX_NAME}에서 다시 선택해 주세요.`}/><Link to="/cases">← {INDEX_NAME}</Link></>;
 const timeline=[...inst.initiatives].sort(byLatest);
 const partners=disclosedPartners(inst);
 const eco=institutionEcosystem(inst);
 const discovery=accountDiscovery(inst);
 const relatedCases=cases.filter(c=>inst.relatedCaseIds.includes(c.id));
 const sum=evidenceSummary(inst);
 const share=officialSourceShare(inst,sources);
 const supports=sourceSupports(inst);
 const rank=assetRanks(institutions).get(inst.id);
 const leaders=[...inst.publicLeaders,...inst.initiatives.flatMap(i=>i.publicLeaders??[])];
 const orgs=[...inst.ownerDepartments,...inst.initiatives.flatMap(i=>(i.ownerDepartments??[]).map(o=>({...o,title:i.title})))];
 const src=sortSourcesByType(sources.filter(x=>inst.sourceIds.includes(x.id)));
 const years=[...RECENT_YEARS,'HISTORICAL','NODATE'];
 const yearOf=(i:InstitutionInitiative)=>!i.announcedAt?'NODATE':isHistoricalInitiative(i)?'HISTORICAL':initiativeYear(i)!;
 const yearLabel=(y:string)=>y==='HISTORICAL'?'2023 이전 (역사자료)':y==='NODATE'?'날짜 미공개':y;
 const none=<p className={s.muted}>{NO_PUBLIC}. 공개자료가 확인되지 않은 것이며 해당 사실이 없다는 뜻이 아닙니다.</p>;
 return <>
  <Link to="/cases">← {INDEX_NAME}</Link>
  <PageHeading eyebrow={`${displaySectorLabels[displaySectorOf[inst.sector]]}${inst.subSector?` · ${inst.subSector}`:''}${inst.financialGroup?` · ${inst.financialGroup}`:''}`} title={inst.name} description={`조사 수준: ${researchCoverageLabels[inst.researchCoverage]} (우리 DB의 조사 정도이며 회사의 디지털 성숙도가 아닙니다)`}/>
  <div className={s.actions}><BookmarkButton id={inst.id} kind="institution" label="☆ 관심계정"/></div>
  <section className={s.card}><h2>Evidence Summary</h2>
   <dl className={s.facts}>
    <div><dt>공개 IT·AX Initiative</dt><dd>{sum.total}건</dd></div>
    {MATRIX_DOMAINS.map(d=><div key={d}><dt>{itDomainLabels[d]}</dt><dd>{sum.byDomain[d]}건</dd></div>)}
    {sum.byDomain.OTHER>0&&<div><dt>기타</dt><dd>{sum.byDomain.OTHER}건</dd></div>}
    <div><dt>공식 출처 비중</dt><dd>{share.total?`${share.official} / ${share.total} (${Math.round(share.official*100/share.total)}%)`:'—'}</dd></div>
    <div><dt>마지막 확인일</dt><dd>{sum.lastVerifiedAt??'—'}</dd></div>
    <div><dt>조사 수준</dt><dd>{researchCoverageLabels[inst.researchCoverage]}{inst.dbResearchPriority&&<span className={s.badge}>DB 심층조사 대상</span>}</dd></div>
   </dl>
   <p className={s.muted}>점수나 등급이 아니라 공개 사실의 개수입니다. 한 사업이 여러 영역에 걸치면 각 영역에 중복 집계됩니다. 공식 출처 비중은 금융회사·금융당국·공시·공식 CSP/MSP/SI·협회 자료의 비율이며 전문언론은 제외합니다. “DB 심층조사 대상”은 우리 DB의 조사 우선순위이며 영업 공략 우선순위가 아닙니다.</p>
  </section>

  <section className={s.card}><h2>1. 회사 기본정보</h2>
   <dl className={s.facts}>
    <div><dt>본사 소재지</dt><dd>{inst.headOffice?<>{inst.headOffice.region}{inst.headOffice.district?` ${inst.headOffice.district}`:''}<span className={s.muted}> · DART 기준{inst.headOffice.note?` (${inst.headOffice.note})`:''}</span></>:'미확인'}</dd></div>
    <div><dt>공식 홈페이지</dt><dd>{inst.website?<a href={inst.website} target="_blank" rel="noopener noreferrer">{inst.website} ↗</a>:'미확인'}</dd></div>
    <div><dt>회사 명부 근거</dt><dd>{inst.universeSourceId?sources.find(x=>x.id===inst.universeSourceId)?.title:'명부로 확인하지 못함'}{inst.rosterNote&&<span className={s.muted}> · {inst.rosterNote}</span>}</dd></div>
    <div><dt>우선순위</dt><dd>{inst.priorityTier??'미지정'}</dd></div>
    <div><dt>최근 조사일</dt><dd>{inst.lastResearchedAt??'—'}</dd></div>
   </dl>
  </section>

  <section className={s.card}><h2>2. 업권 · 금융그룹</h2>
   <dl className={s.facts}>
    <div><dt>업권(화면 순서 기준)</dt><dd>{displaySectorLabels[displaySectorOf[inst.sector]]}{inst.subSector?` · ${inst.subSector}`:''}</dd></div>
    <div><dt>공식 인허가 대분류(참고)</dt><dd>{regulatoryLabels[inst.regulatoryCategory]}</dd></div>
    <div><dt>시장관행 태그</dt><dd>{marketGroupLabels[inst.marketGroup]} <span className={s.muted}>(법적 업권 분류가 아님)</span></dd></div>
    <div><dt>금융그룹</dt><dd>{inst.financialGroup??'미확인'}</dd></div>
   </dl>
   <p className={s.muted}>금융그룹과 개별 금융회사는 다른 Entity이며 규모를 같은 순위표에 섞지 않습니다.</p>
  </section>

  <section className={s.card}><h2>3. 규모 및 순위</h2>
   <dl className={s.facts}>
    <div><dt>총자산</dt><dd>{scaleText(inst)}</dd></div>
    <div><dt>재무기준</dt><dd>{inst.scale?.assetBasis??'미확보'}</dd></div>
    <div><dt>업권 내 순위</dt><dd>{rank??'미확보'}</dd></div>
    {inst.scale?.secondaryScaleMetric&&<div><dt>{inst.scale.secondaryScaleMetric.label}</dt><dd>{formatWon(inst.scale.secondaryScaleMetric.value,inst.scale.secondaryScaleMetric.unit)} ({inst.scale.secondaryScaleMetric.asOf})</dd></div>}
   </dl>
   {inst.scale?.totalAssets==null&&<p className={s.muted}>동일 기준의 공식 규모 자료(FISIS·DART·경영공시)를 아직 확보하지 못해 값과 순위를 비워 두었습니다. 추정하지 않습니다.</p>}
  </section>

  <section className={s.card} id="keyman"><h2>4. 공개 조직 · IT·AX 책임자</h2>
   <h3>추진조직</h3>
   {orgs.length?<ul>{orgs.map((o,n)=><li key={o.name+n}><b>{o.name}</b>{'title' in o&&<span className={s.muted}> · {(o as {title:string}).title}</span>} <span className={s.muted}>· Source {o.sourceIds.length}건, 확인 {o.lastVerifiedAt}</span></li>)}</ul>:none}
   <h3>책임자·임원</h3>
   {leaders.length?<ul>{leaders.map((l,n)=><li key={l.personName+n}><b>{l.personName}</b> {l.title}{l.department?` · ${l.department}`:''}{l.asOfDate?` · ${l.asOfDate} 기준`:''} {l.historical&&<span className={s.badge}>과거 직책</span>} {leaderNeedsRecheck(l)&&<span className={s.recheckBadge}>재확인 필요</span>}</li>)}</ul>:none}
   <p className={s.muted}>이름과 조직명은 Source가 있는 경우에만 표시합니다. 직책은 자주 바뀌므로 기준일을 함께 보고 90일 이상 재확인되지 않으면 “재확인 필요”를 표시합니다.</p>
  </section>

  <section className={s.card}><h2>5. IT Footprint Matrix</h2>
   {inst.initiatives.length?<dl className={s.facts}>{[...MATRIX_DOMAINS,'OTHER' as ITFootprintDomain].map(d=><div key={d}><dt title={itDomainScope[d]}>{itDomainLabels[d]}</dt><dd><Chips inst={inst} domain={d} open={setDrawer}/></dd></div>)}</dl>:none}
   <dl className={s.facts}><div><dt>IDC·전산센터</dt><dd><span className={s.muted}>{NO_PUBLIC}</span></dd></div></dl>
   <p className={s.muted}>칩을 누르면 사업 상세와 근거 Source를 엽니다. IDC·전산센터는 공개 정보가 확인된 경우에만 이 화면에서 다룹니다.</p>
  </section>

  <section className={s.card}><h2>6. 최근 3년 IT·AX Initiative Timeline</h2>
   {timeline.length?years.filter(y=>timeline.some(i=>yearOf(i)===y)).map(y=><div key={y}><h3>{yearLabel(y)}</h3><ol className={s.initiatives}>{timeline.filter(i=>yearOf(i)===y).map(i=><li key={i.id}>
    <div className={s.row}><strong>{i.announcedAt??'날짜 미공개'}</strong>{i.domains.map(d=><span className={s.badge} key={d}>{itDomainLabels[d]}</span>)}{i.sourceStage&&<span className={s.stage}>{initiativeStatusLabels[i.sourceStage]}</span>}</div>
    <h4><button className={s.linkButton} onClick={()=>setDrawer(i)}>{i.title}</button></h4><p>{i.summary}</p>
   </li>)}</ol></div>):none}
  </section>

  <section className={s.card}><h2>7. 확인된 CSP · MSP/SI · Product · Vendor</h2>
   {partners.csp.length||partners.msp.length||partners.vendors.length||partners.models.length||eco.products.length?<dl className={s.facts}>
    <div><dt>CSP</dt><dd>{partners.csp.join(', ')||'—'}</dd></div><div><dt>MSP·SI</dt><dd>{partners.msp.join(', ')||'—'}</dd></div>
    <div><dt>Product</dt><dd>{eco.products.join(', ')||'—'}</dd></div><div><dt>기술 Vendor</dt><dd>{partners.vendors.join(', ')||'—'}</dd></div><div><dt>배포 모델</dt><dd>{partners.models.join(' · ')||'—'}</dd></div></dl>:none}
   <p className={s.muted}>공개되지 않은 CSP·Architecture·Model·계약금액은 추정하지 않습니다.</p>
  </section>

  <section className={s.card}><h2>8. 관련 내부 Case</h2>
   {relatedCases.length?<ul>{relatedCases.map(c=><li key={c.id}><Link to={`/cases/${c.id}`}>{c.title}</Link> <span className={s.muted}>· {c.stage}</span></li>)}</ul>:<p className={s.muted}>연결된 사업 사례가 없습니다. 사례 데이터는 복사하지 않고 연결만 합니다.</p>}
  </section>

  <section className={s.card}><h2>9. Source Library</h2>
   {SOURCE_CATEGORIES.map(cat=>{const rows=src.filter(x=>cat.types.includes(x.sourceType??'OTHER'));return rows.length?<div key={cat.key}><h3>{cat.label} ({rows.length})</h3>
    <ul className={s.sourceRows}>{rows.map(x=>{const f=freshnessOf(x);return <li key={x.id}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.title} ↗</a>
     <div className={f.state==='RECHECK'?s.recheckBadge:s.muted}>{x.publisher} · 발행 {x.publishedAt??'미상'} · 확인 {x.lastVerifiedAt} · {freshnessLabel(f)}</div>
     <div className={s.muted}>뒷받침하는 Fact: {(supports.get(x.id)??['—']).join(' / ')}</div></li>})}</ul></div>:null})}
  </section>

  <section className={s.salesBlock}><span className={s.eyebrow}>SALES_VIEW</span><h2>10. Discovery Questions</h2>
   <p className={s.note}>영업 관점의 질문 템플릿입니다. 이 회사의 공식 계획이나 공개 사실이 아닙니다. 특정 고객에 대한 공략 메모는 공개 데이터에 넣지 않습니다.</p>
   <h3>업권 기준</h3><ul>{discovery.sector.map(x=><li key={x}>{x}</li>)}</ul>
   {discovery.initiative.length>0&&<><h3>공개된 사업 영역 기준</h3><ul>{discovery.initiative.map(x=><li key={x.title+x.question}><b>{x.title}</b> · {x.question}</li>)}</ul></>}
   {discovery.fallback.length>0&&<><h3>공개자료가 없는 경우의 첫 질문</h3><ul>{discovery.fallback.map(x=><li key={x}>{x}</li>)}</ul></>}
  </section>

  <AccountMemo id={inst.id}/>
  <InitiativeDrawer initiative={drawer} institution={inst} onClose={()=>setDrawer(null)}/>
 </>;
}
