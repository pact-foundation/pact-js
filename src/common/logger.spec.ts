/* tslint:disable:no-unused-expression */
import { expect } from "chai";
import * as  proxyquire from "proxyquire";
import * as sinon from "sinon";

describe("Logger", () => {
  const consoleLogSpy = sinon.spy(console, "log");
  const consoleWarnSpy = sinon.spy(console, "warn");

  context("with logging configuration turned on", () => {
    beforeEach(() => {
      consoleLogSpy.reset();
      consoleWarnSpy.reset();
      const logger = proxyquire("./logger", { "./config": { config: { logging: true } } }).logger;
      logger.info("this will be logged");
      logger.warn("this will be logged at warn");
    });

    it("logs a message", () => {
      expect(consoleLogSpy).to.have.been.calledWith("this will be logged");
      expect(consoleWarnSpy).to.have.been.calledWith("this will be logged at warn");
    });
  });

  context("with logging configuration turned off", () => {
    beforeEach(() => {
      consoleLogSpy.reset();
      consoleWarnSpy.reset();
      const logger = proxyquire("./logger", { "./config": { config: { logging: false } } }).logger;
      logger.info("this will be ignored");
      logger.warn("this will be ignored at warn");
    });

    it("ignores a message to be logged", () => {
      expect(consoleLogSpy).to.not.have.been.called;
      expect(consoleWarnSpy).to.not.have.been.called;
    });
  });
});
