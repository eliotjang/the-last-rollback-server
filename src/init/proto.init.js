import fs from 'fs';
import path from 'path';
import url from 'url';
import protobuf from 'protobufjs';
import { packetNames, payloadNames } from '../constants/packet.constants.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const protoDirname = path.join(__dirname, '../protobuf');

const getAllProtoFilePaths = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllProtoFilePaths(filePath, fileList);
    } else if (path.extname(file) === '.proto') {
      fileList.push(filePath);
    }
  });

  return fileList;
};

const protoFiles = getAllProtoFilePaths(protoDirname);
const root = new protobuf.Root();
const protoMessages = {};

export const loadProtoFiles = async () => {
  try {
    protoFiles.forEach((file) => root.loadSync(file));

    // protoMessages['RequestPacket'] = root.lookupType('Google.Protobuf.Protocol.RequestPacket');
    // protoMessages['ResponsePacket'] = root.lookupType('Google.Protobuf.Protocol.ResponsePacket');

    protoMessages.packet = {};
    protoMessages.payload = {};
    for (const [packetType, messageName] of Object.entries(packetNames)) {
      protoMessages.packet[packetType] = root.lookupType(messageName);
    }

    for (const [payloadType, messageName] of Object.entries(payloadNames)) {
      protoMessages.payload[payloadType] = root.lookupType(messageName);
    }

    Object.freeze(protoMessages);
    console.log(`Successfully loaded protobuf files.`);
    console.log(Object.values(protoMessages.packet).map((message) => message.name));
  } catch (err) {
    console.error(err);
  }
};

export const getProtoMessages = () => protoMessages;
