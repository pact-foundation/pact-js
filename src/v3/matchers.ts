import { isNil, pickBy, times } from 'ramda';
import RandExp from 'randexp';

import {
  ArrayContainsMatcher,
  DateTimeMatcher,
  Matcher,
  MaxLikeMatcher,
  MinLikeMatcher,
  ProviderStateInjectedValue,
  RulesMatcher,
  V3RegexMatcher,
} from './types';

import { AnyJson, JsonMap } from '../common/jsonTypes';

export * from './types';

export function isMatcher(x: unknown): x is Matcher<unknown> {
  return (
    x != null &&
    (x as Matcher<unknown>)['pact:matcher:type'] !== undefined &&
    (x as Matcher<unknown>).value !== undefined
  );
}

/**
 * Value must match the given template
 * @param template Template to base the comparison on
 */
export const like = <T>(template: T): Matcher<T> => ({
  'pact:matcher:type': 'type',
  value: template,
});

/**
 * Object where the key itself is ignored, but the value template must match.
 *
 * @deprecated use eachKeyMatches or eachValueMatches
 * @param keyTemplate Example key to use
 * @param template Example value template to base the comparison on
 */
export const eachKeyLike = <T>(
  keyTemplate: string,
  template: T
): Matcher<T> => ({
  'pact:matcher:type': 'values',
  value: {
    [keyTemplate]: template,
  },
});

/**
 * Object where the _keys_ must match the supplied matchers.
 * The values for each key are ignored. That is, there can be 0 or more keys
 * with any valid JSON identifier, so long as the names of the keys match the constraints.
 *
 * @param example Example object with key/values e.g. `{ foo: 'bar', baz: 'qux'}`
 * @param matchers Matchers to apply to each key
 */
export const eachKeyMatches = (
  example: Record<string, unknown>,
  matchers: Matcher<string> | Matcher<string>[] = like('key')
): RulesMatcher<unknown> => ({
  'pact:matcher:type': 'eachKey',
  rules: Array.isArray(matchers) ? matchers : [matchers],
  value: example,
});

/**
 * Object where the _values_ must match the supplied matchers.
 * The names of the keys are ignored. That is, there can be 0 or more keys
 * with any valid JSON identifier, so long as the values match the constraints.
 *
 * @param example Example object with key/values e.g. `{ foo: 'bar', baz: 'qux'}`
 * @param matchers Matchers to apply to each value
 */
export const eachValueMatches = <T>(
  example: Record<string, T>,
  matchers: Matcher<T> | Matcher<T>[]
): RulesMatcher<T> => ({
  'pact:matcher:type': 'eachValue',
  rules: Array.isArray(matchers) ? matchers : [matchers],
  value: example,
  // Unsure if the full object is provided, or just a template k/v pair
  // value: {
  //   [keyTemplate]: template,
  // },
});

/**
 * Array where each element must match the given template
 * @param template Template to base the comparison on
 * @param min Minimum number of elements required in the array
 */
export const eachLike = <T>(template: T, min = 1): MinLikeMatcher<T[]> => {
  const elements = min;
  return {
    min,
    'pact:matcher:type': 'type',
    value: times(() => template, elements),
  };
};

/**
 * An array that has to have at least one element and each element must match the given template
 * @param template Template to base the comparison on
 * @param count Number of examples to generate, defaults to one
 */
export const atLeastOneLike = <T>(
  template: T,
  count = 1
): MinLikeMatcher<T[]> => ({
  min: 1,
  'pact:matcher:type': 'type',
  value: times(() => template, count),
});

/**
 * An array that has to have at least the required number of elements and each element must match the given template
 * @param template Template to base the comparison on
 * @param min Minimum number of elements required in the array
 * @param count Number of examples to generate, defaults to min
 */
export const atLeastLike = <T>(
  template: T,
  min: number,
  count?: number
): MinLikeMatcher<T[]> => {
  const elements = count || min;
  if (count && count < min) {
    throw new Error(
      `atLeastLike has a minimum of ${min} but ${count} elements were requested.` +
        ` Make sure the count is greater than or equal to the min.`
    );
  }

  return {
    min,
    'pact:matcher:type': 'type',
    value: times(() => template, elements),
  };
};

/**
 * An array that has to have at most the required number of elements and each element must match the given template
 * @param template Template to base the comparison on
 * @param max Maximum number of elements required in the array
 * @param count Number of examples to generate, defaults to one
 */
export const atMostLike = <T>(
  template: T,
  max: number,
  count?: number
): MaxLikeMatcher<T[]> => {
  const elements = count || 1;
  if (count && count > max) {
    throw new Error(
      `atMostLike has a maximum of ${max} but ${count} elements where requested.` +
        ` Make sure the count is less than or equal to the max.`
    );
  }

  return {
    max,
    'pact:matcher:type': 'type',
    value: times(() => template, elements),
  };
};

/**
 * An array whose size is constrained to the minimum and maximum number of elements and each element must match the given template
 * @param template Template to base the comparison on
 * @param min Minimum number of elements required in the array
 * @param max Maximum number of elements required in the array
 * @param count Number of examples to generate, defaults to one
 */
