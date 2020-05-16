/**
 * Provider Verifier service
 * @module ProviderVerifier
 */
import pact from "@pact-foundation/pact-node"
import { qToPromise } from "../common/utils"
import { VerifierOptions as PactNodeVerifierOptions } from "@pact-foundation/pact-node"
import serviceFactory from "@pact-foundation/pact-node"
import { omit, isEmpty } from "lodash"
import * as express from "express"
import * as http from "http"
import logger from "../common/logger"
import { LogLevel } from "./options"
import ConfigurationError from "../errors/configurationError"
import { localAddresses } from "../common/net"
import * as url from "url"
const HttpProxy = require("http-proxy")
const bodyParser = require("body-parser")

export interface ProviderState {
  states?: [string]
}

export interface StateHandler {
  [name: string]: () => Promise<any>
}

interface ProxyOptions {
  logLevel?: LogLevel
  requestFilter?: express.RequestHandler
  stateHandlers?: StateHandler
  validateSSL?: boolean
  changeOrigin?: boolean
}

export type VerifierOptions = ProxyOptions & PactNodeVerifierOptions

export class Verifier {
  private address: string = "http://localhost"
  private stateSetupPath: string = "/_pactSetup"
  private config: VerifierOptions
  private deprecatedFields: string[] = ["providerStatesSetupUrl"]

  constructor(config?: VerifierOptions) {
    if (config) {
      this.setConfig(config)
    }
  }

  /**
   * Verify a HTTP Provider
   *
   * @param config
   */
  public verifyProvider(config?: VerifierOptions): Promise<any> {
    logger.info("Verifying provider")

    // Backwards compatibility
    if (config) {
      logger.warn(
        "Passing options to verifyProvider() wil be deprecated in future versions, please provide to Verifier constructor instead"
      )
      this.setConfig(config)
    }

    if (isEmpty(this.config)) {
      return Promise.reject(
        new ConfigurationError("No configuration provided to verifier")
      )
    }

    // Start the verification CLI proxy server
    const app = this.createProxy()
    const server = this.startProxy(app)

    // Run the verification once the proxy server is available
    return this.waitForServerReady(server)
      .then(this.runProviderVerification())
      .then(result => {
        server.close()
        return result
      })
      .catch(e => {
        server.close()
        throw e
      })
  }

  // Run the Verification CLI process
  private runProviderVerification() {
    return (server: http.Server) => {
      const opts = {
        providerStatesSetupUrl: `${this.address}:${server.address().port}${
          this.stateSetupPath
        }`,
        ...omit(this.config, "handlers"),
        providerBaseUrl: `${this.address}:${server.address().port}`,
      }

      return qToPromise<any>(pact.verifyPacts(opts))
    }
  }

  // Listens for the server start event
  // Converts event Emitter to a Promise
  private waitForServerReady(server: http.Server): Promise<http.Server> {
    return new Promise((resolve, reject) => {
      server.on("listening", () => resolve(server))
      server.on("error", () =>
        reject(new Error("Unable to start verification proxy server"))
      )
    })
  }

  // Get the Proxy we'll pass to the CLI for verification
  private startProxy(
    app: (request: http.IncomingMessage, response: http.ServerResponse) => void
  ): http.Server {
    return http.createServer(app).listen()
  }

  // Get the Express app that will run on the HTTP Proxy
  private createProxy(): express.Express {
    const app = express()
    const proxy = new HttpProxy()

    app.use(this.stateSetupPath, bodyParser.json())
    app.use(this.stateSetupPath, bodyParser.urlencoded({ extended: true }))

    // Allow for request filtering
    if (this.config.requestFilter !== undefined) {
      app.use(this.config.requestFilter)
    }

    // Setup provider state handler
    app.post(this.stateSetupPath, this.createProxyStateHandler())

    // Proxy server will respond to Verifier process
    app.all("/*", (req, res) => {
      logger.debug("Proxing", req.path)
      proxy.web(req, res, {
        changeOrigin: this.config.changeOrigin === true,
        secure: this.config.validateSSL === true,
        target: this.config.providerBaseUrl,
      })
    })

    return app
  }

  private createProxyStateHandler() {
    return (req: any, res: any) => {
      const message: ProviderState = req.body

      return this.setupStates(message)
        .then(() => res.sendStatus(200))
        .catch(e => res.status(500).send(e))
    }
  }

  // Lookup the handler based on the description, or get the default handler
  private setupStates(descriptor: ProviderState): Promise<any> {
    const promises: Array<Promise<any>> = new Array()

    if (descriptor.states) {
      descriptor.states.forEach(state => {
        const handler = this.config.stateHandlers
          ? this.config.stateHandlers[state]
          : null

        if (handler) {
          promises.push(handler())
        } else {
          logger.warn(`No state handler found for "${state}", ignoring`)
        }
      })
    }

    return Promise.all(promises)
  }

  private setConfig(config: VerifierOptions) {
    this.config = config

    if (this.config.logLevel && !isEmpty(this.config.logLevel)) {
      serviceFactory.logLevel(this.config.logLevel)
      logger.level(this.config.logLevel)
    }

    this.deprecatedFields.forEach(f => {
      if ((this.config as any)[f]) {
        logger.warn(
          `${f} is deprecated, and will be removed in future versions`
        )
      }
    })

    if (this.config.validateSSL === undefined) {
      this.config.validateSSL = true
    }

    if (this.config.changeOrigin === undefined) {
      this.config.changeOrigin = false

      if (!this.isLocalVerification()) {
        this.config.changeOrigin = true
        logger.debug(
          `non-local provider address ${this.config.providerBaseUrl} detected, setting 'changeOrigin' to 'true'. This property can be overridden.`
        )
      }
    }
  }

  private isLocalVerification() {
    const u = new url.URL(this.config.providerBaseUrl)
    return (
      localAddresses.includes(u.host) || localAddresses.includes(u.hostname)
    )
  }
}
