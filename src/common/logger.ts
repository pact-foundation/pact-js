import pino = require("pino")
import pkg from "./metadata"
import { RequestOptions, ClientRequest, IncomingMessage } from "http"
const http = require("http")

const DEFAULT_LOG_LEVEL = "info"
const logLevel = (process.env.LOGLEVEL || DEFAULT_LOG_LEVEL).toLowerCase()
const pactLogFile = process.env.PACT_LOG_PATH

const destination = pactLogFile
  ? pino.destination(pactLogFile)
  : pino.destination(1)

const logOpts = {
  level: logLevel,
  prettyPrint: {
    messageFormat: `pact@${pkg.version}: {msg}`,
    translateTime: true,
  },
}

let logger = pino(logOpts, destination)

Object.defineProperties(logger, {
  level: {
    enumerable: true,
    value: (newLevel: string): void => {
      logger = pino(
        {
          ...logOpts,
          level: (newLevel || DEFAULT_LOG_LEVEL).toLowerCase(),
        },
        destination
      )
    },
  },
})

export const traceHttpInteractions = () => {
  const originalRequest = http.request

  http.request = (options: RequestOptions, cb: any): ClientRequest => {
    const requestBodyChunks: Buffer[] = []
    const responseBodyChunks: Buffer[] = []

    const hijackedCalback = (res: any) => {
      logger.trace("outgoing request", {
        ...options,
        body: Buffer.concat(requestBodyChunks).toString("utf8"),
      })

      if (cb) {
        return cb(res)
      }
    }

    const clientRequest: ClientRequest = originalRequest(
      options,
      hijackedCalback
    )
    const oldWrite = clientRequest.write.bind(clientRequest)

    clientRequest.write = (chunk: any) => {
      requestBodyChunks.push(Buffer.from(chunk))
      return oldWrite(chunk)
    }

    clientRequest.on("response", (incoming: IncomingMessage) => {
      incoming.on("readable", () => {
        responseBodyChunks.push(Buffer.from(incoming.read()))
      })
      incoming.on("end", () => {
        logger.trace({
          body: Buffer.concat(responseBodyChunks).toString("utf8"),
          headers: incoming.headers,
          statusCode: incoming.statusCode,
        })
      })
    })

    return clientRequest
  }
}

export default logger
