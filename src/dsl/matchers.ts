/** @module Matchers
 *
 * For specific matcher types (e.g. IpV6), the values generated are not random
 * but are fixed, to prevent contract invalidation after each run of the consumer test.
 */

import { isFunction, isNil, isEmpty, isUndefined } from "lodash"
import MatcherError from "../errors/matcherError"

// Note: The following regexes are Ruby formatted,
// so attempting to parse as JS without modification is probably not going to work as intended!
/* tslint:disable:max-line-length */
export const EMAIL_FORMAT = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$"
export const ISO8601_DATE_FORMAT =
  "^([\\+-]?\\d{4}(?!\\d{2}\\b))((-?)((0[1-9]|1[0-2])(\\3([12]\\d|0[1-9]|3[01]))?|W([0-4]\\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\\d|[12]\\d{2}|3([0-5]\\d|6[1-6])))?)$"
export const ISO8601_DATETIME_FORMAT =
  "^\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d([+-][0-2]\\d:[0-5]\\d|Z)$"
export const ISO8601_DATETIME_WITH_MILLIS_FORMAT =
  "^\\d{4}-[01]\\d-[0-3]\\dT[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d{3,}([+-][0-2]\\d(:?[0-5]\\d)?|Z)$"
export const ISO8601_TIME_FORMAT =
  "^(T\\d\\d:\\d\\d(:\\d\\d)?(\\.\\d+)?(([+-]\\d\\d:\\d\\d)|Z)?)?$"
export const RFC3339_TIMESTAMP_FORMAT =
  "^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\\s\\d{2}\\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s\\d{4}\\s\\d{2}:\\d{2}:\\d{2}\\s(\\+|-)\\d{4}$"
export const UUID_V4_FORMAT = "^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$"
export const IPV4_FORMAT = "^(\\d{1,3}\\.)+\\d{1,3}$"
export const IPV6_FORMAT =
  "^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$"
export const HEX_FORMAT = "^[0-9a-fA-F]+$"
/* tslint:enable */

/**
 * Validates the given example against the regex.
 *
 * @param example Example to use in the matcher.
 * @param matcher Regular expression to check.
 */
export function validateExample(example: string, matcher: string): boolean {
  // Note we escape the double \\ as these get sent over the wire as JSON
  return new RegExp(matcher.replace("\\\\", "\\")).test(example)
}

/**
 * The eachLike matcher
 * @param {any} content
 * @param {Object} opts
 * @param {Number} opts.min
 */
export function eachLike<T>(content: T, opts?: { min: number }) {
  if (isUndefined(content)) {
    throw new MatcherError(
      "Error creating a Pact eachLike. Please provide a content argument"
    )
  }

  if (opts && (isNil(opts.min) || opts.min < 1)) {
    throw new MatcherError(
      "Error creating a Pact eachLike. Please provide opts.min that is > 0"
    )
  }

  const min = !isEmpty(opts) && opts ? opts.min : 1

  return {
    contents: content,
    getValue: () => {
      const data = []
      for (let i = 0; i < min; i++) {
        data[i] = content
      }
      return data
    },
    json_class: "Pact::ArrayLike",
    min,
  }
}

/**
 * The somethingLike matcher
 * @param {any} value - the value to be somethingLike
 */
export function somethingLike<T>(value: T) {
  if (isNil(value) || isFunction(value)) {
    throw new MatcherError(
      "Error creating a Pact somethingLike Match. Value cannot be a function or undefined"
    )
  }

  return {
    contents: value,
    getValue: () => {
      return value
    },
    json_class: "Pact::SomethingLike",
  }
}

/**
 * The term matcher. Also aliased to 'regex' for discoverability.
 * @param {Object} opts
 * @param {string} opts.generate - a value to represent the matched String
 * @param {string} opts.matcher - a Regex representing the value
 */
export function term(opts: { generate: string; matcher: string }) {
  const generate = opts.generate
  const matcher = opts.matcher

  if (isNil(generate) || isNil(matcher)) {
    throw new MatcherError(`Error creating a Pact Term.
      Please provide an object containing "generate" and "matcher" properties`)
  }

  if (!validateExample(generate, matcher)) {
    throw new MatcherError(
      `Example '${generate}' does not match provided regular expression '${matcher}'`
    )
  }

  return {
    data: {
      generate,
      matcher: {
        json_class: "Regexp",
        o: 0,
        s: matcher,
      },
    },
    getValue: () => {
      return generate
    },
    json_class: "Pact::Term",
  }
}

/**
 * Email address matcher.
 * @param {string} address - a email address to use as an example
 */
