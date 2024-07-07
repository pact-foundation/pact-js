import { ConsumerPact, ConsumerInteraction } from '@pact-foundation/pact-core';
import { ASTNode } from 'graphql';
import { isUndefined } from 'lodash';
import { reject } from 'ramda';

import {
  escapeGraphQlQuery,
  validateQuery,
} from '../../common/graphQL/graphQL';
import { InteractionWithRequest } from '../http/interactionWithRequest';
import { PactV4Options, V4InteractionWithRequest } from '../http/types';
import {
  V4GraphQLInteractionWithRequest,
  OperationType,
  GraphqlRequest,
} from './types';
import { regex } from '../../v3/matchers';

export class GraphQLInteractionWithRequest
  implements V4GraphQLInteractionWithRequest
{
  // tslint:disable:no-empty-function
  constructor(
    protected pact: ConsumerPact,
    protected interaction: ConsumerInteraction,
    protected opts: PactV4Options,
    protected cleanupFn: () => void,
    protected graphQLRequest: GraphqlRequest
  ) {}

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
  withQuery(query: string | ASTNode): V4InteractionWithRequest {
    return this.setQueryDetails(query, OperationType.Query);
  }

  withMutation(mutation: string | ASTNode): V4InteractionWithRequest {
    return this.setQueryDetails(mutation, OperationType.Mutation);
  }

  private setQueryDetails(
    query: string | ASTNode,
    type: OperationType
  ): V4InteractionWithRequest {
    const validatedQuery = validateQuery(query, type);

    this.interaction.withRequestBody(
      JSON.stringify(
        reject(isUndefined, {
          operationName: this.graphQLRequest.operation,
          query: regex(escapeGraphQlQuery(validatedQuery), validatedQuery),
          variables: this.graphQLRequest.variables,
        })
      ),
      'application/json'
    );

    return new InteractionWithRequest(
      this.pact,
      this.interaction,
      this.opts,
      this.cleanupFn
    );
  }
}
