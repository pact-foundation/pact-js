import chai from "chai"
import chaiAsPromised from "chai-as-promised"
import sinon, { SinonSpy } from "sinon"

import express from "express"

import { createProxyStateHandler } from "./stateHandler"
import * as setupStatesModule from "./setupStates"
import { ProxyOptions } from "../types"

chai.use(chaiAsPromised)

const { expect } = chai

describe("#createProxyStateHandler", () => {
  let res: any
  const mockResponse = {
    sendStatus: (status: number) => {
      res = status
    },
    status: (status: number) => {
      res = status
      return {
        send: () => {},
      }
    },
  }

  context("when valid state handlers are provided", () => {
    beforeEach(() => {
      sinon.stub(setupStatesModule, "setupStates").returns(Promise.resolve())
    })
    afterEach(() => {
      ;(setupStatesModule.setupStates as SinonSpy).restore()
    })
    it("returns a 200", () => {
      const h = createProxyStateHandler({} as ProxyOptions)

      return expect(
        h({} as express.Request, mockResponse as express.Response)
      ).to.eventually.be.fulfilled.then(() => {
        expect(res).to.eql(200)
      })
    })
  })

  context("when there is a problem with a state handler", () => {
    beforeEach(() => {
      sinon
        .stub(setupStatesModule, "setupStates")
        .returns(Promise.reject(new Error("state error")))
    })
    afterEach(() => {
      ;(setupStatesModule.setupStates as SinonSpy).restore()
    })
    it("returns a 500", () => {
      const h = createProxyStateHandler({} as ProxyOptions)

      return expect(
        h({} as express.Request, mockResponse as express.Response)
      ).to.eventually.be.fulfilled.then(() => {
        expect(res).to.eql(500)
      })
    })
  })
})
