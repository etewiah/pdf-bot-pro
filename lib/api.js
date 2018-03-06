const Url     = require('url')
const uuid    = require('uuid')
const faktory = require('faktory-worker')
const debug   = require('debug')

module.exports = class Api {
  constructor(options) {
    this.validationErrors = []
    this.options = options || {}
    this.log = debug(this.options.log || 'pdf-bot-pro:s3')

    if (this.options.token === undefined) {
      throw new Error('No API Token specified')
    }
  }

  async create(req, res) {
    this.log('Request received...')
    this.validateRequest(req)

    if (this.validationErrors.length > 0) {
      this.log(`Invalid request: ${JSON.stringify(this.validationErrors)}`)

      res.status(401).json({
        errors: this.validationErrors
      })
    } else {
      this.log('Valid request...')
      const id = uuid()

      try {
        const faktoryClient = await faktory.connect()
        const jobOptions    = Object.assign(req.body, { jobId: id })

        await faktoryClient.push({
          jobtype: 'Generate',
          args:    [jobOptions],
          retry:   25
        })

        await faktoryClient.close()

        res.status(201).json({
          jobId: id
        })
      } catch (error) {
        this.log(`Encountered an error: ${error}`)
        res.status(500).send('Service unavailable, try again later')
      }
    }
  }

  // Private

  validateRequest(req) {
    this.validateApiToken(req)
    this.validateContentType(req)
    this.validateUrl(req.body.url)
  }

  validateApiToken(req) {
    this.log('Validating API Token...')
    const authHeader = req.get('Authorization')

    if (this.options.token && (!authHeader || authHeader.replace(/Bearer (.*)$/i, '$1') !== this.options.token)) {
      this.validationErrors.push({
        error:   100,
        message: 'Invalid API Token'
      })
    }
  }

  validateContentType(req) {
    this.log('Validating Content-Type...')

    const contentType = req.get('Content-Type')

    if (contentType !== 'application/json') {
      this.validationErrors.push({
        error:   101,
        message: 'Invalid Content-Type, must be application/json'
      })
    }
  }

  validateUrl(url) {
    this.log('Validating url...')

    try {
      const parsedUrl = Url.parse(url)

      if (parsedUrl.hostname === null) {
        throw new Error('Invalid Url')
      }
    } catch (error) {
      this.validationErrors.push({
        error:   200,
        message: 'Invalid url Payload'
      })
    }
  }
}
