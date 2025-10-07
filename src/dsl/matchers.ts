/** @module Matchers
 *
 * For specific matcher types (e.g. IpV6), the values generated are not random
 * but are fixed, to prevent contract invalidation after each run of the consumer test.
 */

import { isFunction, isNil, isEmpty, isUndefined } from 'lodash';
import { times } from 'ramda';
import { AnyJson, JsonMap } from '../common/jsonTypes';
import MatcherError from '../errors/matcherError';

// Note: The following regexes are Ruby formatted,
// so attempting to parse as JS without modification is probably not going to work as intended!
export const EMAIL_FORMAT = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$';
export const ISO8601_DATE_FORMAT =
  '^([\\+-]?\\d{4}(?!\\d{2}\\b))((-?)((0[1-9]|1[0-2])(\\3([12]\\d|0[1-9]|3[01]))?|W([0-4]\\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\\d|[12]\\d{2}|3([0-5]\\d|6[1-6])))?)$';
export const ISO8601_DATETIME_FORMAT =
  '^\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d([+-][0-2]\\d:[0-5]\\d|Z)$';
export const ISO8601_DATETIME_WITH_MILLIS_FORMAT =
  '^\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d(:?[0-5]\\d)?|Z)$';
export const ISO8601_TIME_FORMAT =
  '^(T\\d\\d:\\d\\d(:\\d\\d)?(\\.\\d+)?(([+-]\\d\\d:\\d\\d)|Z)?)?$';
export const RFC1123_TIMESTAMP_FORMAT =
  '^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\\s\\d{2}\\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s\\d{4}\\s\\d{2}:\\d{2}:\\d{2}\\s(\\+|-)\\d{4}$';
export const UUID_V4_FORMAT = '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$';
export const IPV4_FORMAT = '^(\\d{1,3}\\.)+\\d{1,3}$';
export const IPV6_FORMAT =
  '^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$';
export const HEX_FORMAT = '^[0-9a-fA-F]+$';

export interface MatcherV2<T> {
  value?: T;
  'pact:matcher:type': string;
  getValue(): T;
}

export interface ArrayMatcher<T> extends MatcherV2<T> {
  'pact:matcher:type': string;
  min?: number;
  max?: number;
}

export function isMatcher(x: unknown): x is MatcherV2<AnyTemplate> {
  return x != null && (x as MatcherV2<AnyTemplate>).getValue !== undefined;
}

export type AnyTemplate =
  | AnyJson
  | MatcherV2<AnyTemplate>
  | ArrayMatcher<AnyTemplate>
  | TemplateMap
  | ArrayTemplate;

export type InterfaceToTemplate<O> = { [K in keyof O]: AnyTemplate };

interface TemplateMap {
  [key: string]: AnyTemplate;
}
type ArrayTemplate = Array<AnyTemplate>;

/**
 * Validates the given example against the regex.
 *
 * @param example Example to use in the matcher.
 * @param matcher Regular expression to check.
 */
export function validateExample(example: string, matcher: string): boolean {
  // Note we escape the double \\ as these get sent over the wire as JSON
  return new RegExp(matcher.replace('\\\\', '\\')).test(example);
}

/**
 * The eachLike matcher
 * @param {any} template
 * @param {Object} opts
 * @param {Number} opts.min
 */
export function eachLike<T>(
  template: T,
  opts?: { min: number }
): ArrayMatcher<T[]> {
  if (isUndefined(template)) {
    throw new MatcherError(
      'Error creating a Pact eachLike. Please provide a content argument'
    );
  }

  if (opts && (isNil(opts.min) || opts.min < 1)) {
    throw new MatcherError(
      'Error creating a Pact eachLike. Please provide opts.min that is > 0'
    );
  }

  const min = !isEmpty(opts) && opts ? opts.min : 1;

  return {
    value: times(() => template, min),
    getValue: () => times(() => template, min),
    'pact:matcher:type': 'type',
    min,
  };
}

/**
 * The somethingLike matcher
 * @param {any} value - the value to be somethingLike
 */
export function somethingLike<T>(value: T): MatcherV2<T> {
  if (isNil(value) || isFunction(value)) {
    throw new MatcherError(
      'Error creating a Pact somethingLike Match. Value cannot be a function or undefined'
    );
  }

  return {
    value,
    getValue: () => value,
    'pact:matcher:type': 'type',
  };
}

export interface RegexMatcher<T> extends MatcherV2<T> {
  regex: string;
}

/**
 * The term matcher. Also aliased to 'regex' for discoverability.
 * @param {Object} opts
 * @param {string} opts.generate - a value to represent the matched String
 * @param {string} opts.matcher - a Regex representing the value
 */
export function term(opts: {
  generate: string;
  matcher: string;
}): RegexMatcher<string> {
  const { generate, matcher } = opts;

  if (isNil(generate) || isNil(matcher)) {
    throw new MatcherError(`Error creating a Pact Term.
      Please provide an object containing "generate" and "matcher" properties`);
  }

  if (!validateExample(generate, matcher)) {
    throw new MatcherError(
      `Example '${generate}' does not match provided regular expression '${matcher}'`
    );
  }

  return {
    getValue: () => generate,
    value: generate,
    regex: matcher,
    'pact:matcher:type': 'regex',
  };
}

