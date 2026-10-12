import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../app/App';
import { content, institutions, sources } from '../content';
import { assetRanks, sortForDisplay, officialSourceShare, scaleText } from '../domain/accounts';
import { displaySectorOf, displaySectors, initiativeStatuses, type ContentStore, type FinancialInstitution } from '../domain/types';
import { validateContent } from '../domain/validate';
import { stageForcedNull } from '../content/accountEnrichment';
import { amTakeawayFor, discoveryQuestionsFor } from '../features/initiativeInsights';

const mount = (path: string) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
const clone = (): ContentStore => structuredClone(content);
const initiatives = institutions.flatMap(i => i.initiatives);
beforeEach(() => localStorage.clear());

describe('Phase C.5 · sourceStage re-verification', () => {
  it('has re-verified the stage of the initiatives whose sources could be read', () => {
    expect(initiatives.filter(i => i.stageReviewedAt).length).toBeGreaterThanOrEqual(60);
  });
  it('never keeps the old ANNOUNCED stage and keeps only valid stages with a short evidence quote', () => {
    for (const i of initiatives) {
      expect(i.sourceStage).not.toBe('ANNOUNCED');
      if (i.sourceStage) { expect(initiativeStatuses).toContain(i.sourceStage); expect(i.stageEvidenceQuote, i.id).toBeTruthy(); expect(i.stageEvidenceQuote!.length).toBeLessThanOrEqual(120); }
      else expect(i.stageEvidenceQuote).toBeUndefined();
    }
  });
  it('does not convert weak wording (plans, MOUs, designations, bids) into a stage', () => {
    for (const id of Object.keys(stageForcedNull)) { const x = initiatives.find(i => i.id === id); expect(x, id).toBeDefined(); expect(x!.sourceStage, id).toBeUndefined(); }
    // 계약·협약·지정·수주 성격의 사업은 단계를 비운다
    for (const id of ['kb-card-1', 'samsung-card-1', 'bc-card-1', 'hyundai-marine-1', 'korean-re-1', 'korean-re-2', 'koreainvest-sec-1', 'ibk-sec-1', 'hana-bank-2'])
      { const x = initiatives.find(i => i.id === id); expect(x, id).toBeDefined(); expect(x!.sourceStage, id).toBeUndefined(); }
  });
  it('rejects a reviewed stage without an evidence quote', () => {
    const d = clone(); const x = d.institutions.flatMap(i => i.initiatives).find(i => i.sourceStage)!; x.stageEvidenceQuote = undefined;
    expect(validateContent(d).join(' ')).toMatch(/Stage evidence quote/);
  });
});

describe('Phase C.5 · total assets and ranking', () => {
  it('has total assets only on the common basis (별도, 2025-12-31, 원) with a DART source URL', () => {
    const scaled = institutions.filter(i => i.scale?.totalAssets != null);
    expect(scaled.length).toBeGreaterThanOrEqual(35);
    for (const i of scaled) {
      expect(i.scale!.assetBasis).toContain('별도'); expect(i.scale!.assetAsOf).toBe('2025-12-31'); expect(i.scale!.unit).toBe('원');
      const src = sources.find(s => s.id === i.scale!.assetSourceIds[0])!;
      expect(src.url).toMatch(/^https:\/\/dart\.fss\.or\.kr\/dsaf001\/main\.do\?rcpNo=\d+$/); expect(src.sourceType).toBe('DISCLOSURE');
    }
  });
  it('creates ranks only for sectors where every listed company has common-basis assets', () => {
    const r = assetRanks(institutions);
    const sectors = [...new Set(institutions.map(i => displaySectorOf[i.sector]))];
    for (const ds of sectors) {
      const group = institutions.filter(i => displaySectorOf[i.sector] === ds);
      const complete = group.length > 1 && group.every(i => i.scale?.totalAssets != null);
      expect(group.every(i => (r.get(i.id) != null) === complete), ds).toBe(true);
    }
    const sorted = sortForDisplay(institutions).filter(i => displaySectorOf[i.sector] === 'BANKING' && i.scale?.totalAssets != null);
    expect(sorted[0].name).toBe('KB국민은행');
    const assets = sorted.map(i => i.scale!.totalAssets!);
    expect(assets).toEqual([...assets].sort((a, b) => b - a));
  });
  it('keeps the specified sector order and shows equity as a secondary metric for securities', () => {
    const order = sortForDisplay(institutions).map(i => displaySectors.indexOf(displaySectorOf[i.sector]));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    const sec = institutions.filter(i => i.sector === 'SECURITIES' && i.scale);
    expect(sec.length).toBeGreaterThan(0);
    for (const i of sec) expect(i.scale!.secondaryScaleMetric?.label).toContain('자기자본');
  });
  it('sorts same-sector companies without assets by Korean reading so KB/NH/IBK are not pushed back', () => {
    const mk = (id: string, name: string, sortNameKo?: string): FinancialInstitution => ({ id, name, sortNameKo, marketGroup: 'FIRST_FINANCIAL_SECTOR', sector: 'BANK', regulatoryCategory: 'BANKING', researchCoverage: 'UNRESEARCHED', ownerDepartments: [], publicLeaders: [], initiatives: [], relatedCaseIds: [], sourceIds: [] });
    const list = [mk('s', '신한은행'), mk('n', 'NH농협은행', '농협은행'), mk('k', 'KB국민은행', '국민은행'), mk('h', '하나은행')];
    expect(sortForDisplay(list).map(i => i.id)).toEqual(['k', 'n', 's', 'h']);
  });
  it('shows assets in 조원 and "미확보" for missing values', () => {
    expect(scaleText(institutions.find(i => i.id === 'kb-bank')!)).toMatch(/^563\.6조원/);
    expect(scaleText(institutions.find(i => i.id === 'ok-sb')!)).toBe('미확보');
  });
});

