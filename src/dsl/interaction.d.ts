import {HTTPMethod} from '../common/request';
import {MatcherResult} from './matchers';

export class Interaction {
  constructor();
  given(providerState: string): Interaction;
  uponReceiving(description: string): Interaction;
  withRequest(requestOpts: RequestOptions): Interaction;
  willRespondWith(responseOpts: ResponseOptions): Interaction;
  json(): object;
}

export interface RequestOptions {
  method: HTTPMethod;
  path: string | MatcherResult;
  query?: any;
  headers?: {[name: string]: string | MatcherResult};
  body?: any;
}

export interface ResponseOptions {
  status: number | MatcherResult;
  headers?: {[name: string]: string | MatcherResult};
  body?: any;
}

export interface InteractionObject {
  state: string;
  uponReceiving: string;
  withRequest: RequestOptions;
  willRespondWith: ResponseOptions;
}
