/**
 * An Interaction is where you define the state of your interaction with a Provider.
 * @module Interaction
 */

import { isNil, keys, omitBy } from 'lodash';
import { HTTPMethods, HTTPMethod } from '../common/request';
import { Matcher, isMatcher, AnyTemplate } from './matchers';
import ConfigurationError from '../errors/configurationError';

interface QueryObject {
  [name: string]: string | Matcher<string> | string[];
}
export type Query = string | QueryObject;

export type Headers = {
  [header: string]: string | Matcher<string>;
};

export interface RequestOptions {
  method: HTTPMethods | HTTPMethod;
  path: string | Matcher<string>;
  query?: Query;
  headers?: Headers;
  body?: AnyTemplate;
}

export interface ResponseOptions {
  status: number;
  headers?: Headers;
  body?: AnyTemplate;
}

export interface InteractionObject {
  state: string | undefined;
  uponReceiving: string;
  withRequest: RequestOptions;
  willRespondWith: ResponseOptions;
}

export interface InteractionState {
  providerState?: string;
  description?: string;
  request?: RequestOptions;
  response?: ResponseOptions;
}

export interface InteractionStateComplete {
  providerState?: string;
  description: string;
  request: RequestOptions;
  response: ResponseOptions;
}

/**
 * Returns valid if object or matcher only contains string values
 * @param query
 */
const throwIfQueryObjectInvalid = (query: QueryObject) => {
  if (isMatcher(query)) {
    return;
  }

  Object.values(query).forEach((value) => {
    if (
      !(isMatcher(value) || Array.isArray(value) || typeof value === 'string')
    ) {
      throw new ConfigurationError(`Query must only contain strings.`);
    }
  });
};

export class Interaction {
  protected state: InteractionState = {};

  /**
   * Gives a state the provider should be in for this interaction.
   * @param {string} providerState - The state of the provider.
   * @returns {Interaction} interaction
   */
  public given(providerState: string): this {
    if (providerState) {
      this.state.providerState = providerState;
    }

    return this;
  }

  /**
   * A free style description of the interaction.
   * @param {string} description - A description of the interaction.
   * @returns {Interaction} interaction
   */
  public uponReceiving(description: string): this {
    if (isNil(description)) {
      throw new ConfigurationError(
        'You must provide a description for the interaction.'
      );
    }
    this.state.description = description;

    return this;
  }

  /**
   * The request that represents this interaction triggered by the consumer.
   * @param {Object} requestOpts
   * @param {string} requestOpts.method - The HTTP method
   * @param {string} requestOpts.path - The path of the URL
   * @param {string} requestOpts.query - Any query string in the interaction
   * @param {Object} requestOpts.headers - A key-value pair oject of headers
   * @param {Object} requestOpts.body - The body, in {@link String} format or {@link Object} format
   * @returns {Interaction} interaction
   */
  public withRequest(requestOpts: RequestOptions): this {
    if (isNil(requestOpts.method)) {
      throw new ConfigurationError('You must provide an HTTP method.');
    }

    if (keys(HTTPMethods).indexOf(requestOpts.method.toString()) < 0) {
      throw new ConfigurationError(
        `You must provide a valid HTTP method: ${keys(HTTPMethods).join(', ')}.`
      );
    }

    if (isNil(requestOpts.path)) {
      throw new ConfigurationError('You must provide a path.');
    }

    if (typeof requestOpts.query === 'object') {
      throwIfQueryObjectInvalid(requestOpts.query);
    }

    this.state.request = omitBy(requestOpts, isNil) as RequestOptions;

    return this;
  }

  /**
   * The response expected by the consumer.
   * @param {Object} responseOpts
   * @param {string} responseOpts.status - The HTTP status
   * @param {string} responseOpts.headers
   * @param {Object} responseOpts.body
   * @returns {Interaction} interaction
   */
  public willRespondWith(responseOpts: ResponseOptions): this {
    if (
      isNil(responseOpts.status) ||
      responseOpts.status.toString().trim().length === 0
    ) {
      throw new ConfigurationError('You must provide a status code.');
    }

    this.state.response = omitBy(
      {
        body: responseOpts.body,
        headers: responseOpts.headers || undefined,
        status: responseOpts.status,
      },
      isNil
    ) as ResponseOptions;
    return this;
  }

  /**
   * Returns the interaction object created.
   * @returns {Object}
   */
  public json(): InteractionStateComplete {
    if (isNil(this.state.description)) {
      throw new ConfigurationError(
        'You must provide a description for the Interaction'
      );
    }
    if (
      isNil(this.state.request) ||
      isNil(this.state?.request?.method) ||
      isNil(this.state?.request?.path)
    ) {
      throw new ConfigurationError(
        'You must provide a request with at least a method and path for the Interaction'
      );
    }
    if (isNil(this.state.response) || isNil(this.state?.response?.status)) {
      throw new ConfigurationError(
        'You must provide a response with a status for the Interaction'
      );
    }

    return this.state as InteractionStateComplete;
  }
}

export const interactionToInteractionObject = (
  interaction: InteractionStateComplete
): InteractionObject => {
  return {
    state: interaction.providerState,
    uponReceiving: interaction.description,
    withRequest: {
      method: interaction.request?.method,
      path: interaction.request?.path,
      query: interaction.request?.query,
      body: interaction.request?.body,
      headers: interaction.request?.headers,
    },
    willRespondWith: {
      status: interaction.response?.status,
      body: interaction.response?.body,
      headers: interaction.response?.headers,
    },
  };
};
