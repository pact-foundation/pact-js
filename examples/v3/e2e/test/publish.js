const pact = require("@pact-foundation/pact-node")
const path = require("path")
let pactBroker = "https://test.pact.dius.com.au"
if (process.env.CI && !process.env.APPVEYOR) {
  pactBroker = "http://localhost:9292"
}

let consumerVersion = "1.0."

if (process.env.APPVEYOR) {
  consumerVersion = consumerVersion + process.env.APPVEYOR_BUILD_NUMBER
} else if (process.env.GITHUB_ACTIONS) {
  consumerVersion = consumerVersion + process.env.GITHUB_ACTION
} else {
  consumerVersion = consumerVersion + Math.floor(new Date() / 1000)
}

const opts = {
  pactFilesOrDirs: [
    path.resolve(
      __dirname,
      "../pacts/Matching Service V3-Animal Profile Service V3.json"
    ),
  ],
  pactBroker: pactBroker,
  pactBrokerUsername: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
  pactBrokerPassword: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1",
  tags: ["prod", "test"],
  consumerVersion: consumerVersion,
}

pact
  .publishPacts(opts)
  .then(() => {
    console.log("Pact contract publishing complete!")
    console.log("")
    if (!process.env.CI && !process.env.APPVEYOR) {
      console.log("Head over to https://test.pact.dius.com.au/ and login with")
      console.log("=> Username: dXfltyFMgNOFZAxr8io9wJ37iUpY42M")
      console.log("=> Password: O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1")
      console.log("to see your published contracts.")
    }
  })
  .catch(e => {
    console.log("Pact contract publishing failed: ", e)
  })
