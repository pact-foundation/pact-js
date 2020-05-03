"use strict"

const axios = require("axios")

exports.getMeDogs = endpoint => {
  const url = endpoint.url

  return axios
    .request({
      method: "GET",
      baseURL: url,
      url: "/dogs",
      headers: { Accept: "application/json" },
    })
    .then(response => response.data)
}

exports.getMeCats = endpoint => {
  const url = endpoint.url

  return axios
    .request({
      method: "GET",
      baseURL: url,
      url: "/cats?catId[]=2&catId[]=3",
      headers: { Accept: "application/json" },
    })
    .then(response => response.data)
}
