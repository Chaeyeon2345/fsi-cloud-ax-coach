import { extractKeywords } from './accounts';
import type { CaseStudy, FinancialInstitution, InstitutionInitiative } from './types';

// 생태계(CSP·MSP/SI·Product) 정보는 사업·사례의 공개 Source가 말한 것에서만 만든다. 특정 회사를 특별 취급하지 않고 모두 같은 필터 항목으로 다룬다.
export const PRODUCT_PATTERNS: [string, RegExp][] = [
  ['AIR Studio', /AIR[ -]?Studio/i], ['Amazon Bedrock', /Bedrock/i], ['Azure OpenAI', /Azure OpenAI/i], ['HyperCLOVA X', /하이퍼클로바|HyperCLOVA/i],
  ['Claude', /Claude|클로드/i], ['XGEN', /XGEN/i],
];
// AIR Studio는 Source에 직접 명시된 사업이 있을 때만 태깅된다. 현재 확인된 금융 Reference는 없지만 필터에서는 항상 선택할 수 있게 둔다.
export const ALWAYS_PRODUCTS = ['AIR Studio'];
export const productsOfText = (text: string): string[] => PRODUCT_PATTERNS.filter(([, re]) => re.test(text)).map(([n]) => n);

const clean = (name: string) => name.replace(/\s*\([^)]*\)/g, '').replace(/\s*컨소시엄$/, '').trim();
// "플래티어·KT 컨소시엄" 같은 표기를 개별 파트너로 나눈다
export const splitPartners = (value: string): string[] => value.split(/[·,/]/).map(clean).filter(x => x && x !== '미공개');

export interface Ecosystem { csp: string[]; msp: string[]; vendors: string[]; products: string[]; deployments: string[]; themes: string[] }
const uniq = (a: string[]) => [...new Set(a)];
export function initiativeEcosystem(i: InstitutionInitiative): Ecosystem {
  const text = `${i.title} ${i.summary} ${[...(i.cspVendors ?? []), ...(i.technologyVendors ?? []), ...(i.mspSiPartners ?? [])].join(' ')}`;
  return { csp: i.cspVendors ?? [], msp: i.mspSiPartners ?? [], vendors: i.technologyVendors ?? [], products: [...new Set([...(i.products ?? []), ...productsOfText(text)])], deployments: i.deploymentModels ?? [], themes: i.domains };
}
export function institutionEcosystem(inst: Pick<FinancialInstitution, 'initiatives'>): Ecosystem {
  const all = inst.initiatives.map(initiativeEcosystem);
  const pick = (f: (e: Ecosystem) => string[]) => uniq(all.flatMap(f));
  return { csp: pick(e => e.csp), msp: pick(e => e.msp), vendors: pick(e => e.vendors), products: pick(e => e.products), deployments: pick(e => e.deployments), themes: pick(e => e.themes) };
}
// 사례(Case)의 생태계: 공개(DISCLOSED)된 값만 쓴다
export function caseEcosystem(c: CaseStudy): Ecosystem & { tech: string[] } {
  const disclosed = (e: { value: string; status: string }) => (e.status === 'DISCLOSED' ? e.value : '');
  const csp = splitPartners(disclosed(c.csp)), msp = splitPartners(disclosed(c.partner));
  const text = `${c.title} ${disclosed(c.technology)} ${disclosed(c.model)} ${disclosed(c.csp)} ${disclosed(c.architecture)}`;
  return { csp, msp, vendors: [], products: productsOfText(text), deployments: c.deploymentModels, themes: [], tech: extractKeywords(`${c.title} ${disclosed(c.technology)} ${disclosed(c.architecture)}`) };
}
