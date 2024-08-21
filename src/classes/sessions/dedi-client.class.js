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
  // monsterIdx : Vector3 (X,Y,Z)
  console.log('---------', this.dungeonId);
  const dungeonSession = getDungeonSession(this.dungeonId);
  const { positions } = deserialized;
  const monsterTransformInfo = [];

  for (const [monsterIdx, worldPosition] of Object.entries(positions)) {
    monsterTransformInfo.push({
      monsterIdx,
      transformInfo: {
        posX: worldPosition.x,
        posY: worldPosition.y,
        posZ: worldPosition.z,
        rot: 0,
      },
    });
  }

  dungeonSession.notifyAll(payloadTypes.S_MONSTERS_LOCATION_UPDATE, monsterTransformInfo);
  // dungeonSession.monstersLocationUpdate(deserialized);
};

const PlayersLocationUpdateHandler = function (deserialized) {
  // accountId : Vector3 (X,Y,Z)
  // const dungeonSession = getDungeonSession(this.dungeonId);
  const { positions } = deserialized;
  const temp = Object.keys(positions)[0];
  if (!temp) return;
  const dungeonSession = getDungeonSessionByUserId(temp);
  const playerTransformInfo = [];

  // TODO: 이전 위치 저장 및 rotation 계산

  for (const [accountId, worldPosition] of Object.entries(positions)) {
    console.log(
      `accountId: ${accountId}  x: ${worldPosition.x} y: ${worldPosition.y} z: ${worldPosition.z}`,
    );
    playerTransformInfo.push({
      accountId,
      transformInfo: {
        posX: worldPosition.x,
        posY: worldPosition.y,
        posZ: worldPosition.z,
        rot: 0,
      },
    });
  }

  dungeonSession.notifyAll(payloadTypes.S_PLAYERS_TRANSFORM_UPDATE, playerTransformInfo);
  // dungeonSession.playersLocationUpdate(map);
};

const handlerMappings = {
  [dediPacketTypes.S_MONSTERS_LOCATION_UPDATE]: MonstersLocationUpdateHandler,
  [dediPacketTypes.S_PLAYERS_LOCATION_UPDATE]: PlayersLocationUpdateHandler,
};

class DediClient {
  static #dediClients = new Map();
  #socket = new net.Socket();

  constructor(dungeonId) {
    this.init();
    this.dungeonId = dungeonId;
    // this.dungeon = dungeon;
    // DediClient.addClient(dungeonId, this);
  }

  static addClient = (dungeonId, dediClient) => {
    DediClient.#dediClients.set(dungeonId, dediClient);
  };

  static getClient = (dungeonId) => {
    return DediClient.#dediClients.get(dungeonId);
  };

  static removeClient = (dungeonId) => {
    const client = DediClient.getClient(dungeonId);
    client.getSocket().end();
    return DediClient.#dediClients.delete(dungeonId);
  };

  init() {
    this.#socket.connect(config.dediServer.port, config.dediServer.host, () => {
      console.log(
        `Connected to dedi-server on ${this.#socket.remoteAddress}:${this.#socket.remotePort}`,
      );

      // this.#socket.send(dediPacketTypes.C_CREATE_SESSION, {
      //   dungeonCode: this.dungeon.dungeonCode,
      // });
    });
    this.#socket.on('data', this.onData.bind(this));
    this.#socket.on('end', this.onEnd.bind(this));
    this.#socket.on('error', this.onError.bind(this));
    this.#socket.buffer = Buffer.alloc(0);
    this.#socket.send = sendPacketToDediServer.bind(this.#socket);
  }

  onData(data) {
    try {
      this.#socket.buffer = Buffer.concat([this.#socket.buffer, data]);
      while (this.#socket.buffer.length >= headerSize) {
        const { totalLength, packetType: dediPacketType } = readHeader(this.#socket.buffer, true);
        if (totalLength > this.#socket.buffer.length) {
          break;
        }
        console.log('----------------????', dediPacketType, totalLength);
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

  onEnd() {
    try {
      DediClient.removeClient(this.dungeonId);
      console.log('Dedicated client shut down');
    } catch (error) {
      handleError(this.#socket, error);
    }
  }

  onError(error) {
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
   * @param {WorldPosition} pos pathfinding.proto 내 'WorldPosition' 구조 확인
   */
  setPlayerDest(accountId, pos) {
    // TODO: 소켓을 통해 accountId와 pos를 담은 데이터 전송하기
    // 데이터 예시: { accountId, pos: { x, y, z } }
    // dungeon.class - movePlayer
    this.#socket.send(dediPacketTypes.C_SET_PLAYER_DEST, { accountId, pos });
  }

  /**
   * 몬스터의 이동 목표 지정
   *
   * @param {uint32} monsterIdx
   * @param {Target} target pathfinding.proto 내 'Target' 구조 확인
   */
  setMonsterDest(monsterIdx, target) {
    // TODO: 소켓을 통해 monsterIdx와 target을 담은 데이터 전송하기
    // 데이터 예시: { monsterIdx, target: { targetPlayer: { accountId } } }
    // dungeon.class - updateMonsterAttackPlayer
    this.#socket.send(dediPacketTypes.C_SET_MONSTER_DEST, { monsterIdx, target });
  }
}

export default DediClient;
