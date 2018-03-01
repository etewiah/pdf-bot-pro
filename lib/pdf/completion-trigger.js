const htmlPdf = require('html-pdf-chrome')

module.exports = class CompletionTrigger {
  constructor(options) {
    this.options = options || {}
  }

  build() {
    if (this.options.callback) {
      return this.buildCallbackTrigger()
    } else if (this.options.event) {
      return this.buildEventTrigger()
    } else if (this.options.element) {
      return this.buildElementTrigger()
    } else if (this.options.variable) {
      return this.buildVariableTrigger()
    } else {
      return this.buildTimerTrigger()
    }
  }

  // Private

  buildCallbackTrigger() {
    return new htmlPdf.CompletionTrigger.Callback(
      this.options.callback || 'pdfBotPro',
      parseInt(this.options.timeout) || 5000
    )
  }

  buildElementTrigger() {
    return new htmlPdf.CompletionTrigger.Element(
      this.options.element || 'footer',
      parseInt(this.options.timeout) || 5000
    )
  }

  buildEventTrigger() {
    return new htmlPdf.CompletionTrigger.Event(
      this.options.event || 'load',
      this.options.element || 'document',
      parseInt(this.options.timeout) || 5000
    )
  }

  buildVariableTrigger() {
    return new htmlPdf.CompletionTrigger.Variable(
      this.options.variable || 'pdfBotPro',
      parseInt(this.options.timeout) || 5000
    )
  }

  buildTimerTrigger() {
    return new htmlPdf.CompletionTrigger.Timer(
      parseInt(this.options.timeout) || 5000
    )
  }
}
