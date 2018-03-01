const assert  = require('assert')

let fs, S3

const options = {
  s3Bucket:          'a',
  s3Region:          'b',
  s3AccessKeyId:     'c',
  s3SecretAccessKey: 'd'
}

module.exports = {
  beforeEach() {
    fs = td.replace('fs')
    S3 = require('../../lib/s3')
  },

  requiresS3Bucket() {
    assert.throws(() => {
      new S3();
    }, /No S3 Bucket/)
  },

  requiresS3Region() {
    assert.throws(() => {
      new S3({ s3Bucket: 'a' });
    }, /No S3 Region/)
  },

  requiresS3AccessKeyId() {
    assert.throws(() => {
      new S3({ s3Bucket: 'a', s3Region: 'a' });
    }, /No S3 Access Key Id/)
  },

  requiresS3SecretAccessKey() {
    assert.throws(() => {
      new S3({ s3Bucket: 'a', s3Region: 'a', s3AccessKeyId: 'b' });
    }, /No S3 Secret Access Key/)
  },

  upload: {
    async beforeEach(done) {
      const s3 = new S3(options)
      s3.client = td.object('client')

      const promise = td.object(['promise'])

      td.when(s3.client.upload(td.matchers.anything()))
        .thenReturn(promise)

      td.when(promise.promise())
        .thenResolve(true)

      td.when(s3.client.getSignedUrl('getObject', {
        Bucket:  options.s3Bucket,
        Key:     td.matchers.isA(String),
        Expires: 604800
      })).thenReturn('http://path/abc.pdf')

      this.result = await s3.upload('/tmp/file.pdf', 'abc.pdf')
      done()
    },

    key() {
     assert(this.result.key.match(/abc\.pdf$/))
    },

    signedUrl() {
      assert.equal(this.result.signedUrl, 'http://path/abc.pdf')
    }
  }
}
