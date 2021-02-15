"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */
var chai = require("chai");
var path = require("path");
var chaiAsPromised = require("chai-as-promised");
var consumer_1 = require("./consumer");
var pact_1 = require("@pact-foundation/pact");
var like = pact_1.Matchers.like;
// import gql from "graphql-tag";
var expect = chai.expect;
chai.use(chaiAsPromised);
describe("GraphQL example", function () {
    var provider = new pact_1.Pact({
        port: 4000,
        log: path.resolve(process.cwd(), "logs", "mockserver-integration.log"),
        dir: path.resolve(process.cwd(), "pacts"),
        consumer: "GraphQLConsumer",
        provider: "GraphQLProvider",
    });
    before(function () { return provider.setup(); });
    after(function () { return provider.finalize(); });
    describe("query hello on /graphql", function () {
        before(function () {
            var graphqlQuery = new pact_1.GraphQLInteraction()
                .uponReceiving("a hello request")
                .withQuery("\n          query HelloQuery {\n            hello\n          }\n        ")
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
            });
            return provider.addInteraction(graphqlQuery);
        });
        it("returns the correct response", function () {
            return expect(consumer_1.query()).to.eventually.deep.equal({ hello: "Hello world!" });
        });
        // verify with Pact, and reset expectations
        afterEach(function () { return provider.verify(); });
    });
});
