/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as path from 'path';
import sinonChai from 'sinon-chai';
import {
  Pact,
  Matchers,
  SpecificationVersion,
  LogLevel,
} from '@pact-foundation/pact';

const expect = chai.expect;
import { DogService } from '../src/index';
const { eachLike } = Matchers;

chai.use(sinonChai);
chai.use(chaiAsPromised);
const LOG_LEVEL = process.env.LOG_LEVEL || 'DEBUG';

describe('GET /dogs', () => {
  let dogService: DogService;

  // Create a 'pact' between the two applications in the integration we are testing
  const provider = new Pact({
    dir: path.resolve(process.cwd(), 'pacts'),
    consumer: 'Typescript Consumer Example V4',
    provider: 'Typescript Provider Example',
    spec: SpecificationVersion.SPECIFICATION_VERSION_V4, // Modify this as needed for your use case,
    logLevel: LOG_LEVEL as LogLevel,
  });
  it('returns an HTTP 200 and a list of dogs', async () => {
    const dogExample = { dog: 1 };
    const EXPECTED_BODY = eachLike(dogExample);

    // Arrange: Setup our expected interactions
    //
    // We use Pact to mock out the backend API
    await provider
      .addInteraction()
      .given('I have a list of dogs')
      .uponReceiving('a request for all dogs with the builder pattern')
      .withRequest('GET', '/dogs', (builder) => {
        builder.query({ from: 'today' });
        builder.headers({ Accept: 'application/json' });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        builder.jsonBody(EXPECTED_BODY);
      })
      .executeTest(async (mockserver) => {
        // Act: test our API client behaves correctly
        //
        // Note we configure the DogService API client dynamically to
        // point to the mock service Pact created for us, instead of
        // the real one
        dogService = new DogService({ url: mockserver.url });
        const response = await dogService.getMeDogs('today');

        // Assert: check the result
        expect(response.data[0]).to.deep.eq(dogExample);
        return response;
      });
  });
  it('returns a dog profile', async () => {
    const dogExample = { dog: 1 };
    const EXPECTED_BODY = eachLike(dogExample);
    const EXPECTED_DOG_PROFILE_BODY = Matchers.like({
      id: 1,
      name: 'Fido',
      age: 3,
    });

    // In this test, we make two http calls, in our SUT (System Under Test)
    // we first call GET /dogs to get the list of dogs, then we call
    // GET /dogs/1/profile to get the profile of dog 1
    //
    // We need to setup two interactions in Pact to handle this

    // TODO: This would be more ergonomic, if we could chain adding a new
    // V4UnconfiguredInteraction to a V4InteractionWithResponse
    provider
      .addInteraction()
      .given('I have a list of dogs with {id}', { id: 1 })
      .uponReceiving('a request for all dogs with the builder pattern')
      .withRequest('GET', '/dogs', (builder) => {
        builder.query({ from: 'today' });
        builder.headers({ Accept: 'application/json' });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        builder.jsonBody(EXPECTED_BODY);
      });

    await provider
      .addInteraction()
      .given('I have a list of dogs')
      .uponReceiving('a request for for a dog profile with the builder pattern')
      .withRequest('GET', `/dogs/1/profile`, (builder) => {
        builder.headers({ Accept: 'application/json' });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        builder.jsonBody(EXPECTED_DOG_PROFILE_BODY);
      }) // TODO: Ideally we could call addInteraction() here again
      .executeTest(async (mockserver) => {
        // Act: test our API client behaves correctly
        //
        // Note we configure the DogService API client dynamically to
        // point to the mock service Pact created for us, instead of
        // the real one
        dogService = new DogService({ url: mockserver.url });
        const response = await dogService.getDogProfile(1, 'today');

        // Assert: check the result
        expect(response.data).to.deep.eq(EXPECTED_DOG_PROFILE_BODY.value);
        return response;
      });
  });
});
