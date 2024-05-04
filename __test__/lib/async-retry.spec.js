const asyncRetry = require('../../lib/async-retry');

it('should return a successful promise', async () => {
  const fn = jest.fn().mockResolvedValue("Success");
  const maxTimeout = 5;
  const delay = 500;
  const result = await asyncRetry(fn, { maxTimeout, delay });
  expect(result).toBe("Success");
});

it('should retry an unsuccessful promise', async () => {
  let failedOnce = false
  const myFunctionThatFailsOnce = () => {
    if (!failedOnce) {
      failedOnce = true
      throw 'Failed'
    }
    return 'Success'
  };
  const fn = jest.fn(myFunctionThatFailsOnce);
  const maxTimeout = 5;
  const delay = 500;
  const result = await asyncRetry(fn, { maxTimeout, delay });
  expect(fn).toHaveBeenCalledTimes(2);
  expect(result).toBe("Success");
});