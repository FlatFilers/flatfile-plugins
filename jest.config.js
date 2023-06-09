
module.exports = {
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  setupFiles: ["./utils/setup-tests.js"]
};
