import fs from 'fs';
import path from 'path';
import url from 'url';
import protobuf from 'protobufjs';
import { packetNames, packetTypes, payloadNames } from '../constants/packet.constants.js';
import { stringToPascalCase } from '../utils/transform-case.utils.js';

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

    protoMessages.packet = {};
    protoMessages.payload = {};

    // protoMessages.payload['Temp'] = root.lookupType('Google.Protobuf.Protocol.Temp');
    // protoMessages.payload['Temp2'] = root.lookupType('Google.Protobuf.Protocol.Temp2');

    for (const [key, value] of Object.entries(packetNames)) {
      protoMessages.packet[key] = root.lookupType(value);
    }

    Object.freeze(protoMessages);
    console.log(`Successfully loaded protobuf files.`);
    console.log(Object.values(protoMessages.packet).map((message) => message.name));
  } catch (err) {
    console.error(err);
  }
};

export const getProtoMessages = () => protoMessages;
