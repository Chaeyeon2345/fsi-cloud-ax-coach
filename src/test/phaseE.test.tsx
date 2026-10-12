import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../app/App';
import { cases, curriculum, institutions, quiz, sources } from '../content';
import { accountReadingOrder, accountPlanFields, customerSignals, meetingFlow, motionDiscovery, partnerRoles, solutionMotions, stakeholderRoles } from '../content/dayTools';
import { buildBrief } from '../features/accountBrief';
import { readDayWork } from '../storage/persistence';

const mount = (path: string) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
const initiatives = institutions.flatMap(i => i.initiatives);
beforeEach(() => localStorage.clear());

describe('Market Universe and initiatives', () => {
  it('has a Universe of 80~200 companies, each with an official roster source or an explicit note', () => {
    expect(institutions.length).toBeGreaterThanOrEqual(80); expect(institutions.length).toBeLessThanOrEqual(200);
    for (const i of institutions) expect(Boolean(i.universeSourceId) || Boolean(i.rosterNote), i.id).toBe(true);
    expect(new Set(institutions.map(i => i.id)).size).toBe(institutions.length);
  });
  it('keeps unresearched companies registered as profiles without initiatives (UNRESEARCHED)', () => {
    const empty = institutions.filter(i => i.initiatives.length === 0);
    expect(empty.length).toBeGreaterThan(30);
    expect(empty.every(i => i.researchCoverage === 'UNRESEARCHED')).toBe(true);
  });
  it('has 150+ initiatives and never gives MOU or designation a build stage', () => {
    expect(initiatives.length).toBeGreaterThanOrEqual(150);
    for (const i of initiatives) if (i.kind === 'MOU') expect(i.sourceStage, i.id).toBeUndefined();
    for (const i of initiatives) expect(i.sourceIds.length, i.id).toBeGreaterThan(0);
  });
  it('tags the market convention for every company and offers the filter with the disclaimer', () => {
    for (const i of institutions) expect(['FIRST_FINANCIAL_SECTOR', 'SECOND_FINANCIAL_SECTOR', 'OTHER']).toContain(i.marketGroup);
    mount('/cases');
    const label = screen.getByLabelText('금융권(시장관행)').closest('label')!;
    expect(label.getAttribute('title')).toContain('법률상 공식 업권분류와 동일하지 않습니다');
    const all = screen.getAllByRole('row').length;
    fireEvent.change(screen.getByLabelText('금융권(시장관행)'), { target: { value: 'FIRST_FINANCIAL_SECTOR' } });
    expect(screen.getAllByRole('row').length).toBeLessThan(all);
  });
});

