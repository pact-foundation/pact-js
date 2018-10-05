const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");

const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

const root = {
  hello: () => "Hello world!",
};

const app = express();
export default app;

app.use("/graphql", graphqlHTTP({
  graphiql: true,
  rootValue: root,
  schema,
}));

export function start(): any {
  app.listen(4000, () => console.log("Now browse to localhost:4000/graphql"));
}
