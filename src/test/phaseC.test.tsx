import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../app/App';
import { content, sources, knowledge, curriculum, quiz } from '../content';
import { validateContent } from '../domain/validate';
import { searchContent } from '../features/search';

const mount = (path: string) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
const card = (id: string) => knowledge.find(k => k.id === id)!;
beforeEach(() => localStorage.clear());

describe('Phase C · Day 7~13 are READY with the required structure', () => {
  it.each([7, 8, 9, 10, 11, 12, 13])('Day %i satisfies the READY minimum', n => {
    const d = curriculum[n - 1];
    expect(d.contentStatus).toBe('READY');
    expect(d.conclusions).toHaveLength(5);
    expect(d.memorize).toHaveLength(5);
    expect(d.discoveryQuestions.length).toBeGreaterThanOrEqual(5);
    expect(d.quizIds.length).toBeGreaterThanOrEqual(5);
    expect(d.meeting30s.length).toBeGreaterThan(40);
    expect(d.sourceIds.length).toBeGreaterThan(0);
    expect(d.nextQuestions.length).toBeGreaterThanOrEqual(3);
    for (const id of d.knowledgeIds) expect(card(id).sales, `${d.id}/${id}`).toBeTruthy();
  });
  it('has Day 14~16 READY too (all sixteen days are written)', () => {
    for (const d of curriculum) expect(d.contentStatus).toBe('READY');
  });
  it('links Day 9 to the JB Deep Dive and Day 11/13 to their cards', () => {
    expect(curriculum[8].knowledgeIds).toContain('jb-hybrid-deep-dive');
    expect(curriculum[8].caseIds).toContain('jb');
    expect(curriculum[10].knowledgeIds).toContain('saas-network-exception');
    expect(curriculum[12].knowledgeIds).toEqual(expect.arrayContaining(['ai-governance', 'ai-basic-act', 'high-impact-vs-high-risk-ai']));
  });
  it('labels AWS technical statements as TECH_FACT/ARCHITECTURE_GUIDE and never as regulatory FACT', () => {
    const tech = ['aws-fsi-overview', 'direct-connect', 'private-connectivity', 'iam-finance', 'encryption-key-management', 'audit-observability', 'aws-resilience', 'rag', 'agent', 'mcp', 'model-serving', 'gpu-npu'];
    for (const id of tech) expect(card(id).sections.some(s => s.type === 'TECH_FACT' || s.type === 'ARCHITECTURE_GUIDE' || s.type === 'INTERPRETATION'), id).toBe(true);
    for (const id of tech) expect(card(id).sections.filter(s => s.type === 'FACT'), id).toHaveLength(0);
  });
  it('does not claim that using an AWS service makes a customer compliant', () => {
    const text = JSON.stringify([...knowledge.filter(k => k.domain !== 'REGULATION'), ...curriculum.slice(6, 13)], (k, v) => (k === 'commonMistakes' ? undefined : v)); // 흔한 실수 목록은 금지 표현을 부정형으로 나열한다
    expect(text).not.toMatch(/자동으로 (규제 )?(준수|충족)된다|규제 준수를 보장한다(?!는)/);
    expect(text).not.toContain('면접');
  });
  it('states the AI Basic Act only as far as it was verified', () => {
    const c = card('ai-basic-act');
    expect(c.caveats.join(' ')).toMatch(/조문 본문은 확인하지 못했습니다/);
    expect(c.sections[0].text).toContain('2025-01-21');
    expect(c.sections[0].text).toContain('2026-01-22');
    const art = c.sections[6];
    expect(art.type).toBe('INTERPRETATION');
  });
  it('keeps the financial AI guideline announcement date and no legal effective date', () => {
    const s = sources.find(x => x.id === 'ai-guideline')!;
    expect(s.publishedAt).toBe('2026-06-18');
    expect(s.effectiveAt).toBeNull();
  });
  it('cites the FSC SaaS exception facts', () => {
    const t = card('saas-network-exception').sections.map(s => s.text).join(' ');
    for (const w of ['2026-04-20', '정보보호위원회', '고유식별정보', '가명정보', '4.7']) expect(t).toContain(w);
  });
  it('adds quizzes for Day 7~13 with correct basis metadata', () => {
    const added = quiz.filter(q => /^qb(7|8|9|10|11|12|13)-/.test(q.id));
    expect(added.length).toBeGreaterThanOrEqual(35);
    for (const q of added) { expect(q.reasons).toHaveLength(q.options.length); expect(q.basis).toBeTruthy(); }
  });
  it('renders Day 7, 9, 11 and 13 pages', () => {
    for (const n of [7, 9, 11, 13]) {
      const { container, unmount } = mount(`/learn/curriculum/${n}`);
      expect(container.textContent).toContain(curriculum[n - 1].conclusions[0].slice(0, 12));
      expect(container.textContent).not.toContain('작성 중입니다');
      unmount();
    }
  });
});

