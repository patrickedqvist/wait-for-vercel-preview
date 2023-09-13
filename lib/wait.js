/**
 * Asynchronously wait for a given number of milliseconds
 * @param {number} milliseconds - The number of milliseconds to wait
 * @returns {Promise<void>} A promise that will resolve after the given number of milliseconds
 */
function wait(milliseconds) {
  return new Promise((resolve) => {
    if (typeof milliseconds !== 'number') {
      throw new Error('milliseconds not a number');
    }
    setTimeout(() => resolve('done!'), milliseconds);
  });
}

module.exports = wait;
