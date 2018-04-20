const { ApolloClient, HttpLink } = require('apollo-boost')
const { InMemoryCache } = require('apollo-cache-inmemory')
const gql = require('graphql-tag')
const fetch = require('node-fetch')
const { createHttpLink } = require('apollo-link-http')
const link = createHttpLink({
  uri: 'http://localhost:4000/graphql',
  fetch: fetch,
  headers: {
    "foo": "bar",
  }
})

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
})

const query = () =>
  client
  .query({
    variables: {
      "foo": "bar",
    },
    query: gql `
    {
      hello
    }
  `
  })
  .then(result => result.data)

module.exports = {
  query
}
