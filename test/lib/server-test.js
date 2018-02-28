const Server = require('../../lib/server')

module.exports = {
  addsMiddware() {
    let server = new Server()

    server.app = td.constructor(server.app)
    server.start()

    td.verify(server.app.use(td.matchers.anything()))
  },

  addsApiCreate() {
    let server = new Server()

    server.app = td.constructor(server.app)
    server.start()

    td.verify(server.app.post('/api', td.matchers.anything()))
  },

  startsServer() {
    let server = new Server({
      port: 6000,
      log:  'test-server'
    })

    server.app = td.constructor(server.app)
    server.start()

    td.verify(server.app.listen(6000, td.matchers.anything()))
  }
}
