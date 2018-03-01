const assert  = require('assert')
const Api     = require('../../lib/api')

module.exports = {
  throwsWithNoToken() {
    assert.throws(() => {
      new Api();
    }, /No API Token/)
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
      td.when(this.fakeRes.status(201)).thenReturn(this.fakeJson)
    },

    validAPIToken() {
      new Api({ token: '1234' }).create(this.fakeReq, this.fakeRes);

      td.verify(this.fakeJson.json({ id: td.matchers.isA(String) }))
    },

    invalidAPIToken() {
      td.when(this.fakeReq.get('Authorization')).thenReturn('1234')
      td.when(this.fakeRes.status(401)).thenReturn(this.fakeJson)

      new Api({ token: '4321' }).create(this.fakeReq, this.fakeRes);

      td.verify(this.fakeJson.json(
        td.matchers.contains({ errors: [{ error: 100, message: 'Invalid API Token' }] })
      ))
    },

    invalidUrl() {
      this.fakeReq.body = { url: 'blah' }
      td.when(this.fakeRes.status(401)).thenReturn(this.fakeJson)

      new Api({ token: '1234' }).create(this.fakeReq, this.fakeRes);

      td.verify(this.fakeJson.json(
        td.matchers.contains({ errors: [{ error: 102, message: 'Invalid url Payload' }] })
      ))
    }
  }
}
