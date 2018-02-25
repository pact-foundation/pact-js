/* tslint:disable:no-unused-expression object-literal-sort-keys no-empty no-console */
import * as Promise from "bluebird";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as path from "path";
import * as superagent from "superagent";
import { HTTPMethod } from "./common/request";
import { Matchers, Pact } from "./pact";

chai.use(chaiAsPromised);
const expect = chai.expect;
const { eachLike, like, term } = Matchers;

describe("Integration", () => {

  ["http", "https"].forEach((protocol) => {
    describe(`Pact on ${protocol} protocol`, () => {
      const MOCK_PORT = Math.floor(Math.random() * 999) + 9000;
      const PROVIDER_URL = `${protocol}://localhost:${MOCK_PORT}`;
      const provider = new Pact({
        consumer: "Matching Service",
        provider: "Animal Profile Service",
        port: MOCK_PORT,
        log: path.resolve(process.cwd(), "logs", "mockserver-integration.log"),
        dir: path.resolve(process.cwd(), "pacts"),
        logLevel: "warn",
        ssl: (protocol === "https"),
        spec: 2,
      });

      const EXPECTED_BODY = [{
        id: 1,
        name: "Project 1",
        due: "2016-02-11T09:46:56.023Z",
        tasks: [
          {
            id: 1,
            name: "Do the laundry",
            done: true,
          },
          {
            id: 2,
            name: "Do the dishes",
            done: false,
          },
          {
            id: 3,
            name: "Do the backyard",
            done: false,
          },
          {
            id: 4,
            name: "Do nothing",
            done: false,
          },
        ],
      }];

      before(() => provider.setup());

      // once all tests are run, write pact and remove interactions
      after(() => provider.finalize());

      context("with a single request", () => {

        // add interactions, as many as needed
        before(() => provider.addInteraction({
          state: "i have a list of projects",
          uponReceiving: "a request for projects",
          withRequest: {
            method: HTTPMethod.GET,
            path: "/projects",
            headers: {
              Accept: "application/json",
            },
          },
          willRespondWith: {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
            body: EXPECTED_BODY,
          },
        }));

        // execute your assertions
        it("returns the correct body", () => superagent
          .get(`${PROVIDER_URL}/projects`)
          .set({
            Accept: "application/json",
          })
          .then((res: any) => {
            expect(res.text).to.eql(JSON.stringify(EXPECTED_BODY));
          }));

        // verify with Pact, and reset expectations
        it("successfully verifies", () => provider.verify());
      });

      context("with a single request with query string parameters", () => {

        // add interactions, as many as needed
        before(() => {
          return provider.addInteraction({
            state: "i have a list of projects",
            uponReceiving: "a request for projects with a filter",
            withRequest: {
              method: HTTPMethod.GET,
              path: "/projects",
              query: {
                from: "today",
              },
              headers: {
                Accept: "application/json",
              },
            },
            willRespondWith: {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
              body: EXPECTED_BODY,
            },
          });
        });

        // execute your assertions
        it("returns the correct body", () => superagent
          .get(`${PROVIDER_URL}/projects?from=today`)
          .set({
            Accept: "application/json",
          })
          .then((res: any) => {
            expect(res.text).to.eql(JSON.stringify(EXPECTED_BODY));
          }));

        // verify with Pact, and reset expectations
        it("successfully verifies", () => provider.verify());
      });

      context("with a single request and eachLike, like, term", () => {

        // add interactions, as many as needed
        before(() => {
          return provider.addInteraction({
            state: "i have a list of projects but I dont know how many",
            uponReceiving: "a request for such projects",
            withRequest: {
              method: HTTPMethod.GET,
              path: "/projects",
              headers: {
                Accept: "application/json",
              },
            },
            willRespondWith: {
              status: 200,
              headers: {
                "Content-Type": term({
                  generate: "application/json",
                  matcher: "application\/json",
                }),
              },
              body: [{
                id: 1,
                name: "Project 1",
                due: "2016-02-11T09:46:56.023Z",
                tasks: eachLike({
                  id: like(1),
                  name: like("Do the laundry"),
                  done: like(true),
                }, {
                    min: 4,
                  }),
              }],
            },
          });
        });

        // execute your assertions
        it("returns the correct body", () => {
          const verificationPromise = superagent
            .get(`${PROVIDER_URL}/projects`)
            .set({ Accept: "application/json" })
            .then((res: any) => JSON.parse(res.text)[0]);

          return expect(verificationPromise).to.eventually.have.property("tasks");
        });

        // verify with Pact, and reset expectations
        it("successfully verifies", () => provider.verify());
      });

      context("with two requests", () => {

        before(() => {
          const interaction1 = provider.addInteraction({
            state: "i have a list of projects",
            uponReceiving: "a request for projects",
            withRequest: {
              method: HTTPMethod.GET,
              path: "/projects",
              headers: {
                Accept: "application/json",
              },
            },
            willRespondWith: {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
              body: EXPECTED_BODY,
            },
          });

          const interaction2 = provider.addInteraction({
            state: "i have a list of projects",
            uponReceiving: "a request for a project that does not exist",
            withRequest: {
              method: HTTPMethod.GET,
              path: "/projects/2",
              headers: {
                Accept: "application/json",
              },
            },
            willRespondWith: {
              status: 404,
              headers: {
                "Content-Type": "application/json",
              },
            },
          });

          return Promise.all([interaction1, interaction2]);
        });

        it("allows two requests", () => {
          const verificationPromise =
            superagent.get(`${PROVIDER_URL}/projects`)
              .set({
                Accept: "application/json",
              })
              .then((res: any) => res.text);

          const verificationPromise404 =
            superagent.get(`${PROVIDER_URL}/projects/2`).set({
              Accept: "application/json",
            });
          return Promise.all([
            expect(verificationPromise).to.eventually.equal(JSON.stringify(EXPECTED_BODY)),
            expect(verificationPromise404).to.eventually.be.rejected,
          ]);
        });

        // verify with Pact, and reset expectations
        it("successfully verifies", () => provider.verify());
      });

      context("with an unexpected interaction", () => {
        // add interactions, as many as needed
        before(() => provider.addInteraction({
          state: "i have a list of projects",
          uponReceiving: "a request for projects",
          withRequest: {
            method: HTTPMethod.GET,
            path: "/projects",
            headers: {
              Accept: "application/json",
            },
          },
          willRespondWith: {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
            body: EXPECTED_BODY,
          },
        }).then(() => console.log("Adding interaction worked"), () => console.warn("Adding interaction failed.")));

        it("fails verification", () => {
          const verificationPromise =
            superagent.get(`${PROVIDER_URL}/projects`)
              .set({ Accept: "application/json" })
              .then(() => superagent.delete(`${PROVIDER_URL}/projects/2`).catch(() => { }))
              .then(() => provider.verify());

          return expect(verificationPromise)
            .to.be.rejectedWith("Pact verification failed - expected interactions did not match actual.");
        });
      });
    });
  });
});
