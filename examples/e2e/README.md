# Pact JS End-to-End Example

Using a simple animal dating API, we demonstrate the following Pact features:

- Consumer testing and pact file generation, including advanced features like:
  - [Flexible matching](https://docs.pact.io/getting_started/matching#flexible-matching)
  - [Provider states](https://docs.pact.io/getting_started/provider_states)
- Sharing Pacts by publishing to and retrieving from a [Pact Broker](https://github.com/pact-foundation/pact_broker)
- Provider side verification

This comprises a complete E2E example that can be used as a basis for projects.

<!-- TOC depthFrom:2 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [The Example Project](#the-example-project) - [Provider (Profile API)](#provider-profile-api) - [Consumer (Matching API)](#consumer-matching-api)
- [Running the tests](#running-the-tests)
- [Running the API](#running-the-api) - [Animal Profile API](#animal-profile-api) - [GET /animals](#get-animals) - [GET /animals/:id](#get-animalsid) - [GET /animals/available](#get-animalsavailable) - [POST /animals](#post-animals) - [Matching service](#matching-service) - [GET /suggestions/:id](#get-suggestionsid)
- [Viewing contracts with the Pact Broker](#viewing-contracts-with-the-pact-broker)

<!-- /TOC -->

## The Example Project

[Matching API] -> [Profile API]+\(DB\)

### Provider (Profile API)

Provides Animal profile information, including interests, zoo location and other personal details.

### Consumer (Matching API)

Given an animal profile, recommends a suitable partner based on similar interests.

## Running the tests

1. `npm install` (on the root project directory)
1. `npm run dist` (on the root project directory)
1. `npm run test:consumer` (from e2e directory) - Run consumer tests
1. `npm run test:publish` (from e2e directory) - Publish contracts to the broker
1. `npm run test:provider` (from e2e directory) - Run provider tests

[![asciicast](https://asciinema.org/a/105793.png)](https://asciinema.org/a/105793)

## Running the API

If you want to experiment with the API to get an understanding:

1. `npm run api` - Runs the both provider and consumer API

or individually :

1. `npm run provider` - Runs the provider API (animal service)
1. `npm run consumer` - Runs the consumer API (matching service)

### Animal Profile API

The APIs are described below, including a bunch of cURL statements to invoke them.

#### GET /animals

```
curl -H "Authorization: Bearer 1234" -X GET "http://localhost:8081/animals"
```

#### GET /animals/:id

```
curl -H "Authorization: Bearer 1234" -X GET "http://localhost:8081/animals/1"
```

#### GET /animals/available

```
curl -H "Authorization: Bearer 1234" -X GET http://localhost:8081/animals/available
```

#### POST /animals

```
curl -H "Authorization: Bearer 1234" -X POST -H "Content-Type: application/json" -d '{
  "first_name": "aoeu",
  "last_name": "aoeu",
  "age":  21,
  "gender": "M",
  "location": {
    "description": "Melbourne Zoo",
    "country": "Australia",
    "post_code": 3000
  },
  "eligibility": {
    "available": true,
    "previously_married": false
  },
  "interests": [
    "walks in the garden/meadow",
    "munching on a paddock bomb",
    "parkour"
  ]
}' "http://localhost:8081/animals"
```

### Matching service

#### GET /suggestions/:id

```
curl -H "Authorization: Bearer 1234" -X GET http://localhost:8080/suggestions/1
```

## Viewing contracts with the Pact Broker

A test [Pact Boker](https://github.com/bethesque/pact_broker) is running at https://test.pact.dius.com.au:

- Username: `dXfltyFMgNOFZAxr8io9wJ37iUpY42M`
- Password: `O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1`

Or use the API:

```
curl -v -u 'dXfltyFMgNOFZAxr8io9wJ37iUpY42M:O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1' https://test.pact.dius.com.au
```
