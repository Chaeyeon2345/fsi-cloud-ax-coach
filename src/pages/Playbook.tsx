import {Link} from 'react-router-dom';
import {cases,knowledge} from '../content';
import {curriculum} from '../content/curriculum';
import {MeetingTabs,PageHeading} from '../components/Common';
import {KnowledgeGrid} from './Learning';
import s from '../styles/App.module.css';

// 영업 Playbook 탭: 영업(SALES) Domain 카드와, 영업 학습 필드를 가진 모든 항목의 색인.
// 영업 지식은 이 탭에만 있지 않다. 모든 Day·Knowledge·Case 상세에서도 같은 필드를 볼 수 있다.
export function Playbook(){
 const withSales=[
  ...curriculum.filter(d=>d.sales).map(d=>({key:d.id,label:`Day ${d.day} · ${d.title}`,to:`/learn/curriculum/${d.day}`})),
  ...knowledge.filter(k=>k.sales).map(k=>({key:k.id,label:k.title,to:`/knowledge/${k.id}`})),
  ...cases.filter(c=>c.sales).map(c=>({key:c.id,label:`${c.company} · ${c.title}`,to:`/cases/${c.id}`})),
 ];
 return <>
  <MeetingTabs active="playbook"/>
  <PageHeading eyebrow="SALES PLAYBOOK" title="영업 Playbook" description="AM 필수 지식, Discovery 질문, Architecture 의미, 관련 Service, SA Hand-off, 다음 질문, 흔한 실수를 한곳에서 찾습니다."/>
  <h2>영업 카드</h2>
  <KnowledgeGrid domains={['SALES']}/>
  <h2>영업 학습 필드가 있는 항목</h2>
  {withSales.length?<ul>{withSales.map(x=><li key={x.key}><Link to={x.to}>{x.label}</Link></li>)}</ul>:<p className={s.muted}>영업 학습 필드는 Day·학습 카드·사례에 순차적으로 추가됩니다. 추가되면 이곳에도 모입니다.</p>}
 </>;
}
