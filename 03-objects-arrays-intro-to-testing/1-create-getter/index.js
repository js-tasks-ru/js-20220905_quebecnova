/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */

export function createGetter(path) {
  const paths = path.split(".");
  return (curr) => {
    let res = curr;
    for (const singlePath of paths) {
      if (res) {
        res = res[singlePath];
      }
    }
    return res;
  };
}
