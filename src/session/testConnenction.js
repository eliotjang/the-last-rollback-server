import { getGameAssets } from '../init/assets.js';
import MonsterTransformInfo from '../protobuf/classes/info/monster-transform-info.proto.js';
import TransformInfo from '../protobuf/classes/info/transform-info.proto.js';
import { addDungeonSession } from './dungeon.session.js';
import { addUser, removeUser } from './user.session.js';

const dungeonSessionConnection = async () => {
  //
};

export const testAllSessionConnections = async () => {
  await dungeonSessionConnection();
};
