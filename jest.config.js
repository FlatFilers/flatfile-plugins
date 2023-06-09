const path = require("path");

module.exports = {
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  setupFiles: [path.join(__dirname, "./testing/setup-tests.js")],
};
