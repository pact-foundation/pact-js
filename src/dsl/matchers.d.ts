export interface MatcherResult {
  json_class: string;
}

export function term(opts: {generate: string, matcher: string}): {
  json_class: 'Pact::Term',
  data: {
    generate: string,
    matcher: {
      json_class: 'Regexp',
      o: 0,
      s: string,
    },
  },
};

export function eachLike<T>(content: T, opts?: {min: number}): {
  json_class: 'Pact::ArrayLike',
  contents: T,
  min: number,
};

export function somethingLike<T>(value: T): {
  json_class: 'Pact::SomethingLike',
  contents: T,
};
