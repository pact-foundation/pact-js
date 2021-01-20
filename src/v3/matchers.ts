import * as R from "ramda"
const PactNative = require("../native/index.node")

export namespace MatchersV3 {
  /**
   * Pact Matcher
   */
  export interface Matcher {
    "pact:matcher:type": string
    "pact:generator:type"?: string
    value?: any
  }

  /**
   * Value must match the given template
   * @param template Template to base the comparison on
   */
  export function like(template: any): Matcher {
    return {
      "pact:matcher:type": "type",
      value: template,
    }
  }

  /**
   * Array where each element must match the given template
   * @param template Template to base the comparison on
   */
  export function eachLike(template: any): Matcher {
    return {
      "pact:matcher:type": "type",
      value: [template],
    }
  }

  /**
   * Like Matcher with a minimum number of required values
   */
  interface MinLikeMatcher extends Matcher {
    min: number
  }

  /**
   * An array that has to have at least one element and each element must match the given template
   * @param template Template to base the comparison on
   * @param count Number of examples to generate, defaults to one
   */
  export function atLeastOneLike(
    template: any,
    count: number = 1
  ): MinLikeMatcher {
    return {
      min: 1,
      "pact:matcher:type": "type",
      value: R.times(() => template, count),
    }
  }

  /**
   * An array that has to have at least the required number of elements and each element must match the given template
   * @param template Template to base the comparison on
   * @param min Minimum number of elements required in the array
   * @param count Number of examples to generate, defaults to one
   */
  export function atLeastLike(
    template: any,
    min: number,
    count?: number
  ): MinLikeMatcher {
    const elements = count || min
    if (count && count < min) {
      throw new Error(
        "atLeastLike has a minimum of " +
          min +
          " but " +
          count +
          " elements where requested." +
          " Make sure the count is greater than or equal to the min."
      )
    }

    return {
      min,
      "pact:matcher:type": "type",
      value: R.times(() => template, elements),
    }
  }

  /**
   * Like Matcher with a maximum number of required values
   */
  interface MaxLikeMatcher extends Matcher {
    max: number
  }

  /**
   * An array that has to have at most the required number of elements and each element must match the given template
   * @param template Template to base the comparison on
   * @param max Maximum number of elements required in the array
   * @param count Number of examples to generate, defaults to one
   */
  export function atMostLike(
    template: any,
    max: number,
    count?: number
  ): MaxLikeMatcher {
    const elements = count || 1
    if (count && count > max) {
      throw new Error(
        "atMostLike has a maximum of " +
          max +
          " but " +
          count +
          " elements where requested." +
          " Make sure the count is less than or equal to the max."
      )
    }

    return {
      max,
      "pact:matcher:type": "type",
      value: R.times(() => template, elements),
    }
  }

  /**
   * An array whose size is constrained to the minimum and maximum number of elements and each element must match the given template
   * @param template Template to base the comparison on
   * @param min Minimum number of elements required in the array
   * @param max Maximum number of elements required in the array
   * @param count Number of examples to generate, defaults to one
   */
  export function constrainedArrayLike(
    template: any,
    min: number,
    max: number,
    count?: number
  ): MinLikeMatcher & MaxLikeMatcher {
    const elements = count || min
    if (count) {
      if (count < min) {
        throw new Error(
          "constrainedArrayLike has a minimum of " +
            min +
            " but " +
            count +
            " elements where requested." +
            " Make sure the count is greater than or equal to the min."
        )
      } else if (count > max) {
        throw new Error(
          "constrainedArrayLike has a maximum of " +
            max +
            " but " +
            count +
            " elements where requested." +
            " Make sure the count is less than or equal to the max."
        )
      }
    }

    return {
      min,
      max,
      "pact:matcher:type": "type",
      value: R.times(() => template, elements),
    }
  }

  /**
   * Value must be a boolean
   * @param b Boolean example value
   */
  export function boolean(b: boolean): Matcher {
    return {
      "pact:matcher:type": "type",
      value: b,
    }
  }

