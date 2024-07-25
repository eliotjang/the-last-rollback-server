const transformToObject = (transform) => ({
  posX: transform.posX,
  posY: transform.posY,
  posZ: transform.posZ,
  rot: transform.rot,
});

const statInfoToObject = (statInfo) => ({
  level: statInfo.level,
  hp: statInfo.hp,
});

export const playerInfoToObject = (playerInfo) => ({
  playerId: playerInfo.playerId,
  nickname: playerInfo.nickname,
  class: playerInfo.characterClass,
  transform: transformToObject(playerInfo.transform),
  statInfo: statInfoToObject(playerInfo.statInfo),
});
