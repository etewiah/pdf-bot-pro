const AWS   = require('aws-sdk')
const fs    = require('fs')
const uuid  = require('uuid')
const debug = require('debug')

module.exports = class S3 {
  constructor(options) {
    this.options = options || {}

    if (this.options.s3Bucket === undefined || this.options.s3Bucket.length === 0) {
      throw new Error('No S3 Bucket provided')
    }

    if (this.options.s3Region === undefined || this.options.s3Region.length === 0) {
      throw new Error('No S3 Region provided')
    }

    if (this.options.s3AccessKeyId === undefined || this.options.s3AccessKeyId.length === 0) {
      throw new Error('No S3 Access Key Id provided')
    }

    if (this.options.s3SecretAccessKey === undefined || this.options.s3SecretAccessKey.length === 0) {
      throw new Error('No S3 Secret Access Key provided')
    }

    this.log = debug(this.options.log || 'pdf-bot-pro:s3')

    this.client = new AWS.S3({
      credentials: {
        accessKeyId:     this.options.s3AccessKeyId,
        secretAccessKey: this.options.s3SecretAccessKey,
        region:          this.options.s3Region
      }
    })
  }

  async upload(filePath, filename) {
    filename = filename || `${uuid()}.pdf`

    const key = `${uuid()}/${filename}`
    this.log(`Uploading file to S3: ${filePath} => ${key}`)

    const params = {
      Bucket:             this.options.s3Bucket,
      Key:                key,
      ContentType:        'application/pdf',
      ACL:                'private',
      ContentDisposition: `attachment; filename="${filename}"`,
      Body:               fs.createReadStream(filePath)
    }

    await this.client.upload(params).promise()
    this.log(`Upload of file to S3 complete: ${key}`)

    return {
      key:       key,
      signedUrl: this.client.getSignedUrl('getObject', {
        Bucket:  this.options.s3Bucket,
        Key:     key,
        Expires: 604800
      })
    }
  }
}
