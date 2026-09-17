# v3.19

- v3.18 전체 파일을 기반으로 업데이트.
- feature-gates: history_ulleung, quiz_ulleung, history_dokdo, quiz_dokdo, CAS 업데이트.
- quiz.mjs: 학생 인증과 공개 상태 확인, 최초 답안과 정답 XP를 progress 레코드에서 원자적으로 저장. 제출 전 정답·해설 비공개.
- 기존 quiz_* 직접 claim 및 quiz_all_bonus 지급 경로 차단. 기존 지급 기록 보존.
- growthLevel은 획득 단계, avatarLevel은 선택한 모습. 서버에서 획득 단계 범위 검증.
- 학습 및 보상 데이터는 기존 Netlify Blobs 사용. 외부 서비스 설정 추가 없음.
- 학습 자료: 기존 국사편찬위원회·외교부 자료 유지. 추가 이규원 이야기의 참고 자료는 동북아역사재단 『울릉도 1882, 검찰사 이규원의 시간 여행』(https://www.nahf.or.kr/), 태정관 지령 설명은 외교부 독도(https://dokdo.mofa.go.kr/) 자료 확인 후 작성.
- npm test: 16개 통합 테스트. 실제 배포·브라우저 시각 검증은 미실시.
