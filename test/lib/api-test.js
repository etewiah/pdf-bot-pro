const assert = require('assert')
const Api    = require('../../lib/api')

module.exports = {
  throwsWithNoToken() {
    assert.throws(() => {
      new Api();
    }, /No API Token specified/)
  },

  create: {
    beforeEach() {
      this.fakeRes  = td.object('status');
      this.fakeJson = td.object('jsonResponse')
      this.fakeReq  = td.object({
        get: function() {},
        body: { url: 'http://google.com' }
      });

      td.when(this.fakeReq.get('Authorization')).thenReturn('1234')
      td.when(this.fakeReq.get('Content-Type')).thenReturn('application/json')
      td.when(this.fakeRes.status(201)).thenReturn(this.fakeJson)
    },

    async validRequest() {
      await new Api({ token: '1234' }).create(this.fakeReq, this.fakeRes);

      td.verify(this.fakeJson.json({ jobId: td.matchers.isA(String) }))
      td.verify(faktoryClient.push(td.matchers.contains({ jobtype: 'Generate' })))
    },

    async serverUnavailable() {
      td.when(faktoryWorker.connect()).thenReject('boom')
      td.when(this.fakeRes.status(500)).thenReturn(td.object('send'))

      await new Api({ token: '1234' }).create(this.fakeReq, this.fakeRes);
    },

    invalidApiToken() {
      td.when(this.fakeReq.get('Authorization')).thenReturn('1234')
      td.when(this.fakeRes.status(401)).thenReturn(this.fakeJson)

      new Api({ token: '4321' }).create(this.fakeReq, this.fakeRes);

      td.verify(this.fakeJson.json(
        td.matchers.contains({ errors: [{ error: 100, message: 'Invalid API Token' }] })
      ))
    },

    invalidContentType() {
      td.when(this.fakeReq.get('Content-Type')).thenReturn('text/html')
      td.when(this.fakeRes.status(401)).thenReturn(this.fakeJson)

      new Api({ token: '1234' }).create(this.fakeReq, this.fakeRes);

      td.verify(this.fakeJson.json(
        td.matchers.contains({ errors: [{ error: 101, message: 'Invalid Content-Type, must be application/json' }] })
      ))
    },

    invalidUrl() {
      this.fakeReq.body = { url: null }
      td.when(this.fakeRes.status(401)).thenReturn(this.fakeJson)

      new Api({ token: '1234' }).create(this.fakeReq, this.fakeRes);

      td.verify(this.fakeJson.json(
        td.matchers.contains({ errors: [{ error: 200, message: 'Invalid url Payload' }] })
      ))
    }
  }
}
