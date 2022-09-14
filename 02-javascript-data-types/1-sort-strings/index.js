/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  const copyArr = [...arr];
  let sortType;
  if (param === "asc") {
    sortType = 1;
  }
  if (param === "desc") {
    sortType = -1;
  }
  return copyArr.sort(
    (a, b) =>
      sortType * a.localeCompare(b, ["ru", "en"], { caseFirst: "upper" })
  );
}
