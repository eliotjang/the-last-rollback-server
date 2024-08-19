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
  constructor() {
    this.socket = new net.Socket();
    this.init();
  }

  init() {
    this.socket.connect(config.dediServer.port, config.dediServer.host, () => {
      console.log(
        `Connected to dedi-server on ${this.socket.remoteAddress}:${this.socket.remotePort}`,
      );
    });
    this.socket.on('data', this.onData.bind(this));
    this.socket.on('end', this.onEnd.bind(this));
    this.socket.on('error', this.onError.bind(this));
    this.socket.buffer = Buffer.alloc(0);
    this.socket.send = sendPacketToDediServer.bind(this.socket);
  }

  onData(data) {
    try {
      this.socket.buffer = Buffer.concat([socket.buffer, data]);
      while (this.socket.buffer.length >= headerSize) {
        const { totalLength, dediPacketType } = readHeader(socket.buffer);
        if (totalLength > this.socket.buffer.length) {
          break;
        }
        const packet = this.socket.buffer.subarray(headerSize, totalLength);
        this.socket.buffer = this.socket.buffer.subarray(totalLength);
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
}

export default DediClient;
