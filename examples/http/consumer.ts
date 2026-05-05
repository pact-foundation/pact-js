import axios, { type AxiosResponse } from 'axios';

/** A user profile returned by the User Service. */
export interface User {
  id: number;
  name: string;
  email: string;
}

/**
 * HTTP client for the User Service.
 *
 * In production, construct this with the live service base URL. In Pact
 * consumer tests, `mockserver.url` from `executeTest()` is passed in instead
 * and the client never needs to know it is talking to a mock.
 *
 * Only the fields the consumer actually uses appear here. If the provider
 * returns additional fields (e.g. `address`, `createdAt`), they are simply
 * ignored. This is intentional: the contract only captures what matters to
 * this consumer, leaving the provider free to evolve independently.
 */
export class UserServiceClient {
  constructor(private readonly baseUrl: string) {}

  /**
   * Fetch a single user by their numeric ID.
   *
   * @param id - The user's numeric identifier.
   * @throws {AxiosError} on non-2xx responses.
   */
  async getUser(id: number): Promise<User> {
    const { data }: AxiosResponse<User> = await axios.get(
      `${this.baseUrl}/users/${id}`,
      { headers: { Accept: 'application/json' } },
    );
    return data;
  }

  /**
   * Fetch all users.
   *
   * The consumer only needs to know that the response is an array of users;
   * the exact count is not part of the contract.
   */
  async getUsers(): Promise<User[]> {
    const { data }: AxiosResponse<User[]> = await axios.get(
      `${this.baseUrl}/users`,
      { headers: { Accept: 'application/json' } },
    );
    return data;
  }
}
