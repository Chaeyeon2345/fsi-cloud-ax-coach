import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../app/App';
import { cases, curriculum, institutions, knowledge, sources } from '../content';
import { matrixRows } from '../content/cloudAxMatrix';
import { discoveryBank } from '../content/cloudAxDiscovery';
import { patterns, requirements } from '../content/cloudAxGuide';
import { clauses, misstatements, practices, topics } from '../content/regulationPlaybook';

const mount = (path: string) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
beforeEach(() => localStorage.clear());

describe('Product clean-up · Home and wording', () => {
  it('has no TODAY\'S MEETING on Home and keeps only current day, continue and curriculum progress', () => {
    mount('/learn');
    expect(document.body.textContent).not.toContain("TODAY'S MEETING");
    expect(screen.getByText(/현재 학습/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '전체 Curriculum 진행상태' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /시작|이어서 학습/ })).toBeInTheDocument();
  });
  it('keeps the removed Home question available in Day 1 and the meeting question bank', () => {
    expect(curriculum[0].meetingIds).toContain('m1');
  });
  it('does not centre the curriculum on a specific company', () => {
    const text = JSON.stringify(curriculum.map(d => [d.title, d.goal]));
    expect(text).not.toMatch(/MegazoneCloud|메가존|리셀링/);
    expect(curriculum[14].title).toBe('금융 고객의 IT·AX 사업기회 구조');
    expect(curriculum.every(d => d.contentStatus === 'READY')).toBe(true);
  });
  it('never uses the prohibited word or job-seeking wording in the UI sources', () => {
    const text = JSON.stringify([curriculum, knowledge.map(k => k.title)]);
    expect(text).not.toMatch(/면접|입사|취업/);
  });
});

describe('Cloud·AX Architecture', () => {
  it('has four tabs and opens the deployment comparison first', () => {
    mount('/cloud-ax');
    const nav = within(screen.getByRole('navigation', { name: 'Cloud·AX 탭' })).getAllByRole('link');
    expect(nav.map(a => a.textContent)).toEqual(['배포모델 비교', '요건 → Architecture', 'Discovery 질문', '대표 Pattern']);
    expect(within(document.querySelector('thead') as HTMLElement).getAllByRole('columnheader').map(h => h.textContent)).toEqual(['비교 기준', 'Public Cloud', 'Hybrid', 'On-premises', 'Private Cloud', 'Private AI']);
  });
  it('compares the required criteria side by side and never ranks a model', () => {
    expect(matrixRows.length).toBeGreaterThanOrEqual(26);
    const labels = matrixRows.map(r => r.label).join('|');
    for (const l of ['가장 적합한 상황', 'Data 위치', 'CapEx', 'GPU/NPU 확보 방식', 'IAM / 권한통제', 'Vendor lock-in 고려', '규제 검토 포인트', 'AM이 먼저 확인할 것', 'SA에게 넘길 시점']) expect(labels).toContain(l);
    expect(JSON.stringify(matrixRows)).not.toMatch(/가장 안전|가장 최신|가장 적합한 모델/);
  });
  it('keeps at least 40 distinct discovery questions, each with why and impact, grouped by the 16 categories', () => {
    expect(discoveryBank.length).toBeGreaterThanOrEqual(40);
    expect(new Set(discoveryBank.map(d => d.q)).size).toBe(discoveryBank.length);
    for (const d of discoveryBank) { expect(d.why, d.id).toBeTruthy(); expect(d.impact, d.id).toBeTruthy(); }
    expect(new Set(discoveryBank.map(d => d.category)).size).toBe(16);
  });
  it('shows the discovery table with the four required columns', () => {
    mount('/cloud-ax?tab=discovery');
    const heads = screen.getAllByRole('columnheader').map(h => h.textContent);
    expect(heads).toEqual(expect.arrayContaining(['질문', '왜 묻는가', '답변에 따라 달라지는 것', '관련 Architecture']));
  });
  it('turns requirements into candidates with reasons, counter conditions and SA handoff — without a score', () => {
    mount('/cloud-ax?tab=requirement');
    fireEvent.click(screen.getByRole('button', { name: /내부 Data는 On-prem/ }));
    expect(screen.getByRole('heading', { name: '우선 검토 Architecture' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: /^Hybrid/ })).toBeInTheDocument();
    for (const h of ['왜 후보인가', '추가 확인할 점', '반대 옵션도 가능한 조건', '주요 Risk', 'SA Handoff']) expect(screen.getByRole('columnheader', { name: h })).toBeInTheDocument();
    expect(document.body.textContent).toContain('점수나 정답이 아닙니다');
    expect(requirements).toHaveLength(16);
  });
  it('offers five to seven patterns that reference existing discovery questions, cases and cards', () => {
    expect(patterns.length).toBeGreaterThanOrEqual(5); expect(patterns.length).toBeLessThanOrEqual(7);
    for (const p of patterns) {
      p.discoveryIds.forEach(i => expect(discoveryBank.some(d => d.id === i), `${p.id}/${i}`).toBe(true));
      p.caseIds.forEach(i => expect(cases.some(c => c.id === i), `${p.id}/${i}`).toBe(true));
      p.knowledgeIds.forEach(i => expect(knowledge.some(k => k.id === i), `${p.id}/${i}`).toBe(true));
      expect(p.flow.length).toBeGreaterThan(2); expect(p.avoid.length).toBeGreaterThan(0);
    }
  });
});

