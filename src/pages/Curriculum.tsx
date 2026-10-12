import {Link,useParams} from 'react-router-dom';
import {curriculum} from '../content/curriculum';
import {knowledge,cases,quiz,meeting,architectures} from '../content';
import {PageHeading,SourceButton,SourceRows,SalesBlock,claimLabel} from '../components/Common';
import {LifecycleFlow,NetworkMap,SystemLayers} from '../components/Visuals';
import {useApp} from '../app/Context';
import {NotFound,TimelineBody} from './Learning';
import {DayWorkbench} from './DayWorkbench';
import type {CurriculumDay,KnowledgeCard,LearningSection} from '../domain/types';
import s from '../styles/App.module.css';

const knowledgeDone=(day:CurriculumDay,doneIds:Set<string>)=>day.knowledgeIds.length>0&&day.knowledgeIds.every(id=>doneIds.has(id));

// Day별 진행: 학습 카드를 모두 완료로 표시한 Day만 "완료"로 센다.
export function dayProgress(day:CurriculumDay,doneIds:Set<string>){
 const done=day.knowledgeIds.filter(id=>doneIds.has(id)).length;
 return {done,total:day.knowledgeIds.length,complete:knowledgeDone(day,doneIds)};
}
// 현재 학습 Day = 본문이 있는 Day 중 아직 끝내지 않은 첫 Day (모두 끝났으면 마지막 본문 Day)
export function currentDay(doneIds:Set<string>):CurriculumDay{
 const ready=curriculum.filter(d=>d.contentStatus==='READY');
 return ready.find(d=>!dayProgress(d,doneIds).complete)??ready[ready.length-1]??curriculum[0];
}
// 16일 학습 지도 (/learn 랜딩에서 사용): 카드 격자가 아니라 한눈에 훑는 표
export function DayTable(){
 const {state}=useApp();const done=new Set(state.progress.map(p=>p.contentId));
 const now=currentDay(done).day;
 return <div className={s.tableWrap}><table className={s.dayTable}>
  <thead><tr><th scope="col">Day</th><th scope="col">주제</th><th scope="col">상태</th><th scope="col">카드 진행</th></tr></thead>
  <tbody>{curriculum.map(d=>{const p=dayProgress(d,done);return <tr key={d.id} aria-current={d.day===now?'step':undefined}>
   <th scope="row">{d.day}</th>
   <td>{d.contentStatus==='READY'?<Link to={`/learn/curriculum/${d.day}`}>{d.title}</Link>:<span>{d.title}</span>}<div className={s.muted}>{d.goal}</div></td>
   <td>{p.complete?<span className={s.stage}>✓ 완료</span>:d.contentStatus==='READY'?<span className={s.badge}>{d.day===now?'학습 중':'본문 제공'}</span>:<span className={s.muted}>준비 중</span>}</td>
   <td>{p.total?<><progress max={p.total} value={p.done} aria-label={`Day ${d.day} 카드 진행`}/> <span className={s.muted}>{p.done}/{p.total}</span></>:<span className={s.muted}>—</span>}</td>
  </tr>})}</tbody>
 </table></div>;
}

// Day 화면은 카드의 섹션을 "참조해서" 보여준다. 같은 Fact 본문을 Day에 복사하지 않는다.
function Excerpt({cards,labels}:{cards:KnowledgeCard[];labels:LearningSection['label'][]}){
 const rows=cards.flatMap(k=>k.sections.filter(x=>labels.includes(x.label)).map(x=>({k,x})));
 if(!rows.length)return <p className={s.muted}>연결된 학습 카드가 없어 아직 표시할 내용이 없습니다.</p>;
 return <>{rows.map(({k,x})=><div className={s.excerpt} key={`${k.id}-${x.label}`}><span className={s.eyebrow}>{claimLabel(x.type)} · <Link to={`/knowledge/${k.id}`}>{k.title}</Link></span><h3>{x.label}</h3><p>{x.text}</p><SourceButton ids={x.sourceIds}/></div>)}</>;
}
const List=({items,empty='작성 예정'}:{items:string[];empty?:string})=>items.length?<ul>{items.map(x=><li key={x}>{x}</li>)}</ul>:<p className={s.muted}>{empty}</p>;

// Day 상세의 17개 섹션 (V2 기준 순서)
const toc=['오늘의 결론','왜 배우는가','선수지식','핵심 개념','왜 생겼나 · Before-After','현재 실무','실제 금융사 사례','Architecture','금융 AE에게 중요한 이유','고객 Discovery 질문','관련 Cloud·AX·On-prem 사업 영역','30초 미팅 설명','다음 질문','혼동주의','Quiz','오늘 외울 5문장','Source'];

