export const findBaseHpByDungeonCode = (dungeonCode) => {
  switch (dungeonCode) {
    case '1':
      return 100;
    case '2':
      return 150;
    case '3':
      return 200;
    default:
      throw new CustomError(ErrorCodes.INVALID_PACKET, '존재하지 않는 던전 코드입니다.');
  }
};
