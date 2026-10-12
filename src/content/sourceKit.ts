import type { Source, SourceKind } from '../domain/types';
// Source 제작 도구 (sources.ts와 accountSources.ts가 함께 쓴다).
// 전역 확인일은 없다. 자료마다 "실제로 확인한 날(verified)"을 직접 적는다.
export type Dates = { published?: string; effective?: string | null; verified: string; status?: Source['status']; locator?: string; notes?: string };
export const source = (id: string, title: string, publisher: string, tier: Source['tier'], kind: SourceKind, url: string, d: Dates): Source => ({
  id, title, publisher, tier, kind, url,
  publishedAt: d.published, effectiveAt: d.effective, lastVerifiedAt: d.verified,
  status: d.status ?? 'CURRENT', locator: d.locator, notes: d.notes,
});
export const V0927 = '2026-09-27';
export const V1011 = '2026-10-11';
