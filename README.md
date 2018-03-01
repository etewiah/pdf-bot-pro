# pdf-bot-pro: HTML to PDF generation
### Horizontally scalable deployment of a pdf-bot

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

This is a re-write of [pdf-bot](https://github.com/esbenp/pdf-bot), a tool for creating PDF's using Google Chrome in headless mode. From the `pdf-bot` README:

> pdf-bot is installed on a server and will receive URLs to turn into PDFs through its API or CLI. pdf-bot will manage a queue of PDF jobs. Once a PDF job has run it will notify you using a webhook so you can fetch the API. pdf-bot supports storing PDFs on S3 out of the box. Failed PDF generations and Webhook pings will be retried after a configurable decaying schedule.

This project aims to be one-click deployable and easily scalable. It relies on existing job queuing systems to manage actual PDF generation and Webhook delivery with built in back-off retries instead of reinventing the whell. Both the server and workers can be scaled horizontally to support increased loads.

### How does it work?

1. Submit a publically accessible URL to be converted to a PDF via a HTTP request
2. Magic happens 🦄
3. Receive a HTTP request to your sever as a webhook when the generation is complete, with a URL to the PDF

#### 1. Submit URL to be converted
This is done with a JSON encoded `POST` request the the webserver.
```sh
  curl -X POST -H 'Authorization: Bearer API_TOKEN_DEFINED_BELOW' -H 'Content-Type: application/json' http://url-of-your-pdf-bot-pro-server/api -d '{ "url" : "https://github.com/danielwestendorf/pdf-bot-pro" }'
```

This will generate a JSON response with a `jobId` to represent the job you've just created.

The only required JSON attribute is the URL you wish to encode. You can (and should) send some more details to help identify what this PDF represents. Any additional attributes you pass will follow all they way through the request cycle. If you pass a `filename` value, the pdf with be given the filename. Otherwise a `uuid` will be used.

```json
  {
    "url":      "https://github.com/danielwestendorf/pdf-bot-pro",
    "filename": "pdf-bot-pro.pdf",
    "id":      1234,
    "account":  "PDFGeneration-R-Us",
    "foo":      "bar"
  }
```

##### 1.a Completion Triggers
You might be rendering a Javascript heavy page, so it's helpful to let `pdf-bot-pro` know when the page is done rendering. This is accomplished by simply passing some configuration options with your JSON request. The default completion trigger is a timer of 5000ms.


**Timer:** After X milliseconds, render the PDF.
```json
  {
    "url":     "https://github.com/danielwestendorf/pdf-bot-pro",
    "timeout": 1000 # Default: 5000
  }
```

**Variable:** Once the `window.foo` variable exists, render the PDF. Timeout after X milliseconds.
```json
  {
    "url":      "https://github.com/danielwestendorf/pdf-bot-pro",
    "variable": "foo", # Default: pdfBotPro
    "timeout":  1000   # Default: 5000
  }
```

**Event:** After element `div#foo` receives the event `bar`, render the PDF. Timeout after X milliseconds.
```json
  {
    "url":     "https://github.com/danielwestendorf/pdf-bot-pro",
    "element": "div#foo", # Default: document
    "event":   "bar",     # Default: load
    "timeout": 1000       # Default: 5000
  }
```


**Element:** Once element `div#foo` exists with the document, render the PDF. Timeout after X milliseconds.
```json
  {
    "url":      "https://github.com/danielwestendorf/pdf-bot-pro",
    "element": "div#foo", # Default: footer
    "timeout":  1000      # Default: 5000
  }
```

**Callback:** Once function `window.foo` is invoked, render the PDF. Timeout after X milliseconds.
```json
  {
    "url":      "https://github.com/danielwestendorf/pdf-bot-pro",
    "callback": "foo", # Default: pdfBotPro
    "timeout":  1000   # Default: 5000
  }
```

#### 2. Magic

The gist of how it `pdf-bot-pro` works is this: The worker spins up a Google Chrome instance in headless mode, loads the provided URL, and generates a PDF. The PDF is then uploaded to Amazon S3 for storage.

#### 3. Receive a HTTP request to your sever as a webhook

Your webserver will receive JSON via a HTTP `POST` request to the URL specified by the `WEBHOOK_URL`. This JSON will include the `id` of the job, the private `signedUrl` of the PDF, the `key` for of the S3 object, and any additional metadata you submitted with your initial request.

```json
  {
    "jobId":     "1234-uuid-56789",
    "signedUrl": "https://yourbucket.amazonaws.com/pdf/pdf-bot-pro.pdf",
    "key":       "pdf/pdf-bot-pro.pdf",
    "id":        1234,
    "account":   "PDFGeneration-R-Us",
    "foo":       "bar"
  }
```

##### 3.a Verify authenticity of the webhook
If you want to validate the the webhook is authentic, you should compare the hex `HMAC` signature of the body using `sha1` and the `WEBHOOK_SECRET` to the `X-Signature` header sent with the request.



### Deployment

#### Heroku
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

1. Click the deployment button to get the system running on Heroku
2. Configure the Config Vars below
3. Turn on the configured worker dyno


#### Non-Heroku

1. Install node
2. `npm install`
3. Install and configure a [`faktory`](https://github.com/contribsys/faktory) server
4. Set the Environment variables specified below
5. Start the web process `node web.js`
6. Start the worker process `node worker.js`

### Configuration
Set the Environment/Heroku Config Vars

| ENV Variable               | Default Value      | Description                                                             |
| -------------              |:-------------:     | -----                                                                   |
| API_TOKEN                  | generated secret   | A secret key for accessing the printer API.                             |
| AWS_S3_BUCKET              | REPLACE_ME         | AWS S3 Bucket Name                                                      |
| AWS_S3_ACCESS_KEY_ID       | REPLACE_ME         | AWS S3 Access Key ID                                                    |
| AWS_S3_SECRET_ACCESS_KEY   | REPLACE_ME         | AWS S3 Secret Access Key                                                |
| AWS_S3_REGION              | REPLACE_ME         | AWS S3 Bucket Region                                                    |
| AWS_S3_PREFIX              | pdf                | The path prefix for S3 storage                                          |
| WEBHOOK_SECRET             | generated secret   | Secret to use when sending webhooks                                     |
| WEBHOOK_URL                | REPLACE_ME         | URL to send webhooks to when generation is complete                     |
| FAKTORY_PROVIDER           | ACK_FOUNDRY_API_URL| The ENV var which holds the Faktory connection URL                      |


Set `DEBUG` Config var to `pdf-bot-pro:*` to get debugged output.


### Run Tests

`$ bin/faktory`
`$ npm test`
