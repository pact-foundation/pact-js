/*eslint-disable*/
(function () {

  describe("Client", function () {

    var client, provider

    beforeAll(function (done) {
      client = example.createClient('http://localhost:1234')
      provider = Pact({ port: 1234 })

      // required for slower Travis CI environment
      setTimeout(function () { done() }, 2000)

      // Required if run with `singleRun: false`
      provider.removeInteractions()
    })

    afterAll(function (done) {
      provider.finalize()
        .then(function () { done() }, function (err) { done.fail(err) })
    })

    describe("sayHello", function () {
      beforeAll(function (done) {
        provider.addInteraction({
          uponReceiving: 'a request for hello',
          withRequest: {
            method: 'GET',
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

      it("should say hello", function (done) {
        //Run the tests
        client.sayHello()
          .then(function (data) {
            expect(JSON.parse(data.responseText)).toEqual({ reply: "Hello" })
            done()
          })
          .catch(function (err) {
            done.fail(err)
          })
      })

      // verify with Pact, and reset expectations
      it('successfully verifies', function (done) {
        provider.verify()
          .then(function (a) {
            done()
          }, function (e) {
            done.fail(e)
          })
      })
    })

    describe("findFriendsByAgeAndChildren", function () {

      beforeAll(function (done) {
        provider
          .addInteraction({
            uponReceiving: 'a request friends',
            withRequest: {
              method: 'GET',
              path: '/friends',
              query: {
                age: Pact.Matchers.term({ generate: '30', matcher: '\\d+' }), //remember query params are always strings
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

      it("should return some friends", function (done) {
        //Run the tests
        client.findFriendsByAgeAndChildren('33', ['Mary Jane', 'James'])
          .then(function (res) {
            expect(JSON.parse(res.responseText)).toEqual({ friends: [{ name: 'Sue' }] })
            done()
          })
          .catch(function (err) {
            done.fail(err)
          })
      })

      // verify with Pact, and reset expectations
      // verify with Pact, and reset expectations
      it('successfully verifies', function (done) {
        provider.verify()
          .then(function (a) {
            done()
          }, function (e) {
            done.fail(e)
          })
      })
    })

    describe("unfriendMe", function () {

      afterEach(function () {
        return provider.removeInteractions()
      })

      describe("when I have some friends", function () {

        beforeAll(function (done) {
          //Add interaction
          provider.addInteraction({
            state: 'I am friends with Fred',
            uponReceiving: 'a request to unfriend',
            withRequest: {
              method: 'PUT',
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

        it("should unfriend me", function (done) {
          //Run the tests
          client.unfriendMe()
            .then(function (res) {
              expect(JSON.parse(res.responseText)).toEqual({ reply: "Bye" })
              done()
            })
            .catch(function (err) {
              done.fail(err)
            })
        })

        // verify with Pact, and reset expectations
        it('successfully verifies', function (done) {
          provider.verify()
            .then(function (a) {
              done()
            }, function (e) {
              done.fail(e)
            })
        })
      })

      // verify with Pact, and reset expectations
      describe("when there are no friends", function () {
        beforeAll(function (done) {
          //Add interaction
          provider.addInteraction({
            state: 'I have no friends',
            uponReceiving: 'a request to unfriend',
            withRequest: {
              method: 'PUT',
              path: '/unfriendMe'
            },
            willRespondWith: {
              status: 404,
              body: { error: "No friends :(" }
            }
          })
            .then(function () { done() }, function (err) { done.fail(err) })
        })

        it("returns an error message", function (done) {
          //Run the tests
          client.unfriendMe().then(function () {
            done(new Error('expected request to /unfriend me to fail'))
          }, function (e) {
            expect(e.status).toEqual(404)
            expect(JSON.parse(e.responseText).error).toEqual('No friends :(')
            done()
          })

        })

        // verify with Pact, and reset expectations
        // verify with Pact, and reset expectations
        it('successfully verifies', function (done) {
          provider.verify()
            .then(function (a) {
              done()
            }, function (e) {
              done.fail(e)
            })
        })
      })
    })

  })
})()
