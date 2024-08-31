# The Last RollBack

프로젝트 제작 기간 : 2024.7.22(월) ~ 2024.8.26.(월)

## 프로젝트 소개

![project-logo_01](https://github.com/user-attachments/assets/5880a9e8-5cb9-4d35-a188-e70374c3d1cd)


### 프롤로그 

코르딩딩 마을에서 버그를 퇴치하기 위해 마을을 나선 르탄이 용사들이 실종된 지 어언 1년…  
더욱 기세등등해진 버그들이 이제는 코르딩딩 마을의 백본 서버를 부수기 위해 침공하기 시작하는데…  
과연 마을에 남아있는 르탄이 용사 2세들은 백본 서버를 지키고 롤백하여 버그들을 물리칠 수 있을 것인가?!  

### The Last RollBack이란?

4명의 플레이어가 강력한 몬스터들로부터 타워를 지켜 최종 라운드까지 살아남는 쿼터뷰 형식의 MORPG + Defense 게임입니다.

![게임 실행](https://github.com/user-attachments/assets/de05321d-b8ed-4eb0-a061-0efdd34e80eb)

게임은 타운과 던전 두 구역으로 나뉩니다.

타운에는 다른 유저들과 채팅 및 상호작용을 할 수 있고,
입장하고 싶은 던전의 난이도를 정한 뒤 던전 포탈에 들어가면 됩니다.
던전 대기열에 4명이 차게되면 던전으로 이동하게 됩니다.

게임은 라운드별로 진행됩니다.

각 라운드마다 낮과 밤이 존재합니다.
낮 시간 동안에는 소지하고 있는 골드로 구조물을 설치할 수 있고,
밤 시간에는 몬스터가 밀려오며 전투가 시작됩니다.

라운드가 모두 끝나면 플레이어들이 승리하게 되며,
그 이전에 모든 플레이어가 전멸하거나 백본 서버가 파괴되면 패배하게 됩니다.

## 프로젝트 목표

- **실시간 멀티플레이**
    
    안정적이고 신뢰성 있는 실시간 데이터 전송을 위해 TCP 소켓 사용
    
- **동시성 제어**

    여러 플레이어가 동일한 작업을 수행하더라도 결과를 안전하고 정확하게 처리  
    게임 플레이 중 던전 입장과 같은 다중 이벤트가 동시에 발생할 때, 이를 안전하고 정확하게 제어
    
- **서버 호스팅**

    서버 과부하와 지연 현상을 최소화
    호스트 주도 게임의 일부 기능을 분리하여 .NET 기반의 데디케이트 서버로 처리
    
- **스트레스 테스트**
    
    게임 서버 및 데디 서버 성능 확인을 위한 스트레스 테스트
    
- **배포 및 운영**
    
    효율성과 일관성을 위해 Docker 및 Docker Compose 사용

## 서비스 아키텍처

![image](https://github.com/user-attachments/assets/746e60e2-6588-4c5c-aab1-e6a8432b2582)


## 주요 콘텐츠

- [게임 플레이 및 UX](https://eliotjang.notion.site/UX-93ab3caa123148c28528110c2b7bd950?pvs=4)
- [5가지 종류의 직업 및 버그 몬스터](https://eliotjang.notion.site/5-1c429213d7694dc0a81e4937548e4a61?pvs=4)
- [29가지 종류의 버그 몬스터](https://eliotjang.notion.site/29-34d39c3b67334d8f9781b99646563394?pvs=4)
- [확률형 아이템 획득](https://eliotjang.notion.site/7916000fbf144a568d69446a26e4ce23?pvs=4)
- [공격 / 방어 구조물 설치 및 활용](https://eliotjang.notion.site/224fde58e9e1449ab929caef045dc290?pvs=4)
- [난이도별 던전 구분](https://eliotjang.notion.site/1bd40ad929384c378ee7dbbdbe163cf3?pvs=4)

## 기능 및 시연 영상

- [던전 입장](https://eliotjang.notion.site/18743f0b5f384d66bc7e89407619ccfa?pvs=4)
- [낮&밤 라운드](https://eliotjang.notion.site/2ea0f5377e0e49c8a24976ec80b66c9b?pvs=4)
- [스킬 발동](https://eliotjang.notion.site/5512af29a7b04f73ab29276b06ca21fa?pvs=4)
- [구조물 설치](https://eliotjang.notion.site/18d7ac67f2bd45c4a5a2554236ca538b?pvs=4)
- [타운 상호작용](https://eliotjang.notion.site/c9577d3fc51f4ab0955abeb17a998ea9?pvs=4)
- [시연 영상](https://eliotjang.notion.site/fff6b79eb40f80eeb6e2faede4708a61?pvs=4)

## 프로젝트 로직

![image](https://github.com/user-attachments/assets/498376b7-6ccb-4631-bfe4-3d5178cfb729)

- [서버 아키텍처 - 클라이언트 로직](https://eliotjang.notion.site/cbdf69c7b418436bb869bd3591641233?pvs=4)
- [서버 아키텍처 - 게임 서버 로직](https://eliotjang.notion.site/fff6b79eb40f80a8b517f862cc5b08aa?pvs=4)
- [서버 아키텍처 - 데디케이티드 서버 로직](https://eliotjang.notion.site/c7de917bf02144be934b05cef0e32bd8?pvs=4)

## 기술 기록

- [동시성 제어](https://eliotjang.notion.site/BullQueue-e0cea2bbf41b4d29881166c0ba9b1ee3?pvs=4)
- [서버 아키첵처 - 데디케이티드 서버](https://eliotjang.notion.site/Dedicated-Server-247a2325e5b6440c933b521d063184f8?pvs=4)
- [스트레스 테스트 - Apache JMeter](https://eliotjang.notion.site/Apache-JMeter-c64dc67ffa5f490ea19872d26383b58b?pvs=4)
- [운영 및 배포 - Docker & Docker Compose](https://eliotjang.notion.site/Docker-Docker-Compose-25cef93e641d4c018f12698d84c40fac?pvs=4)

## 트러블 슈팅

- [플레이어 애니메이션 변경 처리 문제](https://eliotjang.notion.site/4ddd81ad6b634c9c8a6ff534066108c6?pvs=4)
- [몬스터 동시 처치 시 원자성 문제](https://eliotjang.notion.site/6ffef4bccd2841e5a098ec0aa732fab1?pvs=4)
- [Container 환경 Bull Queue 적용 문제](https://eliotjang.notion.site/Container-Bull-Queue-413e8bd0f9a540aa8a45fa7d1b06c58c?pvs=4)
- [Docker Desktop 설치 후 BSOD 발생 문제](https://eliotjang.notion.site/Docker-Desktop-BSOD-0a6bd560cdee4a92bc715030e892eee8?pvs=4)
- [게임 종료 후 타운 복귀 문제](https://eliotjang.notion.site/0b4ea29b8b134a89828a5b9bfb7ca680?pvs=4)
- [스트레스 테스트 TCP 적용 문제](https://eliotjang.notion.site/TCP-f37669673f234686ac6c31c65c7de8b2?pvs=4)

## 기술 스택

- Programming Language
  - JavaScript
  - C#
- Socket Programming
  - TCP/IP
  - Protobuf
- Game Server
  - Node.js
- Dedicated Server
  - .NET
- Client
  - Unity
- Platform
  - Ubuntu
- DataBase
  - MySQL
  - Redis
- DevOps
  - Amazon EC2
  - Docker
  - Docker Compose
- Tech
  - Bull Queue
- Test
  - Apache JMeter
- Version Control System
  - GitHub
  - Unity Version Control

## 기술적 의사 결정

- [Unity Client](https://eliotjang.notion.site/Unity-Client-5fe3f4e9d307486f940c7ab5bb56f440?pvs=4)
- [DataBase](https://eliotjang.notion.site/DataBase-a7aae8e29d9c40d7974184978e1eb22c?pvs=4)
- [Game Server](https://eliotjang.notion.site/Game-Server-674168e753df4635a6f2d5e5e213a8b9?pvs=4)
- [Dedicated Server](https://eliotjang.notion.site/Dedicated-Server-4b31a7d521e042bcb14993c2bcd35c4e?pvs=4)

## 기획 / 게임 데이터 저장 및 관리

- [게임 서버 저장 데이터](https://eliotjang.notion.site/9b11cdec04b9421794456a16d0344435?pvs=4)
- [DataBase 저장 데이터](https://eliotjang.notion.site/DataBase-86e730d6dd48466298d1da9d4f8c9801?pvs=4)
- [JSON 데이터 파일](https://eliotjang.notion.site/JSON-9ae427bfdd5d45238d29433f4f55f293?pvs=4)
- [패킷 명세서](https://eliotjang.notion.site/0f89a31ff9e149c9b673474c6c60899f?pvs=4)
- [패치 노트](https://eliotjang.notion.site/f36755ce37824a7586ce50c63c4ad187?pvs=4)

## 게임 다운로드

- [Widnows : latest - Google Drive](https://drive.google.com/drive/folders/1zCgdExPVPxtChM2rvZbYq-qsJm9ZG36F?usp=drive_link)
- [Mac : latest - Google Drive](https://drive.google.com/drive/folders/1KJEkPIhdMJufx8A8xIo9sBbSeh8taamf?usp=drive_link)

## 관련 링크

- [팀 노션](https://eliotjang.notion.site/12-4e3e631c584d4531802dc6811208dec6?pvs=4)

## 상장

![The Last Roll Back-최우수상](https://github.com/user-attachments/assets/ee103d6f-0fea-4107-ae4d-b92b2c778bd2)

## 팀원

| 이름           | email    | github              |
|----------------|-------------------------------|-----------------------------|
|장성원          | eliotjang2@gmail.com | [https://github.com/eliotjang](https://github.com/eliotjang) |
|김동균          | donkim0122@gmail.com | [https://github.com/donkim1212](https://github.com/donkim1212) |
|윤동협          | ydh23203727@gmail.com | [https://github.com/ydh1503](https://github.com/ydh1503) |
|박지호          | bjh1157@naver.com | [https://github.com/Hoji1998](https://github.com/Hoji1998) |
|양현언          | kkx3695@naver.com | [https://github.com/HyuneonY](https://github.com/HyuneonY) |
|황정민          | gwa446@gmail.com | [https://github.com/mimihimesama](https://github.com/mimihimesama) |
