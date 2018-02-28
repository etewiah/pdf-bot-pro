const assert  = require('assert')
const htmlPdf = td.replace('html-pdf-chrome')
const pdf     = td.object('toFile')
const Pdf     = require('../../lib/pdf')

module.exports = {
  beforeEach() {
    td.when(htmlPdf.create(td.matchers.isA(String), td.matchers.anything()))
      .thenResolve(pdf)
  },

  generate: {
    async htmlString(done) {
      const htmlString   = "<p>Hello world!</p>"
      const pdfGenerator = new Pdf()

      let pdfFilePath = await pdfGenerator.generate(htmlString)
      assert(pdfFilePath.match(/\.pdf$/))

      td.verify(pdf.toFile(pdfFilePath))
      done()
    },

    async url(done) {
      const url          = "https://google.com"
      const pdfGenerator = new Pdf()

      let pdfFilePath = await pdfGenerator.generate(url)
      assert(pdfFilePath.match(/\.pdf$/))

      td.verify(pdf.toFile(pdfFilePath))
      done()
    }
  }
}
