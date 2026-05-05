import axios, { type AxiosResponse } from 'axios';

/** The result of the HelloQuery operation. */
export interface HelloQueryResult {
  data: {
    hello: string;
  };
}

/**
 * GraphQL client for the Hello service.
 *
 * GraphQL queries are sent as HTTP POST requests with a JSON body containing
 * `query`, `operationName`, and `variables`. This is a plain HTTP call — no
 * GraphQL client library is required for Pact testing.
 *
 * Pact's `addGraphQLInteraction()` understands the query structure and can
 * normalise whitespace and field ordering when matching, which means minor
 * formatting differences between consumer and provider don't break the contract.
 */
export async function fetchHello(baseUrl: string): Promise<string> {
  const { data }: AxiosResponse<HelloQueryResult> = await axios.post(
    `${baseUrl}/graphql`,
    {
      operationName: 'HelloQuery',
      query: `
        query HelloQuery {
          hello
        }
      `,
      variables: { name: 'World' },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  );
  return data.data.hello;
}
