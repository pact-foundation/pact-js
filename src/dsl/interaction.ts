/**
 * An Interaction is where you define the state of your interaction with a Provider.
 * @module Interaction
 */


import { MatcherResult } from './matchers';
import { HTTPMethod } from '../common/request';
import { isNil, omitBy } from 'lodash';

export interface RequestOptions {
  method: HTTPMethod;
  path: string | MatcherResult;
  query?: any;
  headers?: { [name: string]: string | MatcherResult };
  body?: any;
}

export interface ResponseOptions {
  status: number | MatcherResult;
  headers?: { [name: string]: string | MatcherResult };
  body?: any;
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

export class Interaction {
  private state: InteractionState = {};

  /**
   * Creates a new Interaction.
   * @returns {Interaction} interaction
   */
  constructor() { }

  /**
   * Gives a state the provider should be in for this interaction.
   * @param {string} providerState - The state of the provider.
   * @returns {Interaction} interaction
   */
  given(providerState: string) {
    if (providerState) {
      this.state['providerState'] = providerState;
    }

    return this;
  }

  /**
   * A free style description of the interaction.
   * @param {string} description - A description of the interaction.
   * @returns {Interaction} interaction
   */
  uponReceiving(description: string) {
    if (isNil(description)) {
      throw new Error('You must provide a description for the interaction.');
    }
    this.state['description'] = description;

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
  withRequest(requestOpts: RequestOptions) {
    if (isNil(requestOpts.method)) {
      throw new Error('You must provide a HTTP method.')
    }

    // if (VALID_METHODS.indexOf(requestOpts.method.toUpperCase()) < 0) {
    //   throw new Error('You must provide a valid HTTP method.');
    // }

    if (isNil(requestOpts.path)) {
      throw new Error('You must provide a path.');
    }

    this.state['request'] = requestOpts;

    // omitBy({
    //   method: requestOpts.method.toUpperCase(),
    //   path: requestOpts.path,
    //   query: requestOpts.query,
    //   headers: requestOpts.headers,
    //   body: requestOpts.body
    // }, isNil)

    return this;
  }

  /**
  * The response expected by the consumer.
  * @param {Object} responseOpts
  * @param {string} responseOpts.status - The HTTP status
  * @param {string} responseOpts.headers
  * @param {Object} responseOpts.body
   */
  willRespondWith(responseOpts: ResponseOptions) {
    if (isNil(responseOpts.status) || responseOpts.status.toString().trim().length === 0) {
      throw new Error('You must provide a status code.');
    }

    this.state['response'] = responseOpts;
    // omitBy({
    //   status: status,
    //   headers: headers || undefined,
    //   body: body || undefined
    // }, isNil);
  }

  /**
   * Returns the interaction object created.
   * @returns {Object}
   */
  json(): InteractionState {
    return this.state;
  }
}
