'use strict';

const axios = require('axios');

exports.getMeDogs = (endpoint) => {
  const url = endpoint.url;
  const port = endpoint.port;

  return axios.request({
    method: 'POST',
    baseURL: `${url}:${port}`,
    url: '/dogs',
    headers: {
      Accept: 'application/x.avidxchange.accounting+json;version=1.0.0',
      'Content-Type': 'application/x.avidxchange.accounting+json;version=1.0.0',
    },
    data: {
      foo: 'bar',
    },
  });
};
