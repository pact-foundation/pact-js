import * as chai from "chai"
import * as chaiAsPromised from "chai-as-promised"
import { ApolloGraphQLInteraction } from "./apolloGraphql"

chai.use(chaiAsPromised)
const expect = chai.expect

describe("ApolloGraphQLInteraction", () => {
  let interaction: ApolloGraphQLInteraction

  beforeEach(() => {
    interaction = new ApolloGraphQLInteraction()
  })

  describe("#withVariables", () => {
    describe("when given a set of variables", () => {
      it("adds the variables to the payload", () => {
        interaction.uponReceiving("a request")
        interaction.withOperation("query")
        interaction.withQuery("{ hello }")
        interaction.withVariables({
          foo: "bar",
        })

        const json: any = interaction.json()
        expect(json.request.body.variables).to.deep.eq({ foo: "bar" })
      })
    })

    describe("when no variables are presented", () => {
      it("adds an empty variables property to the payload", () => {
        interaction.uponReceiving("a request")
        interaction.withOperation("query")
        interaction.withQuery("{ hello }")

        const json: any = interaction.json()
        expect(json.request.body).to.have.property("variables")
      })
    })
  })

  describe("#withOperation", () => {
    describe("when no operationNaame is presented", () => {
      it("adds a null operationName property to the payload", () => {
        interaction.uponReceiving("a request")
        interaction.withQuery("{ hello }")

        const json: any = interaction.json()
        expect(json.request.body).to.have.property("operationName")
      })
    })
  })
})
