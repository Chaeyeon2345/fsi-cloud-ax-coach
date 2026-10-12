import {quiz} from '../content';
import type {PersistedState} from '../domain/types';
// 복습 기록에서 분야별 취약도를 계산합니다. 점수나 합격 예측이 아니라 "다시 볼 문제 수"만 보여줍니다.
export function weakCategories(reviews:PersistedState['reviews']){
 const counts=new Map<string,number>();
 for(const r of reviews){if(r.correct&&r.confidence==='확실')continue;const q=quiz.find(x=>x.id===r.questionId);if(q)counts.set(q.category,(counts.get(q.category)??0)+1);}
 return [...counts.entries()].map(([category,count])=>({category,count})).sort((a,b)=>b.count-a.count);
}
