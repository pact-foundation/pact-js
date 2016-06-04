'use strict'

import verifier from './dsl/verifier'
import Interceptor from './interceptor'
import { term, eachLike, somethingLike } from './dsl/matcher'

/**
 * Entry point for the Pact library.
 *
 * @module Pact
 * @returns {Object} Pact - returns a {@link Verifier}, a {@link Matcher#term}, a {@link Matcher#eachLike}, a {@link Matcher#somethingLike} and an {@link Interaction}.
 */
module.exports = {
  Verifier: verifier,
  Matcher: { term, eachLike, somethingLike },
  Interceptor: Interceptor
}
