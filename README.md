# 승주 원정대 v0.17 — 새로 만든 독립 프로젝트

## 주요 기능
- 13명 학생 로그인
- 남학생 3종 / 여학생 3종 캐릭터 선택
- 얼굴·체형이 달라도 장비 좌표가 동일한 레이어 구조
- 교복 → 탐험복 → 탐험모자 → 나침반 → 카메라 → 태극기 배지 → 황금 망원경
- 미션 완료 보상 및 XP
- 장비실
- 관리자 미션 공개
- 학생 공지
- 참석자 체크
- 11~13명 자동 3개 조 편성
- 개인 점수 입력
- PWA 기본 구성

## 관리자
- 주소: admin-login.html
- 초기 비밀번호: 1004

## GitHub Desktop 배포
1. Repository → Show in Explorer
2. 기존 저장소 안의 파일을 모두 다른 곳에 백업합니다.
3. 이 압축파일을 풀고, `sj-expedition-v0.17` 폴더 안의 파일과 폴더를 저장소 최상위에 복사합니다.
4. GitHub Desktop에서 변경 파일을 확인합니다.
5. Summary: `Rebuild SJ Expedition v0.17`
6. Commit to main → Push origin
7. Netlify Deploys에서 Published 확인
8. `https://sj-expedition.netlify.app/?v=17` 접속

## 중요
압축 폴더 자체를 저장소 안에 넣지 말고, 압축을 푼 폴더 안의 `index.html`, `student.html`, `assets`, `css`, `js` 등을 저장소 최상위에 넣으십시오.
