/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty no-console*/
const { MessageProviderPact } = require("../../../src/pact")
import path = require("path")
const { createDog } = require("./dog-client")

describe("Message provider tests", () => {
  const p = new MessageProviderPact({
    messageProviders: {
      "a request for rendering": () => createDog(27),
    },
    log: path.resolve(process.cwd(), "logs"),
    logLevel: "INFO",
    provider: "MyJSMessageProvider",
    providerVersion: "1.0.0",

    // For local validation
    pactUrls: [
      path.resolve(
        process.cwd(),
        "myjsmessageconsumer-myjsmessageprovider.json"
      ),
    ],
  })

  describe("renders", () => {
    it("sends a rendering event", () => {
      return p.verify()
    })
  })
})
