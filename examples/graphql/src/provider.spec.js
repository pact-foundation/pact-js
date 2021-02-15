"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pact_1 = require("@pact-foundation/pact");
var provider_1 = require("./provider");
var server;
// Verify that the provider meets all consumer expectations
describe("Pact Verification", function () {
    before(function (done) {
        server = provider_1.default.listen(4000, function () {
            done();
        });
    });
    it("validates the expectations of Matching Service", function () {
        // lexical binding required here
        var opts = {
            // Local pacts
            // pactUrls: [path.resolve(process.cwd(), "./pacts/graphqlconsumer-graphqlprovider.json")],
            pactBrokerPassword: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1",
            pactBrokerUrl: "https://test.pact.dius.com.au/",
            pactBrokerUsername: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
            provider: "GraphQLProvider",
            providerBaseUrl: "http://localhost:4000/graphql",
            providerVersion: "1.0.0",
            publishVerificationResult: true,
            tags: ["prod"],
        };
        return new pact_1.Verifier(opts).verifyProvider().then(function (output) {
            server.close();
        });
    });
});
