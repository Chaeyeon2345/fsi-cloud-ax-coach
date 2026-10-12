import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../app/App';
import { content, institutions, sources } from '../content';
import { assetRanks, chipLabel, evidenceSummary, leaderNeedsRecheck, publicOrganizations, sortForDisplay } from '../domain/accounts';
import { displaySectorOf, displaySectors, type ContentStore, type FinancialInstitution } from '../domain/types';
import { validateContent } from '../domain/validate';
import { readAccountNotes, writeAccountNote } from '../storage/persistence';
import { searchContent } from '../features/search';

const mount = (path: string) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
const clone = (): ContentStore => structuredClone(content);
const errorsOf = (d: ContentStore) => validateContent(d).join(' | ');
beforeEach(() => localStorage.clear());

describe('금융시장 IT·AX Index · data model & validation', () => {
  it('passes validation and covers the main display sectors', () => {
    expect(validateContent(content)).toEqual([]);
    expect(institutions.length).toBeGreaterThanOrEqual(35);
    const shown = new Set(institutions.map(i => displaySectorOf[i.sector]));
    for (const s of ['BANKING', 'CARD', 'SECURITIES', 'INSURANCE', 'CAPITAL', 'SAVINGS_BANK'] as const) expect(shown.has(s), s).toBe(true);
  });
  it('keeps the display sector order and separates it from the regulatory category', () => {
    expect(displaySectors).toEqual(['BANKING', 'CARD', 'SECURITIES', 'INSURANCE', 'CAPITAL', 'SAVINGS_BANK', 'MUTUAL_FINANCE', 'FINTECH', 'ASSET_INVEST', 'INFRA_CREDIT', 'OTHER']);
    const ordered = sortForDisplay(institutions).map(i => displaySectors.indexOf(displaySectorOf[i.sector]));
    expect(ordered).toEqual([...ordered].sort((a, b) => a - b));
    expect(institutions.find(i => i.id === 'samsung-sec')?.regulatoryCategory).toBe('CAPITAL_MARKET');
    expect(institutions.find(i => i.id === 'samsung-life')?.subSector).toBe('생명보험');
    expect(institutions.find(i => i.id === 'samsung-fire')?.subSector).toBe('손해보험');
  });
  it('every institution has a universe source (roster) separate from its initiative sources', () => {
    for (const i of institutions) {
      if (i.universeSourceId) expect(sources.find(s => s.id === i.universeSourceId)?.kind, i.id).toBe('INSTITUTION_ROSTER');
      else expect(i.rosterNote, i.id).toBeTruthy();
    }
  });
  it('never creates a maturity score or sales memo in the public seed', () => {
    for (const i of institutions) {
      expect(i).not.toHaveProperty('aiMaturity'); expect(i).not.toHaveProperty('cloudMaturity'); expect(i).not.toHaveProperty('salesHypotheses');
    }
  });
  it('uses 조사 수준 coverage: no initiative ⇒ UNRESEARCHED, never "none/미도입"', () => {
    const empty = institutions.filter(i => i.initiatives.length === 0);
    expect(empty.length).toBeGreaterThan(0);
    for (const i of empty) expect(i.researchCoverage).toBe('UNRESEARCHED');
  });
  it('links each existing Korean case to exactly one institution without copying data', () => {
    for (const c of content.cases.filter(c => c.region === 'KR')) expect(institutions.filter(i => i.relatedCaseIds.includes(c.id)), c.id).toHaveLength(1);
  });
  it('sets sourceStage only where the stage is stated and every initiative has a source type', () => {
    for (const i of institutions) for (const x of i.initiatives) {
      expect(x.sourceIds.length).toBeGreaterThan(0);
      expect(x.domains.length).toBeGreaterThan(0);
      for (const id of x.sourceIds) expect(sources.find(s => s.id === id)?.sourceType, `${x.id}/${id}`).toBeTruthy();
    }
  });
  it('does not put speculative wording into fact fields', () => {
    for (const i of institutions) for (const x of i.initiatives) expect(`${x.title} ${x.summary} ${(x.businessOutcome ?? []).join(' ')}`).not.toMatch(/추정|아마(?!존)|가능성이 높/);
  });
  it('rejects an initiative without a source', () => {
    const d = clone(); d.institutions.find(i => i.initiatives.length)!.initiatives[0].sourceIds = [];
    expect(errorsOf(d)).toMatch(/Initiative without source/);
  });
  it('rejects a leader or department without a source', () => {
    const a = clone(); a.institutions[0].publicLeaders = [{ personName: '홍길동', title: 'AX그룹장', sourceIds: [], lastVerifiedAt: '2026-10-11' }];
    expect(errorsOf(a)).toMatch(/Leader source/);
    const b = clone(); b.institutions[0].ownerDepartments = [{ name: 'AI본부', sourceIds: [], lastVerifiedAt: '2026-10-11' }];
    expect(errorsOf(b)).toMatch(/Organization source/);
    const c = clone(); const x = c.institutions.find(i => i.initiatives.length)!.initiatives[0]; x.ownerDepartments = [{ name: 'AI본부', sourceIds: [], lastVerifiedAt: '2026-10-11' }];
    expect(errorsOf(c)).toMatch(/Organization source/);
  });
  it('rejects total assets without as-of date, basis, unit and source; and mixed basis inside a sector', () => {
    const a = clone(); a.institutions[0].scale = { totalAssets: 100, assetSourceIds: [] };
    expect(errorsOf(a)).toMatch(/Asset source/);
    const b = clone();
    const banks = b.institutions.filter(i => displaySectorOf[i.sector] === 'BANKING');
    const src = banks[0].sourceIds[0];
    banks[0].scale = { totalAssets: 10, unit: '조원', assetAsOf: '2026-06-30', assetBasis: '별도', assetSourceIds: [src] };
    banks[1].scale = { totalAssets: 9, unit: '조원', assetAsOf: '2026-06-30', assetBasis: '연결', assetSourceIds: [src] };
    expect(errorsOf(b)).toMatch(/Asset basis mixed/);
  });
  it('rejects speculative wording and unknown stages in verified initiatives', () => {
    const a = clone(); a.institutions.find(i => i.initiatives.length)!.initiatives[0].summary = 'AI를 확대할 가능성이 높음';
    expect(errorsOf(a)).toMatch(/Speculative wording/);
    const b = clone(); (b.institutions.find(i => i.initiatives.length)!.initiatives[0] as { sourceStage?: string }).sourceStage = 'MAGIC';
    expect(errorsOf(b)).toMatch(/Initiative:/);
  });
  it('rejects a source without a source type used by an institution', () => {
    const d = clone(); const id = d.institutions[0].sourceIds[0]; delete d.sources.find(s => s.id === id)!.sourceType;
    expect(errorsOf(d)).toMatch(/Source type missing/);
  });
  it('rejects a mismatch between coverage and initiatives', () => {
    const d = clone(); d.institutions.find(i => i.initiatives.length)!.researchCoverage = 'UNRESEARCHED';
    expect(errorsOf(d)).toMatch(/research coverage/);
  });
});

