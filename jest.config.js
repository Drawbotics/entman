module.exports = {
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'src'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  testMatch: ['<rootDir>/test/**/*.test.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'html', 'text'],
};
