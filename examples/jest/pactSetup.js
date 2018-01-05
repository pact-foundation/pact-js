const path = require('path')
const Pact = require('../../dist/pact').Pact

global.port = 8989
global.provider = new Pact({
  port: global.port,
  log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  spec: 2,
  pactfileWriteMode: 'update',
  consumer: 'MyConsumer',
  provider: 'MyProvider'
})