  /**
   * Value must be an integer (must be a number and have no decimal places)
   * @param int Example value. If omitted a random value will be generated.
   */
  export function integer(int?: number): Matcher {
    if (int) {
      return {
        "pact:matcher:type": "integer",
        value: int,
      }
    } else {
      return {
        "pact:generator:type": "RandomInt",
        "pact:matcher:type": "integer",
        value: 101,
      }
    }
  }

  /**
   * Value must be a decimal number (must be a number and have decimal places)
   * @param num Example value. If omitted a random value will be generated.
   */
  export function decimal(num?: number): Matcher {
    if (num) {
      return {
        "pact:matcher:type": "decimal",
        value: num,
      }
    } else {
      return {
        "pact:generator:type": "RandomDecimal",
        "pact:matcher:type": "decimal",
        value: 12.34,
      }
    }
  }

  /**
   * Value must be a number
   * @param num Example value. If omitted a random integer value will be generated.
   */
  export function number(num?: number): Matcher {
    if (num) {
      return {
        "pact:matcher:type": "number",
        value: num,
      }
    } else {
      return {
        "pact:generator:type": "RandomInt",
        "pact:matcher:type": "number",
        value: 1234,
      }
    }
  }

  /**
   * Value must be a string
   * @param str Example value
   */
  export function string(str: string): Matcher {
    return {
      "pact:matcher:type": "type",
      value: str,
    }
  }

  interface RegexMatcher extends Matcher {
    regex: string
    example?: string
  }

  /**
   * Value that must match the given regular expression
   * @param pattern Regular Expression to match
   * @param str Example value
   */
  export function regex(pattern: string, str: string): RegexMatcher
  /**
   * Value that must match the given regular expression
   * @param pattern Regular Expression to match
   * @param str Example value
   */
  export function regex(pattern: RegExp, str: string): RegexMatcher
  export function regex(pattern: any, str: string): RegexMatcher {
    if (pattern instanceof RegExp) {
      return {
        "pact:matcher:type": "regex",
        regex: pattern.source,
        value: str,
      }
    }
    return {
      "pact:matcher:type": "regex",
      regex: pattern,
      value: str,
    }
  }

  /**
   * Value that must be equal to the example. This is mainly used to reset the matching rules which cascade.
   * @param value Example value
   */
  export function equal(value: any): Matcher {
    return {
      "pact:matcher:type": "equality",
      value,
    }
  }

  interface DateTimeMatcher extends Matcher {
    format: string
  }

  /**
   * String value that must match the provided datetime format string.
   * @param format Datetime format string. See [Java SimpleDateFormat](https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html)
   * @param example Example value to use. If omitted a value using the current system date and time will be generated.
   */
  export function timestamp(format: string, example?: string): DateTimeMatcher {
    return datetime(format, example)
  }

  /**
   * String value that must match the provided datetime format string.
   * @param format Datetime format string. See [Java SimpleDateFormat](https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html)
   * @param example Example value to use. If omitted a value using the current system date and time will be generated.
   */
  export function datetime(format: string, example?: string): DateTimeMatcher {
    return {
      "pact:generator:type": "DateTime",
      "pact:matcher:type": "timestamp",
      format,
      value: example || PactNative.generate_datetime_string(format),
    }
  }

  /**
   * String value that must match the provided time format string.
   * @param format Time format string. See [Java SimpleDateFormat](https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html)
   * @param example Example value to use. If omitted a value using the current system time will be generated.
   */
  export function time(format: string, example?: string): DateTimeMatcher {
    return {
      "pact:generator:type": "Time",
      "pact:matcher:type": "time",
      format,
      value: example || PactNative.generate_datetime_string(format),
    }
  }

