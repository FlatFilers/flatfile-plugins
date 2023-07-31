const path = require("path");

module.exports = {
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  setupFilesAfterEnv: [path.join(__dirname, "./testing/setup-tests.js")],
};
