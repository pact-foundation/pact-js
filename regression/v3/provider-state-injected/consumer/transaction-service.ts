import axios from 'axios';

let accountServiceUrl = '';

export default {
  setAccountServiceUrl: (url: string) => {
    accountServiceUrl = url;
  },

  createTransaction: (accountId, amountInCents) => {
    return axios
      .get(`${accountServiceUrl}/accounts/search/findOneByAccountNumberId`, {
        params: {
          accountNumber: accountId,
        },
        headers: {
          Accept: 'application/hal+json',
        },
      })
      .then(({ data }) => {
        const id = Math.floor(Math.random() * Math.floor(100000));
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
        `${accountServiceUrl}/accounts/search/findOneByAccountNumberIdInBody`,
        {
          accountNumber: accountId,
        },
        {
          headers: {
            Accept: 'application/hal+json',
          },
        },
      )
      .then(({ data }) => {
        const id = Math.floor(Math.random() * Math.floor(100000));
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
    return axios.get(`${accountServiceUrl}/data/${id}`).then((data) => {
      return data;
    });
  },
  getXml: (id) => {
    return axios.get(`${accountServiceUrl}/data/xml/${id}`).then((data) => {
      return data;
    });
  },
};
