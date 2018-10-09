/* tslint:disable:no-unused-expression */
import logger from "./logger";
import { isPortAvailable } from "./net";
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const expect = chai.expect;

chai.use(chaiAsPromised);

describe("Net", () => {
  const port = 1234;
  const host = "0.0.0.0";
  const specialPort = process.platform.match("win") ? -1 : 80;

  describe("#isPortAvailable", () => {
    context("when the port is not allowed to be bound", () => {
      it("should return a rejected promise", () => {
        expect(isPortAvailable(specialPort, host)).to.eventually.be.rejected;
      });
    });

    context("when the port is available", () => {
      it("should return a fulfilled promise", () => {
        expect(isPortAvailable(port, host)).to.eventually.be.fulfilled;
      });
    });

    context("when the port is unavailable", () => {
      it("should return a rejected promise", done => {
        createServer(port).then((server: { close(): any }) => {
          isPortAvailable(port, host).then(
            () => {
              server.close();
              done(new Error(`Port ${port} should not be available`));
            },
            (e: any) => {
              done();
            }
          );
        });
      });
    });
  });

  // Utility function to create a server on a given port and return a Promise
  const createServer = (p: number) =>
    new Promise((resolve, reject) => {
      const nodeNet = require("net");
      const server = nodeNet.createServer();

      server.on("error", (err: any) => reject(err));
      server.on("listening", () => resolve(server));

      server.listen(p, host, () => {
        logger.info(`test server is up on port ${p}`);
      });
    });
});
