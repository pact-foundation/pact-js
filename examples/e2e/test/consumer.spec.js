const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const pact = require('pact');
const mockservice = require('@pact-foundation/pact-node');
const MOCK_SERVER_PORT = 1234;
const LOG_LEVEL = process.env.LOG_LEVEL || 'WARN';

chai.use(chaiAsPromised);

// Configure and import consumer API
process.env.API_HOST = `http://localhost:${MOCK_SERVER_PORT}`;
const { suggestion, getAnimalById } = require('../consumer');

describe('Pact', () => {
  let provider;

  // Alias flexible matchers for simplicity
  const term = pact.Matchers.term;
  const like = pact.Matchers.somethingLike;
  const eachLike = pact.Matchers.eachLike;

  // Configure mock server
  const mockServer = mockservice.createServer({
    port: MOCK_SERVER_PORT,
    log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2
    // consumer: "MatchingService",
    // provider: "AnimalProfileService"
  });
  mockservice.logLevel(LOG_LEVEL);

  // Animal we want to match :)
  const suitor = {
    'id': 2,
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
  };

  const MIN_ANIMALS = 2;

  // Define animal list payload, with flexible matchers
  const animalBodyExpectation = {
    'id': like(1),
    'first_name': like('Billy'),
    'last_name': like('Goat'),
    'animal': like('goat'),
    'age': like(21),
    'gender': term({ matcher: 'F|M', generate: 'M' }),
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
  };
  const animalListExpectation = eachLike(animalBodyExpectation, { min: MIN_ANIMALS });

  // Start mock server before unit tests
  before(done => {
    mockServer.start()
      .then(() => {
        provider = pact({ consumer: 'Matching Service', provider: 'Animal Profile Service', port: MOCK_SERVER_PORT });

        // Add interactions
        return provider.addInteraction({
          state: 'Has some animals',
          uponReceiving: 'a request for all animals',
          withRequest: {
            method: 'GET',
            path: '/animals/available'
          },
          willRespondWith: {
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: animalListExpectation
          }
        });
      })
      .then(() => {
        return provider.addInteraction({
          state: 'Has no animals',
          uponReceiving: 'a request for an animal with ID 100',
          withRequest: {
            method: 'GET',
            path: '/animals/100'
          },
          willRespondWith: {
            status: 404
          }
        });
      })
      .then(() => {
        return provider.addInteraction({
          state: 'Has an animal with ID 1',
          uponReceiving: 'a request for an animal with ID 1',
          withRequest: {
            method: 'GET',
            path: '/animals/1'
          },
          willRespondWith: {
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: animalBodyExpectation
          }
        });
      })
      .then(() => done())
      .catch(e => {
        console.log('ERROR: ', e);
        done();
      });
  });

  // Verify service client works as expected
  describe('when a call to list all animals from the Animal Service is made', () => {
    describe('and there are animals in the database', () => {
      it('returns a list of animals', done => {
        const suggestedMates = suggestion(suitor);

        expect(suggestedMates).to.eventually.have.deep.property('suggestions[0].score', 94);
        expect(suggestedMates).to.eventually.have.property('suggestions').with.lengthOf(MIN_ANIMALS).notify(done);
      });
    });
  });
  describe('when a call to the Animal Service is made to retreive a single animal by ID', () => {
    describe('and there is an animal in the DB with ID 1', () => {
      it('returns the animal', done => {
        const suggestedMates = getAnimalById(1);

        expect(suggestedMates).to.eventually.have.deep.property('id', 1).notify(done);
        // expect(suggestedMates).to.eventually.have.property('suggestions').with.lengthOf(MIN_ANIMALS).notify(done);
      });
    });
    describe('and there no animals in the database', () => {
      it('returns a 404', done => {
        const suggestedMates = getAnimalById(100);

        expect(suggestedMates).to.eventually.be.a('null').notify(done);
      });
    });
  });

  // Write pact files
  after(() => {
    provider.finalize().then(() => {
      mockservice.removeAllServers();
    });
  });
});
