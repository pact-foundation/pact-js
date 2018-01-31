/* tslint:disable:no-unused-expression no-empty */
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as nock from "nock";
import {HTTPMethod, Request} from "./request";
chai.use(chaiAsPromised);

const expect = chai.expect;

describe("Request", () => {
  let request: Request;
  const PORT = 3441;
  const URL = `http://localhost:${PORT}`;
  const URLSECURE = `https://localhost:${PORT}`;

  beforeEach(() => {
    request = new Request();
  });

  context("#send", () => {
    afterEach(() => {
      nock.restore();
      nock.cleanAll();
    });

    describe("Promise", () => {
      it("Should return a promise", () => {
        const r = request.send(HTTPMethod.GET, URL);
        return Promise.all([
          expect(r).is.ok,
          expect(r.then).is.ok,
          expect(r.then).is.a("function"),
          expect(r).to.be.rejected,
        ]);
      });
      it("Should resolve when request succeeds with response body", () => {
        const BODY = "body";
        nock(URL).get("/").reply(200, BODY);
        return expect(request.send(HTTPMethod.GET, URL)).to.be.fulfilled("string", BODY);
      });
      it("Should reject when request fails with error message", () => {
        const ERROR = "error";
        nock(URL).get("/").reply(400, ERROR);
        return expect(request.send(HTTPMethod.GET, URL)).to.be.rejected("string", ERROR);
      });
    });
    describe("Headers", () => {
      it("Should have Pact headers are sent with every request", () => {
        nock(URL).matchHeader("X-Pact-Mock-Service", "true").get("/").reply(200);
        return expect(request.send(HTTPMethod.GET, URL)).to.be.fulfilled;
      });
    });
    describe("SSL", () => {
      it("Should ignore self signed certificate errors", () => {
        nock(URLSECURE).matchHeader("X-Pact-Mock-Service", "true").get("/").reply(200);
        return expect(request.send(HTTPMethod.GET, URL)).to.be.fulfilled;
      });
    });
  });
});
