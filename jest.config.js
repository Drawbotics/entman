export default {
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'src'],
  transform: {},
  testMatch: ['<rootDir>/test/**/*.test.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'html', 'text'],
};
