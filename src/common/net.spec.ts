/* tslint:disable:no-unused-expression */
import logger from "./logger"
import { isPortAvailable } from "./net"
const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
const expect = chai.expect

chai.use(chaiAsPromised)

describe("Net", () => {
  const port = 4567
  const defaultHost = "0.0.0.0"
  const specialPort = process.platform.match("win") ? -1 : 80

  describe("#isPortAvailable", () => {
    context("when the port is not allowed to be bound", () => {
      it("returns a rejected promise", () => {
        return expect(isPortAvailable(specialPort, defaultHost)).to.eventually
          .be.rejected
      })
    })

    context("when the port is available", () => {
      it("returns a fulfilled promise", () => {
        return expect(isPortAvailable(port, defaultHost)).to.eventually.be
          .fulfilled
      })
    })

    context("when the port is unavailable", () => {
      let closeFn = (cb: any) => cb()

      it("returns a rejected promise", () =>
        createServer(port).then((server: { close(): any }) => {
          closeFn = server.close.bind(server)
          return expect(isPortAvailable(port, defaultHost)).to.eventually.be
            .rejected
        }))

      // close the servers used in this test as to not conflict with other tests
      afterEach(done => closeFn(done))
    })

    // this test uses the test port on all ipv4 and ipv6 hosts via the respective broadcast
    // addresses (0.0.0.0 and ::)
    context("when the no local hosts are available", () => {
      let closeIpV4ServerFn = (cb: any) => cb()
      let closeIpV6ServerFn = (cb: any) => cb()

      it("return a rejected promise", () =>
        createServer(port, defaultHost).then((ipv4Server: { close(): any }) => {
          closeIpV4ServerFn = ipv4Server.close.bind(ipv4Server)

          return createServer(port, "::").then(
            (ipv6Server: { close(): any }) => {
              closeIpV6ServerFn = ipv6Server.close.bind(ipv6Server)
              return expect(isPortAvailable(port, "127.0.0.1")).to.eventually.be
                .rejected
            }
          )
        }))

      // close the servers used in this test as to not conflict with other tests
      afterEach(done => closeIpV4ServerFn(() => closeIpV6ServerFn(done)))
    })

    context("when a single host is unavailable", () => {
      let closeFn = (cb: any) => cb()

      it("return a fulfilled promise", () =>
        // simulate ::1 being unavailable
        createServer(port, "::1").then((server: { close(): any }) => {
          closeFn = server.close.bind(server)
          // this should work as the `127.0.0.1` is NOT `::1`
          expect(isPortAvailable(port, "127.0.0.1")).to.eventually.be.fulfilled
        }))

      // close the servers used in this test as to not conflict with other tests
      afterEach(done => closeFn(done))
    })
  })

  // Utility function to create a server on a given port and return a Promise
  const createServer = (p: number, host = defaultHost) =>
    new Promise((resolve, reject) => {
      const nodeNet = require("net")
      const server = nodeNet.createServer()

      server.on("error", (err: any) => reject(err))
      server.on("listening", () => resolve(server))

      server.listen({ port: p, host, exclusive: true, ipv6Only: true }, () => {
        logger.info(`test server is up on ${host}:${p}`)
      })
    })
})
