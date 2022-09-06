/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined) return string;
  const charCounter = {};
  let newString = "";
  let i = 0;
  for (const char of string) {
    if (!charCounter[char]) {
      charCounter[char] = 1;
    } else {
      charCounter[char] += 1;
    }

    if (charCounter[char] <= size) {
      newString += char;
    }

    const nextChar = string[i + 1];
    if (nextChar !== char) {
      charCounter[char] = 0;
    }
    i++;
  }
  return newString;
}