describe('금융 IT·규제 Playbook', () => {
  it('has five tabs, the 13 required areas and a 12-part detail for each area', () => {
    mount('/regulation');
    const nav = within(screen.getByRole('navigation', { name: '금융 IT·규제 탭' })).getAllByRole('link');
    expect(nav.map(a => a.textContent)).toEqual(['규제 지도', '핵심 조항', '업무별 적용', '실무 통제', '변화·FAQ']);
    expect(topics.map(t => t.code)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M']);
    for (const t of topics) { expect(knowledge.some(k => k.id === t.cardId), t.id).toBe(true); expect(t.kinds.length).toBeGreaterThan(0); }
  });
  it('shows the 12 detail parts for a selected topic from the Single Source card', () => {
    mount('/regulation?topic=t-saas');
    for (const h of ['한 줄 결론', '왜 존재하는가', '적용 Trigger (언제 적용되는가)', '핵심 Requirement (중요한 조항)', '금융회사 실무에서 무엇을 준비하는가', 'Cloud/AX 사업 영향', '고객에게 물을 질문', '흔한 오해', 'AE가 알아야 할 수준', 'SA / Security / Legal Handoff', '관련 Case', '공식 Source', 'lastVerifiedAt'])
      expect(screen.getByRole('heading', { name: h })).toBeInTheDocument();
  });
  it('has a clause table, at least 15 practices and 15~20 misstatements, all tied to known areas and sources', () => {
    expect(clauses.length).toBeGreaterThanOrEqual(20);
    for (const c of clauses) { expect(topics.some(t => t.id === c.topic), c.ref).toBe(true); c.sourceIds.forEach(id => expect(sources.some(s => s.id === id), `${c.ref}/${id}`).toBe(true)); }
    expect(practices.length).toBeGreaterThanOrEqual(16);
    expect(misstatements.length).toBeGreaterThanOrEqual(20);
    expect(JSON.stringify(practices)).not.toMatch(/모든 금융회사가 동일하게/);
  });
  it('renders the clause table columns and the misstatement section', () => {
    mount('/regulation?tab=clauses');
    expect(screen.getAllByRole('columnheader').map(h => h.textContent)).toEqual(['규정/조항', '한줄 의미', '언제 중요', 'AE 체크', '관련 사업', 'Source']);
    mount('/regulation?tab=changes');
    expect(screen.getByRole('heading', { name: /잘못 말하면 안 되는 문장/ })).toBeInTheDocument();
  });
  it('keeps the old timeline address working', () => {
    mount('/regulation?tab=timeline');
    expect(screen.getByRole('heading', { name: '무엇이, 언제 달라졌나' })).toBeInTheDocument();
  });
});

describe('금융 사례 · 시장 모판 first', () => {
  it('opens the market board by default with only two tabs and no overseas benchmark', () => {
    mount('/cases');
    expect(screen.getByRole('heading', { name: '금융시장 IT·AX Index' })).toBeInTheDocument();
    const nav = within(screen.getByRole('navigation', { name: '금융 사례 탭' })).getAllByRole('link');
    expect(nav.map(a => a.textContent)).toEqual(['시장 모판', '국내 사업 사례']);
    expect(document.body.textContent).not.toContain('Benchmark');
  });
  it('has the required board filters including CSP, MSP/SI and Product (AIR Studio selectable)', () => {
    mount('/cases');
    for (const l of ['업권', 'CSP', 'MSP/SI', 'Deployment', 'IT Theme', 'Product', 'Evidence Type', '조사수준', '금융권(시장관행)']) expect(screen.getByLabelText(l)).toBeInTheDocument();
    const product = screen.getByLabelText('Product') as HTMLSelectElement;
    expect(Array.from(product.options).some(o => o.value === 'AIR Studio')).toBe(true);
    fireEvent.change(product, { target: { value: 'AIR Studio' } });
    expect(screen.getByText(/AIR Studio를 직접 명시한 공개 금융 사례가 확인되지 않았습니다/)).toBeInTheDocument();
  });
  it('filters the board by CSP and by MSP/SI like any other vendor', () => {
    mount('/cases');
    const all = screen.getAllByRole('row').length;
    fireEvent.change(screen.getByLabelText('CSP'), { target: { value: 'AWS' } });
    const aws = screen.getAllByRole('row').length;
    expect(aws).toBeLessThan(all); expect(aws).toBeGreaterThan(1);
    fireEvent.change(screen.getByLabelText('CSP'), { target: { value: '전체' } });
    fireEvent.change(screen.getByLabelText('MSP/SI'), { target: { value: '메가존클라우드' } });
    expect(screen.getAllByRole('row').some(r => r.textContent?.includes('JB우리캐피탈'))).toBe(true);
  });
  it('shows a Keyman on the board only from a current official page, never a past press title', () => {
    mount('/cases');
    const woori = screen.getAllByRole('row').find(r => r.textContent?.includes('우리은행'))!;
    expect(woori.textContent).toContain('옥일진');
    const kb = screen.getAllByRole('row').find(r => r.textContent?.includes('KB국민은행'))!;
    expect(kb.textContent).toContain('공개 확인자료 없음'); expect(kb.textContent).not.toContain('박형주');
    for (const i of institutions) for (const l of i.publicLeaders) if (l.historical) expect(kb.textContent).not.toContain(l.personName + '·');
  });
  it('shows the head office region and ecosystem chips (source-backed) on the board', () => {
    mount('/cases');
    const jb = screen.getAllByRole('row').find(r => r.textContent?.includes('JB우리캐피탈'))!;
    expect(jb.textContent).toContain('전북');
    expect(jb.textContent).toContain('메가존클라우드');
    expect(institutions.filter(i => i.initiatives.length && !i.id.startsWith('u-')).every(i => i.headOffice)).toBe(true);
  });
  it('lists domestic cases only with CaseType, CSP, MSP/SI and Product filters', () => {
    mount('/cases?tab=cases');
    for (const l of ['업권', 'CSP', 'MSP/SI', 'Deployment', 'Technology', 'Product', 'CaseType']) expect(screen.getByLabelText(l)).toBeInTheDocument();
    const types = Array.from((screen.getByLabelText('CaseType') as HTMLSelectElement).options).map(o => o.value);
    expect(types).not.toContain('BENCHMARK');
    fireEvent.change(screen.getByLabelText('MSP/SI'), { target: { value: '메가존클라우드' } });
    expect(screen.getByText(/^\d+ \/ \d+개 사례$/).textContent).not.toMatch(/^0 /);
    expect(cases.every(c => c.region === 'KR')).toBe(true);
  });
  it('keeps every source behind an institution fact reachable by URL', () => {
    for (const i of institutions) for (const id of i.sourceIds) expect(sources.find(s => s.id === id)?.url, `${i.id}/${id}`).toMatch(/^https?:\/\//);
  });
});
