const path = require("path")
const transactionService = require("./transaction-service")
const { PactV3, MatchersV3, XmlBuilder } = require("@pact-foundation/pact/v3")
const { expect } = require("chai")
const { string, integer, url2, regex, datetime, fromProviderState } = MatchersV3

describe("Transaction service - create a new transaction for an account", () => {
  let provider
  beforeEach(() => {
    provider = new PactV3({
      consumer: "TransactionService",
      provider: "AccountService",
      dir: path.resolve(process.cwd(), "pacts"),
    })
  })

  it("queries the account service for the account details", () => {
    provider
      .given("Account Test001 exists", { accountRef: "Test001" })
      .uponReceiving("a request to get the account details")
      .withRequest({
        method: "GET",
        path: "/accounts/search/findOneByAccountNumberId",
        query: { accountNumber: fromProviderState("${accountNumber}", "100") },
        headers: { Accept: "application/hal+json" },
      })
      .willRespondWith({
        status: 200,
        headers: { "Content-Type": "application/hal+json" },
        body: {
          id: integer(1),
          version: integer(0),
          name: string("Test"),
          accountRef: string("Test001"),
          createdDate: datetime("yyyy-MM-dd'T'HH:mm:ss.SSSX"),
          lastModifiedDate: datetime("yyyy-MM-dd'T'HH:mm:ss.SSSX"),
          accountNumber: {
            id: fromProviderState("${accountNumber}", 100),
          },
          _links: {
            self: {
              href: url2("http://localhost:8080", [
                "accounts",
                regex("\\d+", "100"),
              ]),
            },
            account: {
              href: url2("http://localhost:8080", [
                "accounts",
                regex("\\d+", "100"),
              ]),
            },
          },
        },
      })

    return provider.executeTest(async (mockserver) => {
      transactionService.setAccountServiceUrl(mockserver.url)
      return transactionService
        .createTransaction(100, 100000)
        .then((result) => {
          expect(result.account.accountNumber).to.equal(100)
          expect(result.transaction.amount).to.equal(100000)
        })
    })
  })

  // MatchersV3.fromProviderState on body
  it("test text data", () => {
    provider
      .given("set id", { id: "42" })
      .uponReceiving("a request to get the plain data")
      .withRequest({
        method: "GET",
        path: MatchersV3.fromProviderState("/data/${id}", "/data/42"),
      })
      .willRespondWith({
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: MatchersV3.fromProviderState(
          "data: testData, id: ${id}",
          "data: testData, id: 42"
        ),
      })

    return provider.executeTest(async (mockserver) => {
      transactionService.setAccountServiceUrl(mockserver.url)
      return transactionService.getText(42).then((result) => {
        expect(result.data).to.equal("data: testData, id: 42")
      })
    })
  })
})