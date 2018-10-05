import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { GraphQLInteraction } from "./graphql";
import { Interaction } from "../pact";
import { isMatcher, regex } from "./matchers";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("GraphQLInteraction", () => {
  let interaction: GraphQLInteraction;

  beforeEach(() => {
    interaction = new GraphQLInteraction();
  });

  describe("#withOperation", () => {
    describe("when given a valid operation", () => {
      it("should not fail", () => {
        interaction.uponReceiving("a request");
        interaction.withOperation("query");
        interaction.withQuery("{ hello }");

        const json: any = interaction.json();
        expect(json.request.body.operationName).to.eq("query");
      });
    });
    describe("when no operation is provided", () => {
      it("should marshal to null", () => {
        interaction.uponReceiving("a request");
        interaction.withQuery("{ hello }");

        const json: any = interaction.json();
        expect(json.request.body.operationName).to.eq(null);
      });
    });
    describe("when given an invalid operation", () => {
      it("should fail with an error", () => {
        expect(interaction.withOperation.bind("aoeu")).to.throw(Error);
      });
    });
  });

  describe("#withVariables", () => {
    describe("when given a set of variables", () => {
      it("should add the variables to the payload", () => {
        interaction.uponReceiving("a request");
        interaction.withOperation("query");
        interaction.withQuery("{ hello }");
        interaction.withVariables({
          foo: "bar",
        });

        const json: any = interaction.json();
        expect(json.request.body.variables).to.deep.eq({ foo: "bar" });
      });
    });
  });

  describe("#withQuery", () => {
    beforeEach(() => {
      interaction.uponReceiving("a request");
      interaction.withOperation("query");
      interaction.withQuery("{ hello }");
      interaction.withVariables({
        foo: "bar",
      });
    });

    describe("when given an invalid query", () => {
      it("should fail with an error", () => {
        expect(() => interaction.withQuery("{ not properly terminated")).to.throw(Error);
      });
    });

    describe("when given a valid query", () => {
      it("should properly marshal the query", () => {
        const json: any = interaction.json();
        expect(isMatcher(json.request.body.query)).to.eq(true);
        expect(json.request.body.query.getValue()).to.eq("{ hello }");
      });

      describe("without variables", () => {
        it("should add regular expressions for the whitespace in the query", () => {
          const json: any = interaction.json();

          expect(isMatcher(json.request.body.query)).to.eq(true);
          const r = new RegExp(json.request.body.query.data.matcher.s, "g");
          const lotsOfWhitespace = `{             hello

        }`;
          expect(r.test(lotsOfWhitespace)).to.eq(true);
        });
      });

      describe("and variables", () => {
        it("should add regular expressions for the whitespace in the query", () => {
          interaction.withQuery(`{
            Hello(id: $id) {
              name
            }
          }`);
          interaction.withVariables({
            name: "bar",
          });
          const json: any = interaction.json();

          expect(isMatcher(json.request.body.query)).to.eq(true);
          const r = new RegExp(json.request.body.query.data.matcher.s, "g");
          const lotsOfWhitespace = `{             Hello(id: \$id) { name    } }`;
          expect(r.test(lotsOfWhitespace)).to.eq(true);
        });

      });
    });
  });

});