export function CurriculumDayPage(){
 const {day}=useParams();const d=curriculum.find(x=>String(x.day)===day);const {state}=useApp();
 if(!d)return <NotFound/>;
 const cards=knowledge.filter(k=>d.knowledgeIds.includes(k.id));
 const dayCases=cases.filter(c=>d.caseIds.includes(c.id));
 const dayArchitectures=architectures.filter(a=>d.architectureIds.includes(a.id));
 const done=new Set(state.progress.map(p=>p.contentId));
 const section=(n:number,body:React.ReactNode)=><section className={s.daySection} id={`d${n}`} key={n}><span className={s.eyebrow}>{String(n).padStart(2,'0')}</span><h2>{toc[n-1]}</h2>{body}</section>;
 return <>
  <Link to="/learn">← 16일 학습</Link>
  <PageHeading eyebrow={`DAY ${d.day} / ${curriculum.length}`} title={d.title} description={d.goal}/>
  {d.contentStatus==='SKELETON'&&<p className={s.note}>이 Day의 본문(결론·Discovery 질문·외울 문장 등)은 작성 중입니다. 연결된 학습 카드가 있으면 지금 학습할 수 있습니다.</p>}
  <div className={s.dayLayout}>
   <nav className={s.toc} aria-label="Day 목차"><strong>목차</strong><ol>{toc.map((t,i)=><li key={t}><a href={`#d${i+1}`}>{t}</a></li>)}</ol></nav>
   <div className={s.dayBody}>
    {section(1,<List items={d.conclusions}/>)}
    {section(2,d.whyLearn?<p>{d.whyLearn}</p>:<p className={s.muted}>작성 예정</p>)}
    {section(3,<List items={d.prerequisites}/>)}
    {section(4,<>{d.visuals?.includes('LIFECYCLE_FLOW')&&<LifecycleFlow/>}{d.visuals?.includes('NETWORK_MAP')&&<NetworkMap/>}{d.visuals?.includes('SYSTEM_LAYERS')&&<SystemLayers/>}{cards.length?<ul>{cards.map(k=><li key={k.id}><Link to={`/knowledge/${k.id}`}>{k.title}</Link>{done.has(k.id)?' · ✓ 완료':''}<br/><span className={s.muted}>{k.summary}</span></li>)}</ul>:<p className={s.muted}>이 Day의 학습 카드는 작성 예정입니다.</p>}</>)}
    {section(5,<Excerpt cards={cards} labels={['왜 생겼나','기존에는','어떤 문제가 있었나','무엇이 바뀌었나']}/>)}
    {section(6,<><Excerpt cards={cards} labels={['현재','금융사 실무']}/>{d.timelineIds&&d.timelineIds.length>0&&<><h3>규제 변화 타임라인</h3><TimelineBody ids={d.timelineIds}/></>}</>)}
    {section(7,dayCases.length?<ul>{dayCases.map(c=><li key={c.id}><Link to={`/cases/${c.id}`}>{c.company} · {c.title}</Link></li>)}</ul>:<p className={s.muted}>{d.contentStatus==='READY'?'이 Day에서는 개별 사례를 연결하지 않습니다. 실제 사례 읽는 법은 Day 14에서 다룹니다.':'연결된 사례가 없습니다.'}</p>)}
    {section(8,dayArchitectures.length?dayArchitectures.map(a=><div className={s.excerpt} key={a.id}><span className={s.badge}>{a.kind}</span><h3>{a.title}</h3><p>{a.description}</p></div>):<p className={s.muted}>{d.contentStatus==='READY'?'이 Day에서는 별도 Architecture 패턴을 다루지 않습니다. 구조 도식은 위 핵심 개념에, Architecture 패턴은 Day 7~10에서 이어집니다.':'연결된 Architecture가 없습니다.'}</p>)}
    {section(9,<><Excerpt cards={cards} labels={['영업 포인트','Cloud/AX 영향']}/><SalesBlock sales={d.sales} title="이 Day의 영업 학습" omit={d.contentStatus==='READY'?['discoveryQuestions','relatedServices','nextQuestions']:[]}/></>)}
    {section(10,<List items={d.discoveryQuestions}/>)}
    {section(11,<List items={d.relatedServices}/>)}
    {section(12,<>{d.meeting30s?<p>{d.meeting30s}</p>:<Excerpt cards={cards} labels={['미팅 30초 설명']}/>}{d.meetingIds.length>0&&<ul>{d.meetingIds.map(id=>{const m=meeting.find(x=>x.id===id);return m&&<li key={id}><Link to={`/meeting?id=${id}`}>{m.question}</Link>{state.meetingPracticed.includes(id)?' · ✓ 연습함':''}</li>})}</ul>}</>)}
    {section(13,<List items={d.nextQuestions}/>)}
    {section(14,<List items={d.confusionPairs}/>)}
    {section(15,d.quizIds.length?<ul>{d.quizIds.map(id=>{const q=quiz.find(x=>x.id===id);return q&&<li key={id}><Link to={`/quiz?id=${id}`}>{q.prompt}</Link></li>})}</ul>:<p className={s.muted}>연결된 퀴즈가 없습니다.</p>)}
    {section(16,<List items={d.memorize}/>)}
    {section(17,d.sourceIds.length?<><SourceButton ids={d.sourceIds}/><SourceRows ids={d.sourceIds} title="이 Day의 출처 (자료별 확인일)"/></>:<p className={s.muted}>이 Day에 연결된 출처가 아직 없습니다.</p>)}
   </div>
  </div>
  {d.contentStatus==='READY'&&d.day>=14&&<DayWorkbench day={d.day}/>}
  <div className={s.actions}>{d.day>1&&<Link to={`/learn/curriculum/${d.day-1}`}>← Day {d.day-1}</Link>}{d.day<curriculum.length&&<Link className={s.primary} to={`/learn/curriculum/${d.day+1}`}>Day {d.day+1} →</Link>}</div>
 </>;
}
