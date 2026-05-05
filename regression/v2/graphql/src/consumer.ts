import { ApolloClient } from 'apollo-boost';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createHttpLink } from 'apollo-link-http';
import gql from 'graphql-tag';

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: createHttpLink({
    fetch: require('node-fetch'),
    headers: {
      foo: 'bar',
    },
    uri: 'http://127.0.0.1:4000/graphql',
  }),
});

export function query(): Promise<unknown> {
  return client
    .query({
      query: gql`
        query HelloQuery {
          hello
        }
      `,
      variables: {
        foo: 'bar',
      },
    })
    .then((result) => result.data);
}
