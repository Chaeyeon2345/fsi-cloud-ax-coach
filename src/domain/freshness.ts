import type { Source, SourceKind } from './types';

// 재확인 기준일. "stale"은 틀린 자료라는 뜻이 아니라 "재확인 필요" 표시다.
export const RECHECK_AFTER_DAYS: Record<SourceKind, number> = {
  REGULATORY_POLICY: 90, // 법령·감독규정·금융위 정책/FAQ, 혁신금융서비스 지정 목록·공고
  FSEC_GUIDE: 120,       // 금융보안원 가이드
  TECH_PRODUCT: 90,      // AWS 등 공개 기술·제품 문서
  DELIVERY_CASE: 180,    // 구축사/MSP 공식 고객사례, 실제 납품·운영 사례
  INSTITUTION_ROSTER: 180, // 협회·기관 회원사/등록 명부 (회사 목록 근거)
  FINANCIAL_DISCLOSURE: 365, // 사업보고서·경영공시 등 연 1회 재무 공시 (규모 근거)
};
export const sourceKindLabels: Record<SourceKind, string> = {
  REGULATORY_POLICY: '법령·정책', FSEC_GUIDE: '금융보안원 가이드', TECH_PRODUCT: '기술·제품 문서', DELIVERY_CASE: '구축·운영 사례', INSTITUTION_ROSTER: '협회·기관 명부', FINANCIAL_DISCLOSURE: '재무 공시',
};

export const sourceStatusLabels: Record<Source['status'], string> = {
  CURRENT: '현행', ANNOUNCED: '발표(시행 확인 전)', HISTORICAL: '역사자료', SUPERSEDED: '대체됨',
};

export type Freshness =
  | { state: 'HISTORICAL' }                                   // 역사자료: 재확인 경고 대신 역사자료로 표시
  | { state: 'SUPERSEDED' }                                   // 대체됨
  | { state: 'FRESH' | 'RECHECK'; days: number; limit: number };

const DAY = 86_400_000;
export function daysSince(isoDate: string, today: Date = new Date()): number {
  const t = Date.parse(isoDate);
  return Number.isFinite(t) ? Math.floor((today.getTime() - t) / DAY) : Number.POSITIVE_INFINITY;
}
export function freshnessOf(source: Pick<Source, 'kind' | 'status' | 'lastVerifiedAt'>, today: Date = new Date()): Freshness {
  if (source.status === 'HISTORICAL') return { state: 'HISTORICAL' };
  if (source.status === 'SUPERSEDED') return { state: 'SUPERSEDED' };
  const limit = RECHECK_AFTER_DAYS[source.kind];
  const days = daysSince(source.lastVerifiedAt, today);
  return { state: days > limit ? 'RECHECK' : 'FRESH', days, limit };
}
export function freshnessLabel(f: Freshness): string {
  if (f.state === 'HISTORICAL') return '역사자료';
  if (f.state === 'SUPERSEDED') return '대체된 자료';
  return f.state === 'RECHECK' ? `재확인 필요 · 확인 ${f.days}일 경과(기준 ${f.limit}일)` : `확인 ${f.days}일 전`;
}
// 콘텐츠 확인일은 연결된 Source 중 "가장 오래된" 확인일로 보수적으로 표시한다.
export function oldestVerifiedAt(sourceIds: string[], sources: Pick<Source, 'id' | 'lastVerifiedAt'>[]): string | undefined {
  const dates = sources.filter(s => sourceIds.includes(s.id)).map(s => s.lastVerifiedAt).sort();
  return dates[0];
}

// 카드 전체의 재확인 여부는 "핵심 근거(primarySourceIds)"만으로 계산한다.
// - 보조(supporting) 출처는 카드 상태에 영향을 주지 않고 출처 목록에서 개별 배지로만 보인다.
// - HISTORICAL 출처는 카드 계산에서 제외한다. 핵심 근거가 모두 역사자료면 카드도 "역사자료"로 표시한다.
export type CardFreshness = { state: 'FRESH' | 'RECHECK' | 'SUPERSEDED' | 'HISTORICAL'; verifiedAt?: string };
export function cardFreshness(
  card: { primarySourceIds: string[] },
  sources: Pick<Source, 'id' | 'kind' | 'status' | 'lastVerifiedAt'>[],
  today: Date = new Date(),
): CardFreshness {
  const primary = sources.filter(s => card.primarySourceIds.includes(s.id));
  const active = primary.filter(s => s.status !== 'HISTORICAL');
  const oldest = (list: typeof primary) => list.map(s => s.lastVerifiedAt).sort()[0];
  if (!active.length) return { state: 'HISTORICAL', verifiedAt: oldest(primary) };
  const states = active.map(s => freshnessOf(s, today).state);
  const state = states.includes('SUPERSEDED') ? 'SUPERSEDED' : states.includes('RECHECK') ? 'RECHECK' : 'FRESH';
  return { state, verifiedAt: oldest(active) };
}
