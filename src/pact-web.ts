// tslint:disable:no-console
/**
 * Pact module for Web use.
 * @module Pact Web
 */
import { polyfill } from "es6-promise";
import { isEmpty } from "lodash";
import { Interaction, InteractionObject } from "./dsl/interaction";
import { MockService } from "./dsl/mockService";
import { PactOptions, PactOptionsComplete } from "./dsl/options";
polyfill();

/**
 * Creates a new {@link PactWeb}.
 * @memberof Pact
 * @name create
 * @param {PactOptions} opts
 * @return {@link PactWeb}
 * @static
 */
export class PactWeb {
  public mockService: MockService;
  public server: any;
  public opts: PactOptionsComplete;

  constructor(config: PactOptions) {
    const defaults = {
      consumer: "",
      cors: false,
      host: "127.0.0.1",
      pactfileWriteMode: "overwrite",
      port: 1234,
      provider: "",
      spec: 2,
      ssl: false,
    } as PactOptions;

    this.opts = { ...defaults, ...config } as PactOptionsComplete;

    if (!isEmpty(this.opts.consumer) || !isEmpty(this.opts.provider)) {
      console.warn(`Passing in consumer/provider to PactWeb is deprecated,
        and will be removed in the next major version`);
    }

    console.info(`Setting up Pact using mock service on port: "${this.opts.port}"`);

    this.mockService = new MockService(this.opts.consumer, this.opts.provider, this.opts.port, this.opts.host,
      this.opts.ssl, this.opts.pactfileWriteMode);
  }

  /**
   * Add an interaction to the {@link MockService}.
   * @memberof PactProvider
   * @instance
   * @param {Interaction} interactionObj
   * @returns {Promise}
   */
  public addInteraction(interactionObj: InteractionObject): Promise<string> {
    const interaction = new Interaction();

    if (interactionObj.state) {
      interaction.given(interactionObj.state);
    }

    interaction
      .uponReceiving(interactionObj.uponReceiving)
      .withRequest(interactionObj.withRequest)
      .willRespondWith(interactionObj.willRespondWith);

    return this.mockService.addInteraction(interaction);
  }
  /**
   * Checks with the Mock Service if the expected interactions have been exercised.
   * @memberof PactProvider
   * @instance
   * @returns {Promise}
   */
  public verify(): Promise<string> {
    return this.mockService.verify()
      .then(() => this.mockService.removeInteractions())
      .catch((e: any) => {
        throw new Error(e);
      });
  }
  /**
   * Writes the Pact and clears any interactions left behind.
   * @memberof PactProvider
   * @instance
   * @returns {Promise}
   */
  public finalize(): Promise<string> {
    return this.mockService.writePact().then(() => this.mockService.removeInteractions());
  }
  /**
   * Writes the Pact file but leave interactions in.
   * @memberof PactProvider
   * @instance
   * @returns {Promise}
   */
  public writePact(): Promise<string> {
    return this.mockService.writePact();
  }
  /**
   * Clear up any interactions in the Provider Mock Server.
   * @memberof PactProvider
   * @instance
   * @returns {Promise}
   */
  public removeInteractions(): Promise<string> {
    return this.mockService.removeInteractions();
  }
}

/**
 * Exposes {@link Matchers}
 * To avoid polluting the root module's namespace, re-export
 * Matchers as its owns module
 * @memberof Pact
 * @static
 */
import * as Matchers from "./dsl/matchers";
export import Matchers = Matchers;

/**
 * Exposes {@link Interaction}
 * @memberof Pact
 * @static
 */
export * from "./dsl/interaction";

/**
 * Exposes {@link MockService}
 * @memberof Pact
 * @static
 */
export * from "./dsl/mockService";
