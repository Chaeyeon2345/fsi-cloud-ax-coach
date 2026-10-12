import type { PersistedState, ReviewItem } from '../domain/types';
export const STORAGE_KEY='fsi-coach:v1';
export const emptyState=():PersistedState=>({version:1,progress:[],bookmarks:[],reviews:[],meetingPracticed:[]});
const isString=(x:unknown):x is string=>typeof x==='string';
const date=(x:unknown)=>isString(x)&&Number.isFinite(Date.parse(x));
export function isState(value:unknown):value is PersistedState{
 if(!value||typeof value!=='object')return false;
 const v=value as PersistedState;
 return v.version===1&&Array.isArray(v.progress)&&v.progress.every(p=>p&&isString(p.contentId)&&date(p.completedAt))&&Array.isArray(v.bookmarks)&&v.bookmarks.every(b=>b&&isString(b.contentId)&&['knowledge','case','institution'].includes(b.kind)&&date(b.createdAt))&&Array.isArray(v.reviews)&&v.reviews.every(r=>r&&isString(r.questionId)&&date(r.dueAt)&&typeof r.correct==='boolean'&&['모름','애매','확실'].includes(r.confidence))&&Array.isArray(v.meetingPracticed)&&v.meetingPracticed.every(isString);
}
// 저장 형식 마이그레이션. 현재 저장 버전은 1이며 V2 구조 개편(Domain·16일·CaseType·Source)은 저장 데이터 모양을 바꾸지 않는다.
// 진도·북마크·복습은 카드/문항 ID로만 저장되므로 ID를 유지하면 그대로 호환된다.
// 앞으로 카드 ID를 바꿔야 하면 아래 표에 "이전 ID → 현재 ID"를 추가한다. 읽을 때 자동 변환·중복 제거한다.
export const LEGACY_ID_MAP:Record<string,string>={};
const dedupe=<T,>(items:T[],key:(x:T)=>string)=>[...new Map(items.map(x=>[key(x),x])).values()];
export function migrateState(raw:unknown):PersistedState|null{
 if(!isState(raw))return null;
 const id=(x:string)=>LEGACY_ID_MAP[x]??x;
 return {
  version:1,
  progress:dedupe(raw.progress.map(p=>({...p,contentId:id(p.contentId)})),p=>p.contentId),
  bookmarks:dedupe(raw.bookmarks.map(b=>({...b,contentId:id(b.contentId)})),b=>`${b.kind}:${b.contentId}`),
  reviews:dedupe(raw.reviews.map(r=>({...r,questionId:id(r.questionId)})),r=>r.questionId),
  meetingPracticed:[...new Set(raw.meetingPracticed.map(id))],
 };
}
export function readState(storage:Pick<Storage,'getItem'>):{state:PersistedState;warning:string}{
 try {const raw=storage.getItem(STORAGE_KEY);if(!raw)return {state:emptyState(),warning:''};const parsed:unknown=JSON.parse(raw);const migrated=migrateState(parsed);if(!migrated)return {state:emptyState(),warning:'저장 형식이 호환되지 않아 이번 세션은 새 기록으로 시작합니다. 기존 저장값은 자동 삭제하지 않았습니다.'};return {state:migrated,warning:''};}
 catch{return {state:emptyState(),warning:'학습 기록을 읽지 못했습니다. 이번 세션에서는 계속 학습할 수 있습니다.'};}
}
export function writeState(storage:Pick<Storage,'setItem'>,state:PersistedState):boolean{try{if(!isState(state))return false;storage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch{return false;}}
export function makeReview(questionId:string,correct:boolean,confidence:ReviewItem['confidence'],now=new Date()):ReviewItem{
 const days=!correct||confidence==='모름'?1:confidence==='애매'?3:7;
 const due=new Date(now.getTime()+days*86400000);
 return {questionId,correct,confidence,dueAt:due.toISOString()};
}

// 금융시장 IT·AX Index의 "내 메모". 개인 영업 메모이므로 이 브라우저(localStorage)에만 저장하고 공개 Seed에는 넣지 않는다.
export const ACCOUNT_NOTES_KEY='fsi-coach:account-notes:v1';
export function readAccountNotes(storage:Pick<Storage,'getItem'>):Record<string,string>{
 try{const raw=storage.getItem(ACCOUNT_NOTES_KEY);if(!raw)return {};const v:unknown=JSON.parse(raw);if(!v||typeof v!=='object'||Array.isArray(v))return {};return Object.fromEntries(Object.entries(v as Record<string,unknown>).filter(([,t])=>typeof t==='string')) as Record<string,string>}catch{return {}}
}
export function writeAccountNote(storage:Pick<Storage,'getItem'|'setItem'>,institutionId:string,text:string):boolean{
 try{const notes=readAccountNotes(storage);if(text.trim())notes[institutionId]=text;else delete notes[institutionId];storage.setItem(ACCOUNT_NOTES_KEY,JSON.stringify(notes));return true}catch{return false}
}

// Day 14~16 실습 입력(Account Plan, 미팅 정리 등). 이 브라우저에만 저장하고 공개 Seed에는 넣지 않는다.
export const DAY_WORK_KEY='fsi-coach:day-work:v1';
export function readDayWork(storage:Pick<Storage,'getItem'>):Record<string,string>{
 try{const raw=storage.getItem(DAY_WORK_KEY);if(!raw)return {};const v:unknown=JSON.parse(raw);if(!v||typeof v!=='object'||Array.isArray(v))return {};return Object.fromEntries(Object.entries(v as Record<string,unknown>).filter(([,t])=>typeof t==='string')) as Record<string,string>}catch{return {}}
}
export function writeDayWork(storage:Pick<Storage,'getItem'|'setItem'>,key:string,text:string):boolean{
 try{const all=readDayWork(storage);if(text)all[key]=text;else delete all[key];storage.setItem(DAY_WORK_KEY,JSON.stringify(all));return true}catch{return false}
}
