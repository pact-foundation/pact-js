/** @module Matchers
 *
 * For specific matcher types (e.g. IpV6), the values generated are not random
 * but are fixed, to prevent contract invalidation after each run of the consumer test.
*/

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
 * UUIDv4 matcher.
 * @param {string} uuuid - a UUID to use as an example.
 */
export function uuidV4(uuid?: string) {
  return term({
    generate: uuid || 'ce118b6e-d8e1-11e7-9296-cec278b6b50a',
    matcher: '/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/'
  });
}

/**
 * IPv4 matcher.
 * @param {string} ip - an IPv4 address to use as an example. Defaults to `127.0.0.13`
 */
export function ipv4(ip?: string) {
  return term({
    generate: ip || '127.0.0.13',
    matcher: '(\\d{1,3}\\.)+\\d{1,3}'
  });
}

/**
 * IPv6 matcher.
 * @param {string} ip - an IPv6 address to use as an example. Defaults to '::ffff:192.0.2.128'
 */
export function ipv6(ip?: string) {
  return term({
    generate: ip || '::ffff:192.0.2.128',
    matcher: '(\\A([0-9a-f]{1,4}:){1,1}(:[0-9a-f]{1,4}){1,6}\\Z)|(\\A([0-9a-f]{1,4}:){1,2}(:[0-9a-f]{1,4}){1,5}\\Z)|(\\A([0-9a-f]{1,4}:){1,3}(:[0-9a-f]{1,4}){1,4}\\Z)|(\\A([0-9a-f]{1,4}:){1,4}(:[0-9a-f]{1,4}){1,3}\\Z)|(\\A([0-9a-f]{1,4}:){1,5}(:[0-9a-f]{1,4}){1,2}\\Z)|(\\A([0-9a-f]{1,4}:){1,6}(:[0-9a-f]{1,4}){1,1}\\Z)|(\\A(([0-9a-f]{1,4}:){1,7}|:):\\Z)|(\\A:(:[0-9a-f]{1,4}){1,7}\\Z)|(\\A((([0-9a-f]{1,4}:){6})(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3})\\Z)|(\\A(([0-9a-f]{1,4}:){5}[0-9a-f]{1,4}:(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3})\\Z)|(\\A([0-9a-f]{1,4}:){5}:[0-9a-f]{1,4}:(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}\\Z)|(\\A([0-9a-f]{1,4}:){1,1}(:[0-9a-f]{1,4}){1,4}:(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}\\Z)|(\\A([0-9a-f]{1,4}:){1,2}(:[0-9a-f]{1,4}){1,3}:(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}\\Z)|(\\A([0-9a-f]{1,4}:){1,3}(:[0-9a-f]{1,4}){1,2}:(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}\\Z)|(\\A([0-9a-f]{1,4}:){1,4}(:[0-9a-f]{1,4}){1,1}:(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}\\Z)|(\\A(([0-9a-f]{1,4}:){1,5}|:):(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}\\Z)|(\\A:(:[0-9a-f]{1,4}){1,5}:(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}\\Z)'
  });
}

/**
 * ISO8601 DateTime matcher
 * @param {string} date - an ISO8601 Date and Time string, e.g. 2013-02-04T22:44:30.652Z
 */
export function iso8601DateTime(date?: string) {
  return term({
    generate: date || '2013-02-01T22:44:30.652Z',
    matcher: '^([\\+-]?\\d{4}(?!\\d{2}\\b))((-?)((0[1-9]|1[0-2])(\\3([12]\\d|0[1-9]|3[01]))?|W([0-4]\\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\\d|[12]\\d{2}|3([0-5]\\d|6[1-6])))([T\\s]((([01]\\d|2[0-3])((:?)[0-5]\\d)?|24\\:?00)([\\.,]\\d+(?!:))?)?(\\17[0-5]\\d([\\.,]\\d+)?)?([zZ]|([\\+-])([01]\\d|2[0-3]):?([0-5]\\d)?)?)?)?$'
  });
}

/**
 * ISO8601 Date matcher.
 * @param {string} date - a basic yyyy-MM-dd date string e.g. 2000-09-31
 */
export function iso8601Date(date?: string) {
  return term({
    generate: date || '2013-02-01',
    matcher: '^([\\+-]?\\d{4}(?!\\d{2}\\b))((-?)((0[1-9]|1[0-2])(\\3([12]\\d|0[1-9]|3[01]))?|W([0-4]\\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\\d|[12]\\d{2}|3([0-5]\\d|6[1-6])))?)'
  });
}

/**
 * RFC822 Date matcher.
 * @param {string} date - a basic yyyy-MM-dd date string e.g. 2000-09-31
 */
export function iso8601Date(date?: string) {
  return term({
    generate: date || '2013-02-01',
    matcher: '(?x)(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\\s\\d{2}\\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s\\d{4}\\s\\d{2}:\\d{2}:\\d{2}\\s(\\+|-)\\d{4}'
  });
}


/**
 *  ISO8601 Time Matcher, matches a pattern of the format "'T'HH:mm:ss".
 * @param {string} date - a ISO8601 formatted time string e.g. T22:44:30.652Z
 */
export function iso8601Time(time?: string) {
  return term({
    generate: time || 'T22:44:30.652Z',
    matcher: '^(T\\d\\d:\\d\\d(:\\d\\d)?(\\.\\d+)?(([+-]\\d\\d:\\d\\d)|Z)?)?$'
  });
}

/**
 * RFC3339 Timestamp matcher, a subset of ISO8609
 * @param {string} date - an RFC3339 Date and Time string, e.g. 2013-02-04T22:44:30.652Z
 */
export function rfc3339Timestamp(timestamp?: string) {
  return term({
    generate: date || '2013-02-01T22:44:30.652Z',
    matcher: '^([0-9]+)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])[Tt]([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\\.[0-9]+)?(([Zz])|([\+|\-]([01][0-9]|2[0-3]):[0-5][0-9]))$'
  });
}

/**
 * Hexadecimal Matcher.
 * @param {string} hex - a hex value.
 */
export function Hex(hex?: string) {
  return term({
    generate: hex || '3F',
    matcher: '[0-9a-fA-F]+'
  });
}

/**
 * Decimal Matcher.
 * @param {float} hex - a hex value.
 */
export function decimal(float?: number) {
  return somethingLike<number>(float || 13.01);
}

/**
 * Integer Matcher.
 * @param {integer} int - an int value.
 */
export function integer(int?: number) {
  return somethingLike<number>(int || 13);
}

/**
 * Boolean Matcher.
 */
export function boolean() {
  return somethingLike<boolean>(true);
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

// Convenience alias'
export { somethingLike as like };
export { term as regex };

export interface MatcherResult {
  json_class: string;
}
