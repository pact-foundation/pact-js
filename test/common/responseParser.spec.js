import { expect } from 'chai'
import request from 'superagent'
import parse from '../../src/common/responseParser'

describe('Response Parser', () => {

  context('when Array of responses', () => {

    it('resolves Promise with successful responses', (done) => {
      let responses = [
        { text: '{ "this": "is", "a": "json response" }' },
        { text: '{ "this": "is", "another": "json response" }' }
      ]
      expect(parse(responses)).to.eventually.eql(responses.map((r) => r.text)).notify(done)
    })

    it('resolves Promise with mixed responses', (done) => {
      let responses = [
        { text: '{ "this": "is", "a": "json response" }' },
        { text: '{ "message": "error", "interaction_diffs": [] }' }
      ]
      expect(parse(responses)).to.eventually.be.rejected.notify(done)
    })

  })

  context('when single response', () => {

    it('resolves Promise with response from node', (done) => {
      let response = { text: '{ "this": "is", "a": "json response" }' }
      expect(parse(response)).to.eventually.eql(response.text).notify(done)
    })

    it('resolves Promise with response from browser', (done) => {
      let response = { responseText: '{ "this": "is", "a": "json response" }' }
      expect(parse(response)).to.eventually.eql(response.responseText).notify(done)
    })

    const bodyArr = [ '', undefined, null ]
    bodyArr.forEach((body) => {
      it(`resolves Promise when body is "${body}"`, (done) => {
        let response = { text: body }
        expect(parse(response)).to.eventually.eql('').notify(done)
      })
    })

    it('rejects Promise when there are "interaction_diffs"', (done) => {
      let response = { responseText: '{ "message": "error", "interaction_diffs": [] }' }
      expect(parse(response)).to.eventually.be.rejected.notify(done)
    })

  })

})
