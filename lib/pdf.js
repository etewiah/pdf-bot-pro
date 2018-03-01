const htmlPdf           = require('html-pdf-chrome')
const tmp               = require('tmp')
const debug             = require('debug')
const CompletionTrigger = require('./pdf/completion-trigger')

module.exports = class Pdf {
  constructor(options) {
    options = options || {}

    this.log = debug(options.log || 'pdf-bot-pro:pdf')
    this.options = {
      completionTrigger: new CompletionTrigger(options).build()
    }
  }

  async generate(urlOrHtmlString) {
    const filePath = tmp.tmpNameSync({ postfix: '.pdf' })

    this.log(`Generating PDF: ${filePath} for URL or string: ${urlOrHtmlString}`)

    await htmlPdf.create(urlOrHtmlString, this.options)
      .then((pdf) => pdf.toFile(filePath))

    this.log(`Generated PDF: ${filePath}, URL: ${urlOrHtmlString}`)
    return filePath
  }
}
