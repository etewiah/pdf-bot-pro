const faktory  = require('faktory-worker')
const Pdf      = require('./lib/pdf')
const S3       = require('./lib/s3')
const Webhook  = require('./lib/webhook')
const debug    = require('debug')
const log      = require('debug')('pdf-bot-pro:worker')

faktory.register('Generate', async (details) => {
  log(`Starting generation job: ${details.id}`)

  log(`Starting pdf generation: ${details.id}`)
  const filePath = await new Pdf(details).generate(details.url)

  log(`Starting S3 upload: ${details.id}`)
  const s3ObjectDetails = await new S3({
    prefix:            process.env.AWS_S3_PREFIX,
    s3Bucket:          process.env.AWS_S3_BUCKET,
    s3AccessKeyId:     process.env.AWS_S3_ACCESS_KEY_ID,
    s3SecretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    s3Region:          process.env.AWS_S3_REGION,
  }).upload(filePath, details.filename)

  const faktoryClient = await faktory.connect()

  log(`Starting generation job: ${details.id}`)
  await faktoryClient.push({
    jobtype: 'Webhook',
    args:    [Object.assign(details, s3ObjectDetails)]
  })

  faktoryClient.close()
});

faktory.register('Webhook', async(details) => {
  log(`Starting webhook job: ${details.id}`)

  await new Webhook({
    webhookUrl:    process.env.WEBHOOK_URL,
    webhookSecret: process.env.WEBHOOK_SECRET
  }).send(details)
})

faktory.work();
