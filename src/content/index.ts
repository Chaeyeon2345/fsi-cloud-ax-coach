import { sources } from './sources';
import { knowledge, timeline } from './knowledge';
import { cases } from './cases';
import { quiz, meeting } from './practice';
import { architectures, components } from './compare';
import { curriculum } from './curriculum';
import { institutions } from './accountData';
import { validateContent } from '../domain/validate';
import { cardFreshness } from '../domain/freshness';
import type { ContentStore } from '../domain/types';
export const content:ContentStore={sources,knowledge,timeline,cases,quiz,meeting,architectures,components,curriculum,institutions};
const errors=validateContent(content);
if(errors.length)throw new Error(`콘텐츠 검증 실패: ${errors.join(', ')}`);
// 카드의 확인일·재확인 여부는 핵심 근거(primarySourceIds)로만 계산한다. HISTORICAL 출처는 제외한다 (전역 확인일 없음).
export const cardFreshnessOf=(card:{primarySourceIds:string[]})=>cardFreshness(card,sources);
export {sources,knowledge,timeline,cases,quiz,meeting,architectures,curriculum,institutions};
