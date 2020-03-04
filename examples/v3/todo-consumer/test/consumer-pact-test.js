const path = require("path")
const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
// const { PactV3, Matchers } = require("@pact-foundation/pact/dist/v3")
const { PactV3, Matchers, XmlBuilder } = require("../../../../src/v3")
const {
  string,
  eachLike,
  integer,
  boolean,
  atLeastOneLike,
  timestamp,
} = Matchers

const TodoApp = require("../src/todo")

const expect = chai.expect

chai.use(chaiAsPromised)

describe("Pact V3", () => {
  context("when there are a list of projects", () => {
    describe("and there is a valid user session", () => {
      describe("with JSON request", () => {
        const provider = new PactV3({
          consumer: "TodoApp",
          provider: "TodoServiceV3",
          dir: path.resolve(process.cwd(), "pacts"),
          logLevel: "INFO",
        })

        before(() => {
          provider
            .given("i have a list of projects")
            .uponReceiving("a request for projects")
            .withRequest({
              method: "GET",
              path: "/projects",
              query: { from: "today" },
              headers: { Accept: "application/json" },
            })
            .willRespondWith({
              status: 200,
              headers: { "Content-Type": "application/json" },
              body: eachLike({
                id: integer(1),
                name: string("Project 1"),
                due: timestamp(
                  "yyyy-MM-dd'T'HH:mm:ss.SZ",
                  "2016-02-11T09:46:56.023Z"
                ),
                tasks: atLeastOneLike(
                  {
                    id: integer(),
                    name: string("Do the laundry"),
                    done: boolean(true),
                  },
                  4
                ),
              }),
            })
        })

        it("generates a list of TODOs for the main screen", () => {
          let result = provider.executeTest(mockserver => {
            console.log("In Test Function", mockserver)
            return TodoApp.setUrl(mockserver.url)
              .getProjects()
              .then(projects => {
                expect(projects)
                  .to.be.an("array")
                  .with.length(1)
                expect(projects[0].id).to.be.equal(1)
                expect(projects[0].tasks)
                  .to.be.an("array")
                  .with.length(4)
              })
          })
          console.log("result from runTest", result)
          return result
        })
      })
    })

    describe("with XML requests", () => {
      const provider = new PactV3({
        consumer: "TodoApp",
        provider: "TodoServiceV3",
        dir: path.resolve(process.cwd(), "pacts"),
        logLevel: "INFO",
      })

      before(() => {
        provider
          .given("i have a list of projects")
          .uponReceiving("a request for projects in XML")
          .withRequest({
            method: "GET",
            path: "/projects",
            query: { from: "today" },
            headers: { Accept: "application/xml" },
          })
          .willRespondWith({
            status: 200,
            headers: { "Content-Type": "application/xml" },
            body: new XmlBuilder("1.0", "UTF-8", "projects").build(
              el => {
                el.setAttributes({
                  foo: "bar",
                })
                el.eachLike("project", {
                  id: integer(1),
                  type: "activity",
                  name: string("Project 1"),

                  // I think this panics/breaks something somewhere!
                  // due: timestamp(
                  //   "yyyy-MM-dd'T'HH:mm:ss.SZ",
                  //   "2016-02-11T09:46:56.023Z"
                  // ),
                }, project => {})
              }
            ),
            // body: `<?xml version="1.0" encoding="UTF-8"?>
            //     <projects foo="bar">
            //       <project id="1" name="Project 1" due="2016-02-11T09:46:56.023Z">
            //         <tasks>
            //           <task id="1" name="Do the laundry" done="true"/>
            //           <task id="2" name="Do the dishes" done="false"/>
            //           <task id="3" name="Do the backyard" done="false"/>
            //           <task id="4" name="Do nothing" done="false"/>
            //         </tasks>
            //       </project>
            //       <project/>
            //     </projects>
            //   `,
          })
      })

      it("generates a list of TODOs for the main screen", () => {
        let result = provider.executeTest(mockserver => {
          console.log("In Test Function", mockserver)
          return TodoApp.setUrl(mockserver.url)
            .getProjects("xml")
            .then(projects => {
              expect(projects)
                .to.be.an("array")
                .with.length(2)
              expect(projects[0].id).to.be.equal("1")
              expect(projects[0].tasks.task)
                .to.be.an("array")
                .with.length(4)
            })
        })
        console.log("result from runTest", result)
        return result
      })
    })
  })
})