describe('금융시장 IT·AX Index · asset sorting and ranking', () => {
  const mk = (id: string, sector: FinancialInstitution['sector'], total: number | null, basis = '별도', asOf = '2026-06-30'): FinancialInstitution => ({
    id, name: id, marketGroup: 'FIRST_FINANCIAL_SECTOR', sector, regulatoryCategory: 'BANKING', researchCoverage: 'UNRESEARCHED', ownerDepartments: [], publicLeaders: [], initiatives: [], relatedCaseIds: [], sourceIds: [],
    scale: total == null ? undefined : { totalAssets: total, unit: '조원', assetAsOf: asOf, assetBasis: basis, assetSourceIds: ['x'] },
  });
  it('ranks within one sector by total assets only when basis and as-of date are identical', () => {
    const list = [mk('a', 'BANK', 10), mk('b', 'BANK', 30), mk('c', 'BANK', 20), mk('z', 'CARD', 5)];
    const r = assetRanks(list);
    expect([r.get('b'), r.get('c'), r.get('a')]).toEqual([1, 2, 3]);
    expect(r.get('z')).toBeNull(); // 한 회사뿐인 업권은 순위를 만들지 않는다
    expect(sortForDisplay(list).map(i => i.id)).toEqual(['b', 'c', 'a', 'z']);
  });
  it('leaves rank null when basis, date or assets are not comparable', () => {
    expect(assetRanks([mk('a', 'BANK', 10), mk('b', 'BANK', 30, '연결')]).get('a')).toBeNull();
    expect(assetRanks([mk('a', 'BANK', 10), mk('b', 'BANK', 30, '별도', '2026-03-31')]).get('b')).toBeNull();
    expect(assetRanks([mk('a', 'BANK', 10), mk('b', 'BANK', null)]).get('a')).toBeNull();
  });
  it('does not mix rankings across sectors', () => {
    const r = assetRanks([mk('bank', 'BANK', 100), mk('bank2', 'BANK', 50), mk('card', 'CARD', 5), mk('card2', 'CARD', 9)]);
    expect([r.get('bank'), r.get('bank2'), r.get('card'), r.get('card2')]).toEqual([1, 2, 2, 1]);
  });
});

