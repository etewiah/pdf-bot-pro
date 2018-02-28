const Server = require('./lib/server')

console.log('Starting web server...')

new Server({
  log:   'server',
  port:  process.env.PORT || 5001,
  token: process.env.API_TOKEN
}).start()
