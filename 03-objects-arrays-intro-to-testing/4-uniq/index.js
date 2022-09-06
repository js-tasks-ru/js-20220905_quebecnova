/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr = []) {
  const uniqArr = [];
  arr.forEach((value) => {
    if (!uniqArr.includes(value)) {
      uniqArr.push(value);
    }
  });
  return uniqArr;
}