describe('금융시장 IT·AX Index · evidence helpers', () => {
  it('shows a stage on a chip only when the source states one', () => {
    const base = institutions.find(i => i.initiatives.length)!.initiatives[0];
    expect(chipLabel({ ...base, sourceStage: undefined, announcedAt: '2026-03-18', technologyKeywords: ['GenAI'] }, 'AI_AX')).toBe('GenAI · 2026');
    expect(chipLabel({ ...base, sourceStage: 'PRODUCTION', announcedAt: '2026-03-18', technologyKeywords: ['GenAI'] }, 'AI_AX')).toBe('GenAI · 운영 2026');
  });
  it('summarises evidence as counts only and limits public organizations to two', () => {
    const inst = institutions.find(i => i.initiatives.length > 2)!;
    const sum = evidenceSummary(inst);
    expect(sum.total).toBe(inst.initiatives.length);
    expect(publicOrganizations({ ownerDepartments: [{ name: 'A', sourceIds: ['s'], lastVerifiedAt: '2026-10-11' }, { name: 'B', sourceIds: ['s'], lastVerifiedAt: '2026-10-11' }, { name: 'C', sourceIds: ['s'], lastVerifiedAt: '2026-10-11' }], initiatives: [] }).length).toBe(2);
  });
  it('flags leaders not verified within 90 days and keeps historical leaders un-flagged', () => {
    const today = new Date('2026-10-11');
    expect(leaderNeedsRecheck({ lastVerifiedAt: '2026-01-01' }, today)).toBe(true);
    expect(leaderNeedsRecheck({ lastVerifiedAt: '2026-09-20' }, today)).toBe(false);
    expect(leaderNeedsRecheck({ lastVerifiedAt: '2025-01-01', historical: true }, today)).toBe(false);
  });
  it('stores the personal memo only in localStorage under its own key', () => {
    expect(writeAccountNote(localStorage, 'kb-bank', '다음 미팅 준비')).toBe(true);
    expect(readAccountNotes(localStorage)['kb-bank']).toBe('다음 미팅 준비');
    writeAccountNote(localStorage, 'kb-bank', '');
    expect(readAccountNotes(localStorage)['kb-bank']).toBeUndefined();
    expect(JSON.stringify(institutions)).not.toContain('다음 미팅 준비');
  });
});

