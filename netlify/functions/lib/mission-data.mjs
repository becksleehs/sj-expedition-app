export const students=Array.from({length:13},(_,i)=>({id:'s'+String(i+1).padStart(2,'0'),grade:i<2?1:i<7?2:3}));
export const missions=[
 ['lotte-group','부산 롯데월드','우리 조의 첫 단체사진','조원 모두가 나온 롯데월드 단체사진을 올려주세요.','group','photo'],
 ['lotte-grade','부산 롯데월드','우리 학년의 원정 시작','학년별 단체사진을 찍어 올려주세요.','grade','photo'],
 ['lotte-intro','부산 롯데월드','우리 조를 소개합니다!','조 이름과 구호를 정하고 단체사진과 함께 소개해주세요.','group','both'],
 ['dokdo-photo','독도','독도에 우리가 왔다!','입도 후 선생님이 지정한 안전한 장소에서 기념사진을 찍어주세요.','group','photo'],
 ['dokdo-story','독도','직접 만난 독도, 한 문장','직접 본 독도의 모습과 느낀 점을 2~3줄로 남겨주세요.','individual','text'],
 ['ulla','울릉도 자연생태탐방','울라와 함께 웃어라!','추산 메가 울라포토존에서 단체사진 또는 유쾌하고 코믹한 사진을 올려주세요.','group','photo'],
 ['gwaneum','울릉도 자연생태탐방','풍경 속 우리 원정대','관음도의 멋진 배경과 함께 단체사진을 찍어주세요.','group','photo'],
 ['marine','울릉도 자연생태탐방','내 마음에 남은 바다 이야기','울릉도·독도 해양연구기지 해양생태관 관람 후 가장 인상 깊은 전시와 그 이유를 적어주세요.','individual','text'],
 ['waterfall','울릉도 자연생태탐방','우리 학년, 폭포 앞에 서다','봉래폭포에서 학년별 사진을 찍어주세요.','grade','photo'],
 ['recommend','울릉도 자연생태탐방','후배에게 추천하는 한 장면','후배에게 소개하고 싶은 장소 사진과 추천 이유를 남겨주세요.','individual','both'],
 ['eco-observe','울릉도 자연생태탐방','자연 관찰 탐험가','식물이나 지형을 골라 사진과 관찰한 특징 2가지를 남겨주세요. 채집하지 않고 눈으로 관찰합니다.','group','both'],
 ['surprise-kindness','돌발 미션','친구의 빛나는 순간','오늘 친구가 보여준 배려나 도움을 구체적으로 2~3줄 적어주세요.','individual','text'],
 ['senior-photo','특별 미션','우리 3학년의 마지막 원정','참석한 3학년 친구들과 함께 정한 포즈로 단체사진을 남겨주세요.','senior','photo'],
 ['senior-letter','특별 미션','미래의 랜덤 편지','배정된 3학년 친구에게 “1년 뒤의 너에게” 편지를 써주세요.','letter','text']
].map(([id,place,title,description,scope,type])=>({id,place,title,description,scope,type,xp:20}));
