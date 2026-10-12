# FSI Cloud & AX Coach

한국 금융권 B2B IT / Cloud / AX 영업 실무자를 위한 학습 및 미팅 준비 웹앱입니다.

## 주요 기능

- **16일 학습 Curriculum** — 금융 규제·Cloud·AX부터 Account Plan까지 Day 1~16
- **금융 IT·규제 Playbook** — 업무 상황별 규제 지도, 핵심 조항, 실무 통제, 잘못 말하면 안 되는 문장
- **Cloud·AX Architecture** — 배포모델 비교, 요건 → Architecture, Discovery 질문, 대표 Pattern
- **금융시장 IT·AX Index** — 업권별 금융회사의 규모·본사·공개 IT·AX 사업·생태계를 한 화면에 비교
- **국내 금융 IT·AX Case** — 단계(운영/구축 완료/구축 중/규제특례)를 구분한 사례 Library
- **Account Intelligence · 미팅 Discovery · Account Plan** — 고객 읽기, 첫 미팅 질문, 계획 작성 도구
- 퀴즈·미팅 연습·검색·북마크 (학습 기록은 브라우저 localStorage에만 저장)

## 현재 데이터

- 금융회사 163개 · Initiative 157건 · 국내 Case 25건
- Day 1~16 모두 본문 제공

## 원칙

- 모든 사실은 출처(Source)와 확인일을 가집니다.
- 확인된 사실(FACT)과 영업 관점의 해석(SALES_VIEW)을 분리합니다.
- Public Cloud · Hybrid · On-premises · Private Cloud · Private AI를 모두 다루며 특정 CSP/MSP/Vendor에 종속되지 않습니다.
- 확인되지 않은 정보는 추정하지 않고 “공개 확인자료 없음”으로 표시합니다.
- 법률 자문이나 개별 금융회사의 규제 준수 판정이 아닌 학습 자료입니다.

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm test         # 테스트
npm run build    # 빌드 (dist/)
```

## 배포

`main` 브랜치에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가 테스트와 빌드를 실행하고 GitHub Pages에 배포합니다. 저장소 Settings → Pages → Source를 **GitHub Actions**로 설정하세요.
