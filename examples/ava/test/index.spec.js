'use strict'

const path = require('path')
const test = require('ava')
const Pact = require('../../../src/pact.js')
const getMeDogs = require('../index').getMeDogs

const url = 'http://localhost'
const port = 8989

const provider = Pact({
  port: port,
  log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  spec: 2,
  consumer: 'MyConsumer',
  provider: 'MyProvider'
})

const EXPECTED_BODY = [{dog: 1}]

test.before('setting up Dog API expectations', async () => {

  await provider.setup()
  const interaction = {
    state: 'i have a list of projects',
    uponReceiving: 'a request for projects',
    withRequest: {
      method: 'GET',
      path: '/dogs',
      headers: {'Accept': 'application/json'}
    },
    willRespondWith: {
      status: 200,
      headers: {'Content-Type': 'application/json'},
      body: EXPECTED_BODY
    }
  }

  await provider.addInteraction(interaction)
})

test('Dog API returns correct response', async t => {
  t.plan(2)

  const urlAndPort = {url: url, port: port}
  const response = await getMeDogs(urlAndPort)
  t.deepEqual(response.data, EXPECTED_BODY)

  // verify with Pact, and reset expectations
  await t.notThrows(provider.verify())
})

test.always.after('pact.js mock server graceful shutdown', async () => {
  await provider.finalize()
})
