'use strict'

import isNil from 'lodash.isnil'

export function term ({ generate, matcher }) {
  if (isNil(generate) || isNil(matcher)) {
    throw new Error('Error creating a Pact Term. Please provide an object containing \'generate\' and \'matcher\' properties');
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

export function eachLike (content, { min }) {
  if(isNil(content)) {
    throw new Error('Error creating a Pact eachLike. Please provide a content argument');
  }

  if(isNil(min) || min <= 1) {
    throw new Error('Error creating a Pact eachLike. Please provide opts.min that is > 1');
  }

  return {
    'json_class': 'Pact::ArrayLike',
    'contents': content,
    'min': min
  }
}

export function somethingLike (value) {
  if (isNil(value)) {
    throw new Error('Error creating a Pact somethingLike Match. Value cannot be a function or undefined');
  }

  return {
    'json_class': 'Pact::SomethingLike',
    'contents' : value
  }
}
