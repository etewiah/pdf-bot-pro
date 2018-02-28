const assert  = require('assert')
const Api     = require('../../lib/api')

module.exports = {
  throwsWithNoToken() {
    assert.throws(() => {
      new Api();
    }, /No API Token/)
  },

  create: {
    validAPIToken() {
      let fakeReq  = td.object('get');
      let fakeRes  = td.object('status');
      let fakeJson = td.object('json')

      td.when(fakeReq.get('Authorization')).thenReturn('1234')
      td.when(fakeRes.status(201)).thenReturn(fakeJson)

      new Api({token: '1234' }).create(fakeReq, fakeRes);

      td.verify(fakeJson.json({ id: td.matchers.isA(String) }))
    },

    invalidAPIToken() {
      let fakeReq  = td.object('get');
      let fakeRes  = td.object('status');
      let fakeJson = td.object('json')

      td.when(fakeReq.get('Authorization')).thenReturn('1234')
      td.when(fakeRes.status(401)).thenReturn(fakeJson)

      new Api({token: '4321' }).create(fakeReq, fakeRes);

      td.verify(fakeJson.json({ error: '100', message: td.matchers.contains('Invalid API Token') }))
    }
  }
}
