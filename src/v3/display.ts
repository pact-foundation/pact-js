/* eslint-disable import/first */
import { join, toPairs, map, flatten } from 'ramda';
import {
  Mismatch,
  MatchingResult,
  RequestMismatch,
  MatchingResultRequestNotFound,
  MatchingResultMissingRequest,
} from '@pact-foundation/pact-core/src/consumer/index';

export function displayQuery(query: Record<string, string[]>): string {
  const pairs = toPairs(query);
  const mapped = flatten(
    map(([key, values]) => map((val) => `${key}=${val}`, values), pairs)
  );
  return join('&', mapped);
}

function displayHeaders(
  headers: Record<string, string[]>,
  indent: string
): string {
  return join(
    `\n${indent}`,
    map(([k, v]) => `${k}: ${v}`, toPairs(headers))
  );
}

export function displayRequest(request: RequestMismatch, indent = ''): string {
  const output: string[] = [''];

  output.push(
    `${indent}Method: ${request.method}\n${indent}Path: ${request.path}`
  );

  if (request.query) {
    output.push(`${indent}Query String: ${displayQuery(request.query)}`);
  }

  if (request.headers) {
    output.push(
      `${indent}Headers:\n${indent}  ${displayHeaders(
        request.headers,
        `${indent}  `
      )}`
    );
  }

  if (request.body) {
    const body = JSON.stringify(request.body);
    output.push(
      `${indent}Body: ${body.substr(0, 20)}... (${body.length} length)`
    );
  }

  return output.join('\n');
}

export function filterMissingFeatureFlag(
  mismatches: MatchingResult[]
): MatchingResult[] {
  if (process.env.PACT_EXPERIMENTAL_FEATURE_ALLOW_MISSING_REQUESTS) {
    return mismatches.filter((m) => m.type !== 'request-mismatch');
  }
  return mismatches;
}

export function printMismatch(m: Mismatch): string {
  switch (m.type) {
    case 'MethodMismatch':
      return `Expected ${m.expected}, got: ${m.actual}`;
    default:
      return m.mismatch;
  }
}

export function generateMockServerError(
  mismatches: MatchingResult[],
  indent: string
): string {
  return [
    'Mock server failed with the following mismatches:',
    ...mismatches.map((mismatch, i) => {
      if (mismatch.type === 'request-mismatch') {
        return `\n${indent}${i}) The following request was incorrect: \n
          ${indent}${mismatch.method} ${mismatch.path}
          ${mismatch.mismatches
            ?.map(
              (d, j) =>
                `\n${indent}${indent}${indent} 1.${j} ${printMismatch(d)}`
            )
            .join('')}`;
      }
      if (mismatch.type === 'request-not-found') {
        return `\n${indent}${i}) The following request was not expected: ${displayRequest(
          (mismatch as MatchingResultRequestNotFound).request,
          `${indent}    `
        )}`;
      }
      if (mismatch.type === 'missing-request') {
        return `\n${indent}${i}) The following request was expected but not received: ${displayRequest(
          (mismatch as MatchingResultMissingRequest).request,
          `${indent}    `
        )}`;
      }
      return '';
    }),
  ].join('\n');
}
