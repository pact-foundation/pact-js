/*eslint-disable*/
(function () {

  describe("Client", function () {

    var client, provider

    beforeAll(function (done) {
      client = example.createClient('http://localhost:1234')
      provider = Pact({ consumer: 'Karma Jasmine', provider: 'Hello' })
      setTimeout(function() {
        provider.removeInteractions()
          .then(done())
      }, 2000)
    })

    afterAll(function (done) {
      provider.writePact()
        .then(function () { done() }, function (err) { done.fail(err) })
    })

    describe("sayHello", function () {
      it("should say hello", function (done) {
        console.log('Arrange 1')
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
          .then(function () {
            console.log('Act 1')
            return client.sayHello()
          })
          .then(function (data) {
            console.log('Assert 1')
            expect(JSON.parse(data.responseText)).toEqual({ reply: "Hello" })
          })
          .then(function () {
            console.log('Verify 1')
            return provider.verify()
          })
          .then(function () {
            console.log('Done 1')
            done()
          })
          .catch(function (err) {
            done.fail(err)
          })
      })

      it("should return some friends", function (done) {
        console.log('Arrange 2')
        provider.addInteraction({
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
          .then(function () {
            console.log('Act 2')
            return client.findFriendsByAgeAndChildren('33', ['Mary Jane', 'James'])
          })
          .then(function (res) {
            console.log('Assert 2')
            expect(JSON.parse(res.responseText)).toEqual({ friends: [{ name: 'Sue' }] })
          })
          .then(function () {
            console.log('Verify 2')
            return provider.verify()
          })
          .then(function () {
            console.log('Done 2')
            done()
          })
          .catch(function (err) {
            done.fail(err)
          })
      })

      it("should unfriend me", function (done) {
        console.log('Arrange 3')
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
          .then(function () {
            console.log('Act 3')
            return client.unfriendMe()
          })
          .then(function (res) {
            console.log('Assert 3')
            expect(JSON.parse(res.responseText)).toEqual({ reply: "Bye" })
          })
          .then(function () {
            console.log('Verify 3')
            return provider.verify()
          })
          .then(function () {
            console.log('Done 3')
            done()
          })
          .catch(function (err) {
            done.fail(err)
          })
      })

      it("returns an error message", function (done) {
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
          .then(function () {
            return client.unfriendMe()
          })
          .then(function () {
            done(new Error('expected request to /unfriend me to fail'))
          })
          .catch(function (e) {
            console.log('Assert 4')
            expect(e.status).toEqual(404)
            expect(JSON.parse(e.responseText).error).toEqual('No friends :(')
            console.log('Verify 4')
            return provider.verify()
          })
          .then(function ()  {
            console.log('Done 4')
            done()
          })
      })

    })
  })
})()
