const { Publisher } = require("@pact-foundation/pact")
const path = require("path")
const opts = {
  pactFilesOrDirs: [
    path.resolve(
      __dirname,
      "pacts/myjsmessageconsumer-myjsmessageprovider.json"
    ),
  ],
  pactBroker: "https://test.pact.dius.com.au",
  pactBrokerUsername: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
  pactBrokerPassword: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1",
  tags: ["prod", "test"],
  consumerVersion:
    "1.0." +
    (process.env.TRAVIS_BUILD_NUMBER
      ? process.env.TRAVIS_BUILD_NUMBER
      : Math.floor(new Date() / 1000)),
}

new Publisher(opts)
  .publishPacts()
  .then(() => {
    console.log("Pact contract publishing complete!")
    console.log("")
    console.log("Head over to https://test.pact.dius.com.au/ and login with")
    console.log("=> Username: dXfltyFMgNOFZAxr8io9wJ37iUpY42M")
    console.log("=> Password: O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1")
    console.log("to see your published contracts.")
  })
  .catch(e => {
    console.log("Pact contract publishing failed: ", e)
  })
