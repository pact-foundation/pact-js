/**
 * Pact GraphQL module.
 *
 * @module GraphQL
 */
import { Interaction, InteractionState } from "../dsl/interaction"
import { regex } from "./matchers"
import { keys, isNil, extend } from "lodash"
import gql from "graphql-tag"

export type GraphQLOperation = "query" | "mutation" | null

enum GraphQLOperations {
  query = "query",
  mutation = "mutation",
}

export interface GraphQLVariables {
  [name: string]: any
}

/**
 * GraphQL interface
 */
export class GraphQLInteraction extends Interaction {
  private operation: GraphQLOperation = null
  private variables: GraphQLVariables = {}
  private query: string

  /**
   * The type of GraphQL operation. Generally not required.
   */
  public withOperation(operation: GraphQLOperation) {
    if (
      !operation ||
      (operation && keys(GraphQLOperations).indexOf(operation.toString()) < 0)
    ) {
      throw new Error(
        `You must provide a valid HTTP method: ${keys(GraphQLOperations).join(
          ", ",
        )}.`,
      )
    }

    this.operation = operation

    return this
  }

  /**
   * Any variables used in the Query
   */
  public withVariables(variables: GraphQLVariables) {
    this.variables = variables

    return this
  }

  /**
   * The actual GraphQL query as a string.
   *
   * NOTE: spaces are not important, Pact will auto-generate a space-insensitive matcher
   *
   *  e.g. the value for the "query" field in the GraphQL HTTP payload:
   *  '{ "query": "{
   *        Category(id:7) {
   *          id,
   *          name,
   *          subcategories {
   *            id,
   *            name
   *          }
   *        }
   *     }"
   *  }'
   */
  public withQuery(query: string) {
    if (isNil(query)) {
      throw new Error("You must provide a GraphQL query.")
    }

    try {
      gql(query)
    } catch (e) {
      throw new Error(`GraphQL Query is invalid: ${e.message}`)
    }

    this.query = query

    return this
  }

  /**
   * Returns the interaction object created.
   */
  public json(): InteractionState {
    if (isNil(this.query)) {
      throw new Error("You must provide a GraphQL query.")
    }
    if (isNil(this.state.description)) {
      throw new Error("You must provide a description for the query.")
    }

    this.state.request = extend(
      {
        body: {
          operationName: this.operation,
          query: regex({
            generate: this.query,
            matcher: escapeGraphQlQuery(this.query),
          }),
          variables: this.variables,
        },
        headers: { "content-type": "application/json" },
        method: "POST",
      },
      this.state.request,
    )

    return this.state
  }
}

const escapeGraphQlQuery = (s: string) => escapeSpace(escapeRegexChars(s))

const escapeRegexChars = (s: string) =>
  s.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")

const escapeSpace = (s: string) => s.replace(/\s+/g, "\\s*")
