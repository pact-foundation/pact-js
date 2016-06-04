/** @module matcher */
'use strict'

import isNil from 'lodash.isnil'
import isFunction from 'lodash.isfunction'
import isUndefined from 'lodash.isundefined'

/**
 * The term matcher
 * @param {Object} object - should have generate and matcher
 */
export function term ({ generate, matcher }) {
  if (isNil(generate) || isNil(matcher)) {
    throw new Error('Error creating a Pact Term. Please provide an object containing "generate" and "matcher" properties')
  }

  return {
    'json_class': 'Pact::Term',
    'data': {
      'generate': generate,
      'matcher': {
        'json_class': 'Regexp',
        'o': 0,
        's': matcher
      }
    }
  }
}

/**
 * The eachLike matcher
 * @param {string} content
 * @param {Object} opts
 */
export function eachLike (content, opts) {
  if (isUndefined(content)) {
    throw new Error('Error creating a Pact eachLike. Please provide a content argument')
  }

  if (opts && (isNil(opts.min) || opts.min < 1)) {
    throw new Error('Error creating a Pact eachLike. Please provide opts.min that is > 1')
  }

  return {
    'json_class': 'Pact::ArrayLike',
    'contents': content,
    'min': isUndefined(opts) ? 1 : opts.min
  }
}

/**
 * The somethingLike matcher
 * @param {string} value - the value to be somethingLike
 */
export function somethingLike (value) {
  if (isNil(value) || isFunction(value)) {
    throw new Error('Error creating a Pact somethingLike Match. Value cannot be a function or undefined')
  }

  return {
    'json_class': 'Pact::SomethingLike',
    'contents': value
  }
}
