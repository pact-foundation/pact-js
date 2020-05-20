import * as R from "ramda"
const PactNative = require("../native")

/**
 * Value must match the given template
 * @param template Template to base the comparison on
 */
export function like(template: any) {
  return {
    "pact:matcher:type": "type",
    value: template,
  }
}

/**
 * Array where each element must match the given template
 * @param template Template to base the comparison on
 */
export function eachLike(template: any) {
  return {
    "pact:matcher:type": "type",
    value: [template],
  }
}

/**
 * An array that has to have at least one element and each element must match the given template
 * @param template Template to base the comparison on
 * @param count Number of examples to generate, defaults to one
 */
export function atLeastOneLike(template: any, count: number = 1) {
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
export function atLeastLike(template: any, min: number, count?: number) {
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
 * An array that has to have at most the required number of elements and each element must match the given template
 * @param template Template to base the comparison on
 * @param max Maximum number of elements required in the array
 * @param count Number of examples to generate, defaults to one
 */
export function atMostLike(template: any, max: number, count?: number) {
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
) {
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
export function boolean(b: boolean) {
  return {
    "pact:matcher:type": "type",
    value: b,
  }
}

/**
 * Value must be an integer (must be a number and have no decimal places)
 * @param int Example value. If omitted a random value will be generated.
 */
export function integer(int?: number) {
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
export function decimal(num?: number) {
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
export function number(num?: number) {
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
export function string(str: string) {
  return {
    "pact:matcher:type": "type",
    value: str,
  }
}

/**
 * Value that must match the given regular expression
 * @param pattern Regular Expression to match
 * @param str Example value
 */
export function regex(pattern: string, str: string) {
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
export function equal(value: any) {
  return {
    "pact:matcher:type": "equality",
    value,
  }
}

/**
 * String value that must match the provided datetime format string.
 * @param format Datetime format string. See [Java SimpleDateFormat](https://docs.oracle.com/javase/8/docs/api/java/text/SimpleDateFormat.html)
 * @param example Example value to use. If omitted a value using the current system date and time will be generated.
 */
export function timestamp(format: string, example?: string) {
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
export function time(format: string, example?: string) {
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
export function date(format: any, example?: string) {
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
export function includes(value: string) {
  return {
    "pact:matcher:type": "include",
    value,
  }
}

/**
 * Value that must be null. This will only match the JSON Null value. For other content types, it will
 * match if the attribute is missing.
 */
export function nullValue() {
  return {
    "pact:matcher:type": "null",
  }
}
