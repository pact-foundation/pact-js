/*eslint-disable*/
(function() {

  describe("Client", function() {

    var client, projectsProvider;

    // ugly but works... guess would be good to bring jasmine-beforeAll
    beforeEach(function() {
      client = example.createClient('http://localhost:1234');
      projectsProvider = Pact({ consumer: 'Test DSL', provider: 'Projects' })
    });

    describe("sayHello", function () {
      beforeEach(function (done) {
        projectsProvider.addInteraction({
          uponReceiving: 'a request for hello',
          withRequest: {
            method: 'get',
            path: '/sayHello'
          },
          willRespondWith: {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: { reply: "Hello" }
          }
        }).then(() => done())
      })

      afterEach(function (done) {
        projectsProvider.finalize().then(() => done())
      })

      it("should say hello", function(done) {
        //Run the tests
        client.sayHello()
          .then(projectsProvider.verify)
          .then((data) => {
            expect(JSON.parse(data)).to.eql({ reply: "Hello" });
            done()
          })
          .catch((err) => {
            done(err)
          })
      });
    });

    describe("findFriendsByAgeAndChildren", function () {

      beforeEach(function (done) {
        projectsProvider
          .addInteraction({
            uponReceiving: 'a request friends',
            withRequest: {
              method: 'get',
              path: '/friends',
              query: {
                age: Pact.Matchers.term({generate: '30', matcher: '\\d+'}), //remember query params are always strings
                children: ['Mary Jane', 'James'] // specify params with multiple values in an array
              },
              headers: { 'Accept': 'application/json' }
            },
            willRespondWith: {
              status: 200,
              headers: { "Content-Type": "application/json" },
              body: {
                friends: Pact.Matchers.eachLike({
                  name: Pact.Matchers.somethingLike('Sue') // Doesn't tie the Provider to a particular friend such as 'Sue'
                }, { min: 1 })
              }
            }
          }).then(() => done())
      })

      afterEach(function (done) {
        projectsProvider.finalize().then(() => done())
      });

      it("should return some friends", function(done) {
        //Run the tests
        client.findFriendsByAgeAndChildren('33', ['Mary Jane', 'James'])
          .then(projectsProvider.verify)
          .then((data) => {
            expect(JSON.parse(data)).to.eql({friends: [{ name: 'Sue' }]});
            done()
          })
          .catch((err) => {
            done(err)
          })
      });
    });

    describe("unfriendMe", function () {

      beforeEach(function (done) {
        //Add interaction
        projectsProvider.addInteraction({
          state: 'I am friends with Fred',
          uponReceiving: 'a request to unfriend',
          withRequest: {
            method: 'put',
            path: '/unfriendMe'
          },
          willRespondWith: {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: { reply: "Bye" }
          }
        }).then(() => done())
      })

      afterEach(function (done) {
        projectsProvider.finalize().then(() => done())
      });

      it("should unfriend me", function(done) {
        //Run the tests
        client.unfriendMe()
          .then(projectsProvider.verify)
          .then((data) => {
            expect(JSON.parse(data)).to.eql({ reply: "Bye" })
            done()
          })
          .catch((err) => {
            done(err)
          })
      });

      xdescribe("when there are no friends", function () {
        beforeEach(function (done) {
          //Add interaction
          projectsProvider.addInteraction({
            state: 'I have no friends',
            uponReceiving: 'a request to unfriend',
            withRequest: {
              method: 'put',
              path: '/unfriendMe'
            },
            willRespondWith: {
              status: 404
            }
          }).then(() => done())
        })

        it("returns an error message", function (done) {
          //Run the tests
          client.unfriendMe()
            .catch(projectsProvider.verify)
            .then((data) => {
              expect(data).to.eql('No friends :(')
              done()
            })
        });
      });
    });

  });
})();
