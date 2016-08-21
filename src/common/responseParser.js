'use strict'

function getResponseText (response) {
  if (typeof response === 'string') {
    return response
  }
  return response.text || response.responseText || ''
}

function processResponse (response) {
  let responseText = getResponseText(response)
  if (responseText.indexOf('interaction_diffs') > -1) {
    return { action: 'reject', content: responseText }
  }

  return { action: 'resolve', content: responseText }
}

module.exports.parse = (response) => {
  if (Array.isArray(response)) {
    let processedResponses = response.map(processResponse)
    let erroredResponses = processedResponses
      .filter((r) => r.action === 'reject')
      .map((r) => r.content)

    if (erroredResponses.length) {
      return Promise.reject(erroredResponses)
    } else {
      return Promise.resolve(processedResponses.map((r) => r.content))
    }
  } else {
    let result = processResponse(response)
    return Promise[result.action](result.content)
  }
}
