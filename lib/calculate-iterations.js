/**
 * Calculates the number of iterations to be performed
 * @param {number} maxTimeoutSec - Maximum timeout in seconds
 * @param {number} checkIntervalInMilliseconds - Check interval in milliseconds
 * @returns {number} The number of iterations
 */
function calculateIterations(maxTimeoutSec, checkIntervalInMilliseconds) {
  return Math.floor(maxTimeoutSec / (checkIntervalInMilliseconds / 1000));
}

module.exports = calculateIterations;
