/**
 * Network module.
 * @module net
 * @private
 */

import * as net from "net"
import { Promise as bluebird } from "bluebird"

export const localAddresses = ["127.0.0.1", "localhost", "0.0.0.0", "::1"]

const isPortAvailable = (port: number, host: string): Promise<void> => {
  return Promise.resolve(
    bluebird
      .map(
        localAddresses,
        // we meed to wrap the built-in Promise with bluebird.reflect() so we can
        // test the result of the promise without failing bluebird.map()
        h => bluebird.resolve(portCheck(port, h)).reflect(),
        // do each port check sequentially (as localhost & 127.0.0.1 will conflict on most default environments)
        { concurrency: 1 }
      )
      .then(inspections => {
        // if every port check failed, then fail the `isPortAvailable` check
        if (inspections.every(inspection => !inspection.isFulfilled())) {
          return Promise.reject(
            new Error(`Cannot open port ${port} on ipv4 or ipv6 interfaces`)
          )
        }

        // the local addresses passed - now check the host that the user has specified
        return portCheck(port, host)
      })
  )
}

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
