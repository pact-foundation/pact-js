/**
 * Network module.
 * @module net
 * @private
 */

import * as net from "net"
import { Promise as bluebird } from "bluebird"

const isPortAvailable = (port: number, host: string): Promise<void> =>
  Promise.resolve(
    bluebird
      .each([host, "127.0.0.1", "localhost", "0.0.0.0"], h =>
        portCheck(port, h)
      )
      .then(() => Promise.resolve(undefined))
      .catch(e => Promise.reject(e))
  )

const portCheck = (port: number, host: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const server: any = net
      .createServer()
      .listen({ port, host, exclusive: true })
      .on("error", (e: any) => {
        if (e.code === "EADDRINUSE") {
          reject(new Error(`Port ${port} is unavailable on address ${host}`))
        } else {
          reject(e)
        }
      })
      .on("listening", () => {
        server.once("close", () => resolve()).close()
      })
  })
}

export { isPortAvailable, portCheck }
