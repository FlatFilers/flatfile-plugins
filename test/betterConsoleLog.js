console.log = (...msgs) =>
  msgs.forEach((msg) => process.stdout.write(msg + '\n'))
