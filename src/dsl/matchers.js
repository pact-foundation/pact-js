/** @module Matchers */

'use strict'

const isNil = require('lodash.isnil')
const isFunction = require('lodash.isfunction')
const isUndefined = require('lodash.isundefined')

/**
 * The term matcher.
 * @param {Object} opts
 * @param {string} opts.generate - a value to represent the matched String
 * @param {string} opts.matcher - a Regex representing the value
 */
module.exports.term = (opts) => {
  var generate = opts.generate
  var matcher = opts.matcher

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
 * @param {Number} opts.min
 */
module.exports.eachLike = (content, opts) => {
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
module.exports.somethingLike = (value) => {
  if (isNil(value) || isFunction(value)) {
    throw new Error('Error creating a Pact somethingLike Match. Value cannot be a function or undefined')
  }

  return {
    'json_class': 'Pact::SomethingLike',
    'contents': value
  }
}
