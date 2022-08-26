const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const {
  PactV3,
  MatchersV3,
  XmlBuilder,
  SpecificationVersion,
} = require('@pact-foundation/pact');
const LOG_LEVEL = process.env.LOG_LEVEL || 'TRACE';

chai.use(chaiAsPromised);

describe('Pact V3', () => {
  // Alias flexible matchers for simplicity
  const {
    eachLike,
    atLeastLike,
    integer,
    datetime,
    boolean,
    string,
    regex,
    like,
    eachKeyLike,
  } = MatchersV3;

  // Animal we want to match :)
  const suitor = {
    id: 2,
    available_from: '2017-12-04T14:47:18.582Z',
    first_name: 'Nanny',
    animal: 'goat',
    last_name: 'Doe',
    age: 27,
    gender: 'F',
    location: {
      description: 'Werribee Zoo',
      country: 'Australia',
      post_code: 3000,
    },
    eligibility: {
      available: true,
      previously_married: true,
    },
    interests: ['walks in the garden/meadow', 'parkour'],
  };

  const MIN_ANIMALS = 2;

  // Define animal payload, with flexible matchers
  //
  // This makes the test much more resilient to changes in actual data.
  // Here we specify the 'shape' of the object that we care about.
  // It is also import here to not put in expectations for parts of the
  // API we don't care about
  const animalBodyExpectation = {
    id: integer(1),
    available_from: datetime(
      "yyyy-MM-dd'T'HH:mm:ss.SSSX",
      '2016-02-11T09:46:56.023Z'
    ),
    first_name: string('Billy'),
    last_name: string('Goat'),
    animal: string('goat'),
    age: integer(21),
    gender: regex('F|M', 'M'),
    location: {
      description: string('Melbourne Zoo'),
      country: string('Australia'),
      post_code: integer(3000),
    },
    eligibility: {
      available: boolean(true),
      previously_married: boolean(false),
    },
    interests: eachLike('walks in the garden/meadow'),
    // This does not when verifying on the provider
    // reproducing issue https://github.com/pact-foundation/pact-js/issues/662
    identifiers: eachKeyLike('004', {
      id: regex('[0-9]+', '004'),
      description: like('thing'),
    }),
  };

  // Define animal list payload, reusing existing object matcher
  const animalListExpectation = atLeastLike(animalBodyExpectation, MIN_ANIMALS);

  // Configure and import consumer API
  // Note that we update the API endpoint to point at the Mock Service
  const {
    createMateForDates,
    suggestion,
    getAnimalById,
    getAnimalsAsXML,
    availableAnimals,
  } = require('../consumer');

  const provider = new PactV3({
    consumer: 'Matching Service V3',
    provider: 'Animal Profile Service V3',
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: SpecificationVersion.SPECIFICATION_VERSION_V3,
    logLevel: LOG_LEVEL,
    cors: true,
  });

  // Verify service client works as expected.
  //
  // Note that we don't call the consumer API endpoints directly, but
  // use unit-style tests that test the collaborating function behaviour -
  // we want to test the function that is calling the external service.
  describe('when a call to list all animals from the Animal Service is made', () => {
    describe('and the user is not authenticated', () => {
      before(() =>
        provider
          .given('is not authenticated')
          .uponReceiving('a request for all animals')
          .withRequest({
            method: 'GET',
            path: '/animals/available',
          })
          .willRespondWith({
            status: 401,
          })
      );

      it('returns a 401 unauthorized', () => {
        return provider.executeTest((mockserver) => {
          return expect(
            suggestion(suitor, () => mockserver.url)
          ).to.eventually.be.rejectedWith('Unauthorized');
        });
      });
    });
    describe('and the user is authenticated', () => {
      describe('and there are animals in the database', () => {
        it('returns a list of animals', () => {
          provider
            .given('is authenticated')
            .given('Has some animals')
            .uponReceiving('a request for all animals')
            .withRequest({
              method: 'GET',
              path: '/animals/available',
              headers: {
                Authorization: regex('Bearer\\s[a-z0-9]+', 'Bearer token'),
              },
            })
            .willRespondWith({
              status: 200,
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
              },
              body: animalListExpectation,
            });

          return provider.executeTest((mockserver) => {
            const suggestedMates = suggestion(suitor, () => mockserver.url);
            return Promise.all([
              expect(suggestedMates).to.eventually.have.deep.property(
                'suggestions[0].score',
                94
              ),
              expect(suggestedMates)
                .to.eventually.have.property('suggestions')
                .with.lengthOf(MIN_ANIMALS),
            ]);
          });
        });

        it('returns a filtered list of animals', () => {
          provider
            .given('is authenticated')
            .given('Has some animals')
            .uponReceiving('a request for all animals filtered by query')
            .withRequest({
              method: 'GET',
              path: '/animals/available',
              headers: {
                Authorization: regex('Bearer\\s[a-z0-9]+', 'Bearer token'),
              },
              query: {
                first_name: 'Billy',
              },
            })
            .willRespondWith({
              status: 200,
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
              },
              body: eachLike({
                id: integer(1),
                available_from: datetime(
                  "yyyy-MM-dd'T'HH:mm:ss.SSSX",
                  '2016-02-11T09:46:56.023Z'
                ),
                first_name: string('Billy'),
                last_name: string('Goat'),
                animal: string('goat'),
                age: integer(21),
                gender: regex('F|M', 'M'),
                location: {
                  description: string('Melbourne Zoo'),
                  country: string('Australia'),
                  post_code: integer(3000),
                },
                eligibility: {
                  available: boolean(true),
                  previously_married: boolean(false),
                },
                interests: eachLike('walks in the garden/meadow'),
              }),
            });
          return provider.executeTest((mockserver) => {
            return availableAnimals(() => mockserver.url, {
              first_name: 'Billy',
            }).then((available) => {
              expect(available[0]).to.contain({ first_name: 'Billy' });
              expect(available).to.have.lengthOf(1);
            });
          });
        });
        it('returns a filtered list of animals (query containing chinese characters)', () => {
          provider
            .given('is authenticated')
            .given('Has some animals')
            .uponReceiving(
              'a request for all animals filtered by a query containing chinese characters'
            )
            .withRequest({
              method: 'GET',
              path: '/animals/available',
              headers: {
                Authorization: regex('Bearer\\s[a-z0-9]+', 'Bearer token'),
              },
              query: {
                first_name: '比利',
              },
            })
            .willRespondWith({
              status: 200,
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
              },
              body: eachLike({
                id: integer(1),
                available_from: datetime(
                  "yyyy-MM-dd'T'HH:mm:ss.SSSX",
                  '2016-02-11T09:46:56.023Z'
                ),
                first_name: string('比利'),
                last_name: string('Goat'),
                animal: string('goat'),
                age: integer(21),
                gender: regex('F|M', 'M'),
                location: {
                  description: string('Melbourne Zoo'),
                  country: string('Australia'),
                  post_code: integer(3000),
                },
                eligibility: {
                  available: boolean(true),
                  previously_married: boolean(false),
                },
                interests: eachLike('walks in the garden/meadow'),
              }),
            });
          return provider.executeTest((mockserver) => {
            return availableAnimals(() => mockserver.url, {
              first_name: '比利',
            }).then((available) => {
              expect(available[0]).to.contain({ first_name: '比利' });
              expect(available).to.have.lengthOf(1);
            });
          });
        });
        it('returns a filtered list of animals (query containing devanagari characters)', () => {
          provider
            .given('is authenticated')
            .given('Has some animals')
            .uponReceiving(
              'a request for all animals filtered by a query containing devanagari characters'
            )
            .withRequest({
              method: 'GET',
              path: '/animals/available',
              headers: {
                Authorization: regex('Bearer\\s[a-z0-9]+', 'Bearer token'),
              },
              query: {
                first_name: 'बिल्ली',
              },
            })
            .willRespondWith({
              status: 200,
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
              },
              body: eachLike({
                id: integer(1),
                available_from: datetime(
                  "yyyy-MM-dd'T'HH:mm:ss.SSSX",
                  '2016-02-11T09:46:56.023Z'
                ),
                first_name: string('बिल्ली'),
                last_name: string('Goat'),
                animal: string('goat'),
                age: integer(21),
                gender: regex('F|M', 'M'),
                location: {
                  description: string('Melbourne Zoo'),
                  country: string('Australia'),
                  post_code: integer(3000),
                },
                eligibility: {
                  available: boolean(true),
                  previously_married: boolean(false),
                },
                interests: eachLike('walks in the garden/meadow'),
              }),
            });
          return provider.executeTest((mockserver) => {
            return availableAnimals(() => mockserver.url, {
              first_name: 'बिल्ली',
            }).then((available) => {
              expect(available[0]).to.contain({ first_name: 'बिल्ली' });
              expect(available).to.have.lengthOf(1);
            });
          });
        });
      });
    });
  });

  describe('when a call to the Animal Service is made to retrieve a single animal by ID', () => {
    describe('and there is an animal in the DB with ID 100', () => {
      let responseBody = animalBodyExpectation;
      responseBody.id = 100;

      before(() =>
        provider
          .given('is authenticated')
          .given('Has an animal with ID', {
            id: 100,
          })
          .uponReceiving('a request for an animal with an ID')
          .withRequest({
            method: 'GET',
            path: regex('/animals/[0-9]+', '/animals/100'),
            headers: {
              Authorization: regex('Bearer\\s[a-z0-9]+', 'Bearer token'),
            },
          })
          .willRespondWith({
            status: 200,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
            body: responseBody,
          })
      );

      it('returns the animal', () => {
        return provider.executeTest((mockserver) => {
          const animal = getAnimalById(100, () => mockserver.url);

          return expect(animal).to.eventually.have.deep.property('id', 100);
        });
      });
    });

    describe('and there no animals in the database', () => {
      before(() =>
        provider
          .given('is authenticated')
          .given('Has no animals')
          .uponReceiving('a request for an animal by ID')
          .withRequest({
            method: 'GET',
            path: regex('/animals/[0-9]+', '/animals/100'),
            headers: {
              Authorization: regex('Bearer\\s[a-z0-9]+', 'Bearer token'),
            },
          })
          .willRespondWith({
            status: 404,
          })
      );

      it('returns a 404', () => {
        return provider.executeTest((mockserver) => {
          const animal = getAnimalById(123, () => mockserver.url);

          return expect(animal).to.eventually.be.a('null');
        });
      });
    });
  });

  describe('when a call to the Animal Service is made to retrieve a single animal in text by ID', () => {
    describe('and there is an animal in the DB with ID 100', () => {
      before(() =>
        provider
          .given('is authenticated')
          .given('Has an animal with ID', {
            id: 100,
          })
          .uponReceiving('a request for an animal as text with an ID')
          .withRequest({
            method: 'GET',
            path: regex('/animals/[0-9]+', '/animals/100'),

            headers: {
              Authorization: regex('Bearer\\s[a-z0-9]+', 'Bearer token'),
              Accept: 'text/plain',
            },
          })
          .willRespondWith({
            status: 200,
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
            },
            body: 'id=100;first_name=Nanny;last_name=Doe;animal=goat',
          })
      );

      it('returns the animal', async () => {
        return provider.executeTest(async (mockserver) => {
          const animal = await getAnimalById(
            100,
            () => mockserver.url,
            'text/plain'
          );
          return expect(animal).to.equal(
            'id=100;first_name=Nanny;last_name=Doe;animal=goat'
          );
        });
      });
    });
  });

  describe('when a call to the Animal Service is made to create a new mate', () => {
    before(() =>
      provider
        .given('is authenticated')
        .uponReceiving('a request to create a new mate with JSON data')
        .withRequest({
          method: 'POST',
          path: '/animals',
          body: like(suitor),
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: like(suitor),
        })
    );

    it('creates a new mate with JSON data', () => {
      return provider.executeTest((mockserver) => {
        return expect(createMateForDates(suitor, () => mockserver.url)).to
          .eventually.be.fulfilled;
      });
    });
  });

  describe('when a call to the Animal Service is made to create a new mate using form-data body', () => {
    before(() =>
      provider
        .given('is authenticated')
        .uponReceiving(
          'a request to create a new mate with x-www-form-urlencoded data'
        )
        .withRequest({
          method: 'POST',
          path: '/animals',
          body: 'first_name=Nanny&last_name=Doe',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          contentType: 'application/x-www-form-urlencoded',
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: like({
            id: 1,
            first_name: 'Nanny',
            last_name: 'Doe',
          }),
        })
    );

    it('creates a new mate with application/x-www-form-urlencoded data', () => {
      return provider.executeTest((mockserver) => {
        return expect(
          createMateForDates(
            'first_name=Nanny&last_name=Doe',
            () => mockserver.url,
            'application/x-www-form-urlencoded'
          )
        ).to.eventually.be.fulfilled;
      });
    });
  });

  describe('when a call to the Animal Service is made to get animals in XML format', () => {
    before(() =>
      provider
        .given('is authenticated')
        .given('Has some animals')
        .uponReceiving('a request to get animals as XML')
        .withRequest({
          method: 'GET',
          path: '/animals/available/xml',
          headers: {
            Authorization: regex('Bearer\\s[a-z0-9]+', 'Bearer token'),
          },
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
          },
          body: new XmlBuilder('1.0', 'UTF-8', 'animals').build((el) => {
            el.eachLike('lion', {
              id: integer(1),
              available_from: datetime(
                "yyyy-MM-dd'T'HH:mm:ss.SSSX",
                '2016-02-11T09:46:56.023Z'
              ),
              first_name: string('Slinky'),
              last_name: string('Malinky'),
              age: integer(27),
              gender: regex('M|F', 'F'),
            });
            el.eachLike('goat', {
              id: integer(3),
              available_from: datetime(
                "yyyy-MM-dd'T'HH:mm:ss.SSSX",
                '2016-02-11T09:46:56.023Z'
              ),
              first_name: string('Head'),
              last_name: string('Butts'),
              age: integer(27),
              gender: regex('M|F', 'F'),
            });
          }),
        })
    );

    it('gets animals in XML format', () => {
      return provider.executeTest((mockserver) => {
        return expect(getAnimalsAsXML(() => mockserver.url)).to.eventually.be
          .fulfilled;
      });
    });
  });
});
