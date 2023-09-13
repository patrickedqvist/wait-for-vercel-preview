const calculateIterations = require('../../lib/calculate-iterations');

describe('calculateIterations', () => {
  it('should return the correct number of iterations', () => {
    const maxTimeoutSec = 10;
    const checkIntervalInMilliseconds = 500;
    const iterations = calculateIterations(
      maxTimeoutSec,
      checkIntervalInMilliseconds
    );
    expect(iterations).toEqual(20);
  });
});
