import { ASTNode } from 'graphql';
import { isUndefined } from 'lodash';
import { reject } from 'ramda';

import { ConfigurationError } from '../../common/graphQL/configurationError';
import { PactV3 } from '../pact';
import { V3Request, V3Response } from '../types';
import { OperationType } from '../../common/graphQL/types';
import { JsonMap } from '../../common/jsonTypes';

import { regex } from '../matchers';
import {
  escapeGraphQlQuery,
  GraphQLVariables,
  validateQuery,
} from '../../common/graphQL/graphQL';

/**
 * Expose a V3 compatible GraphQL interface
 *
 * Code borrowed/inspired from https://gist.github.com/wabrit/2d1e1f9520aa133908f0a3716338e5ff
 */
export class GraphQLPactV3 extends PactV3 {
  private operation?: string = undefined;

  private variables?: GraphQLVariables = undefined;

  private query: string;

  private req?: V3Request = undefined;

  public given(providerState: string, parameters?: JsonMap): GraphQLPactV3 {
    super.given(providerState, parameters);

    return this;
  }

  public uponReceiving(description: string): GraphQLPactV3 {
    super.uponReceiving(description);

    return this;
  }

  /**
   * The GraphQL operation name, if used.
   * @param operation {string} the name of the operation
   * @return this object
   */
  withOperation(operation: string): GraphQLPactV3 {
    this.operation = operation;
    return this;
  }

  /**
   * Add variables used in the Query.
   * @param variables {GraphQLVariables}
   * @return this object
   */
  withVariables(variables: GraphQLVariables): GraphQLPactV3 {
    this.variables = variables;
    return this;
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
   * @param query {string|ASTNode} parsed or unparsed query
   * @return this object
   */
  withQuery(query: string | ASTNode): GraphQLPactV3 {
    this.query = validateQuery(query, OperationType.Query);

    return this;
  }

  /**
   * The actual GraphQL mutation as a string or parse tree.
   *
   * NOTE: spaces are not important, Pact will auto-generate a space-insensitive matcher
   *
   * e.g. the value for the "query" field in the GraphQL HTTP payload:
   *
   * mutation CreateReviewForEpisode($ep: Episode!, $review: ReviewInput!) {
   *   createReview(episode: $ep, review: $review) {
   *     stars
   *     commentary
   *   }
   * }
   * @param mutation {string|ASTNode} parsed or unparsed mutation
   * @return this object
   */
  withMutation(mutation: string | ASTNode): GraphQLPactV3 {
    this.query = validateQuery(mutation, OperationType.Mutation);

    return this;
  }

  /**
   * Used to pass in the method, path and content-type; the body detail would
   * not typically be passed here as that will be internally constructed from
   * withQuery/withMutation/withVariables calls.
   *
   * @see {@link withQuery}
   * @see {@link withMutation}
   * @see {@link withVariables}
   * @param req {V3Request} request
   * @return this object
   */
  withRequest(req: V3Request): GraphQLPactV3 {
    // Just take what we need from the request, as most of the detail will
    // come from withQuery/withMutation/withVariables
    this.req = req;
    return this;
  }

  /**
   * Overridden as this is the "trigger point" by which we should have received all
   * request information.
   * @param res {V3Response} the expected response
   * @returns this object
   */
  willRespondWith(res: V3Response): GraphQLPactV3 {
    if (!this.query) {
      throw new ConfigurationError('You must provide a GraphQL query.');
    }

    if (!this.req) {
      throw new ConfigurationError('You must provide a GraphQL request.');
    }

    this.req = {
      ...this.req,
      body: reject(isUndefined, {
        operationName: this.operation,
        query: regex(escapeGraphQlQuery(this.query), this.query),
        variables: this.variables,
      }),
      headers: {
        'Content-Type': (this.req.contentType ||= 'application/json'),
      },
      method: (this.req.method ||= 'POST'),
    };

    super.withRequest(this.req);
    super.willRespondWith(res);
    return this;
  }

  public addInteraction(): GraphQLPactV3 {
    throw new ConfigurationError('Only GraphQL Queries are allowed');
  }

  public withRequestBinaryFile(): PactV3 {
    throw new ConfigurationError('Only GraphQL Queries are allowed');
  }

  public withRequestMultipartFileUpload(): PactV3 {
    throw new ConfigurationError('Only GraphQL Queries are allowed');
  }
}
