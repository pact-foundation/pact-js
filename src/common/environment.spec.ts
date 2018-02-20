/* tslint:disable:no-unused-expression no-empty */
import * as chai from "chai";
import * as sinon from "sinon";
import mock from "xhr-mock";
const expect = chai.expect;
import { environment } from "./environment";

describe("Environment", () => {
  context("#isBrowserEnvironment", () => {
    const g: any = global;

    beforeEach(() => {
      g.window = {};
      mock.setup();
    });

    afterEach(() => {
      mock.teardown();
      g.window = undefined;
    });

    it("should consider it to be a browser environment", () => {
      expect(environment.isBrowser()).to.be.true;
    });
  });

  context("#isNodeEnvironment", () => {
    it("should consider it to be a node environment", () => {
      expect(environment.isNode()).to.be.true;
    });
  });
});
