let { Publisher } = require("@pact-foundation/pact")
let path = require("path")

let opts = {
  pactFilesOrDirs: [path.resolve(process.cwd(), "pacts")],
  pactBroker: "https://localhost:3000",
  pactBrokerUsername: process.env.PACT_USERNAME,
  pactBrokerPassword: process.env.PACT_PASSWORD,
  consumerVersion: "2.0.0",
}

new Publisher(opts).publishPacts()
