const fetch  = require('node-fetch')
const crypto = require('crypto')

module.exports = class Webhook {
  constructor(options) {
    this.options = options || {}

    if (this.options.webhookUrl === undefined || this.options.webhookUrl.length === 0) {
      throw new Error('No webhook url provided')
    }

    if (this.options.webhookSecret === undefined || this.options.webhookSecret.length === 0) {
      throw new Error('No webhook secret provided')
    }
  }

  send(data) {
    return new Promise((resolve, reject) => {
      const body      = JSON.stringify(data)
      const signature = this.generateSignature(body)

      const headers = {
        'Content-Type': 'application/json',
        'X-Signature':  signature
      }

      fetch(this.options.webhookUrl, { method: 'POST', headers: headers, body: body })
        .then((response) => {
          if (response.status >= 200 && response.status < 300) {
            resolve()
          } else {
            reject(new Error('Server responded with an error'))
          }
        }).catch(() => reject(new Error('Network error')))
    })
  }

  // Private

  generateSignature(payload) {
    return crypto.createHmac('sha1', this.options.webhookSecret).update(payload).digest('hex')
  }
}
