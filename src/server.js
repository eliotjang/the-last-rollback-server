import net from 'net';
import initServer from './init/index.js';
import { config } from './config/config.js';
import onConnection from './events/on-connection.js';
import { payloadNames, payloadTypes } from './constants/packet.constants.js';
import {
  deserialize,
  deserializeEx,
  serialize,
  serializeEx,
} from './utils/packet-serializer.utils.js';
import { detachHeader } from './utils/packet-header.utils.js';
import { sendResponse, sendResponseEx } from './utils/packet-sender.utils.js';

const server = net.createServer(onConnection);

initServer()
  .then(() => {
    server.listen(config.server.port, config.server.host, () => {
      console.log(`서버가 ${config.server.host}:${config.server.port}에서 실행 중입니다.`);
      console.log(server.address());

      const data = {
        playerId: 1,
        nickname: '임시',
        class: 1001,
        transform: {
          posX: 9,
          posY: 1,
          posZ: 8,
          rot: 90,
        },
        statInfo: {
          level: 1,
          hp: 90,
          maxHp: 100,
          mp: 10,
          maxMp: 50,
          atk: 10,
          def: 15,
          magic: 8,
          speed: 1,
        },
      };

      const temp = sendResponseEx(0, 'temp', payloadTypes.S_ENTER, { player: data }, true);
      console.log(temp);
      const { totalLength, packetType, payload } = detachHeader(temp);
      console.log(totalLength, packetType);
      const deserialized = deserializeEx(packetType, payload);
      console.log(deserialized);
      // console.log(JSON.parse(deserialized.payload));

      // -------------
      // console.log(packetNames);
      // const data = {
      //   nickname: 'temp',
      //   class: 101,
      // };

      // const data = {
      //   payload: {
      //     nickname: 'temp',

      //   }
      // }

      // const packet = serialize(packetTypes.C_ENTER, data);
      // const { totalLength, packetType, payload } = detachHeader(packet);
      // console.log('payload', payload);
      // console.log(totalLength, packetType);
      // const deserialized = deserialize(packetType, payload);
      // console.log('deserialized:', deserialized);
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1); // 오류 발생 시 프로세스 종료
  });
