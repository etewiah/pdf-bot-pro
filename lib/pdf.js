const htmlPdf = require('html-pdf-chrome')
const tmp     = require('tmp')

module.exports = class Pdf {
  constructor(options) {
    this.options = options || {}
  }

  async generate(urlOrHtmlString) {
    const filePath = tmp.tmpNameSync({ postfix: '.pdf' })

    await htmlPdf.create(urlOrHtmlString, this.options)
      .then((pdf) => pdf.toFile(filePath))

    return filePath
  }
}
