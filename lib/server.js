const express    = require('express')
const bodyParser = require('body-parser')
const debug      = require('debug')
const Api        = require('./api')

module.exports = class Server {
  constructor(options) {
    this.options = options || {
      port: 5001
    }

    this.app = express()
    this.log = debug(this.options.log || 'pdf-bot-pro:s3')
  }

  start() {
    this.log('Starting server...')

    this.addMiddleware()
    this.addEndpoints()

    this.app.listen(this.options.port, () => {
      console.log(`Listening for requests at http://localhost:${this.options.port}...`)
    })
  }

  // private

  addMiddleware() {
    this.app.use(bodyParser.json())
  }

  addEndpoints() {
    this.app.post('/api', (req, res) => {
      return new Api({
        token: this.options.token
      }).create(req, res)
    })
  }
}
