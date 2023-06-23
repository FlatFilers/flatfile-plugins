module.exports = {
  
    testEnvironment: "node",
    extensionsToTreatAsEsm: [".ts"],
    transform: {
      "^.+\\.ts$": "esbuild-jest",
    },
    globals: {
      "ts-jest": {
        useESM: true,
      },
    },
  };