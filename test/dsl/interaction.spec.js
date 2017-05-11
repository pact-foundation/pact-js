var expect = require('chai').expect
var Interaction = require('../../src/dsl/interaction')

describe('Interaction', () => {
  describe('#given', () => {
    it('creates Interaction with provider state', () => {
      const actual = new Interaction().given('provider state').json()
      expect(actual).to.eql({ providerState: 'provider state' })
    })

    describe('without provider state', () => {
      it('creates Interaction when undefined', () => {
        const actual = new Interaction().given(undefined).json()
        expect(actual).to.eql({})
      })

      it('creates Interaction when blank', () => {
        const actual = new Interaction().given('').json()
        expect(actual).to.eql({})
      })

      it('creates Interaction when nothing is passed', () => {
        const actual = new Interaction().given().json()
        expect(actual).to.eql({})
      })
    })
  })

  describe('#uponReceiving', () => {
    const interaction = new Interaction()

    it('throws error when no description informed', () => {
      expect(interaction.uponReceiving).to.throw(Error, 'You must provide a description for the interaction.')
    })

    it('has a state with description', () => {
      interaction.uponReceiving('an interaction description')
      expect(interaction.json()).to.eql({ description: 'an interaction description' })
    })
  })

  describe('#withRequest', () => {
    const interaction = new Interaction()

    it('throws error when method is not informed', () => {
      expect(interaction.withRequest.bind(interaction, {})).to.throw(Error, 'You must provide a HTTP method.')
    })

    it('throws error when method is not valid', () => {
      expect(interaction.withRequest.bind(interaction, { method: 'MET' })).to.throw(Error, 'You must provide a valid HTTP method.')
    })

    it('throws error when path is not informed', () => {
      expect(interaction.withRequest.bind(interaction, { method: 'GET' })).to.throw(Error, 'You must provide a path.')
    })

    describe('with only mandatory params', () => {
      const actual = new Interaction().withRequest({ method: 'GET', path: '/search' }).json()

      it('has a state compacted with only present keys', () => {
        expect(actual).to.have.keys('request')
        expect(actual.request).to.have.keys('method', 'path')
      })

      it('request has no other keys', () => {
        expect(actual.request).to.not.have.keys('query', 'headers', 'body')
      })
    })

    describe('with all other parameters', () => {
      const actual = new Interaction().withRequest({
        method: 'GET',
        path: '/search',
        query: 'q=test',
        headers: { 'Content-Type': 'application/json' },
        body: { id: 1, name: 'Test', due: 'tomorrow' }
      }).json()

      it('has a full state all available keys', () => {
        expect(actual).to.have.keys('request')
        expect(actual.request).to.have.keys('method', 'path', 'query', 'headers', 'body')
      })
    })
  })

  describe('#willRespondWith', () => {
    const interaction = new Interaction()

    it('throws error when status is not informed', () => {
      expect(interaction.willRespondWith.bind(interaction, {})).to.throw(Error, 'You must provide a status code.')
    })

    it('throws error when status is blank', () => {
      expect(interaction.willRespondWith.bind(interaction, { status: '' })).to.throw(Error, 'You must provide a status code.')
    })

    describe('with only mandatory params', () => {
      const interaction = new Interaction()
      interaction.willRespondWith({ status: 200 })
      const actual = interaction.json()

      it('has a state compacted with only present keys', () => {
        expect(actual).to.have.keys('response')
        expect(actual.response).to.have.keys('status')
      })

      it('request has no other keys', () => {
        expect(actual.response).to.not.have.keys('headers', 'body')
      })
    })

    describe('with all other parameters', () => {
      const interaction = new Interaction()
      interaction.willRespondWith({
        status: 404,
        headers: { 'Content-Type': 'application/json' },
        body: { id: 1, name: 'Test', due: 'tomorrow' }
      })

      const actual = interaction.json()

      it('has a full state all available keys', () => {
        expect(actual).to.have.keys('response')
        expect(actual.response).to.have.keys('status', 'headers', 'body')
      })
    })
  })
})
