const path = require("path")
const { VerifierV3 } = require("@pact-foundation/pact/v3")
const { accountService } = require("./account-service")
const { Account, AccountNumber, accountRepository } = require("./account-repository")

describe("Account Service", () => {

  beforeAll(done => accountService.listen(8081, done))
  afterAll((done) => accountService.close(done))

  it("validates the expectations of Transaction Service", () => {
    let opts = {
      provider: "Account Service",
      providerBaseUrl: "http://localhost:8081",

      stateHandlers: {
        "Account Test001 exists": (setup, params) => {
          if (setup) {
            let account = new Account(0, 0, "Test001", params.accountRef, new AccountNumber(0), Date.now(), Date.now())
            let persistedAccount = accountRepository.save(account)
            return { accountNumber: persistedAccount.accountNumber.id }
          } else {
            return null
          }
        }
      },

      pactUrls: [
        path.resolve(process.cwd(), "./pacts/TransactionService-AccountService.json")
      ]
    }

    return new VerifierV3(opts).verifyProvider().then(output => true)
  })
})
