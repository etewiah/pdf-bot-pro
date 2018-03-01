/* global td:true */
/* global faktoryWorker:true */
/* global faktoryClient:true */
/* eslint no-multi-spaces:0 */

global.td             = require('testdouble')
global.faktoryWorker  = td.replace('faktory-worker')
global.faktoryClient  = td.object('connect')

module.exports = {
  beforeEach: function() {
    td.when(faktoryWorker.connect()).thenResolve(faktoryClient)
  },

  afterEach: function() {
    td.reset()
  },

  beforeAll: function() {
  },

  afterAll: function() {
  }
}
