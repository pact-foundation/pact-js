/**
 * An Interaction is where you define the state of your interaction with a Provider.
 * @module Interaction
 */

import { isNil, keys, omitBy } from "lodash";
import { HTTPMethod, methods } from "../common/request";
import { MatcherResult } from "./matchers";

export interface RequestOptions {
  method: HTTPMethod | methods;
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
   * Gives a state the provider should be in for this interaction.
   * @param {string} providerState - The state of the provider.
   * @returns {Interaction} interaction
   */
  public given(providerState: string) {
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
  public uponReceiving(description: string) {
    if (isNil(description)) {
      throw new Error("You must provide a description for the interaction.");
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
  public withRequest(requestOpts: RequestOptions) {
    if (isNil(requestOpts.method)) {
      throw new Error("You must provide an HTTP method.");
    }

    if (keys(HTTPMethod).indexOf(requestOpts.method.toString()) < 0) {
      throw new Error(`You must provide a valid HTTP method: ${keys(HTTPMethod).join(", ")}.`);
    }

    if (isNil(requestOpts.path)) {
      throw new Error("You must provide a path.");
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
   */
  public willRespondWith(responseOpts: ResponseOptions) {
    if (isNil(responseOpts.status) || responseOpts.status.toString().trim().length === 0) {
      throw new Error("You must provide a status code.");
    }

    this.state.response = omitBy({
      body: responseOpts.body || undefined,
      headers: responseOpts.headers || undefined,
      status: responseOpts.status,
    }, isNil) as ResponseOptions;
    return this;
  }

  /**
   * Returns the interaction object created.
   * @returns {Object}
   */
  public json(): InteractionState {
    return this.state;
  }
}
