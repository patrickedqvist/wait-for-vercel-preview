module.exports = {
  setupFilesAfterEnv: ['./test/support/setupTests.js'],
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', './action.js'],
  coveragePathIgnorePatterns: ['/node_modules/', '/test/', './index.js'],
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
  },
};
