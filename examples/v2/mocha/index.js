'use strict';

const axios = require('axios');

exports.getMeDogs = (endpoint) => {
  const url = endpoint.url;
  const port = endpoint.port;

  return axios.request({
    method: 'GET',
    baseURL: `${url}:${port}`,
    url: '/dogs',
    headers: {
      Accept: [
        'application/problem+json',
        'application/json',
        'text/plain',
        '*/*',
      ],
    },
  });
};

exports.getMeDog = (endpoint) => {
  const url = endpoint.url;
  const port = endpoint.port;

  return axios.request({
    method: 'GET',
    baseURL: `${url}:${port}`,
    url: '/dogs/1',
    headers: { Accept: 'application/json' },
  });
};
