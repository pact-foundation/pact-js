/**
 * Pact module.
 * @module Pact
 */
import serviceFactory from "@pact-foundation/pact-node";
import * as clc from "cli-color";
import * as Matchers from "./dsl/matchers";
import * as path from "path";
import * as process from "process";
import { Interaction, InteractionObject } from "./dsl/interaction";
import { isEmpty } from "lodash";
import { isPortAvailable } from "./common/net";
import { logger } from "./common/logger";
import { MockService } from "./dsl/mockService";
import { PactOptions, PactOptionsComplete } from "./dsl/options";
import { Server } from "@pact-foundation/pact-node/src/server";

/**
 * Creates a new {@link PactProvider}.
 * @memberof Pact
 * @name create
 * @param {PactOptions} opts
 * @return {@link PactProvider}
 */
export class Pact {
  public static defaults = {
    consumer: "",
    cors: false,
    dir: path.resolve(process.cwd(), "pacts"),
    host: "127.0.0.1",
    log: path.resolve(process.cwd(), "logs", "pact.log"),
    logLevel: "info",
    pactfileWriteMode: "overwrite",
    port: 1234,
    provider: "",
    spec: 2,
    ssl: false,
  } as PactOptions;

  public static createOptionsWithDefaults(opts: PactOptions): PactOptionsComplete {
    return { ...Pact.defaults, ...opts } as PactOptionsComplete;
  }

  public server: Server;
  public opts: PactOptionsComplete;
  public mockService: MockService;
  private finalized: boolean;

  constructor(config: PactOptions) {
    this.opts = Pact.createOptionsWithDefaults(config);

    if (isEmpty(this.opts.consumer)) {
      throw new Error("You must specify a Consumer for this pact.");
    }

    if (isEmpty(this.opts.provider)) {
      throw new Error("You must specify a Provider for this pact.");
    }

    serviceFactory.logLevel(this.opts.logLevel);
    this.server = serviceFactory.createServer({
      consumer: this.opts.consumer,
      cors: this.opts.cors,
      dir: this.opts.dir,
      host: this.opts.host,
      log: this.opts.log,
      pactFileWriteMode: this.opts.pactfileWriteMode,
      port: this.opts.port,
      provider: this.opts.provider,
      spec: this.opts.spec,
      ssl: this.opts.ssl,
      sslcert: this.opts.sslcert,
      sslkey: this.opts.sslkey,
    });

    logger.info(`Setting up Pact with Consumer "${this.opts.consumer}" and Provider "${this.opts.provider}"
   using mock service on Port: "${this.opts.port}"`);

    this.mockService = new MockService(undefined, undefined, this.opts.port, this.opts.host,
      this.opts.ssl, this.opts.pactfileWriteMode);
  }

  /**
   * Start the Mock Server.
   * @returns {Promise}
   */
  public setup(): Promise<void> {
    return isPortAvailable(this.opts.port, this.opts.host)
      // Need to wrap it this way until we remove q.Promise from pact-node
      .then(() => new Promise<void>((resolve, reject) => this.server.start().then(() => resolve(), () => reject())));
  }

  /**
   * Add an interaction to the {@link MockService}.
   * @memberof PactProvider
   * @instance
   * @param {Interaction} interactionObj
   * @returns {Promise}
   */
  public addInteraction(interactionObj: InteractionObject | Interaction): Promise<string> {
    if (interactionObj instanceof Interaction) {
      return this.mockService.addInteraction(interactionObj);
    }
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
        // Properly format the error
        /* tslint:disable: no-console */
        console.error("");
        console.error(clc.red("Pact verification failed!"));
        console.error(clc.red(e));
        /* tslint:enable: */

        throw new Error("Pact verification failed - expected interactions did not match actual.");
      });
  }

  /**
   * Writes the Pact and clears any interactions left behind and shutdown the
   * mock server
   * @memberof PactProvider
   * @instance
   * @returns {Promise}
   */
  public finalize(): Promise<void> {
    if (this.finalized) {
      logger.warn("finalize() has already been called, this is probably a logic error in your test setup. " +
        "In the future this will be an error.");
    }
    this.finalized = true;

    return this.mockService.writePact()
      .then(() => logger.info("Pact File Written"), (e) => {
        return Promise.reject(e);
      })
      .then(() => new Promise<void>((resolve, reject) => this.server.delete().then(() => resolve(), (e) => reject(e))))
      .catch((e: Error) => new Promise<void>((resolve, reject) => {
        return this.server.delete().finally(() => reject(e));
      }));
  }

  /**
   * Writes the pact file out to file. Should be called when all tests have been performed for a
   * given Consumer <-> Provider pair. It will write out the Pact to the
   * configured file.
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
 * Exposes {@link Verifier}
 * @memberof Pact
 * @static
 */
export * from "./dsl/verifier";

/**
 * Exposes {@link Matchers}
 * To avoid polluting the root module's namespace, re-export
 * Matchers as its owns module
 * @memberof Pact
 * @static
 */
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
