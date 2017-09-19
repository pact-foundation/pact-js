'use strict'

const axios = require('axios')

exports.getMeSchroedingersCats = (endpoint) => {
  const url = endpoint.url
  const port = endpoint.port

  return axios.request({
    method: 'GET',
    baseURL: `${url}:${port}`,
    url: '/schroedinger/cats',
    headers: { 'Accept': 'application/json' }
  })
}