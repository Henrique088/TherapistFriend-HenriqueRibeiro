// jest.config.js
module.exports = {
  testEnvironment: "node",
  verbose: true,
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },

  testMatch: [
    "**/__tests__/**/*.+(ts|js)",
    "**/?(*.)+(spec|test).+(ts|js)"
  ]
};
