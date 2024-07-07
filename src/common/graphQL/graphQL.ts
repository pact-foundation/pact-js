import { ASTNode, print } from 'graphql';
import gql from 'graphql-tag';
import { GraphQLQueryError } from './graphQLQueryError';
import { ConfigurationError } from './configurationError';
import { OperationType } from './types';

export interface GraphQLVariables {
  [name: string]: unknown;
}

/**
 * Accepts a raw or pre-parsed query, validating in the former case, and
 * returns a normalized raw query.
 * @param query {string|ASTNode} the query to validate
 * @param type the operation type
 */
export function validateQuery(
  query: string | ASTNode,
  type: OperationType
): string {
  if (!query) {
    throw new ConfigurationError(`You must provide a GraphQL ${type}.`);
  }

  if (typeof query !== 'string') {
    if (query?.kind === 'Document') {
      // Already parsed, store in string form
      return print(query);
    }
    throw new ConfigurationError(
      'You must provide a either a string or parsed GraphQL.'
    );
  } else {
    // String, so validate it
    try {
      gql(query);
    } catch (e) {
      throw new GraphQLQueryError(`GraphQL ${type} is invalid: ${e.message}`);
    }

    return query;
  }
}

export const escapeSpace = (s: string): string => s.replace(/\s+/g, '\\s*');

export const escapeRegexChars = (s: string): string =>
  s.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');

export const escapeGraphQlQuery = (s: string): string =>
  escapeSpace(escapeRegexChars(s));
