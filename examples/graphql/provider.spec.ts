import { Verifier } from "../../src/pact";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

import { VerifierOptions } from "@pact-foundation/pact-node";
import app from "./provider";

const expect = chai.expect;
const path = require("path");
chai.use(chaiAsPromised);

const server = app.listen(4000, () =>
  console.log("Now browse to localhost:4000/graphql")
);

// Verify that the provider meets all consumer expectations
describe("Pact Verification", () => {
  it("should validate the expectations of Matching Service", () => {
    // lexical binding required here
    const opts = {
      provider: "GraphQLProvider",
      providerBaseUrl: "http://localhost:4000/graphql",
      // Local pacts
      // pactUrls: [path.resolve(process.cwd(), "./pacts/graphqlconsumer-graphqlprovider.json")],
      pactBrokerUrl: "https://test.pact.dius.com.au/",
      pactBrokerUsername: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
      pactBrokerPassword: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1",
      publishVerificationResult: true,
      providerVersion: "1.0.0",
      tags: ["prod"]
    };

    return new Verifier().verifyProvider(opts).then(output => {
      console.log("Pact Verification Complete!");
      console.log(output);
      server.close();
    });
  });
});
