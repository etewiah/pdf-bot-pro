const fetch = require('node-fetch')

const apiUrl = process.env.API_URL || 'http://localhost:5001/api'
const apiSecret = process.env.API_SECRET || 'apisecret1234'

fetch(apiUrl, {
  method:  'POST',
  body:    JSON.stringify({
    url:      (process.argv[2] || 'https://google.com'),
    filename: `my-filename-${Math.floor(new Date() / 1000)}.pdf`,
    id:       '1234',
    timeout:  1000
  }),
  headers: {
    'Authorization': `Bearer ${apiSecret}`,
    'Content-Type':  'application/json'
  }
}).then((response) => {
  response.json().then((json) => {
    if (response.status == 201) {
      console.log('PDF generation job was queued!')
      console.log(`Job ID: ${json.jobId}`)
    } else {
      console.log('An error was encountered!')
      console.log(json)
    }
  })
})
