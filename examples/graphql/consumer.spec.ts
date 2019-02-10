/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */
import * as chai from "chai"
import * as chaiAsPromised from "chai-as-promised"
import { like } from "../../src/dsl/matchers"
import { query } from "./consumer"
import { Pact, GraphQLInteraction } from "../../src/pact"
// import gql from "graphql-tag";

const path = require("path")
const expect = chai.expect

chai.use(chaiAsPromised)

describe("GraphQL example", () => {
  const provider = new Pact({
    port: 4000,
    log: path.resolve(process.cwd(), "logs", "mockserver-integration.log"),
    dir: path.resolve(process.cwd(), "pacts"),
    consumer: "GraphQLConsumer",
    provider: "GraphQLProvider",
  })

  before(() => provider.setup())
  after(() => provider.finalize())

  describe("query hello on /graphql", () => {
    before(() => {
      const graphqlQuery = new GraphQLInteraction()
        .uponReceiving("a hello request")
        .withQuery(
          `
          query HelloQuery {
            hello
          }
        `
        )
        .withOperation("HelloQuery")
        .withRequest({
          path: "/graphql",
          method: "POST",
        })
        .withVariables({
          foo: "bar",
        })
        .willRespondWith({
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: {
            data: {
              hello: like("Hello world!"),
            },
          },
        })
      return provider.addInteraction(graphqlQuery)
    })

    it("returns the correct response", () => {
      return expect(query()).to.eventually.deep.equal({ hello: "Hello world!" })
    })

    // verify with Pact, and reset expectations
    afterEach(() => provider.verify())
  })
})
