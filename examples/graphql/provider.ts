import express, { type Express } from 'express';
import { buildSchema, graphql } from 'graphql';

/**
 * GraphQL schema for the Hello service.
 *
 * A minimal schema with a single `hello` query. In a real application this
 * would be much larger; kept small here so the example focuses on Pact, not
 * GraphQL schema design.
 */
const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

/** GraphQL resolvers. */
const rootValue = {
  hello: () => 'Hello, World!',
};

/**
 * Creates the Hello service Express application.
 *
 * Handles GraphQL requests at POST /graphql. Uses the `graphql` function from
 * the `graphql` package directly to execute the query — no Express-specific
 * GraphQL middleware required.
 */
export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.post('/graphql', async (req, res) => {
    const { query, variables, operationName } = req.body as {
      query: string;
      variables?: Record<string, unknown>;
      operationName?: string;
    };
    const result = await graphql({
      schema,
      source: query,
      rootValue,
      variableValues: variables,
      operationName,
    });
    res.json(result);
  });

  return app;
}
