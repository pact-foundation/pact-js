const path = require("path")
const chai = require("chai")
const chaiAsPromised = require("chai-as-promised")
const { PactV3, MatchersV3, XmlBuilder } = require("@pact-foundation/pact/v3")
const {
  string,
  eachLike,
  integer,
  boolean,
  atLeastOneLike,
  timestamp,
} = MatchersV3

const TodoApp = require("../src/todo")

const expect = chai.expect

chai.use(chaiAsPromised)

describe("Pact V3", () => {
  context("when there are a list of projects", () => {
    describe("and there is a valid user session", () => {
      describe("with JSON request", () => {
        before(() => {
          provider = new PactV3({
            consumer: "TodoApp",
            provider: "TodoServiceV3",
            dir: path.resolve(process.cwd(), "pacts"),
          })
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
                  "yyyy-MM-dd'T'HH:mm:ss.SSSX",
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
      before(() => {
        provider = new PactV3({
          consumer: "TodoApp",
          provider: "TodoServiceV3",
          dir: path.resolve(process.cwd(), "pacts"),
        })
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
            body: new XmlBuilder("1.0", "UTF-8", "ns1:projects").build(el => {
              el.setAttributes({
                id: "1234",
                "xmlns:ns1": "http://some.namespace/and/more/stuff",
              })
              el.eachLike(
                "ns1:project",
                {
                  id: integer(1),
                  type: "activity",
                  name: string("Project 1"),
                  // TODO: implement XML generators
                  // due: timestamp(
                  //   "yyyy-MM-dd'T'HH:mm:ss.SZ",
                  //   "2016-02-11T09:46:56.023Z"
                  // ),
                },
                project => {
                  project.appendElement("ns1:tasks", {}, task => {
                    task.eachLike(
                      "ns1:task",
                      {
                        id: integer(1),
                        name: string("Task 1"),
                        done: boolean(true),
                      },
                      null,
                      { examples: 5 }
                    )
                  })
                },
                { examples: 2 }
              )
            }),
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
              expect(projects["ns1:project"])
                .to.be.an("array")
                .with.length(2)
              expect(projects["ns1:project"][0].id).to.be.equal("1")
              expect(projects["ns1:project"][0]["ns1:tasks"]["ns1:task"])
                .to.be.an("array")
                .with.length(5)
            })
        })
        console.log("result from runTest", result)
        return result
      })
    })

    describe("with image uploads", () => {
      before(() => {
        provider = new PactV3({
          consumer: "TodoApp",
          provider: "TodoServiceV3",
          dir: path.resolve(process.cwd(), "pacts"),
        })
        provider
          .given("i have a project", { id: "1001", name: "Home Chores" })
          .uponReceiving("a request to store an image against the project")
          .withRequestBinaryFile(
            { method: "POST", path: "/projects/1001/images" },
            "image/jpeg",
            path.resolve(__dirname, "example.jpg")
          )
          .willRespondWith({ status: 201 })
      })

      it("stores the image against the project", async () => {
        let result = await provider.executeTest(mockserver => {
          console.log("In Test Function", mockserver)
          return TodoApp.setUrl(mockserver.url).postImage(
            1001,
            path.resolve(__dirname, "example.jpg")
          )
        })
        console.log("result from runTest", result.status)
        expect(result.status).to.be.eq(201)
        return result
      })
    })
  })
})
