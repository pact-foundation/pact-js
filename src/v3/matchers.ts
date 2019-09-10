import * as R from "ramda"

export function atLeastOneLike(template: any, count: any) {
  return {
    min: 1,
    "pact:matcher:type": "type",
    value: R.times(() => template, count),
  }
}

export function boolean(b: boolean) {
  return {
    "pact:matcher:type": "type",
    value: b,
  }
}

export function eachLike(template: any) {
  return {
    "pact:matcher:type": "type",
    value: [template],
  }
}

export function integer(int: number) {
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

export function string(str: string) {
  return {
    "pact:matcher:type": "type",
    value: str,
  }
}

export function timestamp(format: any, example: any) {
  return {
    format,
    "pact:generator:type": "DateTime",
    "pact:matcher:type": "timestamp",
    timestamp: format,
    value: example,
  }
}
