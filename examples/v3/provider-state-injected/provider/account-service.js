const {
  Account,
  AccountNumber,
  accountRepository,
} = require("./account-repository")
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")

const server = express()
server.use(cors())
server.use(bodyParser.json())

server.get("/accounts/search/findOneByAccountNumberId", (req, res) => {
  return accountRepository
    .findByAccountNumber(req.query.accountNumber)
    .then(account => {
      if (account) {
        res.header("Content-Type", "application/hal+json; charset=utf-8")
        let baseUrl =
          req.protocol + "://" + req.hostname + ":" + req.socket.localPort
        let body = {
          _links: {
            account: {
              href: baseUrl + "/accounts/" + account.accountNumber.id,
            },
            self: {
              href: baseUrl + "/accounts/" + account.accountNumber.id,
            },
          },
          accountNumber: {
            id: +account.accountNumber.id,
          },
          accountRef: account.referenceId,
          createdDate: new Date(account.created).toISOString(),
          id: account.id,
          lastModifiedDate: new Date(account.updated).toISOString(),
          name: account.name,
          version: account.version,
        }
        res.json(body)
      } else {
        res.status(404).end()
      }
    })
})

module.exports = {
  accountService: server,
}
