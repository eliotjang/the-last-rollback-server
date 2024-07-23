import lodash from 'lodash';

/**
 *
 * @param {string} string
 * @returns camelCase string, or original if it wasn't a string.
 */
export const stringToCamelCase = (string) => {
  if (typeof string === 'string') {
    return lodash.camelCase(string);
  }
  return string;
};

export const stringToPascalCase = (string) => {
  if (typeof string === 'string') {
    return lodash.upperFirst(lodash.camelCase(string));
  }
  return string;
};

export const toCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    // 배열인 경우, 배열의 각 요소에 대해 재귀적으로 toCamelCase 함수를 호출
    return obj.map((v) => toCamelCase(v));
  } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    // 객체인 경우, 객체의 키를 카멜케이스로 변환하고, 값에 대해서도 재귀적으로 toCamelCase 함수를 호출
    return Object.keys(obj).reduce((result, key) => {
      result[lodash.camelCase(key)] = toCamelCase(obj[key]);
      return result;
    }, {});
  }
  // 객체도 배열도 아닌 경우, 원본 값을 반환
  return obj;
};
