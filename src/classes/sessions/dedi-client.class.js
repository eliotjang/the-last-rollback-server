import net from 'net';
import { config } from '../../config/config.js';
import { dediPacketTypes, headerConstants } from '../../constants/packet.constants.js';
import { deserializePf } from '../../utils/packet-serializer.utils.js';
import { sendPacketToDediServer } from '../../utils/packet-sender.utils.js';

const headerSize = headerConstants.TOTAL_LENGTH + headerConstants.PACKET_TYPE_LENGTH;

const handlerMappings = {
  [dediPacketTypes.S_MONSTERS_LOCATION_UPDATE]: MonstersLocationUpdateHandler,
  [dediPacketTypes.S_PLAYERS_LOCATION_UPDATE]: PlayersLocationUpdateHandler,
};

const MonstersLocationUpdateHandler = () => {
  //
};

const PlayersLocationUpdateHandler = () => {
  //
};

class DediClient {
  static #dediClients = new Map();
  #socket = new net.Socket();

  constructor() {
    this.init();
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
        const { totalLength, dediPacketType } = readHeader(this.#socket.buffer);
        if (totalLength > this.#socket.buffer.length) {
          break;
        }
        const packet = this.#socket.buffer.subarray(headerSize, totalLength);
        this.#socket.buffer = this.#socket.buffer.subarray(totalLength);
        const deserialized = deserializePf(dediPacketType, packet);
        const handler = handlerMappings[dediPacketType];
        handler();
      }
    } catch (err) {
      //
    }
  }

  onEnd() {
    //
  }

  onError(error) {
    //
  }

  getSocket() {
    return this.#socket;
  }

  /**
   * 세션 생성
   */
  createSession(dungeonCode) {
    //
  }

  /**
   * 세션 플레이어 목록 세팅
   *
   * @param {Map<string, uint32>} players key: accountId, value: charClass
   */
  setPlayers(players) {
    //
  }

  /**
   * 라운드 몬스터 목록 세팅
   *
   * @param {Map<uint32, uint32>} monsters key: monsterIdx, value: monsterModel
   */
  setMonsters(monsters) {
    //
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
  }

  /**
   * 몬스터의 이동 목표 지정
   *
   * @param {uint32} monsterIdx
   * @param {Target} target pathfinding.proto 내 'Target' 구조 확인
   */
  setMonsterDest(monsterIdx, target) {
    // TODO: 소켓을 통해 monsterIdx와 target을 담은 데이터 전송하기
    // 데이터 예시: { monsterIdx, target: { targetPlayer } }
  }
}

export default DediClient;
