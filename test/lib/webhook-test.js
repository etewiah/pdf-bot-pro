const assert  = require('assert')
const crypto  = require('crypto')

let fetch, Webhook

const options = {
  webhookUrl:    'abc',
  webhookSecret: '123'
}

module.exports = {
  beforeEach() {
    fetch   = td.replace('node-fetch')
    Webhook = require('../../lib/webhook')
  },

  requiresWebhookUrl() {
    assert.throws(() => {
      new Webhook();
    }, /No webhook url/)
  },

  requiresWebhookSecret() {
    assert.throws(() => {
      new Webhook({ webhookUrl: 'blah' });
    }, /No webhook secret/)
  },

  send: {
    async successful(done) {
      const response = td.object({ status: 204 })

      td.when(fetch(td.matchers.isA(String), td.matchers.anything()))
        .thenResolve(response)

      await new Webhook(options).send({})
      done()
    },

    async serverError(done) {
      const response = td.object({ status: 500 })

      td.when(fetch(
        td.matchers.isA(String), {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Signature': td.matchers.isA(String) },
          body: td.matchers.isA(String)
        }
      )).thenResolve(response)

      try {
        await new Webhook(options).send({})
      } catch(error) {
        assert.equal(error, 'Error: Server responded with an error')
        done()
      }
    },

    async networkError(done) {
      td.when(fetch(td.matchers.isA(String), td.matchers.anything()))
        .thenReject('Boom')

      try {
        await new Webhook(options).send({})
      } catch(error) {
        assert.equal(error, 'Error: Network error')
        done()
      }
    }
  },

  generateSignature() {
    const payload   = 'This is my payload'
    const signature = crypto.createHmac('sha1', options.webhookSecret)
                        .update(payload).digest('hex')

    const generatedSignature = new Webhook(options).generateSignature(payload)

    assert.equal(generatedSignature, signature)
  }
}
