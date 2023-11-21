import { Express, json } from 'express'

import http from 'http'

export const startServer = (
  app: Express,
  port: number,
  data?: any
): http.Server => {
  app.use(json())

  app
    .route('/')
    .get((req, res) => {
      console.log('resolving get / data')
      if (!data) res.status(200).send({ message: 'Hello World!' })
      else res.status(200).send(data)
    })
    .post((req, res) => {
      console.log('sending / data')
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

  return app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}

export const stopServer = (server: http.Server) => {
  return new Promise((res, rej) => {
    server.close((err) => {
      if (err) rej(err)
      res(null)
    })
  })
}
