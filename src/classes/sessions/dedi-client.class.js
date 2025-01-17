import net from 'net';
import { config } from '../../config/config.js';
import {
  dediPacketTypes,
  headerConstants,
  payloadTypes,
} from '../../constants/packet.constants.js';
import { deserializePf } from '../../utils/packet-serializer.utils.js';
import { sendPacketToDediServer } from '../../utils/packet-sender.utils.js';
import { handleError } from '../../utils/error/errorHandler.js';
import CustomError from '../../utils/error/customError.js';
import { getDungeonSession, getDungeonSessionByUserId } from '../../session/dungeon.session.js';
import { readHeader } from '../../utils/packet-header.utils.js';

const headerSize = headerConstants.TOTAL_LENGTH + headerConstants.PACKET_TYPE_LENGTH;

const MonstersLocationUpdateHandler = function (deserialized) {
  // S_MONSTERS_LOCATION_UPDATE
  // monsterIdx : Vector3 (X,Y,Z)
  const dungeonSession = getDungeonSession(this.dungeonId);
  const { positions } = deserialized;
  const monsterTransformInfo = [];

  for (const [monsterIdx, worldPosition] of Object.entries(positions)) {
    const prevPosition = this.getMonsterPrevPosition(monsterIdx);
    this.addMonsterPrevPosition(monsterIdx, worldPosition);

    let rot = 0;
    if (prevPosition) {
      const directionVector = {
        x: worldPosition.x - prevPosition.x,
        z: worldPosition.z - prevPosition.z,
      };

      rot = (Math.atan2(directionVector.x, directionVector.z) * (180 / Math.PI) + 360) % 360;
    }

    const transformInfo = {
      posX: worldPosition.x,
      posY: worldPosition.y,
      posZ: worldPosition.z,
      rot: rot,
    };
    const monster = dungeonSession.getMonster(+monsterIdx);
    if (monster.isDead) continue;
    monster.transform.updateTransform(transformInfo);

    monsterTransformInfo.push({
      monsterIdx: +monsterIdx,
      transformInfo,
    });
  }

  if (monsterTransformInfo.length === 0) return;

  // console.log('데디 -> 유니티 몬스터 정보 길이 : ', monsterTransformInfo.length);

  dungeonSession.notifyAll(payloadTypes.S_MONSTERS_TRANSFORM_UPDATE, {
    transformInfo: monsterTransformInfo,
  });
};

const PlayersLocationUpdateHandler = function (deserialized) {
  // accountId : Vector3 (X,Y,Z)
  const dungeonSession = getDungeonSession(this.dungeonId);
  const { positions } = deserialized;
  const playerTransformInfo = [];

  // TODO: 이전 위치 저장 및 rotation 계산
  // this.getPrevPosition(accountId); // 가져오기
  // this.addPrevPosition(accountId, somePositionData); // 저장

  for (const [accountId, worldPosition] of Object.entries(positions)) {
    const prevPosition = this.getPlayerPrevPosition(accountId);
    this.addPlayerPrevPosition(accountId, worldPosition);

    let rot = 0;
    if (prevPosition) {
      const directionVector = {
        x: worldPosition.x - prevPosition.x,
        z: worldPosition.z - prevPosition.z,
      };

      rot = (Math.atan2(directionVector.x, directionVector.z) * (180 / Math.PI) + 360) % 360;
    }

    const transformInfo = {
      posX: worldPosition.x,
      posY: worldPosition.y,
      posZ: worldPosition.z,
      rot: rot,
    };

    dungeonSession.getPlayer(accountId).updateTransform(transformInfo);

    playerTransformInfo.push({
      accountId,
      transformInfo,
    });
  }

  if (playerTransformInfo.length === 0) return;

  dungeonSession.notifyAll(payloadTypes.S_PLAYERS_TRANSFORM_UPDATE, {
    transformInfo: playerTransformInfo,
  });
};

const MonsterAttackHandler = function (deserialized) {
  // handle S_MonsterAttack
  // TODO: 클라이언트로 공격 패킷 전송, 애니메이션 전송
};

const handlerMappings = {
  [dediPacketTypes.S_MONSTERS_LOCATION_UPDATE]: MonstersLocationUpdateHandler,
  [dediPacketTypes.S_PLAYERS_LOCATION_UPDATE]: PlayersLocationUpdateHandler,
};

class DediClient {
  static #dediClients = new Map();
  #socket = new net.Socket();
  #prevPlayerPositions = new Map(); // 플레이어 이전 위치
  #prevMonsterPositions = new Map(); // 몬스터 이전 위치

  constructor(dungeonId) {
    this.#init();
    this.dungeonId = dungeonId;
  }

  static addClient = (dungeonId, dediClient) => {
    DediClient.#dediClients.set(dungeonId, dediClient);
  };

  static getClient = (dungeonId) => {
    return DediClient.#dediClients.get(dungeonId);
  };

  static removeClient = (dungeonId) => {
    const client = DediClient.getClient(dungeonId);
    client?.getSocket().end();
    return DediClient.#dediClients.delete(dungeonId);
  };