describe('Phase C.5 · deep research candidates, organizations and leaders', () => {
  it('marks about 20~25 DB research priority companies and only reviews-complete ones as DEEP', () => {
    const priority = institutions.filter(i => i.dbResearchPriority);
    expect(priority.length).toBeGreaterThanOrEqual(20); expect(priority.length).toBeLessThanOrEqual(25);
    const deep = institutions.filter(i => i.researchCoverage === 'DEEP');
    expect(deep.length).toBeGreaterThan(0);
    for (const i of deep) { expect(i.dbResearchPriority).toBe(true); expect(i.initiatives.every(x => x.stageReviewedAt)).toBe(true); }
  });
  it('rejects DEEP coverage for a company that is not a priority target or has unreviewed initiatives', () => {
    const d = clone(); const x = d.institutions.find(i => i.researchCoverage === 'BASIC')!; x.researchCoverage = 'DEEP'; x.dbResearchPriority = false;
    expect(validateContent(d).join(' ')).toMatch(/Deep coverage requirements/);
  });
  it('stores every person with name, exact title, department, as-of date, source URL and lastVerifiedAt', () => {
    const people = institutions.flatMap(i => i.publicLeaders);
    expect(people.length).toBeGreaterThan(0);
    for (const l of people) {
      expect(l.personName && l.title && l.department && l.asOfDate && l.lastVerifiedAt).toBeTruthy();
      for (const id of l.sourceIds) expect(sources.find(s => s.id === id)?.url).toMatch(/^https?:\/\//);
      expect(['CUSTOMER_OFFICIAL', 'PROFESSIONAL_MEDIA']).toContain(sources.find(s => s.id === l.sourceIds[0])?.sourceType);
    }
    // 보도 기반은 해당 시점의 직책(historical)로만 저장한다
    for (const i of institutions) for (const l of i.publicLeaders) if (sources.find(s => s.id === l.sourceIds[0])?.sourceType === 'PROFESSIONAL_MEDIA') expect(l.historical).toBe(true);
  });
  it('has public organizations only where a source states them', () => {
    const withOrg = institutions.filter(i => i.initiatives.some(x => x.ownerDepartments?.length));
    expect(withOrg.length).toBeGreaterThanOrEqual(15);
    for (const x of initiatives) for (const o of x.ownerDepartments ?? []) expect(o.sourceIds.every(id => x.sourceIds.includes(id))).toBe(true);
  });
});

describe('Phase C.5 · SALES_VIEW takeaway and discovery questions', () => {
  it('gives every initiative an amTakeaway marked as a sales interpretation and 2~5 discovery questions', () => {
    for (const i of initiatives) {
      expect(i.amTakeaway, i.id).toMatch(/영업 해석/);
      expect(i.discoveryQuestions!.length).toBeGreaterThanOrEqual(2); expect(i.discoveryQuestions!.length).toBeLessThanOrEqual(5);
    }
  });
  it('turns a RAG/GenAI initiative into permission, owner and citation questions and does not claim a stage when none is stated', () => {
    const q = discoveryQuestionsFor({ domains: ['AI_AX'], technologyKeywords: ['RAG'] }).join(' ');
    expect(q).toContain('권한체계'); expect(q).toContain('갱신'); expect(q).toContain('citation');
    expect(amTakeawayFor({ domains: ['AI_AX'], technologyKeywords: [] })).toContain('확인되지 않은');
    expect(amTakeawayFor({ domains: ['AI_AX'], technologyKeywords: [], sourceStage: 'PRODUCTION' })).toContain('운영 단계라고 밝힌');
  });
});

describe('Phase C.5 · Source quality', () => {
  it('has a URL for every source behind a verified institution fact', () => {
    for (const i of institutions) for (const id of i.sourceIds) expect(sources.find(s => s.id === id)?.url, `${i.id}/${id}`).toMatch(/^https?:\/\/\S+$/);
  });
  it('reports the official-source share as a composition, not a score', () => {
    const inst = institutions.find(i => i.id === 'jb-woori-capital')!;
    const share = officialSourceShare(inst, sources);
    expect(share.total).toBeGreaterThan(0); expect(share.official).toBeLessThanOrEqual(share.total);
  });
});

describe('Phase C.5 · UI', () => {
  it('shows assets, ranks and chips in the matrix and keeps the sector order', () => {
    mount('/cases?tab=index');
    const rows = screen.getAllByRole('row');
    const kb = rows.find(r => r.textContent?.includes('KB국민은행'))!;
    expect(kb.textContent).toContain('563.6조원');
    expect(rows[1].textContent).toContain('은행');
  });
  it('shows the drawer with sales view, purpose and stage evidence, and the account overview with categorized Source Library and evidence summary', () => {
    mount('/cases/accounts/kb-bank');
    expect(screen.getByRole('heading', { name: 'Evidence Summary' })).toBeInTheDocument();
    expect(document.body.textContent).toContain('공식 출처 비중');
    expect(document.body.textContent).toContain('DB 심층조사 대상');
    expect(document.body.textContent).toContain('뒷받침하는 Fact');
    expect(document.body.textContent).toMatch(/재무기준.*별도/s);
    const chip = Array.from(document.querySelectorAll('button')).find(b => b.className.includes('chip'))!;
    fireEvent.click(chip);
    const dlg = document.querySelector('dialog')!;
    expect(dlg.textContent).toContain('SALES_VIEW'); expect(dlg.textContent).toContain('AM Takeaway'); expect(dlg.textContent).toContain('다음 고객에게 물어볼 질문');
    expect(dlg.textContent).toContain('사업 목적'); expect(dlg.textContent).toContain('대상 사용자');
  });
});
