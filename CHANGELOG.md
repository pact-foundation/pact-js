# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="4.3.2"></a>
## [4.3.2](https://github.com/pact-foundation/pact-js/compare/v4.3.1...v4.3.2) (2018-01-06)


### Bug Fixes

* **logging:** set pact-node log level before constructing server [#139](https://github.com/pact-foundation/pact-js/issues/139) ([ca287bd](https://github.com/pact-foundation/pact-js/commit/ca287bd))



<a name="4.3.1"></a>
## [4.3.1](https://github.com/pact-foundation/pact-js/compare/v4.3.0...v4.3.1) (2017-12-08)


### Bug Fixes

* **pact-node:** update e2e tests with latest pact-node API ([a2828cf](https://github.com/pact-foundation/pact-js/commit/a2828cf))



<a name="4.3.0"></a>
# [4.3.0](https://github.com/pact-foundation/pact-js/compare/v4.2.1...v4.3.0) (2017-12-08)


### Bug Fixes

* **build:** fix for bash script and output helpful information during projects tests ([192f9e4](https://github.com/pact-foundation/pact-js/commit/192f9e4))
* **examples:** update jasmine karma example with best practice [#122](https://github.com/pact-foundation/pact-js/issues/122) ([93cba30](https://github.com/pact-foundation/pact-js/commit/93cba30))
* **examples:** update mocha karma example with best practice [#122](https://github.com/pact-foundation/pact-js/issues/122) ([a62d00f](https://github.com/pact-foundation/pact-js/commit/a62d00f))


### Features

* **upgrade:** upgrade pact-node to v6.4.x ([78d1ae7](https://github.com/pact-foundation/pact-js/commit/78d1ae7))



<a name="4.2.1"></a>
## [4.2.1](https://github.com/pact-foundation/pact-js/compare/v4.2.0...v4.2.1) (2017-11-05)



<a name="4.2.0"></a>
# [4.2.0](https://github.com/pact-foundation/pact-js/compare/v4.1.0...v4.2.0) (2017-11-05)


### Features

* **types:** add TS bindings for pact-web standalone. Fixes [#92](https://github.com/pact-foundation/pact-js/issues/92) ([d436862](https://github.com/pact-foundation/pact-js/commit/d436862))



<a name="4.1.0"></a>
# [4.1.0](https://github.com/pact-foundation/pact-js/compare/v4.0.0...v4.1.0) (2017-10-18)


### Features

* **release:** update release process to use standard-version ([47d118d](https://github.com/pact-foundation/pact-js/commit/47d118d))



<a name="4.0.0"></a>
# [4.0.0](https://github.com/pact-foundation/pact-js/compare/v3.0.1...v4.0.0) (2017-10-18)


### Bug Fixes

* **src:** fix typo in error message ([e91588c](https://github.com/pact-foundation/pact-js/commit/e91588c))
* **verification:** pass validation error message on ([3041282](https://github.com/pact-foundation/pact-js/commit/3041282))


### Features

* **pact-node:** upgrade to pact-node 5.x.x ([6d2ad81](https://github.com/pact-foundation/pact-js/commit/6d2ad81))
* **pact-server:** Allow to run pact mock server on a host other than localhost/127.0.0.1 ([e24be20](https://github.com/pact-foundation/pact-js/commit/e24be20))



<a name="3.0.1"></a>
## [3.0.1](https://github.com/pact-foundation/pact-js/compare/v2.7.0...v3.0.1) (2017-09-19)


### Bug Fixes

* **lint:** fix lint in mock service ([e4c61b1](https://github.com/pact-foundation/pact-js/commit/e4c61b1))
* **tests:** update e2e tests with timeout for CI builds ([f141c5e](https://github.com/pact-foundation/pact-js/commit/f141c5e))
* **typo:** cosmetic cleanup for typo of wrong project name ([18d49f6](https://github.com/pact-foundation/pact-js/commit/18d49f6))


### Features

* **karma:** relax consumer/provider requirement in MockService ([e9f3a4a](https://github.com/pact-foundation/pact-js/commit/e9f3a4a))



<a name="2.7.0"></a>
# [2.7.0](https://github.com/pact-foundation/pact-js/compare/v2.6.0...v2.7.0) (2017-08-06)


### Bug Fixes

* **gitignore:** ignore IDE generated project files ([84b78c3](https://github.com/pact-foundation/pact-js/commit/84b78c3))
* **issue_template:** Corrected typos ([bac51ad](https://github.com/pact-foundation/pact-js/commit/bac51ad))


### Features

* **example:** adding example for the AVA test framework ([65e8314](https://github.com/pact-foundation/pact-js/commit/65e8314))
* **upgrade:** upgrade to latest pact node v4.12.0 ([50e1041](https://github.com/pact-foundation/pact-js/commit/50e1041))



<a name="2.6.0"></a>
# [2.6.0](https://github.com/pact-foundation/pact-js/compare/v2.5.0...v2.6.0) (2017-06-13)



<a name="2.5.0"></a>
# [2.5.0](https://github.com/pact-foundation/pact-js/compare/v2.4.1...v2.5.0) (2017-05-15)



<a name="2.4.1"></a>
## [2.4.1](https://github.com/pact-foundation/pact-js/compare/v2.4.0...v2.4.1) (2017-05-12)


### Features

* **writemode:** update pactFileWriteMode flag and docs ([6b32990](https://github.com/pact-foundation/pact-js/commit/6b32990))



<a name="2.4.0"></a>
# [2.4.0](https://github.com/pact-foundation/pact-js/compare/v2.3.4...v2.4.0) (2017-05-11)


### Bug Fixes

* **providerstate:** make providerState serialisation spec compliant [#12](https://github.com/pact-foundation/pact-js/issues/12) ([cc44554](https://github.com/pact-foundation/pact-js/commit/cc44554))


### Features

* **mock service:** add pactfile_write_mode option handling ([da92274](https://github.com/pact-foundation/pact-js/commit/da92274))
* **verifications:** update example to publish verification results ([592b9db](https://github.com/pact-foundation/pact-js/commit/592b9db))



<a name="2.3.4"></a>
## [2.3.4](https://github.com/pact-foundation/pact-js/compare/v2.3.3...v2.3.4) (2017-04-26)


### Features

* **pact-web:** only deploy pact-web on tagged master ([a66cbea](https://github.com/pact-foundation/pact-js/commit/a66cbea))



<a name="2.3.3"></a>
## [2.3.3](https://github.com/pact-foundation/pact-js/compare/v2.3.1...v2.3.3) (2017-04-21)


### Features

* **port-check:** check if port is available during setup() [#37](https://github.com/pact-foundation/pact-js/issues/37) ([c729d8e](https://github.com/pact-foundation/pact-js/commit/c729d8e))
* **typescript:** add TypeScript annotations ([8eeb561](https://github.com/pact-foundation/pact-js/commit/8eeb561))



<a name="2.3.1"></a>
## [2.3.1](https://github.com/pact-foundation/pact-js/compare/v2.2.1...v2.3.1) (2017-04-03)



<a name="2.2.1"></a>
## [2.2.1](https://github.com/pact-foundation/pact-js/compare/v2.2.0...v2.2.1) (2017-03-12)


### Bug Fixes

* **test:** fix logic issue in karma tests that was passing for the wrong reasons ([080898f](https://github.com/pact-foundation/pact-js/commit/080898f))
* **test:** update karma jasmine test to properly fail tests if verification fails. ([802d5dc](https://github.com/pact-foundation/pact-js/commit/802d5dc))
* **test:** update karma mocha test to fail if verification fails ([98a6380](https://github.com/pact-foundation/pact-js/commit/98a6380))



<a name="2.2.0"></a>
# [2.2.0](https://github.com/pact-foundation/pact-js/compare/v2.1.0...v2.2.0) (2017-02-27)


### Features

* **ssl:** add ability to specify custom ssl key + cert [#29](https://github.com/pact-foundation/pact-js/issues/29) ([c54d224](https://github.com/pact-foundation/pact-js/commit/c54d224))



<a name="2.1.0"></a>
# [2.1.0](https://github.com/pact-foundation/pact-js/compare/v2.0.1...v2.1.0) (2017-02-27)


### Features

* **test:** update end-to-end test example ([cb38b17](https://github.com/pact-foundation/pact-js/commit/cb38b17))
* **verify:** update to latest pact-node including ability to set verification timeout [#28](https://github.com/pact-foundation/pact-js/issues/28) ([4d0901e](https://github.com/pact-foundation/pact-js/commit/4d0901e))



<a name="2.0.1"></a>
## [2.0.1](https://github.com/pact-foundation/pact-js/compare/v2.0.0...v2.0.1) (2017-02-26)


### Bug Fixes

* pact-node and cli-color should be dependencies ([#26](https://github.com/pact-foundation/pact-js/issues/26) [#25](https://github.com/pact-foundation/pact-js/issues/25)) ([83c8af3](https://github.com/pact-foundation/pact-js/commit/83c8af3))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/pact-foundation/pact-js/compare/v1.0.0...v2.0.0) (2017-02-22)


### Bug Fixes

* **api:** remove redundant responseParser and tests ([a06a14d](https://github.com/pact-foundation/pact-js/commit/a06a14d))
* **test:** properly pass through ssl flag ([bc3120d](https://github.com/pact-foundation/pact-js/commit/bc3120d))
* **test:** set timeout to 10s for Travis builds ([e76d0e8](https://github.com/pact-foundation/pact-js/commit/e76d0e8))
* **test:** update all mainline tests to match new API ([936a75d](https://github.com/pact-foundation/pact-js/commit/936a75d))
* **test:** update e2e test to properly wait for pact finalisation ([b98c1f9](https://github.com/pact-foundation/pact-js/commit/b98c1f9))
* **test:** update formatting in integration test ([6bd19c9](https://github.com/pact-foundation/pact-js/commit/6bd19c9))
* **test:** update jest tests with new API, fixes [#21](https://github.com/pact-foundation/pact-js/issues/21) ([4eb2e1c](https://github.com/pact-foundation/pact-js/commit/4eb2e1c))
* **test:** update mocha tests with new API, fixes [#22](https://github.com/pact-foundation/pact-js/issues/22) ([2062d6d](https://github.com/pact-foundation/pact-js/commit/2062d6d))
* **tests:** remove trailing semi-colons for consistency ([7a9565d](https://github.com/pact-foundation/pact-js/commit/7a9565d))


### Features

* **api:** redesign API to make it simpler to interact with ([67482d1](https://github.com/pact-foundation/pact-js/commit/67482d1))
* **examples:** update e2e provider test to use mocha interface ([898203a](https://github.com/pact-foundation/pact-js/commit/898203a))
* **karma:** update code formatting ([ef27b7c](https://github.com/pact-foundation/pact-js/commit/ef27b7c))
* **karma:** update tests for karma suite and adapted Pact API for Karma ([7182c7b](https://github.com/pact-foundation/pact-js/commit/7182c7b))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/pact-foundation/pact-js/compare/v1.0.0-rc.5...v1.0.0) (2017-01-21)


### Features

* **example:** add better readme, cleanup linting for E2E example ([4a8e8cb](https://github.com/pact-foundation/pact-js/commit/4a8e8cb))
* **examples:** running consumer tests for E2E example ([274f18f](https://github.com/pact-foundation/pact-js/commit/274f18f))
* **examples:** update docu for e2e example ([491f641](https://github.com/pact-foundation/pact-js/commit/491f641))
* **examples:** WIP e2e example ([14a464c](https://github.com/pact-foundation/pact-js/commit/14a464c))
* **examples:** working e2e example ([24b9888](https://github.com/pact-foundation/pact-js/commit/24b9888))



<a name="1.0.0-rc.5"></a>
# [1.0.0-rc.5](https://github.com/pact-foundation/pact-js/compare/v1.0.0-rc.4...v1.0.0-rc.5) (2016-08-28)


### Bug Fixes

* **readme:** fix example in readme ([f0eeb0f](https://github.com/pact-foundation/pact-js/commit/f0eeb0f))
* **style:** remove empty space breaking linter ([62a72d8](https://github.com/pact-foundation/pact-js/commit/62a72d8))


### Features

* **interceptor:** remove Interceptor from DSL ([0b9e4f4](https://github.com/pact-foundation/pact-js/commit/0b9e4f4))



<a name="1.0.0-rc.4"></a>
# [1.0.0-rc.4](https://github.com/pact-foundation/pact-js/compare/v1.0.0-rc.3...v1.0.0-rc.4) (2016-08-02)


### Features

* **app:** update distribution files ([8f9f7e2](https://github.com/pact-foundation/pact-js/commit/8f9f7e2))



<a name="1.0.0-rc.3"></a>
# [1.0.0-rc.3](https://github.com/pact-foundation/pact-js/compare/v1.0.0-rc.2...v1.0.0-rc.3) (2016-08-01)



<a name="1.0.0-rc.2"></a>
# [1.0.0-rc.2](https://github.com/pact-foundation/pact-js/compare/v1.0.0-rc...v1.0.0-rc.2) (2016-07-11)


### Bug Fixes

* **lib:** better handling HTTP responses ([7b07821](https://github.com/pact-foundation/pact-js/commit/7b07821))
