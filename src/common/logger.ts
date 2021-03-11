import pino = require("pino")
import { version } from "../../package.json"
import { RequestOptions, ClientRequest, IncomingMessage } from "http"
const http = require("http")

const DEFAULT_LEVEL: LogLevel = (
  process.env.LOGLEVEL || "info"
).toLowerCase() as LogLevel

type Logger = pino.Logger
type LogLevel = pino.Level

const createLogger = (level: LogLevel = DEFAULT_LEVEL): Logger =>
  pino({
    level: level.toLowerCase(),
    prettyPrint: {
      messageFormat: `pact@${version}: {msg}`,
      translateTime: true,
    },
  })

const logger: pino.Logger = createLogger()

export const setLogLevel = (
  wantedLevel?: pino.Level | number
): number | void => {
  if (wantedLevel) {
    logger.level =
      typeof wantedLevel === "string"
        ? wantedLevel.toLowerCase()
        : logger.levels.labels[wantedLevel]
  }
  return logger.levels.values[logger.level]
}

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
