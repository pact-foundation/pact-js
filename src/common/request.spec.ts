/* tslint:disable:no-unused-expression no-empty */
import * as chai from "chai";
import { loadavg } from "os";
import * as sinon from "sinon";
import { parse, Url, URL } from "url";
const expect = chai.expect;
import { Request } from "./request";

describe("Request", () => {
  let request: Request;

  beforeEach(() => {
    request = new Request();
  });

  context("#constructor", () => {
    describe("when running in a browser-based environment", () => {
      it.skip('should use "XMLHttpRequest" request object', () => {
        // Need to find an elegant way of turning on 'window' in TypeScript
        expect(request.request).to.not.be.undefined;
        expect(request.request).to.not.be.null;
        expect(request.request.open).to.be.a("function");
        expect(request.request.setRequestHeader).to.be.a("function");
        expect(request.request.send).to.be.a("function");
      });
    });
    describe("when running in a node-based environment", () => {
      it('should use "Request" objects', () => {
        expect(request.httpRequest).to.not.be.null;
        expect(request.httpRequest).to.not.be.undefined;
        expect(request.httpsRequest).to.not.be.null;
        expect(request.httpsRequest).to.not.be.undefined;
        expect(request.responseBody).to.eq("");
      });
    });
  });

  context("#send", () => {
    let requestMock: sinon.SinonMock;
    const onSpy = sinon.spy();
    const writeSpy = sinon.spy();
    const endSpy = sinon.spy();
    const requestLibMock = {
      end: endSpy,
      on: onSpy,
      write: writeSpy,
    };
    let responseMock: any;
    const generateResponseMock = (status: number, call = true) => {
      return {
        on: (_: any, cb: (data: any) => any) => {
          if (call) {
            cb("Response body!");
          }
        },
        setEncoding: () => { },
        statusCode: status,
      };
    };

    afterEach(() => {
      requestMock.restore();
    });

    describe("when communication to the Pact Mock Service is successful", () => {
      beforeEach(() => {
        requestMock = sinon.mock(request.httpRequest);
        responseMock = generateResponseMock(200);

        const args: any = parse("http://localhost:8888/");
        args.method = "GET";
        args.headers = {
          "Content-Type": "application/json",
          "X-Pact-Mock-Service": "true",
        };

        requestMock
          .expects("request")
          .once()
          .withArgs(args)
          .returns(requestLibMock)
          .callsArgWith(1, responseMock);
      });

      describe("and there is no request body", () => {
        it("should should return a successful promise", (done) => {
          const reqPromise = request.send("GET", "http://localhost:8888");
          requestMock.verify();
          expect(onSpy.calledOnce);
          expect(endSpy.calledOnce);
          expect(writeSpy.notCalled);
          expect(reqPromise).to.eventually.equal("Response body!");
          expect(reqPromise).to.eventually.be.fulfilled.notify(done);
        });
      });

      describe("and there is a request body", () => {
        it("should should return a successful promise", (done) => {
          const reqPromise = request.send("GET", "http://localhost:8888", "some body");
          requestMock.verify();
          expect(onSpy.calledOnce);
          expect(endSpy.calledOnce);
          expect(writeSpy.calledOnce);
          expect(reqPromise).to.eventually.equal("Response body!");
          expect(reqPromise).to.eventually.be.fulfilled.notify(done);
        });
      });

    });

    describe("when the pact service returns a failure", () => {
      beforeEach(() => {
        requestMock = sinon.mock(request.httpRequest);
        responseMock = generateResponseMock(500);

        const args: any = parse("http://localhost:8888/");
        args.method = "GET";
        args.headers = {
          "Content-Type": "application/json",
          "X-Pact-Mock-Service": "true",
        };

        requestMock
          .expects("request")
          .once()
          .withArgs(args)
          .returns(requestLibMock)
          .callsArgWith(1, responseMock);
      });

      it("should should return a rejected promise", (done) => {
        const reqPromise = request.send("GET", "http://localhost:8888");
        requestMock.verify();
        expect(onSpy.calledOnce);
        expect(endSpy.calledOnce);
        expect(writeSpy.notCalled);
        expect(reqPromise).to.eventually.be.rejectedWith("Response body!").notify(done);
      });
    });

    describe("when communication to the pact service is a failure", () => {
      const err = "Error: Failed to communicate to Pact Mock Service";
      const requestErrorMock = {
        end: () => { },
        on: (a: string, cb: (err: Error) => {}) => {
          if (a === "error") {
            cb(new Error(err));
          }
        },
        write: () => { },
      };
      beforeEach(() => {
        requestMock = sinon.mock(request.httpRequest);
        responseMock = generateResponseMock(200, false);

        const args: any = parse("http://localhost:8888/");
        args.method = "GET";
        args.headers = {
          "Content-Type": "application/json",
          "X-Pact-Mock-Service": "true",
        };

        requestMock
          .expects("request")
          .once()
          .withArgs(args)
          .returns(requestErrorMock)
          .callsArgWith(1, responseMock);
      });

      it("should should return a rejected promise", (done) => {
        const reqPromise = request.send("GET", "http://localhost:8888");
        requestMock.verify();
        expect(reqPromise).to.eventually.be.rejectedWith(err).notify(done);
      });
    });
  });
});
