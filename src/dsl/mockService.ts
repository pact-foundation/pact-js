/**
 * Mock Service is the HTTP interface to setup the Pact Mock Service.
 * See https://github.com/bethesque/pact-mock_service and
 * https://gist.github.com/bethesque/9d81f21d6f77650811f4.
 * @module MockService
 */
import { isEmpty } from "lodash";
import { logger } from "../common/logger";
import { HTTPMethod, Request } from "../common/request";
import { Interaction } from "./interaction";

// Control how the Pact files are written
//  - overwrite: Recreates the target pact file after each run of Pact,
//               clobbering any existing pacts if present.
//  - merge:     Tells Pact that it will merge in new interactions to an
//               existing file, to allow multiple test files to be run in parallel.
//               This mode is really only useful if you need to split tests for a
//               single consumer-provider pair, across multiple test files.
//               You should delete any existing pacts before running the tests
//               so that interactions deleted from the code are not maintained in the file
//  - update:    Appends or updates interactions in a pact file. If an interaction
//               exists in the file, it is updated.
export type PactfileWriteMode = "overwrite" | "update" | "merge";

export interface Pacticipant {
  name: string;
}

export interface PactDetails {
  consumer?: Pacticipant;
  provider?: Pacticipant;
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
   * @param {string} pactfileWriteMode - 'overwrite' | 'update' | 'merge', defaults to 'overwrite'
   */
  constructor(
    // Deprecated as at https://github.com/pact-foundation/pact-js/issues/105
    private consumer?: string,
    private provider?: string,

    // Valid
    private port = 1234,
    private host = "127.0.0.1",
    private ssl = false,
    private pactfileWriteMode: PactfileWriteMode = "overwrite") {

    this.request = new Request();
    this.baseUrl = `${ssl ? "https" : "http"}://${host}:${port}`;
    this.pactDetails = {
      consumer: (consumer) ? { name: consumer } : undefined,
      pactfile_write_mode: pactfileWriteMode,
      provider: (provider) ? { name: provider } : undefined,
    };
  }

  /**
   * Adds an interaction
   * @param {Interaction} interaction
   * @returns {Promise}
   */
  public addInteraction(interaction: Interaction): Promise<string> {
    return this.request.send(HTTPMethod.POST, `${this.baseUrl}/interactions`, JSON.stringify(interaction.json()));
  }

  /**
   * Removes all interactions.
   * @returns {Promise}
   */
  public removeInteractions(): Promise<string> {
    return this.request.send(HTTPMethod.DELETE, `${this.baseUrl}/interactions`);
  }

  /**
   * Verify all interactions.
   * @returns {Promise}
   */
  public verify(): Promise<string> {
    return this.request.send(HTTPMethod.GET, `${this.baseUrl}/interactions/verification`);
  }

  /**
   * Writes the Pact file.
   * @returns {Promise}
   */
  public writePact(): Promise<string> {
    return this.request.send(HTTPMethod.POST, `${this.baseUrl}/pact`, JSON.stringify(this.pactDetails));
  }

}
