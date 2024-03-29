const axios = require('axios');

let accountServiceUrl = '';

module.exports = {
  setAccountServiceUrl: (url) => {
    accountServiceUrl = url;
  },

  createTransaction: (accountId, amountInCents) => {
    return axios
      .get(accountServiceUrl + '/accounts/search/findOneByAccountNumberId', {
        params: {
          accountNumber: accountId,
        },
        headers: {
          Accept: 'application/hal+json',
        },
      })
      .then(({ data }) => {
        // This is the point where a real transaction service would create the transaction, but for the purpose
        // of this example we'll assume this has happened here
        let id = Math.floor(Math.random() * Math.floor(100000));
        return {
          account: {
            accountNumber: data.accountNumber.id,
            accountReference: data.accountRef,
          },
          transaction: {
            id,
            amount: amountInCents,
          },
        };
      });
  },

  // same as createTransaction, but demonstrating using a PostBody
  createTransactionWithPostBody: (accountId, amountInCents) => {
    return axios
      .post(
        accountServiceUrl + '/accounts/search/findOneByAccountNumberIdInBody',
        {
          accountNumber: accountId,
        },
        {
          headers: {
            Accept: 'application/hal+json',
          },
        }
      )
      .then(({ data }) => {
        // This is the point where a real transaction service would create the transaction, but for the purpose
        // of this example we'll assume this has happened here
        let id = Math.floor(Math.random() * Math.floor(100000));
        return {
          account: {
            accountNumber: data.accountNumber.id,
            accountReference: data.accountRef,
          },
          transaction: {
            id,
            amount: amountInCents,
          },
        };
      });
  },

  getText: (id) => {
    return axios.get(accountServiceUrl + '/data/' + id).then((data) => {
      return data;
    });
  },
  getXml: (id) => {
    return axios.get(accountServiceUrl + '/data/xml/' + id).then((data) => {
      return data;
    });
  },
};
