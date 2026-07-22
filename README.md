# 승주 원정대 v2.0 · Adventure RPG World

부산 롯데월드 → 울릉도 → 독도로 이어지는 체험학습을 모바일 RPG 월드맵처럼 구성한 버전입니다.

## v2.0 핵심 변경
- 첫 화면을 모험 RPG 월드맵으로 전면 개편
- 부산 롯데월드, 울릉도, 독도 목적지를 하나의 지도에 표시
- 현재 학생의 캐릭터, 이름, 조, 레벨, 경험치를 첫 화면에 자동 표시
- 부산 롯데월드 오늘의 퀘스트 보드
- RPG 스타일 HUD, 패널, 월드맵, 하단 게임 메뉴
- 구름, 별, 배, 보상 상자 등의 애니메이션
- PC 메인 학생 화면 캐릭터 표시 문제 추가 수정
- 모든 주요 파일에 v2.0 캐시 버전 적용
- 서비스워커를 네트워크 우선 방식으로 변경하여 이전 화면 캐시 문제 완화

## 실제 학생 명단
- 1학년: 김서하, 조현정
- 2학년: 김주안, 위준민, 정범수, 양하율, 박현제
- 3학년: 양서현, 위지현, 이사랑, 이희주, 송승아, 오예린

## 업로드
1. 압축을 풉니다.
2. `sj-expedition-v2.0-rpg-world` 폴더 안의 파일과 폴더를 GitHub 저장소 최상위에 덮어씁니다.
3. GitHub Desktop 커밋 문구:
   `Upgrade to v2.0 Adventure RPG World`
4. Commit to main → Push origin
5. GitHub Actions 초록 체크 후 접속:
   https://becksleehs.github.io/sj-expedition-app/

## 업로드 후 PC에서 이전 화면이 보일 때
1. `Ctrl + Shift + R` 또는 `Ctrl + F5`
2. 개발자도구(F12) → Application → Service Workers → Unregister
3. Application → Storage → Clear site data
4. 브라우저를 닫고 다시 접속

## 관리자
- 주소: `/admin-login.html`
- 초기 비밀번호: `1004`
