/*eslint-disable*/
(function() {

  describe("Client", function() {

    var client, helloProvider;

    // ugly but works... guess would be good to bring jasmine-beforeAll
    beforeEach(function() {
      client = example.createClient('http://localhost:1234');
      helloProvider = Pact.Verifier({ consumer: 'Test DSL', provider: 'Projects' })
    });

    describe("sayHello", function () {
      it("should say hello", function(done) {

        helloProvider
          .interaction()
          .uponReceiving("a request for hello")
          .withRequest("get", "/sayHello")
          .willRespondWith(200, {
            "Content-Type": "application/json"
          }, {
            reply: "Hello"
          });

        //Run the tests
        helloProvider.verify(client.sayHello)
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

      it("should return some friends", function(done) {
        //Add interaction
        helloProvider
          .interaction()
          .uponReceiving("a request friends")
          .withRequest('get', '/friends', {
            age: Pact.Matcher.term({generate: '30', matcher: '\\d+'}), //remember query params are always strings
            children: ['Mary Jane', 'James'] // specify params with multiple values in an array
          }, { 'Accept': 'application/json' })
          .willRespondWith(200, { "Content-Type": "application/json" },
            {
              friends: Pact.Matcher.eachLike({
                name: Pact.Matcher.somethingLike('Sue') // Doesn't tie the Provider to a particular friend such as 'Sue'
              }, { min: 1 })
            }
          );

        function runFn () {
          return client.findFriendsByAgeAndChildren('33', ['Mary Jane', 'James'])
        }

        //Run the tests
        helloProvider.verify(runFn)
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

      it("should unfriend me", function(done) {
        //Add interaction
        helloProvider
          .interaction()
          .given("I am friends with Fred")
          .uponReceiving("a request to unfriend")
          .withRequest("put", "/unfriendMe")
          .willRespondWith(200, { "Content-Type": "application/json" }, { reply: "Bye" });

        //Run the tests
        helloProvider.verify(client.unfriendMe)
          .then((data) => {
            expect(JSON.parse(data)).to.eql({ reply: "Bye" });
            done()
          })
          .catch((err) => {
            done(err)
          })
      });

      describe("when there are no friends", function () {
        it("returns an error message", function (done) {
          //Add interaction
          helloProvider
            .interaction()
            .given("I have no friends")
            .uponReceiving("a request to unfriend")
            .withRequest("put", "/unfriendMe")
            .willRespondWith(404);

          //Run the tests
          helloProvider.verify(client.unfriendMe)
            .catch((err) => {
              expect(err).to.eql('No friends :(');
              done()
            })
        });
      });
    });

  });
})();
