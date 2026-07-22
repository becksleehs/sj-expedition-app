# 승주 원정대 v1.1 · Cute Character Edition

부산 롯데월드(12:00~17:00) → 울릉도 → 독도 체험학습을 위한 모바일 RPG형 정적 웹앱입니다.

## v1.0 주요 내용
- 모바일 RPG 스타일 학생 화면
- 남학생 3종 / 여학생 3종 탐험가 캐릭터
- 부산 롯데월드 필수·랜덤·숨은 미션
- 경험치, 레벨, 장비, 배지
- 출석 체크와 3개 조 자동 편성
- 학생별 점수 입력
- 미션 공개/닫기
- 관리자 데이터 JSON 백업
- PWA 홈 화면 설치 지원
- GitHub Pages 바로 배포 가능

## 관리자
- 주소: `admin-login.html`
- 초기 비밀번호: `1004`
- 실제 운영 전에 관리자 화면에서 비밀번호를 변경하세요.

## 학생 이름 수정
`js/data.js` 파일의 `students` 목록에서 `2학년 학생 1`, `3학년 학생 1` 등의 이름을 실제 이름으로 바꿉니다.

## 중요한 운영 제한
현재 버전은 별도 서버나 Firebase 없이 브라우저 `localStorage`에 저장됩니다.
따라서 교사 기기에서 입력한 점수·미션 상태가 학생들의 다른 휴대전화로 자동 동기화되지는 않습니다.
v1.0은 디자인과 운영 흐름을 완성한 단계이며, 여러 기기의 실시간 동기화는 Firebase/Supabase 연결이 필요합니다.

## GitHub Desktop 업로드
1. GitHub Desktop에서 `sj-expedition-app` 저장소를 엽니다.
2. `Repository → Show in Explorer`를 누릅니다.
3. 기존 파일을 별도 폴더에 백업합니다.
4. 이 압축파일을 풀고, **폴더 안의 파일과 폴더**를 저장소 최상위에 덮어씁니다.
5. GitHub Desktop의 Summary에 `Upgrade SJ Expedition to v1.0` 입력
6. `Commit to main`
7. `Push origin`
8. Actions에서 초록 체크를 확인한 뒤 아래 주소 새로고침
   - https://becksleehs.github.io/sj-expedition-app/

## 캐시가 이전 화면을 보여줄 때
- PC: `Ctrl + F5`
- 휴대전화: 브라우저 탭을 닫고 다시 열기
- 그래도 동일하면 사이트 데이터/캐시 삭제


## v1.1 변경사항
- 조잡한 SVG 캐릭터 전면 삭제
- 아기자기한 SD 탐험가 캐릭터 6종 적용
- 실제 학생 13명 이름 반영
- 모자·스카프·카메라·나침반·태극기 배지·망원경 꾸미기
- 레벨에 따른 아이템 해금 및 학생별 저장
