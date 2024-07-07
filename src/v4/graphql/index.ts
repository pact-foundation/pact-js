import { ConsumerInteraction, ConsumerPact } from '@pact-foundation/pact-core';

import {
  GraphqlRequest,
  V4GraphQLInteractionWithRequest,
  V4GraphQLRequestBuilderFunc,
  V4UnconfiguredGraphQLInteraction,
} from './types';
import { PactV4Options } from '../http/types';
import { JsonMap } from '../../common/jsonTypes';
import { Path } from '../../v3';
import { matcherValueOrString } from '../../v3/matchers';
import { GraphQLVariables } from '../../common/graphQL/graphQL';
import { GraphQLRequestBuilder } from './graphQLRequestBuilder';
import { GraphQLInteractionWithRequest } from './graphQLInteractionWithRequest';

export class UnconfiguredGraphQLInteraction
  implements V4UnconfiguredGraphQLInteraction
{
  private graphQLRequest: GraphqlRequest;

  // tslint:disable:no-empty-function
  constructor(
    protected pact: ConsumerPact,
    protected interaction: ConsumerInteraction,
    protected opts: PactV4Options,
    protected cleanupFn: () => void
  ) {
    this.graphQLRequest = {};
  }

  withOperation(operation: string): V4UnconfiguredGraphQLInteraction {
    this.graphQLRequest.operation = operation;

    return this;
  }

  withVariables(variables: GraphQLVariables): V4UnconfiguredGraphQLInteraction {
    this.graphQLRequest.variables = variables;

    return this;
  }

  uponReceiving(description: string): V4UnconfiguredGraphQLInteraction {
    this.interaction.uponReceiving(description);

    return this;
  }

  given(state: string, parameters?: JsonMap): V4UnconfiguredGraphQLInteraction {
    if (parameters) {
      this.interaction.givenWithParams(state, JSON.stringify(parameters));
    } else {
      this.interaction.given(state);
    }

    return this;
  }

  withRequest(
    method: string,
    path: Path,
    builder?: V4GraphQLRequestBuilderFunc
  ): V4GraphQLInteractionWithRequest {
    this.interaction.withRequest(method, matcherValueOrString(path));

    if (builder) {
      builder(new GraphQLRequestBuilder(this.interaction));
    }
    return new GraphQLInteractionWithRequest(
      this.pact,
      this.interaction,
      this.opts,
      this.cleanupFn,
      this.graphQLRequest
    );
  }
}
