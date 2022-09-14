/**
 * Sum - returns sum of arguments if they can be converted to a number
 * @param {number} n value
 * @returns {number | function}
 */

export function sum(n) {
  let currentSum = 0;
  if (n) currentSum += n;
  function nextSum(b) {
    if (b) currentSum += b;
    return nextSum;
  }

  nextSum.valueOf = () => {
    return currentSum;
  };

  return nextSum;
}