describe('금융시장 IT·AX Index · UI', () => {
  it('is a tab inside 금융 사례 without a new main nav item', () => {
    mount('/cases');
    expect(screen.getByRole('link', { name: '시장 모판' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '국내 사업 사례' })).toBeInTheDocument();
    expect(within(screen.getByRole('navigation', { name: '주 메뉴' })).getAllByRole('link')).toHaveLength(5);
  });
  it('renders the matrix columns in the specified order with sector grouping and "공개 확인자료 없음" for unresearched companies', () => {
    mount('/cases?tab=index');
    const headers = screen.getAllByRole('columnheader').map(h => h.textContent);
    expect(headers).toEqual(['업권', '회사', '총자산', '본사 지역', '공개 Keyman', 'Core·On-prem', 'Public Cloud', 'Data', 'AI·AX', 'Security·DR', 'Ecosystem', '최근 Initiative']);
    expect(screen.getAllByRole('row').length).toBeGreaterThan(30);
    expect(screen.getAllByText(/공개 확인자료 없음 \/ 추가 조사 필요/).length).toBeGreaterThan(0);
    expect(document.body.textContent).not.toMatch(/AI 성숙도|Cloud 성숙도|ADVANCED|미도입/);
  });
  it('filters by search, sector and IT domain', () => {
    mount('/cases?tab=index');
    const all = screen.getAllByRole('row').length;
    fireEvent.change(screen.getByPlaceholderText(/회사·그룹/), { target: { value: 'JB' } });
    expect(screen.getAllByRole('row').length).toBeLessThan(all);
    fireEvent.change(screen.getByPlaceholderText(/회사·그룹/), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('업권'), { target: { value: 'CARD' } });
    expect(screen.getAllByRole('row').length).toBeLessThan(all);
    fireEvent.change(screen.getByLabelText('업권'), { target: { value: '전체' } });
    fireEvent.change(screen.getByLabelText('IT Theme'), { target: { value: 'AI_AX' } });
    expect(screen.getAllByRole('row').length).toBeLessThan(all);
  });
  it('opens an initiative drawer from a chip (no external navigation) with source links', () => {
    mount('/cases?tab=index');
    const row = screen.getAllByRole('row').find(r => r.textContent?.includes('JB우리캐피탈'))!;
    const chip = within(row).getAllByRole('button').find(b => b.className.includes('chip'))!;
    fireEvent.click(chip);
    const dlg = document.querySelector('dialog')!;
    expect(dlg.textContent).toContain('근거 Source');
    const link = dlg.querySelector('a[href^="http"]') as HTMLAnchorElement;
    expect(link).toBeTruthy(); expect(link.rel).toContain('noopener'); expect(link.target).toBe('_blank');
    expect(dlg.textContent).toMatch(/공개된 단계|원문에 단계 명시 없음/);
  });
  it('opens the account overview with all ten sections, the memo box and no sales hypothesis', () => {
    mount('/cases/accounts/jb-woori-capital');
    for (const h of ['1. 회사 기본정보', '2. 업권 · 금융그룹', '3. 규모 및 순위', '4. 공개 조직 · IT·AX 책임자', '5. IT Footprint Matrix', '6. 최근 3년 IT·AX Initiative Timeline', '7. 확인된 CSP · MSP/SI · Product · Vendor', '8. 관련 내부 Case', '9. Source Library', '10. Discovery Questions', '11. 내 메모'])
      expect(screen.getByRole('heading', { name: h })).toBeInTheDocument();
    expect(screen.getByText(/Evidence Summary/)).toBeInTheDocument();
    expect(document.body.textContent).not.toContain('사업기회 가설');
    expect(document.body.textContent).not.toContain('면접');
    fireEvent.change(screen.getByLabelText('내 메모'), { target: { value: '메모' } });
    expect(readAccountNotes(localStorage)['jb-woori-capital']).toBe('메모');
  });
  it('shows an unresearched account without claiming "no activity"', () => {
    const empty = institutions.find(i => i.initiatives.length === 0)!;
    mount(`/cases/accounts/${empty.id}`);
    expect(document.body.textContent).toContain('공개 확인자료 없음 / 추가 조사 필요');
    expect(document.body.textContent).toContain('해당 사실이 없다는 뜻이 아닙니다');
  });
  it('finds institutions and initiatives from search and keeps the old ?tab=map link working', () => {
    expect(searchContent('JB우리캐피탈').some(r => r.path.startsWith('/cases/accounts/'))).toBe(true);
    mount('/cases?tab=map');
    expect(screen.getAllByRole('columnheader').length).toBe(12);
  });
});
