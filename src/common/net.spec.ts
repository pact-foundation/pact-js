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

    // in all node versions (at time of writing), using the IpV6 broadcast address (::) will
    // listen on all IpV6 *and* IpV4 addresses (for the specified port) (AKA dual-stacking).
    // unless `ipv6Only: true` is used in `server.listen({})`. We cannot use this flag as it
    // has been introduced in node v11.X.
    // Dual-stacking is configurable at the OS level, but we should not rely on that for the
    // tests.
    context("when the no local hosts are available", () => {
      let closeFn = (cb: any) => cb()

      it("returns a rejected promise", () =>
        // cover all IpV6 and IpV4 hosts for the port, so all the checks will fail
        createServer(port, "::").then((ipv6Server: { close(): any }) => {
          closeFn = ipv6Server.close.bind(ipv6Server)
          return expect(isPortAvailable(port, "127.0.0.1")).to.eventually.be
            .rejected
        }))

      // close the servers used in this test as to not conflict with other tests
      afterEach(done => closeFn(done))
    })

    context("when a single host is unavailable", () => {
      let closeFn = (cb: any) => cb()

      it("returns a fulfilled promise", () =>
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

      server.listen({ port: p, host, exclusive: true }, () => {
        logger.info(`test server is up on ${host}:${p}`)
      })
    })
})
