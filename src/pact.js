'use strict'

import verifier from './dsl/verifier'
import Interceptor from './interceptor'
import { term, eachLike, somethingLike } from './dsl/matcher'

module.exports = {
  Verifier: verifier,
  Matcher: { term, eachLike, somethingLike },
  Interceptor: Interceptor
}
