import express from 'express'
import * as http from 'http'
import * as path from 'path'

const app = express()

const PORT = 3000
const HOST_NAME = 'localhost'
const PUBLIC_FOLDER = 'public'

app.use(`/${PUBLIC_FOLDER}`, express.static(path.resolve(PUBLIC_FOLDER)))
app.use('/app', express.static(path.resolve('src')))

app.all('/*', function (_, res) {
  res.sendFile('index.html', { root: path.resolve(PUBLIC_FOLDER) })
})

const server = http.createServer(app)
server.listen(PORT, HOST_NAME)
  .on('listening', function () {
    const { port, address } = server.address()
    console.log(`Express server started on port ${port} at ${address}.`)
  })
