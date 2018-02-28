module.exports = class Api {
  constructor(options) {
    this.options = options || {}

    if (this.options.token === undefined) {
      throw new Error('No API Token specified')
    }
  }

  create(req, res) {
    let authHeader = req.get('Authorization')

    if (this.options.token && (!authHeader || authHeader.replace(/Bearer (.*)$/i, '$1') !== this.options.token)) {
      res.status(401).json({
        error:   '100',
        message: 'Invalid API Token'
      })
    } else {
      // TODO: Add to queue
      res.status(201).json({
        id: '123456'
      })
    }
  }
}