  /**
   * String value that must match the provided date format string.
   * @param format Date format string. See [Java SimpleDateFormat](https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html)
   * @param example Example value to use. If omitted a value using the current system date will be generated.
   */
  export function date(format: any, example?: string): DateTimeMatcher {
    return {
      format,
      "pact:generator:type": "Date",
      "pact:matcher:type": "date",
      value: example || PactNative.generate_datetime_string(format),
    }
  }

  /**
   * Value that must include the example value as a substring.
   * @param value String value to include
   */
  export function includes(value: string): Matcher {
    return {
      "pact:matcher:type": "include",
      value,
    }
  }

  /**
   * Value that must be null. This will only match the JSON Null value. For other content types, it will
   * match if the attribute is missing.
   */
  export function nullValue(): Matcher {
    return {
      "pact:matcher:type": "null",
    }
  }

  /**
   * Matches a URL composed of a list of path fragments. The base URL from the mock server will be used.
   * @param pathFragments list of path fragments, can be regular expressions
   */
  export function url(
    pathFragments: Array<string | RegexMatcher | RegExp>
  ): RegexMatcher {
    return url2(null, pathFragments)
  }

  /**
   * Matches a URL composed of a base path and a list of path fragments
   * @param basePath Base path of the URL. If null, will use the base URL from the mock server.
   * @param pathFragments list of path fragments, can be regular expressions
   */
  export function url2(
    basePath: string | null,
    pathFragments: Array<string | RegexMatcher | RegExp>
  ): RegexMatcher {
    let regex = ".*("
    let example = basePath || "http://localhost:8080"
    for (let p of pathFragments) {
      if (p instanceof RegExp) {
        regex += "\\/" + p.source
        example += "/" + PactNative.generate_regex_string(p.source)
      } else if (p instanceof Object && p["pact:matcher:type"] == "regex") {
        regex += "\\/" + p["regex"]
        example += "/" + p["value"]
      } else {
        regex += "\\/" + p.toString()
        example += "/" + p.toString()
      }
    }

    // Temporary fix for inconsistancies between matchers and generators. Matchers use "value" attribute for
    // example values, while generators use "example"
    if (basePath == null) {
      return {
        "pact:matcher:type": "regex",
        "pact:generator:type": "MockServerURL",
        regex: regex + ")$",
        value: example,
        example,
      }
    } else {
      return {
        "pact:matcher:type": "regex",
        regex: regex + ")$",
        value: example,
      }
    }
  }

  interface ArrayContainsMatcher extends Matcher {
    variants: any[]
  }

  /**
   * Matches the items in an array against a number of variants. Matching is successful if each variant
   * occurs once in the array. Variants may be objects containing matching rules.
   */
  export function arrayContaining(...variants: any[]): ArrayContainsMatcher {
    return {
      "pact:matcher:type": "arrayContains",
      variants,
    }
  }

  interface ProviderStateInjectedValue extends Matcher {
    expression: string
  }

  /**
   * Marks a item as to be injected from the provider state
   * @param expression Expression to lookup in the provider state context
   * @param exampleValue Example value to use in the consumer test
   */
  export function fromProviderState(
    expression: string,
    exampleValue: string
  ): ProviderStateInjectedValue {
    return {
      "pact:matcher:type": "type",
      "pact:generator:type": "ProviderState",
      expression,
      value: exampleValue,
    }
  }

  /**
   * Match a universally unique identifier (UUID). Random values will be used for examples if no example is given.
   */
  export function uuid(example?: string): RegexMatcher {
    const regexStr =
      "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
    if (example) {
      const regex = new RegExp("^" + regexStr + "$")
      if (!example.match(regex)) {
        throw new Error(
          `regex: Example value '${example}' does not match the UUID regular expression '${regexStr}'`
        )
      }
      return {
        "pact:matcher:type": "regex",
        regex: regexStr,
        value: example,
      }
    } else {
      return {
        "pact:matcher:type": "regex",
        regex: regexStr,
        "pact:generator:type": "Uuid",
        value: "e2490de5-5bd3-43d5-b7c4-526e33f71304",
      }
    }
  }
}
