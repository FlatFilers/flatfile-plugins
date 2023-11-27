export const startServer = (app, port, data) => {
  app.get('/', (req, res) => {
    res.send(data)
  })

  return app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}

export const stopServer = (app) => {
  app.close()
}
