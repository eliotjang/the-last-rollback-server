export const verifyAccountId = (string) => {
  if (['true', 'false', 'null', 'undefined'].includes(string)) {
    return '사용할 수 없습니다.';
  }

  const regex = /^(?!0\d)(?!e\d)(?=.*[a-zA-Z])(?!\d+$)[a-zA-Z]*[0-9]*$/i;
  if (!regex.test(string)) {
    return '영문으로 시작하는 영문+숫자 조합만 사용 가능합니다.';
  }
};

/**
 *
 * @param {*} string
 * @returns {boolean} false if string is only numbers, true otherwise, only if alphanumeric
 */
export const verifyAlphaNumericString = (string) => {
  const alphanumericPattern = /^(?!\d+$)[A-Za-z0-9]+$/;
  if (!alphanumericPattern.test(string)) {
    return false;
  }
  return true; // Alphanumeric and not only numbers
};

/**
 *
 * @param {*} string
 * @returns {boolean} true if string can be converted to number in JavaScript
 */
export const verfiyNumberString = (string) => {
  return !isNaN(string);
};

/**
 *
 * @param {string} string string to be verified
 * @return {boolean} true if korean, false otherwise
 */
export const verifyKoreanString = (string) => {
  // Regex pattern to check if the string contains Korean characters
  const koreanPattern = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

  return koreanPattern.test(string);
};

/**
 * Use regex to check string validity
 * @param {string} string string to be verified
 * @return {boolean} False if: only numbers, includes spaces, includes special characters, 'true', 'false', 'null', or 'undefined'. True otherwise.
 */
export const verifyString = (string) => {
  if (['true', 'false', 'null', 'undefined'].includes(string)) {
    return '사용할 수 없습니다.';
  }

  const regex = /^(?!0\d)(?!e\d)(?=.*[a-zA-Z가-힣])(?!\d+$)[a-zA-Z가-힣]*[0-9]*$/i;
  if (!regex.test(string)) {
    return '사용할 수 없습니다.';
  }
  //   const pattern = /^(?!0)[a-zA-Z0-9가-힣]{2,10}$/;
  //   const invalidPattern = /^(?!0?!\d)\w가-힣+$/;

  //   if (!pattern.test(string) || !invalidPattern.test(string)) {
  //     return '잘 못된 닉네임입니다.';
  //   }
};