  #init() {
    this.#socket.connect(config.dediServer.port, config.dediServer.host, () => {
      console.log(
        `Connected to dedi-server on ${this.#socket.remoteAddress}:${this.#socket.remotePort}`,
      );
    });
    this.#socket.on('data', this.#onData.bind(this));
    this.#socket.on('end', this.#onEnd.bind(this));
    this.#socket.on('error', this.#onError.bind(this));
    this.#socket.buffer = Buffer.alloc(0);
    this.#socket.send = sendPacketToDediServer.bind(this.#socket);
  }

  #onData(data) {
    try {
      this.#socket.buffer = Buffer.concat([this.#socket.buffer, data]);
      while (this.#socket.buffer.length >= headerSize) {
        const { totalLength, packetType: dediPacketType } = readHeader(this.#socket.buffer, true);
        if (totalLength > this.#socket.buffer.length) {
          break;
        }
        const packet = this.#socket.buffer.subarray(headerSize, totalLength);
        this.#socket.buffer = this.#socket.buffer.subarray(totalLength);
        const deserialized = deserializePf(dediPacketType, packet);
        const handler = handlerMappings[dediPacketType];
        handler.call(this, deserialized);
      }
    } catch (err) {
      handleError(this.#socket, err);
    }
  }

  #onEnd() {
    try {
      DediClient.removeClient(this.dungeonId);
      console.log('Dedicated client shut down');
    } catch (error) {
      handleError(this.#socket, error);
    }
  }

  #onError(error) {
    try {
      console.error('소켓 오류:', error);
      DediClient.removeClient(this.dungeonId);
    } catch (error) {
      handleError(this.#socket, new CustomError(10000, `소켓 오류: ${error.message}`));
    }
  }

  /**
   *
   * @returns the private member #socket
   */
  getSocket() {
    return this.#socket;
  }

  /**
   * 세션 생성
   */
  createSession(dungeonCode) {
    // this.#socket.connect() 메서드 호출 시 실행
    this.#socket.send(dediPacketTypes.C_CREATE_SESSION, {
      dungeonCode,
    });
  }

  /**
   * 세션 플레이어 목록 세팅
   *
   * @param {Map<string, uint32>} players key: accountId, value: charClass
   */
  setPlayers(players) {
    // dungeon.class - addPlayer
    this.#socket.send(dediPacketTypes.C_SET_PLAYERS, { players });
  }

  /**
   * 라운드 몬스터 목록 세팅
   *
   * @param {Map<uint32, uint32>} monsters key: monsterIdx, value: monsterModel
   */
  setMonsters(monsters) {
    // dungeon.class - setMonsters
    this.#socket.send(dediPacketTypes.C_SET_MONSTERS, { monsters });
  }

  /**
   * 플레이어의 이동 목표 지정
   *
   * @param {string} accountId
   * @param {WorldPosition} pos (nullable) pathfinding.proto 내 'WorldPosition' 구조 확인
   */
  setPlayerDest(accountId, pos) {
    // TODO: 소켓을 통해 accountId와 pos를 담은 데이터 전송하기
    // 데이터 예시: { accountId, pos: { x, y, z } }
    // dungeon.class - movePlayer
    if (!pos) {
      this.#socket.send(dediPacketTypes.C_SET_PLAYER_DEST, { accountId });
      return;
    }
    this.#socket.send(dediPacketTypes.C_SET_PLAYER_DEST, { accountId, pos });
  }

  /**
   * 몬스터의 이동 목표 지정
   *
   * @param {uint32} monsterIdx
   * @param {Target} target (nullable) pathfinding.proto 내 'Target' 구조 확인
   */
  setMonsterDest(monsterIdx, target) {
    // TODO: 소켓을 통해 monsterIdx와 target을 담은 데이터 전송하기
    // 데이터 예시: { monsterIdx, target: { targetPlayer: { accountId } } }
    // dungeon.class - updateMonsterAttackPlayer
    if (!target) {
      this.#socket.send(dediPacketTypes.C_SET_MONSTER_DEST, { monsterIdx });
      return;
    }
    this.#socket.send(dediPacketTypes.C_SET_MONSTER_DEST, { monsterIdx, target });
  }

  /**
   * Dedi 서버에 건물을 추가하는 메서드
   *
   * @param {int32} structureIdx 세션에서 건물을 식별할 idx
   * @param {uint32} structureModel 건물의 model 번호
   * @param {WorldPosition} worldPosition 건물이 위치할 world 좌표
   */
  addStructure(structureIdx, structureModel, worldPosition) {
    this.#socket.send(dediPacketTypes.C_ADD_STRUCTURE, {
      worldPosition,
      structure: { structureIdx, structureModel },
    });
  }

  /**
   * Dedi 서버에서 건물을 제거하는 메서드
   *
   * @param {int32} structureIdx 세션에서 관리하는 건물 idx
   */
  removeStructure(structureIdx) {
    this.#socket.send(dediPacketTypes.C_REMOVE_STRUCTURE, { structureIdx });
  }

  addPlayerPrevPosition(key, pos) {
    this.#prevPlayerPositions.set(key, pos);
  }

  getPlayerPrevPosition(key) {
    return this.#prevPlayerPositions.get(key);
  }

  addMonsterPrevPosition(key, pos) {
    this.#prevMonsterPositions.set(key, pos);
  }

  getMonsterPrevPosition(key) {
    return this.#prevMonsterPositions.get(key);
  }

  setNightRoundStart() {
    console.log('JS -> 데디 : 밤 라운드 시작');
    this.#socket.send(dediPacketTypes.C_NIGHT_ROUND_START, { timeStamp: Date.now() });
  }

  killMonster(monster) {
    console.log(`JS -> 데디 : 몬스터 처치`);
    console.log(monster);
    this.#socket.send(dediPacketTypes.C_KILL_MONSTER, monster);
  }
}

export default DediClient;
