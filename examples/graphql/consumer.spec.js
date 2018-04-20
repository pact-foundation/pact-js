// POC that graphQL endpoints can be tested!
const { like } = require('../../dist/dsl/matchers')
const chai = require('chai')
const expect = chai.expect
const chaiAsPromised = require('chai-as-promised')
const path = require('path')
const { Pact, graphql } = require('../../dist/pact')
const { query } = require('./consumer.js');

chai.use(chaiAsPromised)

describe('GraphQL example', () => {
  const provider = new Pact({
    port: 4000,
    log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'GraphQLConsumer',
    provider: 'GraphQLConsumerProvider',
  })

  before(() => provider.setup())
  after(() => provider.finalize())

  describe('query hello on /graphql', () => {
    before(() => {
      // TODO: make a builder interface
      const graphqlQuery = graphql({
        description: "a hello request",
        operation: null,
        variables: {
          "foo": "bar",
        },
        // TODO: make this whitespace resilient
        // special DSL?
        query: `{\n  hello\n}\n`,
        requestOptions: {
          path: '/graphql',
        },
      }, {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: {
          "data": {
            "hello": like("Hello world!")
          }
        }
      })
      return provider.addInteraction(graphqlQuery)
    })

    it('returns the correct response', (done) => {
      expect(query()).to.eventually.deep.eq({ hello: 'Hello world!' }).notify(done)
    })

    // verify with Pact, and reset expectations
    afterEach(() => provider.verify())
  })
})
