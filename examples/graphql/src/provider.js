"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var graphqlHTTP = require("express-graphql");
var graphql_1 = require("graphql");
var schema = graphql_1.buildSchema("\n  type Query {\n    hello: String\n  }\n");
var root = {
    hello: function () { return "Hello world!"; },
};
var app = express();
exports.default = app;
app.use("/graphql", graphqlHTTP({
    graphiql: true,
    rootValue: root,
    schema: schema,
}));
function start() {
    // tslint:disable:no-console
    app.listen(4000, function () { return console.log("Now browse to localhost:4000/graphql"); });
}
exports.start = start;
