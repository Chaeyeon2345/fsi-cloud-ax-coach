import {describe,it,expect} from 'vitest';
import {content} from '../content';
import {validateContent} from '../domain/validate';
import {matrixRows,models as matrixModels} from '../content/cloudAxMatrix';
import {industries,deployments} from '../domain/types';
import {searchContent} from '../features/search';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
describe('content contract',()=>{
 it('validates all references and evidence',()=>expect(validateContent(content)).toEqual([]));
 it('has exactly 25 cases, 44 knowledge cards, 116 quizzes, 18 meeting drills and 11 REGULATION-domain cards',()=>{expect(content.cases).toHaveLength(25);expect(content.quiz).toHaveLength(116);expect(content.meeting).toHaveLength(18);expect(content.knowledge).toHaveLength(44);expect(content.knowledge.filter(k=>k.domain==='REGULATION')).toHaveLength(11)});
 it('keeps quiz proportions 44/10/17/45 (Day 1~16 included)',()=>expect(['금융규제','금융 IT','사례','아키텍처'].map(c=>content.quiz.filter(q=>q.category===c).length)).toEqual([44,10,17,45]));
 it('rejects missing sources and duplicate IDs',()=>{const d=structuredClone(content);d.cases[0].stageSourceIds=['absent'];d.quiz[0].id=d.quiz[1].id;expect(validateContent(d).join(' ')).toMatch(/missing absent/);expect(validateContent(d).join(' ')).toMatch(/Duplicate/)});
 it('rejects inferred values in unknown fields',()=>{const d=structuredClone(content);d.cases[0].csp.value='AWS';expect(validateContent(d).join(' ')).toMatch(/Unknown field/)});
 it('rejects invalid quiz answers',()=>{const d=structuredClone(content);d.quiz[0].correctIndex=9;expect(validateContent(d).join(' ')).toMatch(/Quiz answers/)});
 it('preserves designation stages and generic architecture separation',()=>{for(const id of ['bc','samsungcard','samsungfire','koreanre'])expect(content.cases.find(c=>c.id===id)?.stage).toBe('혁신금융서비스 지정');expect(content.architectures[0].kind).toBe('GENERIC_PATTERN');expect(content.architectures[0].customerCaseId).toBeUndefined()});
 it('keeps taxonomy order and the deployment comparison matrix',()=>{expect(industries.slice(0,4)).toEqual(['은행','카드','증권','보험']);expect(deployments).toHaveLength(7);expect(matrixModels).toHaveLength(5);expect(matrixRows.length).toBeGreaterThanOrEqual(26);expect(matrixRows.every(r=>r.cells.length===5&&r.cells.every(Boolean)&&r.detail)).toBe(true)});
 it('contains no prohibited UI terminology',()=>{const forbidden='\uBA74\uC811';const scan=(dir:string)=>{for(const entry of readdirSync(dir,{withFileTypes:true})){if(entry.name==='test')continue;const path=join(dir,entry.name);if(entry.isDirectory())scan(path);else if(/\.(ts|tsx|css)$/.test(path))expect(readFileSync(path,'utf8'),path).not.toContain(forbidden)}};scan('src');expect(JSON.stringify(content)).not.toContain(forbidden)});
 it('searches titles and evidence, handles blank queries',()=>{expect(searchContent('Bedrock').some(r=>r.id==='jb')).toBe(true);expect(searchContent('삼성카드')[0].id).toBe('samsungcard');expect(searchContent('  ')).toEqual([])});
});
import {curriculum,meetingModes} from '../content/curriculum';
import {meeting as meetingItems,knowledge as knowledgeItems,quiz as quizItems} from '../content';
describe('curriculum references',()=>{
 it('points only to existing content',()=>{
  for(const d of curriculum){expect(d.knowledgeIds.every(id=>knowledgeItems.some(k=>k.id===id))).toBe(true);expect(d.quizIds.every(id=>quizItems.some(q=>q.id===id))).toBe(true);expect(d.meetingIds.every(id=>meetingItems.some(m=>m.id===id))).toBe(true)}
  for(const m of meetingModes)expect(m.questionIds.every(id=>meetingItems.some(x=>x.id===id))).toBe(true);
  expect(curriculum).toHaveLength(16);
 });
});
