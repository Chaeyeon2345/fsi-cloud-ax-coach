import { sectionLabels, type ClaimType, type KnowledgeCard, type KnowledgeDomain, type SalesLearningExtension } from '../domain/types';

// Knowledge Card 제작 도구 (Phase B 이후 카드용).
// texts는 sectionLabels 순서의 10개 문장이며, 섹션별 근거 유형(claim type)은 아래 기본값을 따른다.
//   0 한 줄 결론·2 기존에는·4 무엇이 바뀌었나·5 현재·6 금융사 실무 → FACT (공식 자료로 확인한 내용)
//   1 왜 생겼나·3 어떤 문제가 있었나·7 Cloud/AX 영향 → INTERPRETATION
//   8 영업 포인트 → SALES_VIEW · 9 미팅 30초 설명 → MEETING
// - arch: true  → 0·2·4·5·6을 ARCHITECTURE_GUIDE로 바꾼다 (업계 일반 구조 해설. 법적 FACT가 아님)
// - types       → 섹션별로 근거 유형을 직접 지정한다 (예: 규제 계층 정리는 INTERPRETATION)
export interface CardSpec {
  id: string; title: string;
  domain: KnowledgeDomain; secondaryDomains?: KnowledgeDomain[];
  primary: string[];            // 카드의 핵심 근거 Source. 카드의 재확인 여부는 이것만으로 계산한다.
  supporting?: string[];        // 보조 근거 Source. 출처 목록에서 개별 배지로만 표시한다.
  texts: string[];
  arch?: boolean;
  tech?: boolean;               // true → 0·2·4·5·6을 TECH_FACT로 (AWS 등 공식 기술 문서로 확인한 사실)
  types?: Partial<Record<number, ClaimType>>;
  cases?: string[]; caveats?: string[];
  sales: SalesLearningExtension;
}
const ARCH_INDEXES = [0, 2, 4, 5, 6];
function sectionType(i: number, spec: CardSpec): ClaimType {
  const override = spec.types?.[i];
  if (override) return override;
  if (i === 8) return 'SALES_VIEW';
  if (i === 9) return 'MEETING';
  if (i === 1 || i === 3 || i === 7) return 'INTERPRETATION';
  if (!ARCH_INDEXES.includes(i)) return 'FACT';
  return spec.arch ? 'ARCHITECTURE_GUIDE' : spec.tech ? 'TECH_FACT' : 'FACT';
}
export function card2(spec: CardSpec): KnowledgeCard {
  if (spec.texts.length !== sectionLabels.length) throw new Error(`카드 본문은 ${sectionLabels.length}개 문장이어야 합니다: ${spec.id}`);
  const sourceIds = [...new Set([...spec.primary, ...(spec.supporting ?? [])])];
  const caveats = spec.caveats ?? [];
  return {
    id: spec.id, title: spec.title, contentKind: 'VERIFIED', sourceIds, primarySourceIds: spec.primary,
    domain: spec.domain, secondaryDomains: spec.secondaryDomains,
    summary: spec.texts[0], relatedCaseIds: spec.cases ?? [], caveats,
    verification: caveats.length ? 'NEEDS_VERIFICATION' : 'VERIFIED',
    sections: sectionLabels.map((label, i) => ({ label, text: spec.texts[i], type: sectionType(i, spec), sourceIds })),
    sales: spec.sales,
  };
}
