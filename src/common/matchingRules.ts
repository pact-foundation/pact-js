import { Rules, Rule, Matcher } from '../v3/types';

/**
 * Converts a matcher to the FFI format expected by pact-core
 * @param matcher The matcher to convert
 * @returns The matcher in FFI format
 */
export const convertMatcherToFFI = (
  matcher: Matcher<unknown>
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  if (matcher['pact:matcher:type']) {
    result.match = matcher['pact:matcher:type'];
  }

  Object.keys(matcher).forEach((key) => {
    if (
      key !== 'pact:matcher:type' &&
      key !== 'pact:generator:type' &&
      key !== 'value'
    ) {
      result[key] = matcher[key as keyof Matcher<unknown>];
    }
  });

  return result;
};

/**
 * Validates that the rules parameter is of type Rules
 * @param rules The rules to validate
 * @throws Error if rules is not a valid Rules object
 */
export const validateRules = (rules: Rules): void => {
  if (!rules || typeof rules !== 'object' || Array.isArray(rules)) {
    throw new Error('rules must be an object');
  }

  const validParts = ['path', 'body', 'header', 'query', 'status'];
  const ruleKeys = Object.keys(rules);

  ruleKeys.forEach((key) => {
    if (!validParts.includes(key)) {
      throw new Error(
        `Invalid part "${key}" in rules. Valid parts are: ${validParts.join(', ')}`
      );
    }

    const partRules = (rules as Record<string, unknown>)[key];
    if (!partRules) return;

    const rulesArray = Array.isArray(partRules) ? partRules : [partRules];
    rulesArray.forEach((rule: unknown, index: number) => {
      if (!rule || typeof rule !== 'object') {
        throw new Error(`Rule at ${key}[${index}] must be an object`);
      }

      const ruleObj = rule as Record<string, unknown>;
      if (!('rule' in ruleObj) || !Array.isArray(ruleObj.rule)) {
        throw new Error(
          `Rule at ${key}[${index}] must have a "rule" property that is an array`
        );
      }

      if ('path' in ruleObj && typeof ruleObj.path !== 'string') {
        throw new Error(
          `Rule at ${key}[${index}] has a "path" property that is not a string`
        );
      }
    });
  });
};

/**
 * Converts Rules format to FFI matching rules format
 * @param rules Rules in the user-friendly format
 * @returns Rules in FFI format
 */
export const convertRulesToFFI = (rules: Rules): Record<string, unknown> => {
  const ffiRules: Record<
    string,
    Record<string, { matchers: Record<string, unknown>[] }>
  > = {};

  Object.keys(rules).forEach((part) => {
    const partRules = rules[part as keyof Rules];
    if (!partRules) return;

    const rulesArray = Array.isArray(partRules) ? partRules : [partRules];
    ffiRules[part] = {};

    rulesArray.forEach((rule: Rule) => {
      if (rule.path) {
        ffiRules[part][rule.path] = {
          matchers: rule.rule.map(convertMatcherToFFI),
        };
      }
    });
  });

  return ffiRules;
};
