import { describe, expect, it } from 'vitest';
import { generateBackoffIntervals } from '../src/generate-backoff-intervals';

describe('backoff intervals', () => {
  it('should generate correct backoff intervals', () => {
    const maxAttempts = 5;
    const expectedIntervals = [30000, 60000, 90000, 120000, 150000];
    const result = generateBackoffIntervals(maxAttempts);
    expect(result).toEqual(expectedIntervals);
  });

  it('should return an empty array for maxAttempts = 0', () => {
    const result = generateBackoffIntervals(0);
    expect(result).toEqual([]);
  });

  it('should return correct intervals for maxAttempts = 1', () => {
    const result = generateBackoffIntervals(1);
    expect(result).toEqual([30000]);
  });

  it('should return correct intervals for a large maxAttempts value', () => {
    const maxAttempts = 10;
    const result = generateBackoffIntervals(maxAttempts, 5);
    expect(result).toHaveLength(maxAttempts);
    expect(result[result.length - 1]).toBe(5000 * maxAttempts);
  });
});
