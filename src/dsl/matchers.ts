/** @module Matchers */

import { isNil, isFunction, isUndefined } from 'lodash';

/**
 * The term matcher.
 * @param {Object} opts
 * @param {string} opts.generate - a value to represent the matched String
 * @param {string} opts.matcher - a Regex representing the value
 */
export function term(opts: { generate: string, matcher: string }) {
  const generate = opts.generate;
  const matcher = opts.matcher;

  if (isNil(generate) || isNil(matcher)) {
    throw new Error('Error creating a Pact Term. Please provide an object containing "generate" and "matcher" properties');
  }

  return {
    'json_class': 'Pact::Term',
    'data': {
      'generate': generate,
      'matcher': {
        'json_class': 'Regexp',
        'o': 0,
        's': matcher
      }
    }
  };
}

/**
 * The eachLike matcher
 * @param {any} content
 * @param {Object} opts
 * @param {Number} opts.min
 */
export function eachLike<T>(content: T, opts?: { min: number }) {
  if (isUndefined(content)) {
    throw new Error('Error creating a Pact eachLike. Please provide a content argument');
  }

  if (opts && (isNil(opts.min) || opts.min < 1)) {
    throw new Error('Error creating a Pact eachLike. Please provide opts.min that is > 1');
  }

  return {
    'json_class': 'Pact::ArrayLike',
    'contents': content,
    'min': isUndefined(opts) ? 1 : opts.min
  };
}

/**
 * The somethingLike matcher
 * @param {any} value - the value to be somethingLike
 */
export function somethingLike<T>(value: T) {
  if (isNil(value) || isFunction(value)) {
    throw new Error('Error creating a Pact somethingLike Match. Value cannot be a function or undefined');
  }

  return {
    'json_class': 'Pact::SomethingLike',
    'contents': value
  };
}

export interface MatcherResult {
  json_class: string;
}
