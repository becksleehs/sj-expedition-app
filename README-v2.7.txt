승주 원정대 FRESH v2.7 CLEAN DASH + ONLINE CHAT

주요 변경
- 프로필 캐릭터 사진은 한 번만 표시: 원정 여권에서 중복 사진 제거
- 지도 위 좌/우 기존 옵션 버튼과 겹치지 않도록 공지/교사 버튼을 독립 상단바로 이동
- 원정 진행률 카드 축소
- DAY 1은 부산 롯데월드 옆, DAY 2·3은 울릉도/독도 옆에 직접 표시
- 하단 메뉴: 홈 / 일정 / 미션 / 채팅 / 공지 / 배지 / 앨범
- 채팅은 Netlify Functions + Netlify Blobs를 사용해 기기 간 실제 메시지 공유
- chat.html은 4초 간격으로 새 메시지를 자동 확인

Netlify 관련
- package.json, netlify.toml, netlify/functions 폴더를 삭제하지 마세요.
- GitHub에 Push하면 Netlify가 의존성을 설치하고 Functions를 배포해야 온라인 채팅이 동작합니다.
- 배포 로그에서 Functions가 함께 배포되는지 확인하세요.
