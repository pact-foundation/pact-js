import { Test } from "@nestjs/testing"
import { pactWith } from "jest-pact"
import { HttpStatus } from "@nestjs/common"
import { AppModule } from "../src/app.module"
import { Matchers, Pact } from "@pact-foundation/pact"
import { AppService } from "../src/app.service"
import { Animal } from "../src/animal.interface"

pactWith(
  { consumer: "NestJS Consumer Example", provider: "NestJS Provider Example" },
  (provider: Pact) => {
    let animalsService: AppService

    beforeAll(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
      }).compile()
      animalsService = moduleRef.get(AppService)

      process.env.API_HOST = provider.mockService.baseUrl
    })

    // Alias flexible matchers for simplicity
    const {
      eachLike,
      like,
      term,
      iso8601DateTimeWithMillis,
      extractPayload,
    } = Matchers

    // Animal we want to match :)
    const suitor: Animal = {
      id: 2,
      available_from: new Date("2017-12-04T14:47:18.582Z"),
      first_name: "Nanny",
      animal: "goat",
      last_name: "Doe",
      age: 27,
      gender: "F",
      location: {
        description: "Werribee Zoo",
        country: "Australia",
        post_code: 3000,
      },
      eligibility: {
        available: true,
        previously_married: true,
      },
      interests: ["walks in the garden/meadow", "parkour"],
    }

    const MIN_ANIMALS = 2

    /*
     * Define animal payload, with flexible matchers
     * This makes the test much more resilient to changes in actual data.
     * Here we specify the 'shape' of the object that we care about.
     * It is also import here to not put in expectations for parts of the
     * API we don't care about
     */
    const animalBodyExpectation = {
      id: like(1),
      available_from: iso8601DateTimeWithMillis(),
      first_name: like("Billy"),
      last_name: like("Goat"),
      animal: like("goat"),
      age: like(21),
      gender: term({
        matcher: "F|M",
        generate: "M",
      }),
      location: {
        description: like("Melbourne Zoo"),
        country: like("Australia"),
        post_code: like(3000),
      },
      eligibility: {
        available: like(true),
        previously_married: like(false),
      },
      interests: eachLike("walks in the garden/meadow"),
    }

    // Define animal list payload, reusing existing object matcher
    const animalListExpectation = eachLike(animalBodyExpectation, {
      min: MIN_ANIMALS,
    })

    // Configure and import consumer API
    // Note that we update the API endpoint to point at the Mock Service

    // Verify service client works as expected.
    //
    // Note that we don't call the consumer API endpoints directly, but
    // use unit-style tests that test the collaborating function behaviour -
    // we want to test the function that is calling the external service.
    describe("when a call to list all animals from the Animal Service is made", () => {
      describe("and the user is not authenticated", () => {
        beforeAll(() =>
          provider.addInteraction({
            state: "is not authenticated",
            uponReceiving: "a request for all animals",
            withRequest: {
              method: "GET",
              path: "/animals/available",
            },
            willRespondWith: {
              status: HttpStatus.UNAUTHORIZED,
            },
          })
        )

        it("returns a 401 unauthorized", () => {
          return expect(
            animalsService.suggestion(suitor)
          ).rejects.toThrowError()
        })
      })

      describe("and the user is authenticated", () => {
        describe("and there are animals in the database", () => {
          beforeAll(() =>
            provider.addInteraction({
              state: "Has some animals",
              uponReceiving: "a request for all animals",
              withRequest: {
                method: "GET",
                path: "/animals/available",
                headers: { Authorization: "Bearer token" },
              },
              willRespondWith: {
                status: HttpStatus.OK,
                headers: {
                  "Content-Type": "application/json; charset=utf-8",
                },
                body: animalListExpectation,
              },
            })
          )

          it("returns a list of animals", async () => {
            const suggestedMates = await animalsService.suggestion(suitor)

            expect(suggestedMates).toHaveProperty("suggestions")

            const { suggestions } = suggestedMates

            expect(suggestions).toHaveLength(MIN_ANIMALS)
            expect(suggestions[0].score).toBe(94)
          })
        })
      })
    })

    describe("when a call to the Animal Service is made to retreive a single animal by ID", () => {
      describe("and there is an animal in the DB with ID 1", () => {
        beforeAll(() =>
          provider.addInteraction({
            state: "Has an animal with ID 1",
            uponReceiving: "a request for an animal with ID 1",
            withRequest: {
              method: "GET",
              path: term({
                generate: "/animals/1",
                matcher: "/animals/[0-9]+",
              }),
              headers: { Authorization: "Bearer token" },
            },
            willRespondWith: {
              status: HttpStatus.OK,
              headers: {
                "Content-Type": "application/json; charset=utf-8",
              },
              body: animalBodyExpectation,
            },
          })
        )

        it("returns the animal", async () => {
          const suggestedMates = await animalsService.getAnimalById(11)

          expect(suggestedMates).toEqual(extractPayload(animalBodyExpectation))
        })
      })

      describe("and there no animals in the database", () => {
        beforeAll(() =>
          provider.addInteraction({
            state: "Has no animals",
            uponReceiving: "a request for an animal with ID 100",
            withRequest: {
              method: "GET",
              path: "/animals/100",
              headers: { Authorization: "Bearer token" },
            },
            willRespondWith: {
              status: HttpStatus.NOT_FOUND,
            },
          })
        )

        it("returns a 404", async () => {
          // uncomment below to test a failed verify
          // const suggestedMates = await animalsService.getAnimalById(123)
          const suggestedMates = animalsService.getAnimalById(100)

          await expect(suggestedMates).rejects.toThrowError()
        })
      })
    })

    describe("when a call to the Animal Service is made to create a new mate", () => {
      beforeAll(() =>
        provider.addInteraction({
          state: undefined,
          uponReceiving: "a request to create a new mate",
          withRequest: {
            method: "POST",
            path: "/animals",
            body: like(suitor),
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
          },
          willRespondWith: {
            status: HttpStatus.CREATED,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
            body: like(suitor),
          },
        })
      )

      it("creates a new mate", () => {
        return expect(
          animalsService.createMateForDates(suitor)
        ).resolves.not.toThrow()
      })
    })
  }
)
