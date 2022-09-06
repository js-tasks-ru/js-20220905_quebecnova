/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  const copyArr = arr.slice();
  const sortType = param === "asc" ? 1 : -1;
  return copyArr.sort(
    (a, b) => sortType * a.localeCompare(b, undefined, { caseFirst: "upper" })
  );
}
