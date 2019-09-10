const axios = require('axios')
const parser = require('xml2json')
const eyes = require('eyes')

let serverUrl = 'http://localhost:2203'

module.exports = {
  getProjects: async (format = "json") => {
    return axios.get(serverUrl + '/projects?from=today', {
      headers: {
        'Accept': 'application/' + format
      }
    })
    .then(response => {
      console.log("todo response:")
      eyes.inspect(response.data)
      if (format === 'xml') {
        const result = JSON.parse(parser.toJson(response.data))
        return result.projects.project
      } else {
        return response.data
      }
    })
    .catch(error => {
      console.log("todo error", error.message)
      return Promise.reject(error)
    })
  },
  setUrl: function (url) {
    serverUrl = url
    return this
  }
}
