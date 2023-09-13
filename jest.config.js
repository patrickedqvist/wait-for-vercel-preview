module.exports = {
  setupFilesAfterEnv: ['<rootDir>/__test__/support/setupTests.js'],
  collectCoverageFrom: ['./**/*.{js,jsx,ts,tsx}', './action.js'],
  coveragePathIgnorePatterns: ['/node_modules/', '/__test__/', './index.js'],
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
  },
};