export const constrainedArrayLike = <T>(
  template: T,
  min: number,
  max: number,
  count?: number
): MinLikeMatcher<T[]> & MaxLikeMatcher<T[]> => {
  const elements = count || min;
  if (count) {
    if (count < min) {
      throw new Error(
        `constrainedArrayLike has a minimum of ${min} but ${count} elements where requested.` +
          ` Make sure the count is greater than or equal to the min.`
      );
    } else if (count > max) {
      throw new Error(
        `constrainedArrayLike has a maximum of ${max} but ${count} elements where requested.` +
          ` Make sure the count is less than or equal to the max.`
      );
    }
  }

  return {
    min,
    max,
    'pact:matcher:type': 'type',
    value: times(() => template, elements),
  };
};

/**
 * Value must be a boolean
 * @param b Boolean example value. Defaults to true if unsupplied
 */
export const boolean = (b = true): Matcher<boolean> => ({
  'pact:matcher:type': 'type',
  value: b,
});

/**
 * Value must be an integer (must be a number and have no decimal places)
 * @param int Example value. If omitted a random value will be generated.
 */
export const integer = (int?: number): Matcher<number> => {
  if (Number.isInteger(int)) {
    return {
      'pact:matcher:type': 'integer',
      value: int,
    };
  }
  if (int) {
    throw new Error(
      `The integer matcher was passed '${int}' which is not an integer.`
    );
  }

  return {
    'pact:generator:type': 'RandomInt',
    'pact:matcher:type': 'integer',
    value: 101,
  };
};

/**
 * Value must be a decimal number (must be a number and have decimal places)
 * @param num Example value. If omitted a random value will be generated.
 */
export const decimal = (num?: number): Matcher<number> => {
  if (Number.isFinite(num)) {
    return {
      'pact:matcher:type': 'decimal',
      value: num,
    };
  }
  if (num) {
    throw new Error(
      `The decimal matcher was passed '${num}' which is not a number.`
    );
  }
  return {
    'pact:generator:type': 'RandomDecimal',
    'pact:matcher:type': 'decimal',
    value: 12.34,
  };
};

/**
 * Value must be a number
 * @param num Example value. If omitted a random integer value will be generated.
 */
export function number(num?: number): Matcher<number> {
  if (typeof num === 'number') {
    return {
      'pact:matcher:type': 'number',
      value: num,
    };
  }
  if (num) {
    throw new Error(
      `The number matcher was passed '${num}' which is not a number.`
    );
  }
  return {
    'pact:generator:type': 'RandomInt',
    'pact:matcher:type': 'number',
    value: 1234,
  };
}

/**
 * Value must be a string
 * @param str Example value
 */
export function string(str = 'some string'): Matcher<string> {
  return {
    'pact:matcher:type': 'type',
    value: str,
  };
}

/**
 * Value that must match the given regular expression
 * @param pattern Regular Expression to match
 * @param str Example value
 */
export function regex(pattern: RegExp | string, str: string): V3RegexMatcher {
  if (pattern instanceof RegExp) {
    return {
      'pact:matcher:type': 'regex',
      regex: pattern.source,
      value: str,
    };
  }
  return {
    'pact:matcher:type': 'regex',
    regex: pattern,
    value: str,
  };
}

/**
 * Value that must be equal to the example. This is mainly used to reset the matching rules which cascade.
 * @param value Example value
 */
export const equal = <T>(value: T): Matcher<T> => ({
  'pact:matcher:type': 'equality',
  value,
});

/**
 * String value that must match the provided datetime format string.
 * @param format Datetime format string. See [Java SimpleDateFormat](https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html)
 * @param example Example value to use. If omitted a value using the current system date and time will be generated.
 */
export function datetime(format: string, example: string): DateTimeMatcher {
  if (!example) {
    throw new Error(`you must provide an example datetime`);
  }

  return pickBy((v) => !isNil(v), {
    'pact:generator:type': example ? undefined : 'DateTime',
    'pact:matcher:type': 'timestamp',
    format,
    value: example,
  });
}

/**
 * String value that must match the provided datetime format string.
 * @param format Datetime format string. See [Java SimpleDateFormat](https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html)
 * @param example Example value to use. If omitted a value using the current system date and time will be generated.
 */
export function timestamp(format: string, example: string): DateTimeMatcher {
  if (!example) {
    throw new Error(`you must provide an example timestamp`);
  }
  return datetime(format, example);
}

/**
 * String value that must match the provided time format string.
 * @param format Time format string. See [Java SimpleDateFormat](https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html)
 * @param example Example value to use. If omitted a value using the current system time will be generated.
 */
export function time(format: string, example: string): DateTimeMatcher {
  if (!example) {
    throw new Error(`you must provide an example time`);
  }
  return {
    'pact:generator:type': 'Time',
    'pact:matcher:type': 'time',
    format,
    value: example,
  };
}

/**
 * String value that must match the provided date format string.
 * @param format Date format string. See [Java SimpleDateFormat](https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html)
 * @param example Example value to use. If omitted a value using the current system date will be generated.
 */
