/** @module Matchers */

import { isNil, isFunction, isUndefined } from 'lodash';
import * as moment from 'moment';

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
 * Create a UUIDv4 matcher
 * @param {string} uuuid - a UUID to use as an example.
 */
export function likeUUIDv4(uuid?: string) {
  return term({
    generate: uuid || 'ce118b6e-d8e1-11e7-9296-cec278b6b50a',
    matcher: '/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/'
  });
}


/**
 * Create a IPv4 matcher
 * @param {string} ip - an IPv4 address to use as an example
 */
export function likeIpv4(ip: string) {
  return term({
    generate: ip,
    matcher: '(\\d{1,3}\\.)+\\d{1,3}'
  });
}

/**
 * Create a IPv6 matcher
 * @param {string} ip - an IPv6 address to use as an example
 */
export function likeIpv6(ip: string) {
  return term({
    generate: ip,
    matcher: '(\\A([0-9a-f]{1,4}:){1,1}(:[0-9a-f]{1,4}){1,6}\\Z)|(\\A([0-9a-f]{1,4}:){1,2}(:[0-9a-f]{1,4}){1,5}\\Z)|(\\A([0-9a-f]{1,4}:){1,3}(:[0-9a-f]{1,4}){1,4}\\Z)|(\\A([0-9a-f]{1,4}:){1,4}(:[0-9a-f]{1,4}){1,3}\\Z)|(\\A([0-9a-f]{1,4}:){1,5}(:[0-9a-f]{1,4}){1,2}\\Z)|(\\A([0-9a-f]{1,4}:){1,6}(:[0-9a-f]{1,4}){1,1}\\Z)|(\\A(([0-9a-f]{1,4}:){1,7}|:):\\Z)|(\\A:(:[0-9a-f]{1,4}){1,7}\\Z)|(\\A((([0-9a-f]{1,4}:){6})(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3})\\Z)|(\\A(([0-9a-f]{1,4}:){5}[0-9a-f]{1,4}:(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3})\\Z)|(\\A([0-9a-f]{1,4}:){5}:[0-9a-f]{1,4}:(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}\\Z)|(\\A([0-9a-f]{1,4}:){1,1}(:[0-9a-f]{1,4}){1,4}:(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}\\Z)|(\\A([0-9a-f]{1,4}:){1,2}(:[0-9a-f]{1,4}){1,3}:(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}\\Z)|(\\A([0-9a-f]{1,4}:){1,3}(:[0-9a-f]{1,4}){1,2}:(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}\\Z)|(\\A([0-9a-f]{1,4}:){1,4}(:[0-9a-f]{1,4}){1,1}:(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}\\Z)|(\\A(([0-9a-f]{1,4}:){1,5}|:):(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}\\Z)|(\\A:(:[0-9a-f]{1,4}){1,5}:(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}\\Z)'
  });
}





/**
 * Create a DateTime matcher
 * @param {string} date - an ISO8601 DateTime string.
 */
export function likeDateISO8601(date?: string) {
  return term({
    generate: date || moment().toISOString(),
    matcher: '^([\\+-]?\\d{4}(?!\\d{2}\\b))((-?)((0[1-9]|1[0-2])(\\3([12]\\d|0[1-9]|3[01]))?|W([0-4]\\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\\d|[12]\\d{2}|3([0-5]\\d|6[1-6])))?)'
  });
}

/**
 * Create a DateTime matcher
 * @param {string} date - an ISO8601 DateTime string.
 */
export function likeIso8601DateTime(date?: string) {
  return term({
    generate: date || moment().toISOString(),
    matcher: '^([\\+-]?\\d{4}(?!\\d{2}\\b))((-?)((0[1-9]|1[0-2])(\\3([12]\\d|0[1-9]|3[01]))?|W([0-4]\\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\\d|[12]\\d{2}|3([0-5]\\d|6[1-6])))?)'
  });
}

/**
 * Create a DateTime matcher
 * @param {string} date - an RFC822 DateTime string.
 */
export function likeRfc2822DateTime(date: string) {
  return term({
    generate: date,
    matcher: '/(?x)(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\\s\\d{ 2}\\s(Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec)\\s\\d{ 4}\\s\\d{ 2}: \\d{ 2}: \\d{ 2}\\s(\\+| -) \\d{ 4}/'
  });
}

/**
 * Create a Simple Date matcher
 * @param {string} date - a basic YYYY-MM-dd date string e.g. 2000-09-31
 */
export function likeDateSimple(date: string) {
  return term({
    generate: date,
    matcher: '/^\d{4}-[01]\d-[0-3]\d$/'
  });
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
    throw new Error('Error creating a Pact eachLike. Please provide opts.min that is > 0');
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

// Alias this for convenience
export { somethingLike as like };

export interface MatcherResult {
  json_class: string;
}
