// tslint:disable:no-console
/**
 * Pact module for Web use.
 * @module Pact Web
 */
import { polyfill } from "es6-promise"
import { isEmpty } from "lodash"
import { Interaction, InteractionObject } from "./dsl/interaction"
import { MockService, PactfileWriteMode } from "./dsl/mockService"
import { PactOptions, LogLevel, MandatoryPactOptions } from "./dsl/options"
import VerificationError from "./errors/verificationError"
polyfill()

export interface PactWebOptions {
  // The port to run the mock service on, defaults to 1234
  port?: number

  // The host to run the mock service, defaults to 127.0.0.1
  host?: string

  // SSL flag to identify the protocol to be used (default false, HTTP)
  ssl?: boolean

  // Path to SSL certificate to serve on the mock service
  sslcert?: string

  // Path to SSL key to serve on the mock service
  sslkey?: string

  // Directory to output pact files
  dir?: string

  // Directory to log to
  log?: string

  // Log level
  logLevel?: LogLevel

  // Pact specification version (defaults to 2)
  spec?: number

  // Allow CORS OPTION requests to be accepted, defaults to false
  cors?: boolean

  // Control how the Pact files are written
  // (defaults to 'overwrite')
  pactfileWriteMode?: PactfileWriteMode
}

export type PactWebOptionsComplete = PactOptions & MandatoryPactOptions

/**
 * Creates a new {@link PactWeb}.
 * @memberof Pact
 * @name create
 * @param {PactOptions} opts
 * @return {@link PactWeb}
 * @static
 */
export class PactWeb {
  public mockService: MockService
  public server: any
  public opts: PactWebOptionsComplete

  constructor(config?: PactWebOptions) {
    const defaults = {
      cors: false,
      host: "127.0.0.1",
      pactfileWriteMode: "overwrite",
      port: 1234,
      spec: 2,
      ssl: false,
    } as PactOptions

    this.opts = { ...defaults, ...config } as PactWebOptionsComplete

    console.info(
      `Setting up Pact using mock service on port: "${this.opts.port}"`
    )

    this.mockService = new MockService(
      this.opts.consumer,
      this.opts.provider,
      this.opts.port,
      this.opts.host,
      this.opts.ssl,
      this.opts.pactfileWriteMode
    )
  }

  /**
   * Add an interaction to the {@link MockService}.
   * @memberof PactProvider
   * @instance
   * @param {Interaction} interactionObj
   * @returns {Promise}
   */
  public addInteraction(
    interactionObj: InteractionObject | Interaction
  ): Promise<string> {
    if (interactionObj instanceof Interaction) {
      return this.mockService.addInteraction(interactionObj)
    }

    const interaction = new Interaction()
    if (interactionObj.state) {
      interaction.given(interactionObj.state)
    }

    interaction
      .uponReceiving(interactionObj.uponReceiving)
      .withRequest(interactionObj.withRequest)
      .willRespondWith(interactionObj.willRespondWith)

    return this.mockService.addInteraction(interaction)
  }
  /**
   * Checks with the Mock Service if the expected interactions have been exercised.
   * @memberof PactProvider
   * @instance
   * @returns {Promise}
   */
  public verify(): Promise<string> {
    return this.mockService
      .verify()
      .then(() => this.mockService.removeInteractions())
      .catch((e: any) => {
        throw new VerificationError(e)
      })
  }
  /**
   * Writes the Pact and clears any interactions left behind.
   * @memberof PactProvider
   * @instance
   * @returns {Promise}
   */
  public finalize(): Promise<string> {
    return this.mockService
      .writePact()
      .then(() => this.mockService.removeInteractions())
  }
  /**
   * Writes the Pact file but leave interactions in.
   * @memberof PactProvider
   * @instance
   * @returns {Promise}
   */
  public writePact(): Promise<string> {
    return this.mockService.writePact()
  }
  /**
   * Clear up any interactions in the Provider Mock Server.
   * @memberof PactProvider
   * @instance
   * @returns {Promise}
   */
  public removeInteractions(): Promise<string> {
    return this.mockService.removeInteractions()
  }
}

/**
 * Exposes {@link Matchers}
 * To avoid polluting the root module's namespace, re-export
 * Matchers as its owns module
 * @memberof Pact
 * @static
 */
import * as Matchers from "./dsl/matchers"
export import Matchers = Matchers

/**
 * Exposes {@link Interaction}
 * @memberof Pact
 * @static
 */
export * from "./dsl/interaction"

/**
 * Exposes {@link MockService}
 * @memberof Pact
 * @static
 */
export * from "./dsl/mockService"

/**
 * Exposes {@link GraphQL}
 * @memberof Pact
 * @static
 */
export * from "./dsl/graphql"
/**
 * Exposes {@link ApolloGraphQL}
 * @memberof Pact
 * @static
 */
export * from "./dsl/apolloGraphql"
