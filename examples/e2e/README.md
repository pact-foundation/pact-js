# Pact JS End-to-End Example

Using a simple animal dating API, we demonstrate the following Pact features:

* Consumer testing and pact file generation, including advanced features like:
    * [Flexible matching](https://docs.pact.io/documentation/javascript/flexible_matching.html)
    * [Provider states](https://docs.pact.io/documentation/provider_states.html)
* Sharing Pacts by publishing to and retrieving from a [Pact Broker](https://github.com/bethesque/pact_broker)
* Provider side verification

This comprises a complete E2E example that can be used as a basis for projects.

## The Example Project

[Matching API] -> [Profile API]+\(DB\)

### Provider (Profile API)

Provides Animal profile information, including interests, zoo location and other personal details.

### Consumer (Matching API)

Given an animal profile, recommends a suitable partner based on similar interests.

## Running

1. `npm install`
1. `npm test:consumer` - Run consumer tests
1. `npm test:publish` - Publish contracts to the broker
1. `npm test:provider` - Run provider tests


## Viewing contracts with the Pact Broker

A test [Pact Boker](https://github.com/bethesque/pact_broker) is running at https://test.pact.dius.com.au:

* Username: `dXfltyFMgNOFZAxr8io9wJ37iUpY42M`
* Password: `O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1`

Or use the API: `curl -v -u 'dXfltyFMgNOFZAxr8io9wJ37iUpY42M:O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1' https://test.pact.dius.com.au`
