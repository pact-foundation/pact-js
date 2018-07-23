const path = require('path')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const expect = chai.expect
const { Pact, Matchers } = require('../../../dist/pact');
const MOCK_SERVER_PORT = 1234
const LOG_LEVEL = process.env.LOG_LEVEL || 'WARN'

chai.use(chaiAsPromised)

describe('Pact', () => {
  const provider = new Pact({
    consumer: 'Matching Service',
    provider: 'Animal Profile Service',
    port: MOCK_SERVER_PORT,
    log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: LOG_LEVEL,
    spec: 2
  })

  // Alias flexible matchers for simplicity
  const { eachLike, like, term, iso8601DateTimeWithMillis } = Matchers;

  // Animal we want to match :)
  const suitor = {
    'id': 2,
    'available_from': '2017-12-04T14:47:18.582Z',
    'first_name': 'Nanny',
    'animal': 'goat',
    'last_name': 'Doe',
    'age': 27,
    'gender': 'F',
    'location': {
      'description': 'Werribee Zoo',
      'country': 'Australia',
      'post_code': 3000
    },
    'eligibility': {
      'available': true,
      'previously_married': true
    },
    'interests': [
      'walks in the garden/meadow',
      'parkour'
    ]
  }

  const MIN_ANIMALS = 2

  // Define animal payload, with flexible matchers
  //
  // This makes the test much more resilient to changes in actual data.
  // Here we specify the 'shape' of the object that we care about.
  // It is also import here to not put in expectations for parts of the
  // API we don't care about
  const animalBodyExpectation = {
    'id': like(1),
    'available_from': iso8601DateTimeWithMillis(),
    'first_name': like('Billy'),
    'last_name': like('Goat'),
    'animal': like('goat'),
    'age': like(21),
    'gender': term({
      matcher: 'F|M',
      generate: 'M'
    }),
    'location': {
      'description': like('Melbourne Zoo'),
      'country': like('Australia'),
      'post_code': like(3000)
    },
    'eligibility': {
      'available': like(true),
      'previously_married': like(false)
    },
    'interests': eachLike('walks in the garden/meadow')
  }

  // Define animal list payload, reusing existing object matcher
  const animalListExpectation = eachLike(animalBodyExpectation, {
    min: MIN_ANIMALS
  })

  // Setup a Mock Server before unit tests run.
  // This server acts as a Test Double for the real Provider API.
  // We then call addInteraction() for each test to configure the Mock Service
  // to act like the Provider
  // It also sets up expectations for what requests are to come, and will fail
  // if the calls are not seen.
  before(() => provider.setup())

  // After each individual test (one or more interactions)
  // we validate that the correct request came through.
  // This ensures what we _expect_ from the provider, is actually
  // what we've asked for (and is what gets captured in the contract)
  afterEach(() => provider.verify())

  // Configure and import consumer API
  // Note that we update the API endpoint to point at the Mock Service
  process.env.API_HOST = `http://localhost:${MOCK_SERVER_PORT}`
  const {
    createMateForDates,
    suggestion,
    getAnimalById
  } = require('../consumer')

  // Verify service client works as expected.
  //
  // Note that we don't call the consumer API endpoints directly, but
  // use unit-style tests that test the collaborating function behaviour -
  // we want to test the function that is calling the external service.
  describe('when a call to list all animals from the Animal Service is made', () => {
    describe('and there are animals in the database', () => {
      before(() =>
        provider.addInteraction({
          state: 'Has some animals',
          uponReceiving: 'a request for all animals',
          withRequest: {
            method: 'GET',
            path: '/animals/available'
          },
          willRespondWith: {
            status: 200,
            headers: {
              'Content-Type': 'application/json; charset=utf-8'
            },
            body: animalListExpectation
          }
        }))

      it('returns a list of animals', done => {
        const suggestedMates = suggestion(suitor)

        expect(suggestedMates).to.eventually.have.deep.property('suggestions[0].score', 94)
        expect(suggestedMates).to.eventually.have.property('suggestions').with.lengthOf(MIN_ANIMALS).notify(done)
      })
    })
  })

  describe('when a call to the Animal Service is made to retreive a single animal by ID', () => {
    describe('and there is an animal in the DB with ID 1', () => {
      before(() => provider.addInteraction({
        state: 'Has an animal with ID 1',
        uponReceiving: 'a request for an animal with ID 1',
        withRequest: {
          method: 'GET',
          path: term({ generate: '/animals/1', matcher: '/animals/[0-9]+' })
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: animalBodyExpectation
        }
      }))

      it('returns the animal', done => {
        const suggestedMates = getAnimalById(11)

        expect(suggestedMates).to.eventually.have.deep.property('id', 1).notify(done)
      })
    })

    describe('and there no animals in the database', () => {
      before(() => provider.addInteraction({
        state: 'Has no animals',
        uponReceiving: 'a request for an animal with ID 100',
        withRequest: {
          method: 'GET',
          path: '/animals/100'
        },
        willRespondWith: {
          status: 404
        }
      }))

      it('returns a 404', done => {
        // uncomment below to test a failed verify
        // const suggestedMates = getAnimalById(123)
        const suggestedMates = getAnimalById(100)

        expect(suggestedMates).to.eventually.be.a('null').notify(done)
      })
    })
  })

  describe('when a call to the Animal Service is made to create a new mate', () => {
    before(() => provider.addInteraction({
      uponReceiving: 'a request to create a new mate',
      withRequest: {
        method: 'POST',
        path: '/animals',
        body: like(suitor),
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: like(suitor)
      }
    }))

    it('should create a new mate', (done) => {
      expect(createMateForDates(suitor)).to.eventually.be.fulfilled.notify(done)
    })
  })

  // Write pact files
  after(() => {
    return provider.finalize()
  })
})
