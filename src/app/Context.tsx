import {createContext,useContext,useState,type ReactNode} from 'react';
import {emptyState,readState,writeState} from '../storage/persistence';
import type {PersistedState} from '../domain/types';
interface AppState {state:PersistedState;update:(fn:(s:PersistedState)=>PersistedState)=>void;warning:string;sourceIds:string[]|null;showSources:(ids:string[]|null)=>void}
const Context=createContext<AppState|null>(null);
export function AppProvider({children}:{children:ReactNode}){
 const [initial]=useState(()=>{try{return readState(window.localStorage)}catch{return {state:emptyState(),warning:'브라우저 저장소에 접근할 수 없어 기록은 이번 세션에만 유지됩니다.'}}});
 const [state,setState]=useState(initial.state),[warning,setWarning]=useState(initial.warning),[sourceIds,showSources]=useState<string[]|null>(null);
 const update=(fn:(s:PersistedState)=>PersistedState)=>setState(previous=>{const next=fn(previous);try{if(!writeState(window.localStorage,next))setWarning('저장에 실패했습니다. 기록은 이번 세션에만 유지됩니다.');}catch{setWarning('저장소를 사용할 수 없습니다.');}return next;});
 return <Context.Provider value={{state,update,warning,sourceIds,showSources}}>{children}</Context.Provider>;
}
export function useApp(){const context=useContext(Context);if(!context)throw new Error('AppProvider required');return context;}
