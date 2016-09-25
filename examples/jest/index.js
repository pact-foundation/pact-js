'use strict'

const axios = require('axios')

exports.getMeDogs = ({ url, port }) => {
  return axios.request({
    method: 'GET',
    baseURL:`${url}:${port}`,
    url: '/dogs',
    headers: { 'Accept': 'application/json' }
  })
}
