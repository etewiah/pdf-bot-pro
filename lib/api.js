const Url     = require('url')
const uuid    = require('uuid')
const faktory = require('faktory-worker')

module.exports = class Api {
  constructor(options) {
    this.validationErrors = []
    this.options = options || {}

    if (this.options.token === undefined) {
      throw new Error('No API Token specified')
    }
  }

  async create(req, res) {
    this.validateRequest(req)

    if (this.validationErrors.length > 0) {
      res.status(401).json({
        errors: this.validationErrors
      })
    } else {
      const id = uuid()

      try {
        const faktoryClient = await faktory.connect()

        faktoryClient.push({
          jobtype: 'Generate',
          args:    [id, req.body]
        })

        res.status(201).json({
          id: id
        })
      } catch (error) {
        res.status(500).send('Service unavailable, try again later')
      }
    }
  }

  // Private

  validateRequest(req) {
    this.validateApiToken(req)
    this.validateContentType(req)

    try {
      this.validateUrl(req.body.url)
    } catch (error) {
      this.validationErrors.push({
        error:   110,
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

  validateContentType(req) {
    const contentType = req.get('Content-Type')

    if (contentType !== 'application/json') {
      this.validationErrors.push({
        error:   101,
        message: 'Invalid Content-Type, must be application/json'
      })
    }
  }

  validateUrl(url) {
    try {
      Url.parse(url)
    } catch (error) {
      this.validationErrors.push({
        error:   200,
        message: 'Invalid url Payload'
      })
    }
  }
}
