/*eslint-disable*/
(function() {

  describe("Client", function() {

    var client, projectsProvider;

    beforeAll(function(done) {
      client = example.createClient('http://localhost:1234')
      projectsProvider = Pact({ consumer: 'Karma Jasmine', provider: 'Hello' })
      // required for slower Travis CI environment
      setTimeout(function () { done() }, 2000)
    });

    afterAll(function (done) {
      projectsProvider.finalize()
        .then(function () { done() }, function (err) { done.fail(err) })
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
        })
        .then(function () { done() }, function (err) { done.fail(err) })
      })

      it("should say hello", function(done) {
        //Run the tests
        client.sayHello()
          .then(projectsProvider.verify)
          .then(function (data) {
            expect(JSON.parse(data)).toEqual({ reply: "Hello" });
            done()
          })
          .catch(function (err) {
            done.fail(err)
          })
      });
    });

    describe("findFriendsByAgeAndChildren", function () {

      beforeEach(function (done) {
        //Add interaction
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
          })
          .then(function () { done() }, function (err) { done.fail(err) })
      })

      it("should return some friends", function(done) {
        //Run the tests
        client.findFriendsByAgeAndChildren('33', ['Mary Jane', 'James'])
          .then(projectsProvider.verify)
          .then(function (data) {
            expect(JSON.parse(data)).toEqual({friends: [{ name: 'Sue' }]});
            done()
          })
          .catch(function (err) {
            done.fail(err)
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
        })
        .then(function () { done() }, function (err) { done.fail(err) })
      })

      it("should unfriend me", function(done) {
        //Run the tests
        client.unfriendMe()
          .then(projectsProvider.verify)
          .then(function (data) {
            expect(JSON.parse(data)).toEqual({ reply: "Bye" });
            done()
          })
          .catch(function (err) {
            done.fail(err)
          })
      });

      xdescribe("when there are no friends", function () {
        beforeEach(function (done) {
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
          })
          .then(function () { done() }, function (err) { done.fail(err) })
        })

        it("returns an error message", function (done) {
          //Run the tests
          client.unfriendMe()
            .catch(projectsProvider.verify)
            .then(function (data) {
              expect(data).toEqual('No friends :(');
              done()
            })
            .catch(function (err) {
              done.fail(err)
            })
        });
      });
    });
  });
})();