/**
 * Email address matcher.
 * @param {string} address - a email address to use as an example
 */
export function email(address?: string): MatcherV2<string> {
  return term({
    generate: address || 'hello@pact.io',
    matcher: EMAIL_FORMAT,
  });
}

/**
 * UUID v4 matcher.
 * @param {string} id - a UUID to use as an example.
 */
export function uuid(id?: string): MatcherV2<string> {
  return term({
    generate: id || 'ce118b6e-d8e1-11e7-9296-cec278b6b50a',
    matcher: UUID_V4_FORMAT,
  });
}

/**
 * IPv4 matcher.
 * @param {string} ip - an IPv4 address to use as an example. Defaults to `127.0.0.13`
 */
export function ipv4Address(ip?: string): MatcherV2<string> {
  return term({
    generate: ip || '127.0.0.13',
    matcher: IPV4_FORMAT,
  });
}

/**
 * IPv6 matcher.
 * @param {string} ip - an IPv6 address to use as an example. Defaults to '::ffff:192.0.2.128'
 */
export function ipv6Address(ip?: string): MatcherV2<string> {
  return term({
    generate: ip || '::ffff:192.0.2.128',
    matcher: IPV6_FORMAT,
  });
}

/**
 * ISO8601 DateTime matcher.
 * @param {string} date - an ISO8601 Date and Time string
 *                        e.g. 2015-08-06T16:53:10+01:00 are valid
 */
export function iso8601DateTime(date?: string): MatcherV2<string> {
  return term({
    generate: date || '2015-08-06T16:53:10+01:00',
    matcher: ISO8601_DATETIME_FORMAT,
  });
}

/**
 * ISO8601 DateTime matcher with required millisecond precision
 * @param {string} date - an ISO8601 Date and Time string, e.g. 2015-08-06T16:53:10.123+01:00
 */
export function iso8601DateTimeWithMillis(date?: string): MatcherV2<string> {
  return term({
    generate: date || '2015-08-06T16:53:10.123+01:00',
    matcher: ISO8601_DATETIME_WITH_MILLIS_FORMAT,
  });
}

/**
 * ISO8601 Date matcher.
 * @param {string} date - a basic yyyy-MM-dd date string e.g. 2000-09-31
 */
export function iso8601Date(date?: string): MatcherV2<string> {
  return term({
    generate: date || '2013-02-01',
    matcher: ISO8601_DATE_FORMAT,
  });
}

/**
 *  ISO8601 Time MatcherV2, matches a pattern of the format "'T'HH:mm:ss".
 * @param {string} date - a ISO8601 formatted time string e.g. T22:44:30.652Z
 */
export function iso8601Time(time?: string): MatcherV2<string> {
  return term({
    generate: time || 'T22:44:30.652Z',
    matcher: ISO8601_TIME_FORMAT,
  });
}

/**
 * RFC1123 Timestamp matcher "DAY, DD MON YYY hh:mm:ss"
 *
 * @param {string} date - an RFC1123 Date and Time string, e.g. Mon, 31 Oct 2016 15:21:41 -0400
 */
export function rfc1123Timestamp(timestamp?: string): MatcherV2<string> {
  return term({
    generate: timestamp || 'Mon, 31 Oct 2016 15:21:41 -0400',
    matcher: RFC1123_TIMESTAMP_FORMAT,
  });
}

/**
 * Hexadecimal MatcherV2.
 * @param {string} hex - a hex value.
 */
export function hexadecimal(hex?: string): MatcherV2<string> {
  return term({
    generate: hex || '3F',
    matcher: HEX_FORMAT,
  });
}

/**
 * Decimal MatcherV2.
 * @param {float} float - a decimal value.
 */
export function decimal(float?: number): MatcherV2<number> {
  return somethingLike<number>(isNil(float) ? 13.01 : float);
}

/**
 * Integer MatcherV2.
 * @param {integer} int - an int value.
 */
export function integer(int?: number): MatcherV2<number> {
  return somethingLike<number>(isNil(int) ? 13 : int);
}

/**
 * Boolean MatcherV2.
 */
export function boolean(value = true): MatcherV2<boolean> {
  return somethingLike<boolean>(value);
}

/**
 * String MatcherV2.
 */
export function string(value = 'iloveorange'): MatcherV2<string> {
  return somethingLike<string>(value);
}

// Convenience alias'
export { somethingLike as like };
export { term as regex };

// Recurse the object removing any underlying matching guff, returning
// the raw example content
export function extractPayload(value: AnyTemplate): AnyJson {
  if (isMatcher(value)) {
    return extractPayload(value.getValue());
  }

  if (Object.prototype.toString.call(value) === '[object Array]') {
    return (value as Array<AnyTemplate>).map(extractPayload);
  }

  if (value !== null && typeof value === 'object') {
    return Object.keys(value).reduce(
      (acc: JsonMap, propName: string) => ({
        ...acc,
        [propName]: extractPayload(
          (value as Record<string, AnyTemplate>)[propName]
        ),
      }),
      {}
    );
  }
  return value;
}

// Gets a matcher as JSON or the string value if it's not a matcher
export function matcherValueOrString(obj: unknown): string {
  if (typeof obj === 'string') return obj;

  return JSON.stringify(obj);
}
