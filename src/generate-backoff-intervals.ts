/**
 * Generates an array of backoff intervals for retry attempts.
 *
 * @param maxAttempts - The maximum number of retry attempts.
 * @param intervalSeconds - The interval in seconds to wait between each retry attempt. Default is 30 seconds.
 * @returns An array of numbers representing the backoff intervals in milliseconds.
 *
 * @example
 * const intervals = generateBackoffIntervals(5);
 * // Returns: [0, 30000, 60000, 90000, 120000]
 */
export const generateBackoffIntervals = (maxAttempts: number, intervalSeconds: number = 30): number[] => {
  return Array(maxAttempts)
    .fill(0)
    .map((_, i) => {
      // The intervals should be the multiplied by the attempt number (and not starting with 0)
      return intervalSeconds * 1000 * (i + 1);
    });
};
