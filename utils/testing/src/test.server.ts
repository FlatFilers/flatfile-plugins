export const startServer = (app, port, data?: any) => {
  app.get('/', (req, res) => {
    if (!data) res.status(200).send({ message: 'Hello World!' })
    else res.status(200).send(data)
  })

  app.post('/', (req, res) => {
    console.dir('sending / data')
    res.status(200).send({
      message: 'POST request recieved with data',
      data: req.body,
    })
  })

  app.post('/data', (req, res) => {
    console.log('sending /data data')
    res.status(200).send({
      message: 'POST request recieved with data',
      data: {
        dataMessage: 'Hello World!',
      },
    })
  })

  app.post('/error', (req, res) => {
    console.log('sending /error data')
    res.status(500).send({
      message: 'POST request recieved with data',
      data: req.body,
    })
  })

  return app.listen(port, (err) => {
    if (err) {
      console.error('Error starting server')
    }
    console.log(`Example app listening on port ${port}`)
  })
}

export const stopServer = (app) => {
  app.close()
}
