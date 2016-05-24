'use strict'

import verifier from './verifier'
import { term, eachLike, somethingLike } from './matcher'

module.exports = {
  Verifier: verifier,
  Matcher: { term, eachLike, somethingLike }
}
