const { URL } = require('url')

module.exports = class Api {
  constructor(options) {
    this.validationErrors = []
    this.options = options || {}

    if (this.options.token === undefined) {
      throw new Error('No API Token specified')
    }
  }

  create(req, res) {
    this.validateRequest(req)

    if (this.validationErrors.length > 0) {
      res.status(401).json({
        errors: this.validationErrors
      })
    } else {
      // TODO: Add to queue
      res.status(201).json({
        id: '123456'
      })
    }
  }

  // Private

  validateRequest(req) {
    this.validateApiToken(req)

    try {
      this.validateUrl(req.body.url)
    } catch (error) {
      this.validationErrors.push({
        error:   101,
        message: `Invalid JSON Payload`
      })
    }
  }

  validateApiToken(req) {
    const authHeader = req.get('Authorization')

    if (this.options.token && (!authHeader || authHeader.replace(/Bearer (.*)$/i, '$1') !== this.options.token)) {
      this.validationErrors.push({
        error:   100,
        message: 'Invalid API Token'
      })
    }
  }

  validateUrl(url) {
    try {
      new URL(url)
    } catch (error) {
      this.validationErrors.push({
        error:   102,
        message: 'Invalid url Payload'
      })
    }
  }
}
