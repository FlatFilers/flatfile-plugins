export const startServer = (app, port, data?: any) => {
  app.get('/', (req, res) => {
    if (!data) res.send({ message: 'Hello World!' })
    else res.send(data)
  })

  app.post('/', (req, res) => {
    res.send({
      message: 'POST request recieved with data',
      data: req.body,
    })
  })

  app.post('/data', (req, res) => {
    res.send({
      message: 'POST request recieved with data',
      data: {
        dataMessage: 'Hello World!',
      },
    })
  })

  app.post('/error', (req, res) => {
    // console.dir(req)
    res.status(500).send({
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
