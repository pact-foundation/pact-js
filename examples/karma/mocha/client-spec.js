/*eslint-disable*/
;(function() {
  describe("Client", function() {
    var client, provider

    before(function(done) {
      client = example.createClient("http://localhost:1234")
      provider = new Pact.PactWeb()
      // required for slower Travis CI environment
      setTimeout(function() {
        done()
      }, 1000)
    })

    after(function() {
      return provider.finalize()
    })

    describe("sayHello", function() {
      before(function() {
        return provider.addInteraction({
          uponReceiving: "a request for hello",
          withRequest: {
            method: "GET",
            path: "/sayHello",
          },
          willRespondWith: {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              reply: "Hello",
            },
          },
        })
      })

      it("says hello", function() {
        //Run the tests
        return client.sayHello().then(function(data) {
          expect(JSON.parse(data.responseText)).to.eql({
            reply: "Hello",
          })
          // verify with Pact, and reset expectations
          return provider.verify()
        })
      })
    })

    describe("findFriendsByAgeAndChildren", function() {
      before(function() {
        return provider.addInteraction({
          uponReceiving: "a request friends",
          withRequest: {
            method: "GET",
            path: "/friends",
            query: {
              age: Pact.Matchers.term({
                generate: "30",
                matcher: "\\d+",
              }), //remember query params are always strings
              children: ["Mary Jane", "James"], // specify params with multiple values in an array
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
            body: {
              friends: Pact.Matchers.eachLike(
                {
                  name: Pact.Matchers.somethingLike("Sue"), // Doesn't tie the Provider to a particular friend such as 'Sue'
                },
                {
                  min: 1,
                }
              ),
            },
          },
        })
      })

      it("returns some friends", function() {
        //Run the tests
        return client
          .findFriendsByAgeAndChildren("33", ["Mary Jane", "James"])
          .then(function(res) {
            expect(JSON.parse(res.responseText)).to.eql({
              friends: [
                {
                  name: "Sue",
                },
              ],
            })
            // verify with Pact, and reset expectations
            return provider.verify()
          })
      })
    })

    describe("unfriendMe", function() {
      afterEach(function() {
        return provider.removeInteractions()
      })

      describe("when I have some friends", function() {
        before(function() {
          //Add interaction
          return provider.addInteraction({
            state: "I am friends with Fred",
            uponReceiving: "a request to unfriend",
            withRequest: {
              method: "PUT",
              path: "/unfriendMe",
            },
            willRespondWith: {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
              body: {
                reply: "Bye",
              },
            },
          })
        })

        it("unfriends me", function() {
          //Run the tests
          return client.unfriendMe().then(function(res) {
            expect(JSON.parse(res.responseText)).to.eql({
              reply: "Bye",
            })
            // verify with Pact, and reset expectations
            return provider.verify()
          })
        })
      })

      // verify with Pact, and reset expectations
      describe("when there are no friends", function() {
        before(function() {
          //Add interaction
          return provider.addInteraction({
            state: "I have no friends",
            uponReceiving: "a request to unfriend",
            withRequest: {
              method: "PUT",
              path: "/unfriendMe",
            },
            willRespondWith: {
              status: 404,
              body: {},
            },
          })
        })

        it("returns an error message", function() {
          //Run the tests
          return client.unfriendMe().then(
            function() {
              throw new Error("expected request to /unfriend me to fail")
            },
            function(e) {
              expect(e).to.eql("No friends :(")
              // verify with Pact, and reset expectations
              return provider.verify()
            }
          )
        })
      })
    })
  })
})()
