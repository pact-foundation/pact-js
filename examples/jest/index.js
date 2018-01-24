'use strict'

const axios = require('axios')

exports.getMeDogs = (endpoint) => {
  const url = endpoint.url
  const port = endpoint.port

  return axios.request({
    method: 'GET',
    baseURL: `${url}:${port}`,
    url: '/dogs',
    headers: { 'Accept': 'application/json' }
  })
}

exports.getMeCats = (endpoint) => {
  const url = endpoint.url
  const port = endpoint.port

  return axios.request({
    method: 'GET',
    baseURL: `${url}:${port}`,
    url: '/cats',
    headers: { 'Accept': 'application/json' }
   })
};
