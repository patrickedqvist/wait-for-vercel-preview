import { retry } from 'radash';
import { calculateIterations } from './calculate-iterations';

/**
 * asyncRetry
 * The function allows you to run an async function and automagically retry it if it fails
 * It will calculate the number of iterations based on the maxTimeout and delay
 * @param {Promise<any>} fn - The function to run. It should be an async function
 * @param {number} maxTimeout - The maximum amount of time to wait for the deployment to be successful
 * @param {number} delay - The number of milliseconds to sleep in between running
 * @returns {Promise} - Returns a promise that resolves when the function is successful
 */
export async function asyncRetry(fn, { maxTimeout, delay }) {
  const iterations = calculateIterations(maxTimeout, delay);
  return retry({ times: iterations, delay }, fn);
}
