"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var apollo_boost_1 = require("apollo-boost");
var apollo_cache_inmemory_1 = require("apollo-cache-inmemory");
var graphql_tag_1 = require("graphql-tag");
var apollo_link_http_1 = require("apollo-link-http");
var client = new apollo_boost_1.ApolloClient({
    cache: new apollo_cache_inmemory_1.InMemoryCache(),
    link: apollo_link_http_1.createHttpLink({
        fetch: require("node-fetch"),
        headers: {
            foo: "bar",
        },
        uri: "http://localhost:4000/graphql",
    }),
});
function query() {
    return client
        .query({
        query: graphql_tag_1.default(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        query HelloQuery {\n          hello\n        }\n      "], ["\n        query HelloQuery {\n          hello\n        }\n      "]))),
        variables: {
            foo: "bar",
        },
    })
        .then(function (result) { return result.data; });
}
exports.query = query;
var templateObject_1;
