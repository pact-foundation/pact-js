import express from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import { buildSchema } from 'graphql';

const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

const root = {
  hello: () => 'Hello world!',
};

const app = express();
export default app;

app.use(
  '/graphql',
  createHandler({
    rootValue: root,
    schema,
  })
);

export function start(): any {
  // tslint:disable:no-console
  app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));
}
