import axios, { type AxiosResponse } from 'axios';

/** An account as returned by the Account Service. */
export interface Account {
  id: number;
  accountNumber: string;
  ownerName: string;
  balance: number;
}

/**
 * HTTP client for the Account Service.
 *
 * Used in the provider-state example to demonstrate parameterised provider
 * states and `fromProviderState()` — where the provider's response contains
 * values it generated during state setup (e.g. a database-assigned ID).
 */
export class AccountServiceClient {
  constructor(private readonly baseUrl: string) {}

  /**
   * Fetch an account by its account number.
   *
   * Note: the provider uses an internal database ID, but this consumer only
   * knows about account numbers. The link between the two is established via
   * provider state parameters.
   */
  async getAccountByNumber(accountNumber: string): Promise<Account> {
    const { data }: AxiosResponse<Account> = await axios.get(
      `${this.baseUrl}/accounts/${accountNumber}`,
      { headers: { Accept: 'application/json' } },
    );
    return data;
  }
}
