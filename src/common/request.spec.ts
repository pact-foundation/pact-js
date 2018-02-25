/* tslint:disable:no-unused-expression no-empty no-console */
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as nock from "nock";
import { HTTPMethod, Request } from "./request";

chai.use(chaiAsPromised);

const expect = chai.expect;

describe("Request", () => {
  let request: Request;
  const PORT = 1024 + Math.floor(Math.random() * 5000);
  const URL = `http://localhost:${PORT}`;
  const URLSECURE = `https://localhost:${PORT}`;

  beforeEach(() => request = new Request());

  context("#send", () => {
    afterEach(() => nock.cleanAll());

    describe("Promise", () => {
      it("Should return a promise", () => {
        nock(URL).get("/").reply(200);
        const r = request.send(HTTPMethod.GET, URL);
        return Promise.all([
          expect(r).is.ok,
          expect(r.then).is.ok,
          expect(r.then).is.a("function"),
          expect(r).to.be.fulfilled,
        ]);
      });
      it("Should resolve when request succeeds with response body", () => {
        const BODY = "body";
        nock(URL).get("/").reply(200, BODY);
        const p = request.send(HTTPMethod.GET, URL);
        return Promise.all([
          expect(p).to.be.fulfilled,
          expect(p).to.eventually.be.equal(BODY),
        ]);
      });
      it("Should reject when request fails with error message", () => {
        const ERROR = "error";
        nock(URL).get("/").reply(400, ERROR);
        const p = request.send(HTTPMethod.GET, URL);
        return expect(p).to.be.rejectedWith(ERROR);
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
        return expect(request.send(HTTPMethod.GET, URLSECURE)).to.be.fulfilled;
      });
    });
  });
});
