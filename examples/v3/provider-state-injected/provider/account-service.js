const {
  Account,
  AccountNumber,
  accountRepository,
} = require('./account-repository');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const server = express();
server.use(cors());
server.use(bodyParser.json());

server.get('/accounts/search/findOneByAccountNumberId', (req, res) => {
  return accountRepository
    .findByAccountNumber(req.query.accountNumber)
    .then((account) => {
      if (account) {
        res.header('Content-Type', 'application/hal+json; charset=utf-8');
        let baseUrl =
          req.protocol + '://' + req.hostname + ':' + req.socket.localPort;
        let body = {
          _links: {
            account: {
              href: baseUrl + '/accounts/' + account.accountNumber.id,
            },
            self: {
              href: baseUrl + '/accounts/' + account.accountNumber.id,
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
        };
        res.json(body);
      } else {
        res.status(404).end();
      }
    });
});

server.get("/data/xml/:id", (req, res) => {
  res.header("Content-Type", "application/xml; charset=utf-8")
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
  <root xmlns:h="http://www.w3.org/TR/html4/">
      <data>
          <h:data>testData</h:data>
          <id>${req.params.id}</id>
      </data>
  </root>`)
})

server.get("/data/:id", (req, res) => {
  res.header("Content-Type", "text/plain; charset=utf-8")
  res.send("data: testData, id: " + req.params.id)
})

module.exports = {
  accountService: server,
};
