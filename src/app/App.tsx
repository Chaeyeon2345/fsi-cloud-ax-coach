import {useEffect} from 'react';
import {Routes,Route,Link,Navigate,useLocation} from 'react-router-dom';
import {AppProvider,useApp} from './Context';
import {mainNav,activeMenu} from './navigation';
import {SourceDrawer} from '../components/Common';
import {KnowledgeDetail,Cases,CaseDetail,Search,Bookmarks,About,NotFound} from '../pages/Learning';
import {Quiz,Meeting} from '../pages/Practice';
import {LearnHome} from '../pages/LearnHome';
import {CurriculumDayPage} from '../pages/Curriculum';
import {RegulationHub,CloudAxHub} from '../pages/Hubs';
import {Playbook} from '../pages/Playbook';
import {AccountDetail} from '../pages/Accounts';
import s from '../styles/App.module.css';

// 예전 주소를 새 구조로 옮긴다. 검색 문자열·hash(예: /timeline#tl-saas)는 보존한다.
function Redirect({to,search=''}:{to:string;search?:string}){
 const {hash}=useLocation();
 return <Navigate to={{pathname:to,search,hash}} replace/>;
}

function Shell(){
 const {warning}=useApp();const location=useLocation();
 const active=activeMenu(location.pathname);
 useEffect(()=>{if(location.hash){document.getElementById(location.hash.slice(1))?.scrollIntoView()}else{window.scrollTo(0,0)}},[location.pathname,location.search,location.hash]);
 return <div className={s.layout}>
  <a href="#main" className={s.skip}>본문으로 이동</a>
  <aside className={s.sidebar}>
   <Link to="/learn" className={s.brand}><span className={s.logo}>F</span><span>FSI Cloud <br/>&amp; AX Coach</span></Link>
   <p className={s.sidebarCaption}>금융 영업을 위한 학습 공간</p>
   <nav aria-label="주 메뉴">{mainNav.map(item=><Link key={item.to} to={item.to} aria-current={active===item.to?'page':undefined} className={active===item.to?s.active:''}>{item.label}</Link>)}</nav>
   <div className={s.sidebarBottom}><span>V2 · 16일 과정 · 개인 학습</span><Link to="/about">출처·이용 안내 →</Link></div>
  </aside>
  <div className={s.workspace}>
   <header className={s.topbar}>
    <span>LEARN → CONNECT → EXPLAIN</span>
    <nav className={s.topbarLinks} aria-label="도구">
     <Link to="/search" aria-label="검색">검색</Link>
     <Link to="/bookmarks" aria-label="북마크">북마크</Link>
     <Link to="/about#sources">출처·검증일</Link>
    </nav>
   </header>
   <main id="main" className={s.main}>
    {warning&&<p className={s.note} role="status">{warning}</p>}
    <Routes>
     <Route path="/" element={<Redirect to="/learn"/>}/>
     <Route path="/home" element={<Redirect to="/learn"/>}/>
     <Route path="/learn" element={<LearnHome/>}/>
     <Route path="/learn/curriculum/:day" element={<CurriculumDayPage/>}/>
     <Route path="/regulation" element={<RegulationHub/>}/>
     <Route path="/cloud-ax" element={<CloudAxHub/>}/>
     <Route path="/knowledge" element={<Redirect to="/regulation"/>}/>
     <Route path="/knowledge/:id" element={<KnowledgeDetail/>}/>
     <Route path="/timeline" element={<Redirect to="/regulation" search="?tab=timeline"/>}/>
     <Route path="/compare" element={<Redirect to="/cloud-ax" search="?tab=compare"/>}/>
     <Route path="/cases" element={<Cases/>}/>
     <Route path="/cases/accounts/:id" element={<AccountDetail/>}/>
     <Route path="/cases/:id" element={<CaseDetail/>}/>
     <Route path="/quiz" element={<Quiz/>}/>
     <Route path="/quiz/:mode" element={<Quiz/>}/>
     <Route path="/meeting" element={<Meeting/>}/>
     <Route path="/meeting/playbook" element={<Playbook/>}/>
     <Route path="/meeting/:mode" element={<Meeting/>}/>
     <Route path="/search" element={<Search/>}/>
     <Route path="/bookmarks" element={<Bookmarks/>}/>
     <Route path="/about" element={<About/>}/>
     <Route path="*" element={<NotFound/>}/>
    </Routes>
    <footer className={s.footer}>FSI Cloud &amp; AX Coach · 출처에 기반한 학습과 미팅 준비</footer>
   </main>
  </div>
  <SourceDrawer/>
 </div>;
}
export default function App(){return <AppProvider><Shell/></AppProvider>}
