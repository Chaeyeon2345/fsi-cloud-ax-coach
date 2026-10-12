import {Link} from 'react-router-dom';
import {curriculum} from '../content/curriculum';
import {PageHeading} from '../components/Common';
import {DayTable,currentDay,dayProgress} from './Curriculum';
import {knowledge} from '../content';
import {useApp} from '../app/Context';
import s from '../styles/App.module.css';

// /learn 랜딩: ① 이어서 학습 ② Day 1~16 Curriculum ③ 복습 필요 항목 ④ 학습 진행률. (임의 질문·장식 Hero·의미 없는 KPI는 두지 않는다)
// (복습·취약영역은 실전 미팅 > 퀴즈, 배포모델 사례 수는 금융 사례에서 본다. 임의의 질문·장식 콘텐츠는 두지 않는다.)
export function LearnHome(){
 const {state}=useApp();
 const done=new Set(state.progress.map(p=>p.contentId));
 const day=currentDay(done);
 const started=curriculum.some(d=>dayProgress(d,done).done>0);
 const due=state.reviews.filter(r=>Date.parse(r.dueAt)<=Date.now()).length;
 const doneCards=knowledge.filter(k=>done.has(k.id)).length;
 const readyDone=curriculum.filter(d=>d.contentStatus==='READY'&&dayProgress(d,done).complete).length;
 const ready=curriculum.filter(d=>d.contentStatus==='READY').length;
 return <>
  <PageHeading eyebrow="LEARN" title="금융 고객 담당 AE를 위한 16일 과정" description="금융 IT·규제에서 Cloud·AX 사례, 고객 Discovery까지. 결론을 읽고, 근거를 확인하고, 자신의 말로 설명합니다."/>
  <section className={s.hero}>
   <div>
    <span className={s.eyebrow}>현재 학습</span>
    <h2>Day {day.day} · {day.title}</h2>
    <p>{day.goal}</p>
    <Link className={s.primary} to={`/learn/curriculum/${day.day}`}>{started?`Day ${day.day} 이어서 학습 →`:`Day ${day.day} 시작 →`}</Link>
   </div>
   <div className={s.metrics}>
    <div><strong>{readyDone} / {ready}</strong><span>완료한 Day (본문 제공 {ready}일 중)</span></div>
    <div><strong>{doneCards} / {knowledge.length}</strong><span>학습한 지식 카드</span></div>
    <div><strong>{due}</strong><span>복습 필요 항목</span></div>
   </div>
  </section>
  {due>0&&<p className={s.note}>오늘 복습할 문제가 {due}개 있습니다. <Link to="/quiz/review">복습 열기 →</Link></p>}
  <h2>전체 Curriculum 진행상태</h2>
  <DayTable/>
  <p className={s.note}>학습 기록은 이 브라우저에만 저장됩니다. 개별 사실은 출처별 발표일·확인일을 기준으로 하며, <Link to="/about#sources">자료별 검증일</Link>에서 볼 수 있습니다. 법률자문이나 특정 금융사의 규제 충족 판정이 아닌 학습 자료입니다.</p>
 </>;
}
