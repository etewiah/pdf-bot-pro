const express    = require('express')
const crypto     = require('crypto')
const bodyParser = require('body-parser')


const app    = express()
const port = process.env.PORT || 7575
const secret = process.env.SECRET || 'secret1234'

function generateSignature(payload) {
  return crypto.createHmac('sha1', secret).update(payload).digest('hex')
}

app.use(bodyParser.json({
  verify: function (req, res, buffer) {
    req.rawBody = buffer; // We need the raw body string to test the signature
  }
}))

app.post('/webhooks/pdf', (req, res) => {
  const signature = req.get('X-Signature')
  const rawBody = req.rawBody // obtained from the verify function of the bodyParser middleware

  if (signature === generateSignature(rawBody)) {
    console.log('This is a valid webhook request!')
    console.log(req.body)
    // Do things with json here
  } else {
    console.log('This webhook request is not valid!')
    // Don't continue, we aren't sure who made this request
  }
})

app.listen(port, () => {
  console.log(`Listening for requests at http://localhost:${port}/webhooks/pdf...`)
})
