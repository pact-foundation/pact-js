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
    url: '/cats?catId[]=2&catId[]=3',
    headers: { 'Accept': 'application/json' }
  })
};
