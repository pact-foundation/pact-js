const path = require("path")
const chai = require("chai")
// const { Pact } = require("@pact-foundation/pact")
const chaiAsPromised = require("chai-as-promised")
const { PactV3, Matchers } = require("../../../../dist/v3")
const {
  string,
  eachLike,
  integer,
  boolean,
  atLeastOneLike,
  timestamp,
} = Matchers
// const pactv3 = require("pact-js-v3")

const TodoApp = require("../src/todo")

const expect = chai.expect
const MOCK_SERVER_PORT = 2203

chai.use(chaiAsPromised)

// describe("Pact V2", () => {
//   const provider = new Pact({
//     consumer: "TodoApp",
//     provider: "TodoServiceV2",
//     port: MOCK_SERVER_PORT,
//     log: path.resolve(process.cwd(), "logs", "pact.log"),
//     dir: path.resolve(process.cwd(), "pacts"),
//     logLevel: "INFO",
//     spec: 2,
//   })

//   const EXPECTED_BODY = [
//     {
//       id: 1,
//       name: "Project 1",
//       due: "2016-02-11T09:46:56.023Z",
//       tasks: [
//         { id: 1, name: "Do the laundry", done: true },
//         { id: 2, name: "Do the dishes", done: false },
//         { id: 3, name: "Do the backyard", done: false },
//         { id: 4, name: "Do nothing", done: false },
//       ],
//     },
//   ]

//   context("when there are a list of projects", () => {
//     describe("and there is a valid user session", () => {
//       before(done => {
//         provider
//           .setup()
//           .then(() => {
//             return provider.addInteraction({
//               state: "i have a list of projects",
//               uponReceiving: "a request for projects",
//               withRequest: {
//                 method: "GET",
//                 path: "/projects",
//                 query: "from=today",
//                 headers: { Accept: "application/json" },
//               },
//               willRespondWith: {
//                 status: 200,
//                 headers: { "Content-Type": "application/json" },
//                 body: EXPECTED_BODY,
//               },
//             })
//           })
//           .then(() => done())
//       })

//       it("generates a list of TODOs for the main screen", () => {
//         return TodoApp.getProjects().then(projects => {
//           expect(projects)
//             .to.be.an("array")
//             .with.length(1)
//           expect(projects[0].id).to.be.equal(1)
//           expect(projects[0].tasks)
//             .to.be.an("array")
//             .with.length(4)
//           expect(() => provider.verify()).to.not.throw()
//         })
//       })

//       after(() => {
//         return provider.finalize()
//       })
//     })
//   })
// })

describe.only("Pact V3", () => {
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
  })
})

// describe("Pact V3: Ron's interface", () => {
//   context("when there are a list of projects", () => {
//     describe("and there is a valid user session", () => {
//       describe("with JSON request", () => {
//         const provider = pactv3.provider({
//           consumer: "TodoApp",
//           provider: "TodoServiceV3",
//           dir: path.resolve(process.cwd(), "pacts"),
//           logLevel: "INFO",
//         })

//         before(() => {
//           provider
//             .given("i have a list of projects")
//             .uponReceiving("a request for projects")
//             .withRequest({
//               method: "GET",
//               path: "/projects",
//               query: { from: "today" },
//               headers: { Accept: "application/json" },
//             })
//             .willRespondWith({
//               status: 200,
//               headers: { "Content-Type": "application/json" },
//               body: pactv3.eachLike({
//                 id: pactv3.integer(1),
//                 name: pactv3.string("Project 1"),
//                 due: pactv3.timestamp(
//                   "yyyy-MM-dd'T'HH:mm:ss.SZ",
//                   "2016-02-11T09:46:56.023Z"
//                 ),
//                 tasks: pactv3.atLeastOneLike(
//                   {
//                     id: pactv3.integer(),
//                     name: pactv3.string("Do the laundry"),
//                     done: pactv3.boolean(true),
//                   },
//                   4
//                 ),
//               }),
//             })
//         })

//         it("generates a list of TODOs for the main screen", () => {
//           let result = provider.runTest(mockserver => {
//             console.log("In Test Function", mockserver)
//             return TodoApp.setUrl(mockserver.url)
//               .getProjects()
//               .then(projects => {
//                 expect(projects)
//                   .to.be.an("array")
//                   .with.length(1)
//                 expect(projects[0].id).to.be.equal(1)
//                 expect(projects[0].tasks)
//                   .to.be.an("array")
//                   .with.length(4)
//               })
//           })
//           console.log("result from runTest", result)
//           return result
//         })
//       })

//       describe("with XML requests", () => {
//         const provider = pactv3.provider({
//           consumer: "TodoApp",
//           provider: "TodoServiceV3",
//           dir: path.resolve(process.cwd(), "pacts"),
//           logLevel: "INFO",
//         })

//         before(() => {
//           provider
//             .given("i have a list of projects")
//             .uponReceiving("a request for projects in XML")
//             .withRequest({
//               method: "GET",
//               path: "/projects",
//               query: { from: "today" },
//               headers: { Accept: "application/xml" },
//             })
//             .willRespondWith({
//               status: 200,
//               headers: { "Content-Type": "application/xml" },
//               body: `<?xml version="1.0" encoding="UTF-8"?>
//                   <projects>
//                     <project id="1" name="Project 1" due="2016-02-11T09:46:56.023Z">
//                       <tasks>
//                         <task id="1" name="Do the laundry" done="true"/>
//                         <task id="2" name="Do the dishes" done="false"/>
//                         <task id="3" name="Do the backyard" done="false"/>
//                         <task id="4" name="Do nothing" done="false"/>
//                       </tasks>
//                     </project>
//                     <project/>
//                   </projects>
//                 `,
//             })
//         })

//         it("generates a list of TODOs for the main screen", () => {
//           let result = provider.runTest(mockserver => {
//             console.log("In Test Function", mockserver)
//             return TodoApp.setUrl(mockserver.url)
//               .getProjects("xml")
//               .then(projects => {
//                 expect(projects)
//                   .to.be.an("array")
//                   .with.length(2)
//                 expect(projects[0].id).to.be.equal("1")
//                 expect(projects[0].tasks.task)
//                   .to.be.an("array")
//                   .with.length(4)
//               })
//           })
//           console.log("result from runTest", result)
//           return result
//         })
//       })
//     })
//   })
// })
