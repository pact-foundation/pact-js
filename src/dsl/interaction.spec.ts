import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { HTTPMethod } from "../common/request";
import { Interaction, RequestOptions } from "./interaction";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Interaction", () => {
  describe("#given", () => {
    it("creates Interaction with provider state", () => {
      const actual = new Interaction().given("provider state").json();
      expect(actual).to.eql({ providerState: "provider state" });
    });

    describe("without provider state", () => {
      it("creates Interaction when blank", () => {
        const actual = new Interaction().given("").json();
        expect(actual).to.eql({});
      });
      it("creates Interaction when nothing is passed", () => {
        const actual = new Interaction().json();
        expect(actual).to.eql({});
      });
    });
  });

  describe("#uponReceiving", () => {
    const interaction = new Interaction();

    it("throws error when no description provided", () => {
      expect(interaction.uponReceiving).to.throw(Error, "You must provide a description for the interaction.");
    });

    it("has a state with description", () => {
      interaction.uponReceiving("an interaction description");
      expect(interaction.json()).to.eql({ description: "an interaction description" });
    });
  });

  describe("#withRequest", () => {
    const interaction = new Interaction();

    it("throws error when method is not provided", () => {
      expect(interaction.withRequest.bind(interaction, {})).to.throw(Error, "You must provide an HTTP method.");
    });

    it("throws error when an invalid method is provided", () => {
      expect(interaction.withRequest.bind(interaction, { method: "FOO" }))
        .to.throw(Error, "You must provide a valid HTTP method: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS.");
    });

    it("throws error when method is not provided", () => {
      expect(interaction.withRequest.bind(interaction, { ath: "/" }))
        .to.throw(Error, "You must provide an HTTP method.");
    });

    it("throws error when path is not provided", () => {
      expect(interaction.withRequest.bind(interaction, { method: HTTPMethod.GET }))
        .to.throw(Error, "You must provide a path.");
    });

    describe("with only mandatory params", () => {
      const actual = new Interaction().withRequest({ method: HTTPMethod.GET, path: "/search" }).json();

      it("has a state containing only the given keys", () => {
        expect(actual).to.have.keys("request");
        expect(actual.request).to.have.keys("method", "path");
      });

      it("request has no other keys", () => {
        expect(actual.request).to.not.have.keys("query", "headers", "body");
      });
    });

    describe("with all other parameters", () => {
      const actual = new Interaction().withRequest({
        body: { id: 1, name: "Test", due: "tomorrow" },
        headers: { "Content-Type": "application/json" },
        method: HTTPMethod.GET,
        path: "/search",
        query: "q=test",
      }).json();

      it("has a full state all available keys", () => {
        expect(actual).to.have.keys("request");
        expect(actual.request).to.have.keys("method", "path", "query", "headers", "body");
      });
    });
  });

  describe("#willRespondWith", () => {
    let interaction = new Interaction();

    it("throws error when status is not provided", () => {
      expect(interaction.willRespondWith.bind(interaction, {})).to.throw(Error, "You must provide a status code.");
    });

    it("throws error when status is blank", () => {
      expect(interaction.willRespondWith.bind(interaction, { status: "" }))
        .to.throw(Error, "You must provide a status code.");
    });

    describe("with only mandatory params", () => {
      interaction = new Interaction();
      interaction.willRespondWith({ status: 200 });
      const actual = interaction.json();

      it("has a state compacted with only present keys", () => {
        expect(actual).to.have.keys("response");
        expect(actual.response).to.have.keys("status");
      });

      it("request has no other keys", () => {
        expect(actual.response).to.not.have.keys("headers", "body");
      });
    });

    describe("with all other parameters", () => {
      interaction = new Interaction();
      interaction.willRespondWith({
        body: { id: 1, name: "Test", due: "tomorrow" },
        headers: { "Content-Type": "application/json" },
        status: 404,
      });

      const actual = interaction.json();

      it("has a full state all available keys", () => {
        expect(actual).to.have.keys("response");
        expect(actual.response).to.have.keys("status", "headers", "body");
      });
    });
  });
});
