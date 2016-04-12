'use strict'

import Mocha from 'mocha'
import Test from 'mocha/lib/test'
import Suite from 'mocha/lib/suite'
import CommonInterface from 'mocha/lib/interfaces/common'

export default Mocha.interfaces['pact-ui'] = (suite) => {
  suite.on('pre-require', (context, file, mocha) => {
    const common = CommonInterface([suite], context)

    context.run = mocha.options.delay && common.runWithSuite(suite)

    context.Pact.Consumer = (consumer, provider, fn) => {
      var suite = Suite.create(suite, `Pact ${consumer} <=> ${provider}`)
      suite.file = file

      suite.pactConsumer = consumer
      suite.pactProvider = provider

      fn.call(suite, {})
      return suite
    }

    context.xPact.Consumer = (consumer, provider, fn) => {
      var suite = Suite.create(suite, `Pact ${consumer} <=> ${provider}`)
      suite.pending = true
      fn.call(suite, {})
    }

    context.setup = (opts, fn) => {
      // suite.pact = Pact({
      //   consumer: suite.consumer,
      //   provider: suite.provider,
      //   port: opts.port || 1234,
      //   targetHost: opts.targetHost,
      //   targetPort: opts.targetPort
      // })
    }

    context.verify = (title, fn) => {
      if (suite.pending) {
        fn = null
      }
      var test = new Test(title, fn)
      test.file = file
      suite.addTest(test)
      return test
    }

    context.xverify = context.it.skip = (title, fn) => {
      context.verify(title)
    }
  })
}
