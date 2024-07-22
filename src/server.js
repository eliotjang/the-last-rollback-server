import net from 'net';
import initServer from './init/index.js';
import { config } from './config/config.js';
import onConnection from './events/on-connection.js';
import { packetTypes } from './constants/packet.constants.js';
import { deserialize, serialize } from './utils/packet-serializer.utils.js';
import { detachHeader } from './utils/packet-header.utils.js';

const server = net.createServer(onConnection);

initServer()
  .then(() => {
    server.listen(config.server.port, config.server.host, () => {
      console.log(`서버가 ${config.server.host}:${config.server.port}에서 실행 중입니다.`);
      console.log(server.address());

      // const data = {
      //   payload: {
      //     nickname: 'temp',
      //     class: 101,
      //   },
      // };

      // const packet = serialize(packetTypes.C_ENTER, data);
      // const { totalLength, packetType, payload } = detachHeader(packet);
      // console.log(totalLength, packetType);
      // const deserialized = deserialize(payload);
      // console.log(deserialized);
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1); // 오류 발생 시 프로세스 종료
  });
