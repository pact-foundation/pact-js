import { type LogLevel, Matchers, PactV3 } from '@pact-foundation/pact';
import { describe, expect, it } from 'vitest';
import { UserService } from '../index';

const { like } = Matchers;
const LOG_LEVEL = process.env.LOG_LEVEL || 'WARN';

describe('The Users API', () => {
  let userService: UserService;

  // Setup the 'pact' between two applications
  const provider = new PactV3({
    consumer: 'User Web',
    provider: 'User API',
    logLevel: LOG_LEVEL as LogLevel,
  });
  const userExample = { id: 1, name: 'Homer Simpson' };
  const EXPECTED_BODY = like(userExample);

  describe('get /users/:id', () => {
    it('returns the requested user', () => {
      // Arrange
      provider
        .given('a user with ID 1 exists')
        .uponReceiving('a request to get a user')
        .withRequest({
          method: 'GET',
          path: '/users/1',
        })
        .willRespondWith({
          status: 200,
          headers: { 'content-type': 'application/json' },
          body: EXPECTED_BODY,
        });

      return provider.executeTest(async (mockserver) => {
        // Act
        userService = new UserService(mockserver.url);
        const response = await userService.getUser(1);

        // Assert
        expect(response.data).toEqual(userExample);
      });
    });
  });
});
