const fetch  = require('node-fetch')
const crypto = require('crypto')
const debug  = require('debug')

module.exports = class Webhook {
  constructor(options) {
    this.options = options || {}

    if (this.options.webhookUrl === undefined || this.options.webhookUrl.length === 0) {
      throw new Error('No webhook url provided')
    }

    if (this.options.webhookSecret === undefined || this.options.webhookSecret.length === 0) {
      throw new Error('No webhook secret provided')
    }

    this.log = debug(this.options.log || 'pdf-bot-pro:webhook')
  }

  send(data) {
    return new Promise((resolve, reject) => {
      const body      = JSON.stringify(data)
      const signature = this.generateSignature(body)

      const headers = {
        'Content-Type': 'application/json',
        'X-Signature':  signature
      }

      this.log(`Sending webhook for job: ${data.id}`)
      fetch(this.options.webhookUrl, { method: 'POST', headers: headers, body: body })
        .then((response) => {
          if (response.status >= 200 && response.status < 300) {
            this.log(`Webhook complete for job: ${data.id}, status: ${response.status}`)
            resolve()
          } else {
            this.log(`Webhook failed for job: ${data.id}, status: ${response.status}`)
            reject(new Error('Server responded with an error'))
          }
        }).catch((error) => {
          this.log(`Webhook failed for job: ${data.id}, network error: ${error}`)
          reject(new Error('Network error'))
        })
    })
  }

  // Private

  generateSignature(payload) {
    return crypto.createHmac('sha1', this.options.webhookSecret).update(payload).digest('hex')
  }
}
