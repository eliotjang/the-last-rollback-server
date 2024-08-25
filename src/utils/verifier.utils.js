export const verifyNameString = (accountId) => {
  const alphanumericPattern = /^[a-zA-Z0-9]+$/;
  if (alphanumericPattern.test(accountId)) {
    return '영문+숫자 조합만 사용 가능합니다.';
  }
  if (typeof accountId == 'number') {
    return '사용할 수 없습니다.';
  }
};