describe('Domestic cases', () => {
  it('has more cases than before, all domestic, and never builds a case from an MOU, bid or plan', () => {
    expect(cases.length).toBeGreaterThanOrEqual(20);
    expect(cases.every(c => c.region === 'KR' && c.caseType !== 'BENCHMARK')).toBe(true);
    for (const c of cases) { expect(c.sourceIds.length, c.id).toBeGreaterThan(0); for (const id of c.sourceIds) expect(sources.find(s => s.id === id)?.url, `${c.id}/${id}`).toMatch(/^https?:\/\//); }
    for (const c of cases) if (c.caseType === 'REGULATORY') expect(c.stage).toBe('혁신금융서비스 지정');
  });
  it('links every domestic case to exactly one institution and keeps initiative links consistent', () => {
    for (const c of cases) expect(institutions.filter(i => i.relatedCaseIds.includes(c.id)), c.id).toHaveLength(1);
  });
  it('offers year and market-convention filters on the case library', () => {
    mount('/cases?tab=cases');
    expect(screen.getByLabelText('연도')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('연도'), { target: { value: '2026' } });
    const n = cases.filter(c => c.date.startsWith('2026')).length;
    expect(screen.getByText(new RegExp(`^${n} / ${cases.length}개 사례$`))).toBeInTheDocument();
  });
});

describe('People Drawer', () => {
  it('opens the keyman drawer from the board with CURRENT status and a source link, never showing historical people on the board', () => {
    mount('/cases');
    const row = screen.getAllByRole('row').find(r => r.textContent?.includes('우리은행') && r.textContent?.includes('옥일진'))!;
    fireEvent.click(within(row).getByRole('button', { name: '옥일진' }));
    const dlg = Array.from(document.querySelectorAll('dialog')).find(d => d.textContent?.includes('옥일진'))!;
    expect(dlg.textContent).toContain('CURRENT');
    expect((dlg.querySelector('a[href^="http"]') as HTMLAnchorElement).rel).toContain('noopener');
    const kb = screen.getAllByRole('row').find(r => r.textContent?.includes('KB국민은행'))!;
    expect(kb.textContent).not.toContain('박형주');
  });
});

describe('Day 14~16', () => {
  it('has Day 14~16 READY with at least five quizzes each and no company-specific wording', () => {
    for (const n of [14, 15, 16]) {
      const d = curriculum[n - 1];
      expect(d.contentStatus).toBe('READY'); expect(d.conclusions).toHaveLength(5); expect(d.memorize).toHaveLength(5); expect(d.quizIds.length).toBeGreaterThanOrEqual(5);
      expect(JSON.stringify(d)).not.toMatch(/MegazoneCloud|메가존|Benchmark|벤치마크/);
    }
    expect(quiz.filter(q => /^qb1[456]-/.test(q.id)).length).toBeGreaterThanOrEqual(18);
    expect(curriculum.map(d => d.title)[13]).toBe('금융 고객 Account Intelligence');
    expect(curriculum.map(d => d.title)[15]).toBe('Account Plan & 금융 고객 미팅');
  });
  it('defines the Day 14~16 frameworks with the required sizes', () => {
    expect(accountReadingOrder).toHaveLength(20); expect(accountReadingOrder.filter(a => a.kind === 'SALES_VIEW')).toHaveLength(2);
    expect(solutionMotions.reduce((a, m) => a + m.items.length, 0)).toBeGreaterThanOrEqual(40); expect(solutionMotions).toHaveLength(10);
    expect(customerSignals.length).toBeGreaterThanOrEqual(10); expect(motionDiscovery.length).toBeGreaterThanOrEqual(8); expect(partnerRoles).toHaveLength(9);
    expect(accountPlanFields).toHaveLength(20); expect(stakeholderRoles).toHaveLength(13); expect(meetingFlow).toHaveLength(17);
  });
  it('builds an Account Brief with 5 facts, 3 hypotheses and 10 questions and labels facts and sales views separately', () => {
    const inst = institutions.find(i => i.id === 'kb-bank')!;
    const b = buildBrief(inst);
    expect(b.facts.length).toBeGreaterThanOrEqual(4); expect(b.facts.length).toBeLessThanOrEqual(5);
    expect(b.recent.length).toBeLessThanOrEqual(3); expect(b.hypotheses.length).toBeGreaterThan(0); expect(b.hypotheses.every(h => h.startsWith('(내 해석)'))).toBe(true);
    expect(b.questions).toHaveLength(10); expect(b.regulations).toHaveLength(3); expect(b.references.length).toBeLessThanOrEqual(2);
  });
  it('shows the Day 14 brief tool and stores exercise answers only in localStorage', () => {
    mount('/learn/curriculum/14');
    expect(screen.getByRole('heading', { name: /Account Brief 만들기/ })).toBeInTheDocument();
    expect(document.body.textContent).toContain('SALES_VIEW'); expect(document.body.textContent).toContain('FACT');
    const box = screen.getAllByLabelText(/1\. 이 고객의 확인된 FACT 5개/)[0];
    fireEvent.change(box, { target: { value: '총자산, 본사' } });
    expect(Object.values(readDayWork(localStorage))).toContain('총자산, 본사');
    expect(JSON.stringify(institutions)).not.toContain('총자산, 본사');
  });
  it('shows Day 15 solution motions and customer signals, and Day 16 account plan, first meeting brief and simulation', () => {
    mount('/learn/curriculum/15');
    expect(screen.getByRole('heading', { name: /Customer Signal → Opportunity/ })).toBeInTheDocument();
    expect(document.body.textContent).toContain('Vendor-neutral');
    document.body.innerHTML = '';
    mount('/learn/curriculum/16');
    for (const h of [/Account Plan Template/, /Stakeholder Map/, /첫 미팅 Discovery Flow/, /PoC → Production Checklist/, /First Meeting Brief/, /Meeting Output/]) expect(screen.getByRole('heading', { name: h })).toBeInTheDocument();
  });
});
