const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const Pact = require('pact');
const mockservice = require('@pact-foundation/pact-node');
const MOCK_SERVER_PORT = 1234;
const LOG_LEVEL = process.env.LOG_LEVEL || 'WARN';

chai.use(chaiAsPromised);

// Configure and import consumer API
process.env.API_HOST = `http://localhost:${MOCK_SERVER_PORT}`;
const { suggestion } = require('../consumer');

describe('Pact', () => {
  let provider;

  // Alias flexible matchers for simplicity
  const term = Pact.Matchers.term;
  const like = Pact.Matchers.somethingLike;
  const eachLike = Pact.Matchers.eachLike;

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

  const suitor = {
    "id": 2,
    "first_name": "Nanny",
    "animal": "goat",
    "last_name": "Doe",
    "age":  27,
    "gender": "F",
    "location": {
      "description": "Werribee Zoo",
      "country": "Australia",
      "post_code": 3000
    },
    "eligibility": {
      "available": true,
      "previously_married": true
    },
    "interests": [
      "walks in the garden/meadow",
      "parkour"
    ]
  };

  // Define animal list payload, with flexible matchers
  const animalListExpectation = eachLike({
    "id": like(1),
    "first_name": like("Billy"),
    "last_name": like("Goat"),
    "animal": like("goat"),
    "age":  like(21),
    "gender": term({matcher: "F|M", generate: "M"}),
    "location": {
      "description": like("Melbourne Zoo"),
      "country": like("Australia"),
      "post_code": like(3000)
    },
    "eligibility": {
      "available": like(true),
      "previously_married": like(false)
    },
    "interests": eachLike("walks in the garden/meadow")
  }, {min: 2});

  before((done) => {

    // Start mock server
    mockServer.start()
    .then(() => {
      provider = Pact({consumer: 'Matching Service', provider: 'Animal Profile Service', port: MOCK_SERVER_PORT});

      // Add interactions
      provider.addInteraction({
        state: 'Has some animals',
        uponReceiving: 'a request for all animals',
        withRequest: {
          method: 'GET',
          path: '/animals/available',
        },
        willRespondWith: {
          status: 200,
          headers: {'Content-Type': 'application/json'},
          body: animalListExpectation
        }
      }).then(() => done());
    })
    .catch(e => {
      console.log("ERROR: ", e);
      done();
    });
  });

  // Verify service client works as expected
  it('returns a list of animals', (done) => {
    const suggestedMates = suggestion(suitor);

    expect(suggestedMates).to.eventually.have.lengthOf(2);
    expect(suggestedMates).to.eventually.be.a('array').notify(done);
  });

  // Write pact files
  after(() => {
    provider.finalize().then(() => {
      mockservice.removeAllServers()
    });
  });
});
