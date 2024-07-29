// change only one dept of object
export function changeProperType(data) {
  try {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      if (!isNaN(value)) {
        result[key] = +value;
      } else if (isJsonString(value)) {
        result[key] = JSON.parse(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  } catch (error) {
    console.error(error);
  }
}

function isJsonString(str) {
  try {
    const json = JSON.parse(str);
    return typeof json === 'object';
  } catch (error) {
    return false;
  }
}
