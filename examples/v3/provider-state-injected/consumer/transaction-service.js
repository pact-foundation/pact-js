const axios = require("axios")

let accountServiceUrl = ""

module.exports = {
  setAccountServiceUrl: url => {
    accountServiceUrl = url
  },

  createTransaction: (accountId, amountInCents) => {
    return axios
      .get(accountServiceUrl + "/accounts/search/findOneByAccountNumberId", {
        params: {
          accountNumber: accountId,
        },
        headers: {
          Accept: "application/hal+json",
        },
      })
      .then(({ data }) => {
        // This is the point where a real transaction service would create the transaction, but for the purpose
        // of this example we'll assume this has happened here
        let id = Math.floor(Math.random() * Math.floor(100000))
        return {
          account: {
            accountNumber: data.accountNumber.id,
            accountReference: data.accountRef,
          },
          transaction: {
            id,
            amount: amountInCents,
          },
        }
      })
  },
}
