const assert    = require('assert')
const fetch     = require('node-fetch')
const { spawn } = require('child_process')

const port  = 9890,
      token = 'abc123'

let server;

module.exports = {
  async beforeAll(done) {
    const newEnv     = process.env
    newEnv.PORT      = port
    newEnv.API_TOKEN = token

    server = spawn('node', ['web.js'], { env: newEnv })
    server.stdout.on('data', (data) => {
      if (`${data}`.match('Listening')) {
        done()
      } else {
        console.log(data.toString())
      }
    })
  },

  afterAll() {
    server.kill()
  },

  // api: {
  //   create: {
  //     successful: {
  //       async beforeEach(done) {
  //         this.response = await fetch(`http://localhost:${port}/api`, {
  //           method:  'POST',
  //           body:    JSON.stringify({ url: 'http://google.com' }),
  //           headers: {
  //             'Authorization': `Bearer ${token}`,
  //             'Content-Type':  'application/json'
  //           }
  //         })

  //         this.json = await this.response.json()
  //         done()
  //       },

  //       status201() {
  //         assert.equal(this.response.status, 201)
  //       },

  //       setsId() {
  //         assert(this.json.id.length > 0)
  //       }
  //     },

  //     invalidToken: {
  //       async beforeEach(done) {
  //         this.response = await fetch(`http://localhost:${port}/api`, {
  //           method:  'POST',
  //           headers: { 'Authorization': `Bearer 4321` }
  //         })

  //         this.json = await this.response.json()
  //         done()
  //       },

  //       status401() {
  //         assert.equal(this.response.status, 401)
  //       },

  //       setsErrorCode() {
  //         assert.equal(this.json.errors[0].error, '100')
  //       },

  //       setsErrorMessage() {
  //         assert(this.json.errors[0].message.match('Invalid API'))
  //       }
  //     }
  //   }
  // }
}
