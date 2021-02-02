/**
 * @module Message
 */

import { omit, isEmpty } from "lodash"
import { MessageDescriptor } from "./dsl/message"
import logger, { setLogLevel } from "./common/logger"
import { VerifierOptions } from "@pact-foundation/pact-node"
import { PactMessageProviderOptions } from "./dsl/options"
import serviceFactory from "@pact-foundation/pact-node"
import * as express from "express"
import * as http from "http"
import { MessageProvider } from "./pact"
import { qToPromise } from "./common/utils"

const bodyParser = require("body-parser")

/**
 * A Message Provider is analagous to Consumer in the HTTP Interaction model.
 *
 * It is the initiator of an interaction, and expects something on the other end
 * of the interaction to respond - just in this case, not immediately.
 */
export class MessageProviderPact {
  constructor(private config: PactMessageProviderOptions) {
    if (config.logLevel && !isEmpty(config.logLevel)) {
      serviceFactory.logLevel(config.logLevel)
      setLogLevel(config.logLevel)
    } else {
      setLogLevel()
    }
  }

  /**
   * Verify a Message Provider.
   */
  public verify(): Promise<any> {
    logger.info("Verifying message")

    // Start the verification CLI proxy server
    const app = this.setupProxyApplication()
    const server = this.setupProxyServer(app)

    // Run the verification once the proxy server is available
    return this.waitForServerReady(server)
      .then(this.runProviderVerification())
      .then(
        result => {
          server.close()
          return result
        },
        err => {
          server.close()
          throw err
        }
      )
  }

  // Listens for the server start event
  // Converts event Emitter to a Promise
  private waitForServerReady(server: http.Server): Promise<http.Server> {
    return new Promise((resolve, reject) => {
      server.on("listening", () => resolve(server))
      server.on("error", () => reject())
    })
  }

  // Run the Verification CLI process
  private runProviderVerification() {
    return (server: http.Server) => {
      const opts = {
        ...omit(this.config, "handlers"),
        ...{ providerBaseUrl: "http://localhost:" + server.address().port },
      } as VerifierOptions

      return qToPromise<any>(serviceFactory.verifyPacts(opts))
    }
  }

  // Get the API handler for the verification CLI process to invoke on POST /*
  private setupVerificationHandler(): (
    req: express.Request,
    res: express.Response
  ) => void {
    return (req, res) => {
      const message: MessageDescriptor = req.body

      // Invoke the handler, and return the JSON response body
      // wrapped in a Message
      this.setupStates(message)
        .then(() => this.findHandler(message))
        .then(handler => handler(message))
        .then(o => res.json({ contents: o }))
        .catch(e => res.status(500).send(e))
    }
  }

  // Get the Proxy we'll pass to the CLI for verification
  private setupProxyServer(
    app: (request: http.IncomingMessage, response: http.ServerResponse) => void
  ): http.Server {
    return http.createServer(app).listen()
  }

  // Get the Express app that will run on the HTTP Proxy
  private setupProxyApplication(): express.Express {
    const app = express()

    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use((req, res, next) => {
      res.header("Content-Type", "application/json; charset=utf-8")
      next()
    })

    // Proxy server will respond to Verifier process
    app.all("/*", this.setupVerificationHandler())

    return app
  }

  // Lookup the handler based on the description, or get the default handler
  private setupStates(message: MessageDescriptor): Promise<any> {
    const promises: Array<Promise<any>> = new Array()

    if (message.providerStates) {
      message.providerStates.forEach(state => {
        const handler = this.config.stateHandlers
          ? this.config.stateHandlers[state.name]
          : null

        if (handler) {
          promises.push(handler(state.name))
        } else {
          logger.warn(`no state handler found for "${state.name}", ignoring`)
        }
      })
    }

    return Promise.all(promises)
  }
  // Lookup the handler based on the description, or get the default handler
  private findHandler(message: MessageDescriptor): Promise<MessageProvider> {
    const handler = this.config.messageProviders[message.description || ""]

    if (!handler) {
      logger.warn(`no handler found for message ${message.description}`)

      return Promise.reject(
        `No handler found for message "${message.description}".` +
          ` Check your "handlers" configuration`
      )
    }

    return Promise.resolve(handler)
  }
}
