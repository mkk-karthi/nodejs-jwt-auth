module.exports = {
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: [],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
