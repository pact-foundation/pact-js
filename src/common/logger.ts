import * as bunyan from "bunyan"
import { RequestOptions, ClientRequest, IncomingMessage } from "http"
const PrettyStream = require("bunyan-prettystream")
const pkg = require("./metadata")
const http = require("http")

const prettyStdOut = new PrettyStream()
prettyStdOut.pipe(process.stdout)

export class Logger extends bunyan {
  public time(action: string, startTime: number) {
    const time = Date.now() - startTime
    this.info(
      {
        action,
        duration: time,
        type: "TIMER",
      },
      `TIMER: ${action} completed in ${time} milliseconds`
    )
  }

  public get logLevelName(): string {
    return bunyan.nameFromLevel[this.level()]
  }
}

const logger = new Logger({
  name: `pact@${pkg.version}`,
  streams: [
    {
      level: (process.env.LOGLEVEL || "info") as bunyan.LogLevel,
      stream: prettyStdOut,
      type: "raw",
    },
  ],
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
