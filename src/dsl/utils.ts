// TODO: potentially make a number of client interfaces
// e.g. ApolloClient
import { Interaction, ResponseOptions, RequestOptions } from "../pact";
import { HTTPMethod, methods } from "common/request";
import { MatcherResult } from "./matchers";
import { extend } from "underscore";

/**
 * Pact Utilities module.
 * @module PactUtils
 */

export interface GraphQLRequestOptions {
  // Overwite default http headers
  headers?: { [name: string]: string | MatcherResult };

  // Overwrite HTTP method.
  // Defaults to "POST"
  method?: HTTPMethod | methods;

  // API endpoint
  path: string | MatcherResult;

  // Query strings
  query?: any;

  // Only specify if you want to overwrite the default
  // GraphQL Query-to-Pact converter
  body?: any;
}

/**
 * GraphQL interface
 */
export interface GraphQLQuery {
  description: string;

  // Provider State
  state?: string;

  // The name of the consumer
  operation: "query" | "mutation" | null;

  // GraphQL query body
  // e.g. the value for the query field in:
  // '{ "query": "{
  //       Category(id:7) {
  //         id,
  //         name,
  //         subcategories {
  //           id,
  //           name
  //         }
  //       }
  //    }"
  // }'
  query: string;

  variables: { [name: string]: any };

  // Specify the HTTP options for the GraphQL Query
  requestOptions: GraphQLRequestOptions;
}

export function graphql(query: GraphQLQuery, response: ResponseOptions): Interaction {
  const interaction = new Interaction();
  const request: RequestOptions = extend({
    body: {
      operationName: query.operation,
      query: query.query,
      variables: query.variables,
    },
    headers: { "content-type": "application/json" },
    method: "POST",
  }, query.requestOptions);

  if (query.state) {
    interaction.given(query.state);
  }
  interaction.uponReceiving(query.description);
  interaction.withRequest(request);
  interaction.willRespondWith(response);

  return interaction;
}
