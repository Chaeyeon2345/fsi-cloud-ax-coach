import { knowledge } from '../content';
import type { KnowledgeDomain } from '../domain/types';

// 메인 메뉴 5개. 검색·북마크·출처는 헤더, 타임라인·비교는 허브 탭, 퀴즈는 Day와 실전 미팅 탭 안에 있다.
export const mainNav = [
  { to: '/learn', label: '16일 학습' },
  { to: '/regulation', label: '금융 IT·규제' },
  { to: '/cloud-ax', label: 'Cloud·AX' },
  { to: '/cases', label: '금융 사례' },
  { to: '/meeting', label: '실전 미팅' },
] as const;

// Knowledge Domain → 목록이 있는 허브. 영업(SALES) 카드는 실전 미팅의 영업 Playbook 탭에 모이지만,
// 모든 카드·Day·사례 상세에서도 같은 영업 필드를 계속 볼 수 있다.
export const regulationDomains: KnowledgeDomain[] = ['FINANCIAL_BUSINESS_IT', 'REGULATION', 'SECURITY_RESILIENCE'];
export const cloudAxDomains: KnowledgeDomain[] = ['CLOUD_ARCHITECTURE', 'AX_AI'];
export function hubForDomain(domain: KnowledgeDomain): '/regulation' | '/cloud-ax' | '/meeting/playbook' {
  if (domain === 'CLOUD_ARCHITECTURE' || domain === 'AX_AI') return '/cloud-ax';
  if (domain === 'SALES') return '/meeting/playbook';
  return '/regulation';
}

// 현재 주소가 속한 메인 메뉴 (상세 페이지는 카드의 Domain을 따른다)
export function activeMenu(pathname: string): string | null {
  if (pathname.startsWith('/learn')) return '/learn';
  if (pathname.startsWith('/regulation') || pathname.startsWith('/timeline')) return '/regulation';
  if (pathname.startsWith('/cloud-ax') || pathname.startsWith('/compare')) return '/cloud-ax';
  if (pathname.startsWith('/cases')) return '/cases';
  if (pathname.startsWith('/meeting') || pathname.startsWith('/quiz')) return '/meeting';
  if (pathname.startsWith('/knowledge/')) {
    const card = knowledge.find(k => k.id === pathname.split('/')[2]);
    if (!card) return null;
    const hub = hubForDomain(card.domain);
    return hub === '/meeting/playbook' ? '/meeting' : hub;
  }
  return null;
}
