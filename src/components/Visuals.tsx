import {lifecycleSteps} from '../content/lifecycle';
import {SourceButton} from './Common';
import s from '../styles/App.module.css';

// Day 3: Cloud 이용 Lifecycle 9단계. 무엇(FACT)은 가이드 확인 내용, 왜·AM 체크포인트는 학습용 해석(INTERPRETATION).
export function LifecycleFlow(){
 return <figure className={s.visual}>
  <figcaption><b>금융 Cloud 이용 Lifecycle 9단계</b> <span className={s.muted}>가이드는 7개 묶음으로 설명하며, 학습용으로 9단계로 나눴습니다.</span> <SourceButton ids={['cloud']}/></figcaption>
  <ol className={s.lifecycle}>{lifecycleSteps.map(step=><li key={step.n}>
   <div className={s.stepHead}><span className={s.stepNo}>{step.n}</span><b>{step.title}</b><span className={s.muted}>가이드 {step.guideChapter}</span></div>
   <p><span className={s.tagFact}>FACT</span> <b>무엇을</b> · {step.what}</p>
   <p><span className={s.tagInterp}>INTERPRETATION</span> <b>왜 필요한가</b> · {step.why}</p>
   <p className={s.amCheck}><b>AM 체크포인트</b> · {step.amCheck}</p>
  </li>)}</ol>
 </figure>;
}

// Day 2: 망 구조도. 업무 범위와 허용 경로는 금융보안원 해설서(2025.4)의 구조도 예시를 따른다.
export function NetworkMap(){
 return <figure className={s.visual}>
  <figcaption><b>연구·개발 분야 망분리 구조 (해설서 구조도 예시)</b> <SourceButton ids={['research']}/></figcaption>
  <div className={s.netMap} role="img" aria-label="인터넷망, 연구개발망, 내부업무망, 전산실의 관계 도식">
   <div className={`${s.netBox} ${s.netNeutral}`}><b>인터넷망</b><small>인터넷 검색, e-mail 확인 등</small></div>
   <div className={s.netLink}>↕ 외부 연결은 접근통제·SaaS/AI 보호대책 적용</div>
   <div className={`${s.netBox} ${s.netRd}`}><b>연구개발망</b><small>개발(코딩·테스트), AI·SaaS 활용 연구·개발. 운영 서비스·실 데이터 테스트는 불가</small></div>
   <div className={s.netRow}>
    <div className={s.netLink}>↔ 논리적 분리 허용(자유 접속 아님)</div>
    <div className={s.netLink}>↓ 필수 개발산출물만 인가 서버로 단방향·한시 전송</div>
   </div>
   <div className={s.netRow}>
    <div className={`${s.netBox} ${s.netNeutral}`}><b>내부업무망 (3호망)</b><small>문서 작성, 인트라넷, 민원 등 사무 업무 · 감독규정 제15조 제1항 제3호</small></div>
    <div className={`${s.netBox} ${s.netCore}`}><b>전산실 (5호망)</b><small>운영·보안 업무, 정보처리시스템과 직접 접속 단말기 · 감독규정 제15조 제1항 제5호</small></div>
   </div>
  </div>
  <p className={s.muted}>숫자는 보안 등급이 아니라 규정의 호 번호입니다. 구체 통제 방식은 금융회사가 자율적으로 구성하며, 해설서는 법적 구속력이 없습니다.</p>
 </figure>;
}

// Day 6: 시스템계 도식. 업계 학습용 분류이며 법적 분류가 아니다 (ARCHITECTURE_GUIDE).
export function SystemLayers(){
 return <figure className={s.visual}>
  <figcaption><b>금융 IT 시스템계 (학습용)</b> <span className={s.tagArch}>ARCHITECTURE GUIDE · 교육용 구성 분석</span> <SourceButton ids={['financial-architecture','financial-channel']}/></figcaption>
  <div className={s.layers} role="img" aria-label="채널계, 계정계, 대외계와 정보계의 관계 도식">
   <div className={`${s.netBox} ${s.netNeutral}`}><b>채널계</b><small>모바일·웹·영업점·콜센터 등 고객·직원 접점</small></div>
   <div className={s.netLink}>→</div>
   <div className={`${s.netBox} ${s.netCore}`}><b>계정계</b><small>거래 처리, 원장·잔액, 높은 정합성·가용성</small></div>
   <div className={s.netLink}>←</div>
   <div className={`${s.netBox} ${s.netNeutral}`}><b>대외계</b><small>금융결제망·외부기관·제휴사/핀테크 연계</small></div>
   <div className={`${s.netBox} ${s.netRd} ${s.layersWide}`}><b>정보계</b><small>데이터웨어하우스, BI, 경영·리스크·마케팅 분석, 배치. 계정계 등의 데이터를 활용</small></div>
  </div>
  <p className={s.muted}>명칭과 경계는 회사마다 다릅니다. 법적 분류나 특정 금융사의 실제 구조가 아니며, “계정계라 Cloud 불가, 채널계라 가능”처럼 판단하지 않습니다.</p>
 </figure>;
}
