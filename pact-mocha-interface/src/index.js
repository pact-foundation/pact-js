'use strict'

var path = require('path')
var Mocha = require('mocha')
var Test = require('mocha/lib/test')
var Suite = require('mocha/lib/suite')
var Pact = require('pact-dsl')
var wrapper = require('@pact-foundation/pact-node')

module.exports = Mocha.interfaces['pact'] = function (suite) {
  var suites = [suite]

  suite.on('pre-require', function (context, file, mocha) {
    var common = require('mocha/lib/interfaces/common')(suites, context)

    context.beforeEach = common.beforeEach
    context.afterEach = common.afterEach
    context.run = mocha.options.delay && common.runWithSuite(suite)

    var mockServer = wrapper.create({
      port: 1234,
      log: path.resolve(process.cwd(), 'logs', 'mockserver.log'),
      dir: path.resolve(process.cwd(), 'pacts'),
      spec: 2
    })

    context.Pact = function (consumer, provider, providerURL, fn) {
      var pactSuite = Suite.create(suites[0], `Pact ${consumer} <=> ${provider}`)
      pactSuite.file = file

      pactSuite.pactConsumer = consumer
      pactSuite.pactProvider = provider

      pactSuite.pact = Pact.Verifier({ consumer: consumer, provider: provider })

      suites.unshift(pactSuite)
      fn.call(pactSuite, {})
      suites.shift()

      return pactSuite
    }

    context.xPact = function (consumer, provider, fn) {
      var pactSuite = Suite.create(suites[0], `Pact ${consumer} <=> ${provider}`)
      pactSuite.pending = true
      suites.unshift(pactSuite)
      fn.call(pactSuite, {})
      suites.shift()
    }

    context.add = function (fn) {
      var pactSuite = suites[0]
      fn.call(pactSuite, pactSuite.pact.interaction())
    }

    context.verify = function (title, pactFn, fn) {
      var pactSuite = suites[0]

      if (pactSuite.pending) {
        fn = null
      }

      var test = new Test(title, function (done) {
        mockServer.start()
          .then(function () {
            return pactSuite.pact.verify(pactFn)
          })
          .then(function (data) {
            fn(data, done)
          })
          .catch(function (err) { done(err) })
          .finally(function () { mockServer.stop() })
      })

      test.file = file
      pactSuite.addTest(test)
      return test
    }

    context.xverify = context.verify.skip = function (title, fn) {
      context.verify(title)
    }
  })
}
