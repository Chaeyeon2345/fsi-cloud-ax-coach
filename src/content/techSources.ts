import type { Source } from '../domain/types';
import { source, V1011 } from './sourceKit';

// Day 7~13의 기술·제품 문서와 법령 Source. 모두 2026-10-11에 실제로 열어 확인했다.
// - AWS/MCP/vLLM 등 기술 문서: TECH_PRODUCT(90일 재확인). 서비스 명칭·가용성은 바뀔 수 있다.
// - 인공지능기본법: 법제처 메타정보(공포·시행일)만 직접 확인했다. 조문 본문은 동적 페이지라 이 앱에서 대조하지 못했다.
const aws = (id: string, title: string, url: string, notes?: string): Source =>
  source(id, title, 'Amazon Web Services', 'B', 'TECH_PRODUCT', url, { verified: V1011, notes: notes ?? 'AWS 공식 문서. 서비스 명칭·가용성이 바뀔 수 있어 확인일 이후 변경을 재확인하세요.' });
const docs = 'https://docs.aws.amazon.com';

export const techSources: Source[] = [
  source('aws-fsi-lens', 'AWS Well-Architected Framework · Financial Services Industry Lens', 'Amazon Web Services', 'B', 'TECH_PRODUCT', `${docs}/wellarchitected/latest/financial-services-industry-lens/financial-services-industry-lens.html`, { published: '2026-01-27', verified: V1011, notes: '페이지에 표시된 게시일(Publication date) 2026-01-27. 개정 이력은 document-revisions 페이지. Risk and control objectives·Resilience 등 세부 섹션 본문은 확인하지 못했습니다.' }),
  aws('aws-fsi-rel04', 'FSI Lens · FSIREL04 복원력과 아키텍처가 비즈니스 요구와 복원력 등급을 반영하는가', `${docs}/wellarchitected/latest/financial-services-industry-lens/fsirel04.html`),
  aws('aws-shared-responsibility', 'AWS 공동 책임 모델', 'https://aws.amazon.com/compliance/shared-responsibility-model/'),
  aws('aws-direct-connect', 'AWS Direct Connect 사용자 가이드', `${docs}/directconnect/latest/UserGuide/Welcome.html`),
  aws('aws-dx-encryption', 'Direct Connect · 전송 중 암호화(encryption in transit)', `${docs}/directconnect/latest/UserGuide/encryption-in-transit.html`),
  aws('aws-privatelink', 'AWS PrivateLink란 무엇인가', `${docs}/vpc/latest/privatelink/what-is-privatelink.html`),
  aws('aws-vpc-peering', 'Amazon VPC 피어링이란 무엇인가', `${docs}/vpc/latest/peering/what-is-vpc-peering.html`),
  aws('aws-iam-best', 'AWS IAM 보안 모범사례', `${docs}/IAM/latest/UserGuide/best-practices.html`),
  aws('aws-identity-center', 'AWS IAM Identity Center란 무엇인가', `${docs}/singlesignon/latest/userguide/what-is.html`),
  aws('aws-kms', 'AWS Key Management Service 개요', `${docs}/kms/latest/developerguide/overview.html`),
  aws('aws-cloudhsm', 'AWS CloudHSM 소개', `${docs}/cloudhsm/latest/userguide/introduction.html`),
  aws('aws-cloudtrail', 'AWS CloudTrail 사용자 가이드', `${docs}/awscloudtrail/latest/userguide/cloudtrail-user-guide.html`),
  aws('aws-config', 'AWS Config란 무엇인가', `${docs}/config/latest/developerguide/WhatIsConfig.html`),
  aws('aws-guardduty', 'Amazon GuardDuty란 무엇인가', `${docs}/guardduty/latest/ug/what-is-guardduty.html`),
  aws('aws-securityhub', 'AWS Security Hub란 무엇인가', `${docs}/securityhub/latest/userguide/what-is-securityhub.html`, 'AWS 공식 문서. 현재 문서에는 “AWS Security Hub CSPM” 명칭이 함께 쓰이므로 표기 변경을 재확인하세요.'),
  aws('aws-az-multiaz', 'Well-Architected Reliability · 다중 AZ와 다중 Region으로 워크로드 보호', `${docs}/wellarchitected/latest/reliability-pillar/rel_fault_isolation_multiaz_region_system.html`),
  aws('aws-dr-options', 'AWS 재해복구 백서 · 클라우드의 DR 옵션', `${docs}/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html`),
  aws('aws-dr-bcp', 'AWS 재해복구 백서 · 업무 연속성 계획(BCP)과 RTO·RPO', `${docs}/whitepapers/latest/disaster-recovery-workloads-on-aws/business-continuity-plan-bcp.html`),
  aws('aws-backup', 'AWS Backup이란 무엇인가', `${docs}/aws-backup/latest/devguide/whatisbackup.html`),
  aws('aws-drs', 'AWS Elastic Disaster Recovery란 무엇인가', `${docs}/drs/latest/userguide/what-is-drs.html`),
  aws('aws-route53', 'Amazon Route 53이란 무엇인가', `${docs}/Route53/latest/DeveloperGuide/Welcome.html`),
  aws('aws-global-accelerator', 'AWS Global Accelerator란 무엇인가', `${docs}/global-accelerator/latest/dg/what-is-global-accelerator.html`),
  aws('aws-s3-replication', 'Amazon S3 복제(Replication)', `${docs}/AmazonS3/latest/userguide/replication.html`),
  aws('aws-7r', 'AWS 대규모 마이그레이션 가이드 · 마이그레이션 전략(7 Rs)', `${docs}/prescriptive-guidance/latest/large-migration-guide/migration-strategies.html`),
  aws('aws-control-tower', 'AWS Control Tower란 무엇인가', `${docs}/controltower/latest/userguide/what-is-control-tower.html`),
  aws('aws-mgn', 'AWS Application Migration Service(MGN)란 무엇인가', `${docs}/mgn/latest/ug/what-is-application-migration-service.html`, 'AWS 공식 문서. 현재 문서에서 “AWS Transform MGN”으로 표기되며 Application Discovery Service와 Migration Hub는 신규 고객에게 열려 있지 않다는 공지가 있어 서비스 가용성을 재확인하세요.'),
  aws('aws-rag', 'RAG(검색 증강 생성)란 무엇인가', 'https://aws.amazon.com/what-is/retrieval-augmented-generation/'),
  aws('aws-ai-agents', 'AI 에이전트란 무엇인가', 'https://aws.amazon.com/what-is/ai-agents/'),
  aws('aws-gpu', 'GPU란 무엇인가', 'https://aws.amazon.com/what-is/gpu/'),
  aws('aws-mlops', 'MLOps란 무엇인가', 'https://aws.amazon.com/what-is/mlops/', 'AWS 공식 문서(MLOps). LLMOps의 공식 정의는 확인하지 못했습니다.'),
  aws('bedrock-guardrails', 'Amazon Bedrock Guardrails', `${docs}/bedrock/latest/userguide/guardrails.html`),
  aws('bedrock-knowledge-bases', 'Amazon Bedrock Knowledge Bases', `${docs}/bedrock/latest/userguide/knowledge-base.html`),
  source('mcp-intro', 'Model Context Protocol 소개', 'Model Context Protocol', 'B', 'TECH_PRODUCT', 'https://modelcontextprotocol.io/docs/getting-started/intro', { verified: V1011, notes: '오픈소스 표준의 공식 문서. 스펙 버전은 계속 갱신됩니다.' }),
  source('vllm-docs', 'vLLM 공식 문서', 'vLLM Project', 'B', 'TECH_PRODUCT', 'https://docs.vllm.ai/en/latest/', { published: '2026-04-09', verified: V1011, notes: '추론 서빙 도구의 소개 문서입니다. “모델 서빙”의 일반 정의 문서는 아닙니다.' }),
  source('ms-npu', 'Microsoft Learn · NPU 디바이스', 'Microsoft', 'B', 'TECH_PRODUCT', 'https://learn.microsoft.com/en-us/windows/ai/npu-devices/', { published: '2025-11-17', verified: V1011, notes: 'PC·온디바이스 맥락의 NPU 설명입니다. 서버·데이터센터 AI 가속기의 정의 문서는 아닙니다.' }),
  // 인공지능기본법: 법제처 메타정보(공포 2025-01-21, 시행 2026-01-22, 법률 제20676호)만 직접 확인. 조문 본문은 확인하지 못했다.
  source('ai-basic-act', '인공지능 발전과 신뢰 기반 조성 등에 관한 기본법 (법률 제20676호)', '국가법령정보센터(법제처)', 'A', 'REGULATORY_POLICY', 'https://www.law.go.kr/lsInfoP.do?lsiSeq=268543', { published: '2025-01-21', effective: '2026-01-22', verified: V1011, notes: '공포일·시행일·법률번호만 법제처 페이지에서 확인했습니다. 조문 본문은 동적 페이지라 이 앱에서 직접 대조하지 못했으므로 조문 요지는 원문 확인이 필요합니다.' }),
  source('ai-basic-act-note', '인공지능기본법 주요 내용 해설 (법무법인 뉴스레터)', '법무법인 김장', 'C', 'REGULATORY_POLICY', 'https://shinkim.com/kor/media/newsletter/3114', { verified: V1011, notes: '법무법인의 2차 해설입니다. 공식 원문이 아니며 조문 번호 매핑은 법제처 원문으로 재확인해야 합니다.' }),
];
