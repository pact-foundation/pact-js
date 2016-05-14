'use strict'

import path from 'path'
import Mocha from 'mocha'
import Test from 'mocha/lib/test'
import Suite from 'mocha/lib/suite'

const wrapper = require('@pact-foundation/pact-node')

import Pact from '../pact-consumer-dsl/pact'

module.exports = Mocha.interfaces['pact'] = (suite) => {
  const suites = [suite]

  suite.on('pre-require', (context, file, mocha) => {
    var common = require('mocha/lib/interfaces/common')(suites, context)
    context.run = mocha.options.delay && common.runWithSuite(suite)

    const mockServer = wrapper.create({
      port: 1234,
      log: path.resolve(process.cwd(), 'logs', 'mockserver.log'),
      dir: path.resolve(process.cwd(), 'pacts'),
      spec: 2
    })

    context.Pact = (consumer, provider, providerURL, fn) => {
      const pactSuite = Suite.create(suites[0], `Pact ${consumer} <=> ${provider}`)
      pactSuite.file = file

      pactSuite.pactConsumer = consumer
      pactSuite.pactProvider = provider

      pactSuite.pact = Pact({ consumer, provider })
      pactSuite.pact.intercept(providerURL)

      suites.unshift(pactSuite)
      fn.call(pactSuite, {})
      suites.shift()

      return pactSuite
    }

    context.xPact = (consumer, provider, fn) => {
      const pactSuite = Suite.create(suites[0], `Pact ${consumer} <=> ${provider}`)
      pactSuite.pending = true
      suites.unshift(pactSuite)
      fn.call(pactSuite, {})
      suites.shift()
    }

    context.add = (fn) => {
      const pactSuite = suites[0]
      fn.call(pactSuite, pactSuite.pact.interaction())
    }

    context.verify = (title, pactFn, fn) => {
      const pactSuite = suites[0]

      if (pactSuite.pending) {
        fn = null
      }

      const test = new Test(title, (done) => {
        mockServer.start()
          .then(() => pactSuite.pact.verify(pactFn))
          .then((data) => { fn(data, done) })
          .catch((err) => { done(err) })
          .finally(() => { mockServer.stop() })
      })

      test.file = file
      pactSuite.addTest(test)
      return test
    }

    context.xverify = context.verify.skip = (title, fn) => {
      context.verify(title)
    }
  })
}
