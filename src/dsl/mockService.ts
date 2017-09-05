/**
 * Mock Service is the HTTP interface to setup the Pact Mock Service.
 * See https://github.com/bethesque/pact-mock_service and
 * https://gist.github.com/bethesque/9d81f21d6f77650811f4.
 * @module MockService
 */
import { isEmpty } from 'lodash';
import { Request } from '../common/request';
import { Interaction } from './interaction';

export type PactfileWriteMode = 'overwrite' | 'update' | 'none';

export interface PactDetails {
  consumer: { name: string };
  provider: { name: string };
  pactfile_write_mode: PactfileWriteMode;
}

export class MockService {
  public pactDetails: PactDetails;
  public request: Request;
  public baseUrl: string;

  /**
   * @param {string} consumer - the consumer name
   * @param {string} provider - the provider name
   * @param {number} port - the mock service port, defaults to 1234
   * @param {string} host - the mock service host, defaults to 127.0.0.1
   * @param {boolean} ssl - which protocol to use, defaults to false (HTTP)
   * @param {string} pactfileWriteMode - 'overwrite' | 'update' | 'none', defaults to 'overwrite'
   */
  constructor(private consumer: string,
    private provider: string,
    private port = 1234,
    private host = '127.0.0.1',
    private ssl = false,
    private pactfileWriteMode: PactfileWriteMode = 'overwrite') {

    if (isEmpty(consumer) || isEmpty(provider)) {
      throw new Error('Please provide the names of the provider and consumer for this Pact.')
    }

    this.request = new Request();
    this.baseUrl = `${ssl ? 'https' : 'http'}://${host}:${port}`;
    this.pactDetails = {
      consumer: { name: consumer },
      provider: { name: provider },
      pactfile_write_mode: pactfileWriteMode
    };
  }

  /**
   * Adds an interaction
   * @param {Interaction} interaction
   * @returns {Promise}
   */
  addInteraction(interaction: Interaction): Promise<string> {
    return this.request.send('POST', `${this.baseUrl}/interactions`, JSON.stringify(interaction.json()));
  }

  /**
   * Removes all interactions.
   * @returns {Promise}
   */
  removeInteractions(): Promise<string> {
    return this.request.send('DELETE', `${this.baseUrl}/interactions`);
  }

  /**
   * Verify all interactions.
   * @returns {Promise}
   */
  verify(): Promise<string> {
    return this.request.send('GET', `${this.baseUrl}/interactions/verification`);
  }

  /**
   * Writes the Pact file.
   * @returns {Promise}
   */
  writePact(): Promise<string> {
    return this.request.send('POST', `${this.baseUrl}/pact`, JSON.stringify(this.pactDetails));
  }

}
