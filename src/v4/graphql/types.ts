import { ASTNode } from 'graphql';
import { JsonMap } from '../../common/jsonTypes';
import { Path, TemplateHeaders, TemplateQuery } from '../../v3';
import { V4InteractionWithRequest } from '../http/types';
import { GraphQLVariables } from '../../common/graphQL/graphQL';

export enum OperationType {
  Mutation = 'Mutation',
  Query = 'Query',
}

export interface V4UnconfiguredGraphQLInteraction {
  given(state: string, parameters?: JsonMap): V4UnconfiguredGraphQLInteraction;
  uponReceiving(description: string): V4UnconfiguredGraphQLInteraction;
  withOperation(operation: string): V4UnconfiguredGraphQLInteraction;
  withVariables(variables: GraphQLVariables): V4UnconfiguredGraphQLInteraction;
  withRequest(
    method: string,
    path: Path,
    builder?: V4GraphQLRequestBuilderFunc
  ): V4GraphQLInteractionWithRequest;
}
export interface V4GraphQLInteractionWithRequest {
  withQuery(query: string | ASTNode): V4InteractionWithRequest;
  withMutation(mutation: string | ASTNode): V4InteractionWithRequest;
}

export type V4GraphQLRequestBuilderFunc = (
  builder: V4GraphQLRequestBuilder
) => void;

// TOOD: not sure if the Builder pattern is better or worse from a readibility
//       and forcing function.
export interface V4GraphQLRequestBuilder {
  query(query: TemplateQuery): V4GraphQLRequestBuilder;
  headers(headers: TemplateHeaders): V4GraphQLRequestBuilder;
}

export type GraphqlRequest = {
  operation?: string;
  mutation?: string;
  variables?: GraphQLVariables;
};