export function date(format: string, example: string): DateTimeMatcher {
  if (!example) {
    throw new Error(`you must provide an example date`);
  }
  return {
    format,
    'pact:generator:type': 'Date',
    'pact:matcher:type': 'date',
    value: example,
  };
}

/**
 * Value that must include the example value as a substring.
 * @param value String value to include
 */
export function includes(value: string): Matcher<string> {
  return {
    'pact:matcher:type': 'include',
    value,
  };
}

/**
 * Value that must be null. This will only match the JSON Null value. For other content types, it will
 * match if the attribute is missing.
 */
export function nullValue(): Matcher<null> {
  return {
    'pact:matcher:type': 'null',
    value: null,
  };
}

function stringFromRegex(r: RegExp): string {
  return new RandExp(r).gen();
}

/**
 * Matches a URL composed of a base path and a list of path fragments
 * @param basePath Base path of the URL. If null, will use the base URL from the mock server.
 * @param pathFragments list of path fragments, can be regular expressions
 */
export function url2(
  basePath: string | null,
  pathFragments: Array<string | V3RegexMatcher | RegExp>
): V3RegexMatcher {
  const regexpr = [
    '.*(',
    ...pathFragments.map((p) => {
      if (p instanceof RegExp) {
        return `\\/${p.source}`;
      }
      if (p instanceof Object && p['pact:matcher:type'] === 'regex') {
        return `\\/${p.regex}`;
      }
      return `\\/${p.toString()}`;
    }),
  ].join('');

  const example = [
    basePath || 'http://localhost:8080',
    ...pathFragments.map((p) => {
      if (p instanceof RegExp) {
        return `/${stringFromRegex(p)}`;
      }
      if (p instanceof Object && p['pact:matcher:type'] === 'regex') {
        return `/${p.value}`;
      }
      return `/${p.toString()}`;
    }),
  ].join('');

  // Temporary fix for inconsistancies between matchers and generators. Matchers use "value" attribute for
  // example values, while generators use "example"
  if (basePath == null) {
    return {
      'pact:matcher:type': 'regex',
      'pact:generator:type': 'MockServerURL',
      regex: `${regexpr})$`,
      value: example,
      example,
    };
  }
  return {
    'pact:matcher:type': 'regex',
    regex: `${regexpr})$`,
    value: example,
  };
}

/**
 * Matches a URL composed of a list of path fragments. The base URL from the mock server will be used.
 * @param pathFragments list of path fragments, can be regular expressions
 */
export function url(
  pathFragments: Array<string | V3RegexMatcher | RegExp>
): V3RegexMatcher {
  return url2(null, pathFragments);
}

/**
 * Matches the items in an array against a number of variants. Matching is successful if each variant
 * occurs once in the array. Variants may be objects containing matching rules.
 */
export function arrayContaining(...variants: unknown[]): ArrayContainsMatcher {
  return {
    'pact:matcher:type': 'arrayContains',
    variants,
  };
}

/**
 * Marks an item to be injected from the provider state
 * @param expression Expression to lookup in the provider state context
 * @param exampleValue Example value to use in the consumer test
 */
export function fromProviderState<V>(
  expression: string,
  exampleValue: V
): ProviderStateInjectedValue<V> {
  return {
    'pact:matcher:type': 'type',
    'pact:generator:type': 'ProviderState',
    expression,
    value: exampleValue,
  };
}

/**
 * Match a universally unique identifier (UUID). Random values will be used for examples if no example is given.
 */
export function uuid(example?: string): V3RegexMatcher {
  const regexStr =
    '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
  if (example) {
    const regexpr = new RegExp(`^${regexStr}$`);
    if (!example.match(regexpr)) {
      throw new Error(
        `regex: Example value '${example}' does not match the UUID regular expression '${regexStr}'`
      );
    }
    return {
      'pact:matcher:type': 'regex',
      regex: regexStr,
      value: example,
    };
  }
  return {
    'pact:matcher:type': 'regex',
    regex: regexStr,
    'pact:generator:type': 'Uuid',
    value: 'e2490de5-5bd3-43d5-b7c4-526e33f71304',
  };
}

export const matcherValueOrString = (obj: unknown): string => {
  if (typeof obj === 'string') return obj;

  return JSON.stringify(obj);
};

/**
 * Recurse the object removing any underlying matching guff, returning the raw
 * example content.
 */
export function reify(input: unknown): AnyJson {
  if (isMatcher(input)) {
    return reify(input.value);
  }

  if (Array.isArray(input)) {
    return input.map(reify);
  }

  if (typeof input === 'object') {
    if (input === null) {
      return input;
    }
    return Object.keys(input).reduce(
      (acc: JsonMap, propName: keyof typeof input) => ({
        ...acc,
        [propName]: reify(input[propName]),
      }),
      {}
    );
  }

  if (
    typeof input === 'number' ||
    typeof input === 'string' ||
    typeof input === 'boolean'
  ) {
    return input;
  }
  throw new Error(
    `Unable to strip matcher from a '${typeof input}', as it is not valid in a Pact description`
  );
}

export { reify as extractPayload };
