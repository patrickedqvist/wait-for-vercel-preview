import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    /**
     * Normally Vitest intercepts console.log, console.error, console.warn, and console.info and hides them
     * from the console. However, the github action relays important information through the console, so
     * we disable the console intercept.
     */
    disableConsoleIntercept: false,
  },
});
