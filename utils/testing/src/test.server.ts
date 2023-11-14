export const startServer = (app, port, data?: any) => {
  app.get('/', (req, res) => {
    if (!data) res.send({ message: 'Hello World!' })
    else res.send(data)
  })

  app.post('/', (req, res) => {
    console.dir(req, { depth: null })
    res.send({
      message: 'POST request recieved with data',
      data: req.body,
    })
  })

  return app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}

export const stopServer = (app) => {
  app.close()
}