export function email(address?: string) {
  return term({
    generate: address || "hello@pact.io",
    matcher: EMAIL_FORMAT,
  })
}

/**
 * UUID v4 matcher.
 * @param {string} uuuid - a UUID to use as an example.
 */
export function uuid(id?: string) {
  return term({
    generate: id || "ce118b6e-d8e1-11e7-9296-cec278b6b50a",
    matcher: UUID_V4_FORMAT,
  })
}

/**
 * IPv4 matcher.
 * @param {string} ip - an IPv4 address to use as an example. Defaults to `127.0.0.13`
 */
export function ipv4Address(ip?: string) {
  return term({
    generate: ip || "127.0.0.13",
    matcher: IPV4_FORMAT,
  })
}

/**
 * IPv6 matcher.
 * @param {string} ip - an IPv6 address to use as an example. Defaults to '::ffff:192.0.2.128'
 */
export function ipv6Address(ip?: string) {
  return term({
    generate: ip || "::ffff:192.0.2.128",
    matcher: IPV6_FORMAT,
  })
}

/**
 * ISO8601 DateTime matcher.
 * @param {string} date - an ISO8601 Date and Time string
 *                        e.g. 2015-08-06T16:53:10+01:00 are valid
 */
export function iso8601DateTime(date?: string) {
  return term({
    generate: date || "2015-08-06T16:53:10+01:00",
    matcher: ISO8601_DATETIME_FORMAT,
  })
}

/**
 * ISO8601 DateTime matcher with required millisecond precision
 * @param {string} date - an ISO8601 Date and Time string, e.g. 2015-08-06T16:53:10.123+01:00
 */
export function iso8601DateTimeWithMillis(date?: string) {
  return term({
    generate: date || "2015-08-06T16:53:10.123+01:00",
    matcher: ISO8601_DATETIME_WITH_MILLIS_FORMAT,
  })
}

/**
 * ISO8601 Date matcher.
 * @param {string} date - a basic yyyy-MM-dd date string e.g. 2000-09-31
 */
export function iso8601Date(date?: string) {
  return term({
    generate: date || "2013-02-01",
    matcher: ISO8601_DATE_FORMAT,
  })
}

/**
 *  ISO8601 Time Matcher, matches a pattern of the format "'T'HH:mm:ss".
 * @param {string} date - a ISO8601 formatted time string e.g. T22:44:30.652Z
 */
export function iso8601Time(time?: string) {
  return term({
    generate: time || "T22:44:30.652Z",
    matcher: ISO8601_TIME_FORMAT,
  })
}

/**
 * RFC3339 Timestamp matcher, a subset of ISO8609
 * @param {string} date - an RFC3339 Date and Time string, e.g. Mon, 31 Oct 2016 15:21:41 -0400
 */
export function rfc3339Timestamp(timestamp?: string) {
  return term({
    generate: timestamp || "Mon, 31 Oct 2016 15:21:41 -0400",
    matcher: RFC3339_TIMESTAMP_FORMAT,
  })
}

/**
 * Hexadecimal Matcher.
 * @param {string} hex - a hex value.
 */
export function hexadecimal(hex?: string) {
  return term({
    generate: hex || "3F",
    matcher: HEX_FORMAT,
  })
}

/**
 * Decimal Matcher.
 * @param {float} float - a decimal value.
 */
export function decimal(float?: number) {
  return somethingLike<number>(isNil(float) ? 13.01 : float)
}

/**
 * Integer Matcher.
 * @param {integer} int - an int value.
 */
export function integer(int?: number) {
  return somethingLike<number>(isNil(int) ? 13 : int)
}

/**
 * Boolean Matcher.
 */
export function boolean(value: boolean = true) {
  return somethingLike<boolean>(value)
}

/**
 * String Matcher.
 */
export function string(value: string = "iloveorange") {
  return somethingLike<string>(value)
}

// Convenience alias'
export { somethingLike as like }
export { term as regex }

export interface MatcherResult {
  json_class: string
  getValue(): any
}

export function isMatcher(x: MatcherResult | any): x is MatcherResult {
  return x != null && (x as MatcherResult).getValue !== undefined
}

// Recurse the object removing any underlying matching guff, returning
// the raw example content
export function extractPayload(value: any): any {
  if (isMatcher(value)) {
    return extractPayload(value.getValue())
  }

  if (Object.prototype.toString.call(value) === "[object Array]") {
    return value.map(extractPayload)
  }

  if (typeof value === "object") {
    return Object.keys(value).reduce(
      (acc: object, propName: string) => ({
        ...acc,
        [propName]: extractPayload(value[propName]),
      }),
      {}
    )
  }
  return value
}
