# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

### [11.0.2](https://github.com/pact-foundation/pact-js/compare/v11.0.1...v11.0.2) (2023-03-09)


### Fixes and Improvements

* v4 response builder for non-plugin interface ([4da4cb3](https://github.com/pact-foundation/pact-js/commit/4da4cb3e917c541a5633246d6c1f4c4a22d4e5fd)), closes [#1073](https://github.com/pact-foundation/pact-js/issues/1073)

### [11.0.1](https://github.com/pact-foundation/pact-js/compare/v11.0.0...v11.0.1) (2023-03-09)


### Fixes and Improvements

* update to the latest @pact-foundation/pact-core-13.13.5 ([dd5b785](https://github.com/pact-foundation/pact-js/commit/dd5b785405ec3973876a1633e4fd51803f200cec))

## [11.0.0](https://github.com/pact-foundation/pact-js/compare/v10.4.1...v11.0.0) (2023-03-02)


### ⚠ BREAKING CHANGES

* Rename the message-pact state handler type to `MessageStateHandlers` from `StateHandlers` avoiding the conflicting type problem introduced in #882. Fixes #1057

### Fixes and Improvements

* Remove all references to `AnyTemplate` and deprecate the type. See [#1054](https://github.com/pact-foundation/pact-js/issues/1054) for details ([c7edb7e](https://github.com/pact-foundation/pact-js/commit/c7edb7ed4909884c232f6a419cdaf9e52394ad0c))
* Rename the message-pact state handler type to `MessageStateHandlers` from `StateHandlers` avoiding the conflicting type problem introduced in [#882](https://github.com/pact-foundation/pact-js/issues/882). Fixes [#1057](https://github.com/pact-foundation/pact-js/issues/1057) ([9be81ce](https://github.com/pact-foundation/pact-js/commit/9be81ce301a324a7b13d0374851e9903556b4cd6))
* Widen types for V3 matchers, avoiding AnyTemplate errors. This has the side effect that functions, Dates and other inappropriate types can now be passed to matchers, and the benefit that people using interfaces don't get spurious errors. Fixes [#1054](https://github.com/pact-foundation/pact-js/issues/1054) ([0803cdf](https://github.com/pact-foundation/pact-js/commit/0803cdf8cc882176651e9570223f3c184ada29d2))

### [10.4.1](https://github.com/pact-foundation/pact-js/compare/v10.4.0...v10.4.1) (2023-01-23)


### Fixes and Improvements

* accept multiple values for headers in V2 interface. Fixes [#1031](https://github.com/pact-foundation/pact-js/issues/1031) ([229aadd](https://github.com/pact-foundation/pact-js/commit/229aadd2e54a0750db1fe95ed6d17d39919f1c26))
* disabled HTTP tracer as it causes the node process to hang ([7de96ca](https://github.com/pact-foundation/pact-js/commit/7de96ca1bb76933a5e2e650a609e2da2a79876d8))
* update to latest pact-core 13.13.2 ([671891b](https://github.com/pact-foundation/pact-js/commit/671891bb5faa432d280cac5bff968511bec4b26a))

## [10.4.0](https://github.com/pact-foundation/pact-js/compare/v10.3.1...v10.4.0) (2022-12-09)


### Features

* add support for rendering plugin content mismatches ([2185693](https://github.com/pact-foundation/pact-js/commit/2185693dc1557b723c4f4dfd03d5de2c20f49466))
* upgrade to latest pact-core ([0b56823](https://github.com/pact-foundation/pact-js/commit/0b56823ac20928d3721ffcd43da0126958bef4af))


### Fixes and Improvements

* Export `VerifierOptions` as a root export ([bbcccc8](https://github.com/pact-foundation/pact-js/commit/bbcccc838465a521e83d3cba0bb4dea6652e4c19))
* missing min in v3 eachLike pact-foundation/pact-js[#958](https://github.com/pact-foundation/pact-js/issues/958) ([18dbfd4](https://github.com/pact-foundation/pact-js/commit/18dbfd4555e70fc0623c7d80985ee112cd150a1b))
* Remove unnecessary dependency @types/bluebird (also removed bluebird internally) ([56efeb3](https://github.com/pact-foundation/pact-js/commit/56efeb38b6ae5dc21020b9792a9d22373aa99b68))
* support multiple header values with matchers ([ccd95bb](https://github.com/pact-foundation/pact-js/commit/ccd95bb66f541efc339eedb0baf630a9f82f1f35)), closes [#964](https://github.com/pact-foundation/pact-js/issues/964)

### [10.3.1](https://github.com/pact-foundation/pact-js/compare/v10.3.0...v10.3.1) (2022-11-30)


### Fixes and Improvements

* PactV4 feature flag check was causing import errors for all imports ([8897da7](https://github.com/pact-foundation/pact-js/commit/8897da76bdf145f0d3ffb53f7fca14cde2f659a9))

## [10.3.0](https://github.com/pact-foundation/pact-js/compare/v10.2.2...v10.3.0) (2022-11-29)


### Features

* expose V4 public interface ([047b61d](https://github.com/pact-foundation/pact-js/commit/047b61d79227ce19629140b90fa2e02edc201f66))


### Fixes and Improvements

* add --detectOpenHandles to provider state tests ([9f14582](https://github.com/pact-foundation/pact-js/commit/9f145825829950da23af36f54e5a353d53fd3762))
* update to latest pact-core 13.12.2 ([e54aa7a](https://github.com/pact-foundation/pact-js/commit/e54aa7ae421e1651c982cada82a7602f7920317a))

### [10.2.2](https://github.com/pact-foundation/pact-js/compare/v10.2.1...v10.2.2) (2022-11-14)


### Fixes and Improvements

* remove all remaining absolute imports ([1d16a76](https://github.com/pact-foundation/pact-js/commit/1d16a76462bb86c64ba0ffeb0120cb4037ce13a8))

### [10.2.1](https://github.com/pact-foundation/pact-js/compare/v10.2.0...v10.2.1) (2022-11-14)


### Fixes and Improvements

* remove absolute import paths in types. Fixes [#974](https://github.com/pact-foundation/pact-js/issues/974) ([a20ad80](https://github.com/pact-foundation/pact-js/commit/a20ad8038dc560168da20d4a22cd65381d93af26))

## [10.2.0](https://github.com/pact-foundation/pact-js/compare/v10.1.4...v10.2.0) (2022-11-10)


### Features

* support V4 Pact interface (beta) ([7f87896](https://github.com/pact-foundation/pact-js/commit/7f87896b58f291aa84b1dff3445e43c166f4ee1c))


### Fixes and Improvements

* Fix an issue where extractPayload would not work correctly with objects with a value key ([469e6d3](https://github.com/pact-foundation/pact-js/commit/469e6d35c162e16f63ac206de1c2bbb833720673))

### [10.1.4](https://github.com/pact-foundation/pact-js/compare/v10.1.3...v10.1.4) (2022-09-21)


### Fixes and Improvements

* Fix issue where MatchersV3.string() with no arguments would not correctly match strings ([ed70734](https://github.com/pact-foundation/pact-js/commit/ed7073427234449328a88ba32bad6b736c32459c))

### [10.1.3](https://github.com/pact-foundation/pact-js/compare/v10.1.2...v10.1.3) (2022-09-06)


### Fixes and Improvements

* PactV4 error handling logic ([78ff0bf](https://github.com/pact-foundation/pact-js/commit/78ff0bf64f45c1de95e34a7f401d97068775b668))

### [10.1.2](https://github.com/pact-foundation/pact-js/compare/v10.1.1...v10.1.2) (2022-08-20)


### Fixes and Improvements

* binary matching via latest pact-core ([887b312](https://github.com/pact-foundation/pact-js/commit/887b3125acceffd3bafe9db141b9661709a3244a))
* binary matching via latest pact-core ([c201eca](https://github.com/pact-foundation/pact-js/commit/c201eca72ef140af3d5800ec811a19ff4e320077))

### [10.1.1](https://github.com/pact-foundation/pact-js/compare/v10.1.0...v10.1.1) (2022-08-14)


### Fixes and Improvements

* print errors if fn passed to executeTest throws ([8cfc8c7](https://github.com/pact-foundation/pact-js/commit/8cfc8c788a5e394d11b19aad405e42d80a09d8bc))

## [10.1.0](https://github.com/pact-foundation/pact-js/compare/v10.0.2...v10.1.0) (2022-08-11)


### Features

* port extractPayload function from 9.x ([1afef87](https://github.com/pact-foundation/pact-js/commit/1afef87a849e6c8059aa68a612993896b5e45e54))

### [10.0.2](https://github.com/pact-foundation/pact-js/compare/v10.0.1...v10.0.2) (2022-08-08)


### Fixes and Improvements

* dsl/verifier - express import typescript error ([60fa69f](https://github.com/pact-foundation/pact-js/commit/60fa69f139e65000edcd28b1487bf372f338a59d))
* import clc from cli-colour ([785b38c](https://github.com/pact-foundation/pact-js/commit/785b38c70cfa59e1d65c281b52285fa9eb3acf62))

### [10.0.1](https://github.com/pact-foundation/pact-js/compare/v10.0.0...v10.0.1) (2022-07-28)


### Fixes and Improvements

* throw error if V4 test closure fails. Fixes [#904](https://github.com/pact-foundation/pact-js/issues/904) ([6b78bed](https://github.com/pact-foundation/pact-js/commit/6b78bedfd492acce99bbad41316eb071164f2a9a))

## [10.0.0](https://github.com/pact-foundation/pact-js/compare/v10.1.0-beta.0...v10.0.0) (2022-07-28)

🎉 TL;DR - lots. See https://github.com/pact-foundation/pact-js/blob/master/docs/migrations/9-10.md for more!

### [9.18.1](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.60...v9.18.1) (2022-06-28)


### Fixes and Improvements

* package.json & package-lock.json to reduce vulnerabilities ([#879](https://github.com/pact-foundation/pact-js/issues/879)) ([5005463](https://github.com/pact-foundation/pact-js/commit/50054638342171d8f9972350b2bf601e99b404b3))

## [9.18.0](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.59...v9.18.0) (2022-06-26)


### Features

* drop support for pact web incl. karma examples ([d45f898](https://github.com/pact-foundation/pact-js/commit/d45f898b29a62aa77cecff499a46ce365fd2c79a))
* modify request body inside of verifer ([#873](https://github.com/pact-foundation/pact-js/issues/873)) ([be8ed15](https://github.com/pact-foundation/pact-js/commit/be8ed151c607b69bcf07670df211156887adb29e))


### Fixes and Improvements

* nestjs example should use branches in workflow ([a7adf07](https://github.com/pact-foundation/pact-js/commit/a7adf07d5563cf7ad92d2054b6913c890ef21220))
* webpack on node 16 ([903cf44](https://github.com/pact-foundation/pact-js/commit/903cf44dd15f19f6132b6d7bf5f89f0cccc70d41))

### [9.17.3](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.58...v9.17.3) (2022-03-16)


### Fixes and Improvements

* remove rust from v3 release build ([2a5f65b](https://github.com/pact-foundation/pact-js/commit/2a5f65bc7e8a48c7ee786905f78207cba7837110))
* The table on README.md is corrupted and unreadable ([#832](https://github.com/pact-foundation/pact-js/issues/832)) ([b73fa05](https://github.com/pact-foundation/pact-js/commit/b73fa05a7f92ed81d225f6c68349d322d388656d))
* throw an error when pact spec version is not set to 2 ([4186c22](https://github.com/pact-foundation/pact-js/commit/4186c22030cc3a7f2abb99c096d480c66f17f2a4))
* upgrade to latest pact-node ([0d9b127](https://github.com/pact-foundation/pact-js/commit/0d9b1270d4dc03e761941ae060b2a75db0bab24d))
* verifier req/res logging on debug ([#835](https://github.com/pact-foundation/pact-js/issues/835)) ([3edc5a0](https://github.com/pact-foundation/pact-js/commit/3edc5a035170fb28f74be6b908091e37093cad98))

## [10.0.0-beta.62](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.61...v10.0.0-beta.62) (2022-07-27)


### Fixes and Improvements

* states not added when using PactV3.addInteraction ([cb4bd1a](https://github.com/pact-foundation/pact-js/commit/cb4bd1a0540261cfe4c8fb9c716a3541cdeae600))

## [10.0.0-beta.61](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.60...v10.0.0-beta.61) (2022-07-26)


### Features

* migrate message pact to new js core ([156886f](https://github.com/pact-foundation/pact-js/commit/156886fde85d2a1fa217a68db69fd876d3a76001))
* remove deprecated VerifierV3 from beta interface. BREAKING CHANGE ([25dc07e](https://github.com/pact-foundation/pact-js/commit/25dc07e3f3f710b77526d8be315ef7ee772ff747))
* replace ruby core with rust core in stable pact http package ([7b7d415](https://github.com/pact-foundation/pact-js/commit/7b7d415f0f9910de19061e1e4bdbe8b1acc7b6ef))
* support JSON addInteraction function for PactV3 ([903fd36](https://github.com/pact-foundation/pact-js/commit/903fd36a13805b80afa2ff4967a161a43cdfed09))
* support user defined port/host in v3 consumer tests ([8aaafe6](https://github.com/pact-foundation/pact-js/commit/8aaafe6e919e1935d033e1b904b5131af084af1e))


### Fixes and Improvements

* Add support for state params to MessageProviderPact ([#372](https://github.com/pact-foundation/pact-js/issues/372)) ([#882](https://github.com/pact-foundation/pact-js/issues/882)) ([33c145a](https://github.com/pact-foundation/pact-js/commit/33c145a908916ac3a83f0eec30f15b782b3a2e71))
* make 'dir' optional in PactV3 interface and default to ./pacts dir ([0b12160](https://github.com/pact-foundation/pact-js/commit/0b121601787895a3c551be6f0e17da4ea819e738))

## [10.0.0-beta.60](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.59...v10.0.0-beta.60) (2022-06-26)


### Features

* modify request body inside of verifier v3 ([#875](https://github.com/pact-foundation/pact-js/issues/875)) ([0fd1a34](https://github.com/pact-foundation/pact-js/commit/0fd1a349dbcc596543d7872c89e6171b9b1cabde))
* remove pact-web and karma ([2c57330](https://github.com/pact-foundation/pact-js/commit/2c57330f5779cd345ff6213fcd468dd34126823e))
* support customising the proxy host ([d281d4f](https://github.com/pact-foundation/pact-js/commit/d281d4f7d94b45a98c27ed5fd5f06a5c7649b710))

## [10.0.0-beta.59](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.58...v10.0.0-beta.59) (2022-04-01)


### Fixes and Improvements

* content type detection now considers matchers ([069da08](https://github.com/pact-foundation/pact-js/commit/069da08b22c748cc0dd929ea28e2cfac564b9a8f))
* e2e tests were verifying the wrong pacts ([1999f2d](https://github.com/pact-foundation/pact-js/commit/1999f2d0f243861c802b886bfb50b8e94f6d7915))
* infer content type from headers, prevent non JSON-able state parameters ([2a6acf3](https://github.com/pact-foundation/pact-js/commit/2a6acf3674707982cfe41318ebe87201064241ad))
* update to latest core ([51c4c52](https://github.com/pact-foundation/pact-js/commit/51c4c52c95e55c0eca812386a0c3390bf40d3dc2))

## [10.0.0-beta.58](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.57...v10.0.0-beta.58) (2022-02-23)


### Fixes and Improvements

* pin to latest beta version of core in examples ([d92c793](https://github.com/pact-foundation/pact-js/commit/d92c793fca7bf354ca8e275bf3b936111bd4eaad))

## [10.0.0-beta.57](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.56...v10.0.0-beta.57) (2022-02-23)


### Fixes and Improvements

* core now supports env vars if option not explicitly set ([bf69903](https://github.com/pact-foundation/pact-js/commit/bf699033e176ce5f67917cf12317a95e09e9b41c))
* formatting ([9c5bdf1](https://github.com/pact-foundation/pact-js/commit/9c5bdf184194dab60b0f82a415cc01c04666bfd1))
* new verifier doesn't support env vars ([dfc01b6](https://github.com/pact-foundation/pact-js/commit/dfc01b65ff8571e6598e5b24651aa42d9d29d2fd))
* node gyp not working on windows ([a6b1d88](https://github.com/pact-foundation/pact-js/commit/a6b1d8874be41967bdb2150bdb6e28034881dc00))
* remove deprecated v3 beta property ([75fc76c](https://github.com/pact-foundation/pact-js/commit/75fc76c3d48ccaa9be61934dbedd122219f21ef4))
* update to latest beta core ([fff279f](https://github.com/pact-foundation/pact-js/commit/fff279f347ba3a0152108520316364d7517b2726))
* update to latest beta core ([7a82ad9](https://github.com/pact-foundation/pact-js/commit/7a82ad90675ccd338f12aea69606e90fecf43ca4))
* update to latest beta core ([cbb4b07](https://github.com/pact-foundation/pact-js/commit/cbb4b0736e8fedd8dfed5d68ce30b59106b6e187))

## [10.0.0-beta.56](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.55...v10.0.0-beta.56) (2022-02-16)


### Fixes and Improvements

* bump version of core, remove rust from builds ([157d14b](https://github.com/pact-foundation/pact-js/commit/157d14b859fe630db4a5e65890e2c68c5c12aab6))

## [10.0.0-beta.55](https://github.com/pact-foundation/pact-js/compare/v9.17.2...v10.0.0-beta.55) (2022-02-16)


### Fixes and Improvements

* Bump pact-core dependency to 13.4.1 ([a3a11ec](https://github.com/pact-foundation/pact-js/commit/a3a11ec9487fc103233cc8915f1f5e15429ae4ed))

## [10.0.0-beta.54](https://github.com/pact-foundation/pact-js/compare/v9.16.5...v10.0.0-beta.54) (2021-10-29)


### Fixes and Improvements

* Bump version of pact-core to 13.3.0 ([97cc2ec](https://github.com/pact-foundation/pact-js/commit/97cc2ec797d6ccde62ad7d35e00dd634043b61c1))

## [10.0.0-beta.53](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.52...v10.0.0-beta.53) (2021-10-19)


### Fixes and Improvements

* Bump version of pact-core to fix regression in publisher API ([db434a5](https://github.com/pact-foundation/pact-js/commit/db434a5bf0acd726070c1db8a357cd68e81f6714))

## [10.0.0-beta.52](https://github.com/pact-foundation/pact-js/compare/v9.16.4...v10.0.0-beta.52) (2021-10-16)


### Fixes and Improvements

* Bump version of pact-core to fix [#760](https://github.com/pact-foundation/pact-js/issues/760) ([0cf7206](https://github.com/pact-foundation/pact-js/commit/0cf7206b8ae8e65e52e0e91fa8384278ccc78555))

## [10.0.0-beta.51](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.50...v10.0.0-beta.51) (2021-09-22)


### Fixes and Improvements

* Bump version of pact-core to obtain fix for a regression in VerifierOptions where the option was set to undefined ([b424136](https://github.com/pact-foundation/pact-js/commit/b4241363276d26ef5947f3b3637e52ce09a4e8e3))

## [10.0.0-beta.50](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.49...v10.0.0-beta.50) (2021-09-21)


### Fixes and Improvements

* Don't generate random numbers when the example given to V3 integer or decimal matchers is 0 ([#742](https://github.com/pact-foundation/pact-js/issues/742)) ([e5a443c](https://github.com/pact-foundation/pact-js/commit/e5a443c55a98c3e3011580d04f639260522e18db))

## [10.0.0-beta.49](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.48...v10.0.0-beta.49) (2021-09-15)


### Fixes and Improvements

* give up on node 16 musl until we can remove neon ([c8e5275](https://github.com/pact-foundation/pact-js/commit/c8e5275af5215f1259e524a2d6ce52270f261a2d))
* update or remove all packages that caused dependency warnings ([e1bb6ec](https://github.com/pact-foundation/pact-js/commit/e1bb6ecb31874ff07be603bde6683d9113a4dc30))

## [10.0.0-beta.48](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.47...v10.0.0-beta.48) (2021-09-15)


### Fixes and Improvements

* upgrade neon to (finally) support Node 16 (hopefully) ([6734a52](https://github.com/pact-foundation/pact-js/commit/6734a52f60a1a3881396c7b5f63b7b4745550f94))

## [10.0.0-beta.47](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.46...v10.0.0-beta.47) (2021-09-15)


### ⚠ BREAKING CHANGES

* **matchers:** `Matchers.rfc3339Timestamp()` has been renamed to `Matchers.rfc1123Timestamp()`. The behaviour is unchanged - it was always RFC1123, and never did match RFC3339 timestamps.

### Features

* support node 16 with native build ([5c5753e](https://github.com/pact-foundation/pact-js/commit/5c5753e3a8ac2ac93bc6c3ce68e9439388b8b639))


### Fixes and Improvements

* add support for request-mismatch error types ([fa63933](https://github.com/pact-foundation/pact-js/commit/fa639330f7bd535d597b765983216bbaed662742))
* Bump version of pact-core to obtain fix for Verifier not accepting broker token correctly ([#738](https://github.com/pact-foundation/pact-js/issues/738)) ([79d9930](https://github.com/pact-foundation/pact-js/commit/79d993016f907a6859a2cdeb950bc42ec9096a8f))
* **matchers:** Rename rfc3339Timestamp to rfc1123Timestamp ([#451](https://github.com/pact-foundation/pact-js/issues/451)) ([8e9c378](https://github.com/pact-foundation/pact-js/commit/8e9c378459c2de0f95ee1b91a7bb8dfaa1d9a60b))

## [10.0.0-beta.46](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.45...v10.0.0-beta.46) (2021-09-13)


### Features

* Support node 16 with native build ([79d43ff](https://github.com/pact-foundation/pact-js/commit/79d43ff695ae64137d083e9651c62482691cf1b8))

## [10.0.0-beta.45](https://github.com/pact-foundation/pact-js/compare/v9.16.1...v10.0.0-beta.45) (2021-09-10)


### ⚠ BREAKING CHANGES

* There are several changes to the `VerifierOptions`. To migrate:

  * Replace `verbose` with `logLevel: "DEBUG"` (logLevels of `DEBUG` and below now imply `verbose` where appropriate)
  * Replace `consumerVersionTag` with the `consumerVersionTags` array
  * Replace `providerVersionTag` with the `providerVersionTags` array
  * Replace `tags` with `consumerVersionTags` or `providerVersionTags` as appropriate.
* Some `VerifierOptions` have been removed entirely:
  * `customProviderHeaders` has been removed. If you need this functionality, set an
    appropriate request filter with the `requestFilters` option instead.
  * All logging and reporting is now on standard out (this was the default before).
    This means `logDir` / `format` / `out` have all been removed. If your ecosystem needs
    the ability to customise logging and reporting, please let us know by opening an issue.
  * The undocumented option `monkeypatch` has been removed. The use cases for this
    feature are mostly covered by other options.
* **logging:** 'fatal' log level has been removed. Nothing was logged at fatal, and the underlying core doesn't support it.

### Features

* Actually send message metadata during verification ([c373144](https://github.com/pact-foundation/pact-js/commit/c373144e040c78babaf48d5b14575dfe33233b88))
* Add ability to specify metadata in provider tests with ([824e49b](https://github.com/pact-foundation/pact-js/commit/824e49b5f7f6cfc9555fb988430dceb0a4ab875b))
* State handlers respect promises for all pact file formats ([72bfc0b](https://github.com/pact-foundation/pact-js/commit/72bfc0b78df471e1a37fd3c93658199493bb066f))


* **logging:** Improve trace logging and use clearer types ([060daa9](https://github.com/pact-foundation/pact-js/commit/060daa964e7b57a5e4ada634702de21c1e434921))
* update verifier options ([6df54b0](https://github.com/pact-foundation/pact-js/commit/6df54b01a68057e88cabee18743048a69db7c28e))


### Fixes and Improvements

* correct VerfierV3Options so that it doesn't clobber VeriferOptions ([5796fde](https://github.com/pact-foundation/pact-js/commit/5796fdeb96c354316fe9606f0a9a7fc0c3d43532))
* You no longer need to import the verifier from /v3, it can be imported directly from @pact-foundation/pact ([c268497](https://github.com/pact-foundation/pact-js/commit/c268497e1fd848d3423d379a2671361ea56c9b53))

## [10.0.0-beta.44](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.43...v10.0.0-beta.44) (2021-07-22)


### Fixes and Improvements

* broken pact provider test not consistent with types ([29af342](https://github.com/pact-foundation/pact-js/commit/29af34250cdc308a5298553f5ee9bbb9daf182cb))
* consumerVersionTags were overwritten with empty array ([#714](https://github.com/pact-foundation/pact-js/issues/714)) ([838d1cb](https://github.com/pact-foundation/pact-js/commit/838d1cbc8730592518abff16733a9a703437abb7))
* using relative import. fixes problems with intellisense in vscode ([35de1c5](https://github.com/pact-foundation/pact-js/commit/35de1c57d744d5bc747e6af114c8d272b2a8cec4))

## [10.0.0-beta.43](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.42...v10.0.0-beta.43) (2021-07-18)


### Fixes and Improvements

* return correct data type in fromProviderState ([#710](https://github.com/pact-foundation/pact-js/issues/710)) ([ec9192f](https://github.com/pact-foundation/pact-js/commit/ec9192fb44986b001634b8c44c877a8e3dd29c64)), closes [#633](https://github.com/pact-foundation/pact-js/issues/633)

## [10.0.0-beta.42](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.41...v10.0.0-beta.42) (2021-06-29)


### Features

* reset consumer test state to enable re-use of PactV3 class ([0134ea8](https://github.com/pact-foundation/pact-js/commit/0134ea8252b49a1639fdd78be4fe16283e1a7d70))

## [10.0.0-beta.41](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.40...v10.0.0-beta.41) (2021-06-26)


### ⚠ BREAKING CHANGES

* the signature of state handlers has been updated to
accept either a single function with parameters, or an object that
can specify optional teardown and setup functions that run on the
different state phases.
* callbackTimeout is now timeout

### Features

* support promises in filters + state handlers ([456567c](https://github.com/pact-foundation/pact-js/commit/456567c83a5f155381eebb7dd3f6b60d3bc0060b))


### Fixes and Improvements

* Make request tracer log in debug instead of trace ([24742e4](https://github.com/pact-foundation/pact-js/commit/24742e4c3d314de346e7fe430da2078cb475d7b1))

## [10.0.0-beta.40](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.39...v10.0.0-beta.40) (2021-06-24)


### Fixes and Improvements

* make fromProviderState Matcher compatible ([b608094](https://github.com/pact-foundation/pact-js/commit/b6080942f60c659c3947ecdd99e711eba088c5e8))

## [10.0.0-beta.39](https://github.com/pact-foundation/pact-js/compare/v9.16.0...v10.0.0-beta.39) (2021-06-23)


### Fixes and Improvements

* fromProviderState should accept any valid JSON. Fixes [#696](https://github.com/pact-foundation/pact-js/issues/696) ([1b03b2d](https://github.com/pact-foundation/pact-js/commit/1b03b2d35752529f1d77ce418ad2bb9c73e4b915))

## [10.0.0-beta.38](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.37...v10.0.0-beta.38) (2021-06-21)


### Fixes and Improvements

* Add InterfaceToTemplate&lt;&gt; generic type to address compile errors if users are using interfaces with matchers ([982c4d2](https://github.com/pact-foundation/pact-js/commit/982c4d2ccd47254e4a8466a38e07b35a7d066a5c))
* **verifier:** added StateHandler type and improved JSDocs ([4cad265](https://github.com/pact-foundation/pact-js/commit/4cad265e48a05539b7e99770852f7eaeba0bbd67))

## [10.0.0-beta.37](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.36...v10.0.0-beta.37) (2021-06-06)


### Features

* add consumer version selectors to v3 pact verifier ([3fe65ad](https://github.com/pact-foundation/pact-js/commit/3fe65ade2a478929309392e2fab030676373c4b4))


### Fixes and Improvements

* append text only works with Matchers ([ef56513](https://github.com/pact-foundation/pact-js/commit/ef56513b96d046a36ec1ff068a1a707591f986a9)), closes [/github.com/pact-foundation/pact-js/commit/b3b5e6231e9f0ade7be045ff117b441d0169114a#diff-254dbea027a5c57e2b14fb8ff30edc28fea1d39ff2392d95731f7a16f60d5782R70](https://github.com/pact-foundation//github.com/pact-foundation/pact-js/commit/b3b5e6231e9f0ade7be045ff117b441d0169114a/issues/diff-254dbea027a5c57e2b14fb8ff30edc28fea1d39ff2392d95731f7a16f60d5782R70)

## [10.0.0-beta.36](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.35...v10.0.0-beta.36) (2021-05-31)


### Features

* filter verification by description & state ([2eb529a](https://github.com/pact-foundation/pact-js/commit/2eb529a6ee5d56bc8a40d280e238c36405bb8f58))


### Fixes and Improvements

* **build:** restore to files from git before build ([dfb9b08](https://github.com/pact-foundation/pact-js/commit/dfb9b08693522557e509c508d90e2a97f370ec4c))
* Error message with no pactBrokerUrl and no pactUrls ([3f6b036](https://github.com/pact-foundation/pact-js/commit/3f6b036779382f826f3449999855931abd12174f))
* internal error in Neon module: called `Option::unwrap()` on a `None` value ([7cb6822](https://github.com/pact-foundation/pact-js/commit/7cb6822d35c0447bead4a9ddcf863dacc7562ee8))
* linting ([3b1d394](https://github.com/pact-foundation/pact-js/commit/3b1d3945516ad924c47b47ffa70f8f33550a1136))
* process body intermediate format when the content type is not JSON [#633](https://github.com/pact-foundation/pact-js/issues/633) ([2683224](https://github.com/pact-foundation/pact-js/commit/26832240ab4977897a77a87f5f6f32e9af9da975))
* rename pact-node to pact-core ([553c525](https://github.com/pact-foundation/pact-js/commit/553c525a73e244d00726e933aa000ca4b81cf137))
* windows tests ([c56db1b](https://github.com/pact-foundation/pact-js/commit/c56db1b4b9477288f041063ca4b6c44b742b1b6f))
* windows tests ([1ef2f7c](https://github.com/pact-foundation/pact-js/commit/1ef2f7cd5869d0f4778e22a92c60f0aeabb785e2))
* XMLBuilder needs to return intermediate format ([002d6bc](https://github.com/pact-foundation/pact-js/commit/002d6bcba1ec495e82d10ba3367d91831d02e62b))

## [10.0.0-beta.35](https://github.com/pact-foundation/pact-js/compare/v9.15.5...v10.0.0-beta.35) (2021-05-21)


### ⚠ BREAKING CHANGES

* Pact-js no longer officially supports node less than 10 (10 is only supported by nodejs for another few months anyway, so I doubt this will affect many users)
* Since some of the interface of pact-core is exposed, there are some breaking changes:
   * In `VerifierOptions`: replace use of `tags`, `consumerVersionTag` and `providerVersionTag` with the appropriate `consumerVersionTags` or `providerVersionTags` option.
   * The type for consumer version selectors in the verifier options has been corrected. This will affect typescript users who were using consumerVersionSelectors with the fields `pacticipant`, `all` or `version`. These fields never worked, and now will no longer compile in typescript. The correct type is:
    ```
    ConsumerVersionSelector {
      tag?: string;
      latest?: boolean;
      consumer?: string;
      fallbackTag?: string;
    }
    ```

* Drop support for node < 10 ([328de85](https://github.com/pact-foundation/pact-js/commit/328de859e0699f849cc515e8240f71d1fe296aec))
* Update pact-core to v11. ([9e5a67d](https://github.com/pact-foundation/pact-js/commit/9e5a67da37fbfbd3433c31760ec6c020ccb2527d))

## [10.0.0-beta.34](https://github.com/pact-foundation/pact-js/compare/v9.15.4...v10.0.0-beta.34) (2021-04-07)


### Features

* add support for ignoring keys via the eachKeyLike matcher ([2f59c9f](https://github.com/pact-foundation/pact-js/commit/2f59c9fd87aedfc37df8e746e695fe6c98f1773d))


### Fixes and Improvements

* Correct types for interaction chaining in graphql ([5043cc0](https://github.com/pact-foundation/pact-js/commit/5043cc0ad5a72559e2508175fffa15e076e77bb3))
* **package-name:** Use the new name (pact-core) for pact-node ([a42fee2](https://github.com/pact-foundation/pact-js/commit/a42fee28a630becdef4a85e61f4a03133d6aba4f))
* Remove deprecated ability to provide options to Vverifier outside the constructor. Temporarily disable nestjs example accordingly ([a7a3c0e](https://github.com/pact-foundation/pact-js/commit/a7a3c0e97bb052ade32c13f174356c56172df522))
* **typescript:** accept string array as query value ([69f74ba](https://github.com/pact-foundation/pact-js/commit/69f74ba81a100c2dbbadb1448141f4e8a7afdb2a))

## [10.0.0-beta.33](https://github.com/pact-foundation/pact-js/compare/v9.15.2...v10.0.0-beta.33) (2021-03-03)


### Fixes and Improvements

* use example in datetime matcher instead of generator if provided. Fixes [#620](https://github.com/pact-foundation/pact-js/issues/620) ([c0ca78b](https://github.com/pact-foundation/pact-js/commit/c0ca78b6995354154ed387f18c1d896789acf778))

## [10.0.0-beta.32](https://github.com/pact-foundation/pact-js/compare/v9.15.1...v10.0.0-beta.32) (2021-02-23)


### Features

* add experimental 'allow missing' behind env var PACT_EXPERIMENTAL_FEATURE_ALLOW_MISSING_REQUESTS ([2d3a1fe](https://github.com/pact-foundation/pact-js/commit/2d3a1fec0c8989d58d0384bd39888cd8eb76d0a7))


### Fixes and Improvements

* **pact-node:** Bump dependency on pact-node ([812e09e](https://github.com/pact-foundation/pact-js/commit/812e09e67a9789b8ab02c852fe689a7b39d092c0))

## [10.0.0-beta.31](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.30...v10.0.0-beta.31) (2021-02-10)


### Fixes and Improvements

* improve file locking behaviour ([0f73466](https://github.com/pact-foundation/pact-js/commit/0f7346663d3edd9ef36cdfa7f08adfbe8f4ab4d8))

## [10.0.0-beta.30](https://github.com/pact-foundation/pact-js/compare/v9.15.0...v10.0.0-beta.30) (2021-02-08)


### Features

* fix file locking, add 'overwrite' and 'callbackTimeout' flags ([e891fcc](https://github.com/pact-foundation/pact-js/commit/e891fccb5802491cf148f398c81406bf06ae43c8)), closes [#599](https://github.com/pact-foundation/pact-js/issues/599) [#600](https://github.com/pact-foundation/pact-js/issues/600)


### Fixes and Improvements

* make the callback timeout configurable with a 5 sec default ([a0f0876](https://github.com/pact-foundation/pact-js/commit/a0f0876b93e728379a289a5bfa6e2e8613ec1768))

## [10.0.0-beta.29](https://github.com/pact-foundation/pact-js/compare/v9.14.2...v10.0.0-beta.29) (2021-01-29)


### Fixes and Improvements

* added export to V3 matcher interfaces ([8d11c1a](https://github.com/pact-foundation/pact-js/commit/8d11c1a6d6d8033ae96f471665245baec750ca51))
* don't strigify response that is already a string ([a867147](https://github.com/pact-foundation/pact-js/commit/a867147566b182e1f9244d72d96c29db59a51007))

## [10.0.0-beta.26](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.25...v10.0.0-beta.26) (2021-01-27)


### Features

* add uuid matcher function ([49c3da8](https://github.com/pact-foundation/pact-js/commit/49c3da8183ae729fe6063bd27e3eeba57750d853))


### Fixes and Improvements

* don't JSON.stringify body if its already a string ([6d44059](https://github.com/pact-foundation/pact-js/commit/6d44059db1917c17e40f128a4b3eedfda16fd2c1))
* local pact URL ([1fd5fe4](https://github.com/pact-foundation/pact-js/commit/1fd5fe4806c62581be7c80504c806257a7b9020a))
* use correct id in consumer test ([3d7e9c0](https://github.com/pact-foundation/pact-js/commit/3d7e9c0fa1ccc36734d864bfa02eab220b054af1))

## [10.0.0-beta.25](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.24...v10.0.0-beta.25) (2021-01-12)


### Fixes and Improvements

* change the release trigger for native libs ([3f1bbfa](https://github.com/pact-foundation/pact-js/commit/3f1bbfa79a4eb11593bc26ad96d34cc852b82c9e))
* URLs were not being generated correctly when used with an array contains matcher ([4fccb8d](https://github.com/pact-foundation/pact-js/commit/4fccb8df1ac19fa858cd7c4f1ca2da68c068bd04))

## [10.0.0-beta.24](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.23...v10.0.0-beta.24) (2021-01-12)


### Fixes and Improvements

* exclude openssl from native build for musl versions ([3db75af](https://github.com/pact-foundation/pact-js/commit/3db75afe2e42da0747deabff946ade6afca30ba4))
* exclude the native lib from the NPM package ([208e750](https://github.com/pact-foundation/pact-js/commit/208e750c5d51968f7e643ed835a299c4bb48f00a))
* exclude the native lib from the NPM package ([69a6e5b](https://github.com/pact-foundation/pact-js/commit/69a6e5b5263750bbef84ae7cadbc20d95294ee1c))

## [10.0.0-beta.23](https://github.com/pact-foundation/pact-js/compare/v9.14.0...v10.0.0-beta.23) (2021-01-11)


### Features

* initial pacts for verification integration ([6428bbe](https://github.com/pact-foundation/pact-js/commit/6428bbef3c056b884c4225a1d05f9f3b7b2d1691))
* support for matchers on headers ([aa3d55e](https://github.com/pact-foundation/pact-js/commit/aa3d55e4bbc60a210cc4be568d1c9dab9b0998b7))
* Update URL matching functions to support mock server URL generation ([2733af9](https://github.com/pact-foundation/pact-js/commit/2733af9aa0f936928358ad6e40e2c17d3aeb48b5))


### Fixes and Improvements

* correct V3 matcher spec ([6b6ac6c](https://github.com/pact-foundation/pact-js/commit/6b6ac6c71878e96ccaf3f19a81903ba620d16b5d))

## [10.0.0-beta.22](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.21...v10.0.0-beta.22) (2020-11-17)


### Features

* add example consumer test with provider state injected values [#516](https://github.com/pact-foundation/pact-js/issues/516) ([190f332](https://github.com/pact-foundation/pact-js/commit/190f332559fe0b1717054796614aa2624e81818c))
* added consumer for provider state injected example ([bdc333c](https://github.com/pact-foundation/pact-js/commit/bdc333c57107ac62f44abfac83ec62645470cc71))
* got provider state injected values working with provider test [#516](https://github.com/pact-foundation/pact-js/issues/516) ([5fdf7eb](https://github.com/pact-foundation/pact-js/commit/5fdf7eb8284d73030049e1abf19c34445981510b))
* implemented matching query parameters and provider state injected values (in consumer DSL) [#516](https://github.com/pact-foundation/pact-js/issues/516) ([f798c13](https://github.com/pact-foundation/pact-js/commit/f798c13494b690d9f5348c61d143855e7117de33))


### Fixes and Improvements

* if query parameters are not supplied they will be null or undefined [#516](https://github.com/pact-foundation/pact-js/issues/516) ([17397be](https://github.com/pact-foundation/pact-js/commit/17397bea50f25d3ded1dc71739a935e39b1f9a52))

## [10.0.0-beta.21](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.20...v10.0.0-beta.21) (2020-10-30)


### Fixes and Improvements

* improve the test error to include the original stack trace ([c14cb97](https://github.com/pact-foundation/pact-js/commit/c14cb97492ad38f16d442bef5a6411999149501d))
* update to latest mock server crate, fixes [#520](https://github.com/pact-foundation/pact-js/issues/520) ([21774de](https://github.com/pact-foundation/pact-js/commit/21774de2cc83b62224cb5315e888fb9ccd09c20b))

## [10.0.0-beta.20](https://github.com/pact-foundation/pact-js/compare/v9.13.0...v10.0.0-beta.20) (2020-10-29)


### Fixes and Improvements

* can not use matrix expressions in uses: with GH actions ([d6942a4](https://github.com/pact-foundation/pact-js/commit/d6942a412a64d1edd11d4f0f4ce2836e020da1e5))
* support any values for provider state parameters ([df4df0b](https://github.com/pact-foundation/pact-js/commit/df4df0bcd944d18088c6f7241b925c66a83a2039))
* update the MUSL docker container for use with GH actions ([5647032](https://github.com/pact-foundation/pact-js/commit/564703202e6bb22443eb7d6b90a533d1f7a54a6e))

## [10.0.0-beta.19](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.18...v10.0.0-beta.19) (2020-10-19)

## [10.0.0-beta.18](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.17...v10.0.0-beta.18) (2020-10-16)


### Features

* add support for array contains matcher ([57bcc79](https://github.com/pact-foundation/pact-js/commit/57bcc792037eb05d17a6e6268d14dcabe0262712))


### Fixes and Improvements

* typo in comment ([7491383](https://github.com/pact-foundation/pact-js/commit/7491383ded889a4b25f3480c2601f715b4f49c69))
* update to latest matching lib ([23e1f39](https://github.com/pact-foundation/pact-js/commit/23e1f39bd690f2bbf80cf78cb2922939484c6838))

## [10.0.0-beta.17](https://github.com/pact-foundation/pact-js/compare/v9.12.2...v10.0.0-beta.17) (2020-10-12)


### Features

* improve the error messages for a failed test ([f01b57e](https://github.com/pact-foundation/pact-js/commit/f01b57e9b0606735669bc684517ceaac19269be1))


### Fixes and Improvements

* allow the mock server port to be configured ([9c63d28](https://github.com/pact-foundation/pact-js/commit/9c63d28eb6d0c3d361b07b2053dcd3853649b160))
* correct the imports [#514](https://github.com/pact-foundation/pact-js/issues/514) ([6764a84](https://github.com/pact-foundation/pact-js/commit/6764a84e5b3004cd7f0f814a9ef694e606481ebe))

## [10.0.0-beta.16](https://github.com/pact-foundation/pact-js/compare/v9.12.1...v10.0.0-beta.16) (2020-09-28)


### Features

* add flag to enable handling CORS pre-flight requests ([0adb3fc](https://github.com/pact-foundation/pact-js/commit/0adb3fcab90bcf491f291c3874dd8bff93d3ac48))


### Fixes and Improvements

* correct Rust code after upgrade to upstream libs ([aa6d803](https://github.com/pact-foundation/pact-js/commit/aa6d803bb611f7d89692abf4e4409c14e43e7cc9))
* need .mocharc.json after merge from master ([2525bf6](https://github.com/pact-foundation/pact-js/commit/2525bf6563e8cc93cd3522bcff8cdb9cb5931c4e))
* package.json after merge from master ([aef422b](https://github.com/pact-foundation/pact-js/commit/aef422b70d850032575bac8efc442bc6eecb0205))

## [10.0.0-beta.15](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.14...v10.0.0-beta.15) (2020-08-05)


### Fixes and Improvements

* correct matcher paths for text nodes in XML ([a217793](https://github.com/pact-foundation/pact-js/commit/a217793a5e538d9e9616ae1bab8cbd561fdd5377))

## [10.0.0-beta.14](https://github.com/pact-foundation/pact-js/compare/v9.11.1...v10.0.0-beta.14) (2020-08-04)


### Fixes and Improvements

* lint ([ae8397a](https://github.com/pact-foundation/pact-js/commit/ae8397af7a30af95fdcade718a6bd5c458da9e25))
* PactNative.init needs to be re-entrant ([16c22f6](https://github.com/pact-foundation/pact-js/commit/16c22f64e3b174b18f3a51cb1d157af66ea019ab))

## [10.0.0-beta.13](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.12...v10.0.0-beta.13) (2020-06-27)


### Features

* add some tests around the conusmer DSL matchers ([e6a153f](https://github.com/pact-foundation/pact-js/commit/e6a153fd62d48644b97018d69e5f23d1710e510f))
* handle XML matching with different types of child elements ([2143ca4](https://github.com/pact-foundation/pact-js/commit/2143ca4c968969e1c6218dd8e538097733ccfa56))
* implemented consumer DSL URL matcher ([f27a444](https://github.com/pact-foundation/pact-js/commit/f27a44409aed3ece1adbab6af9e853b7684c101c))


### Fixes and Improvements

* after upgrading crates ([9a5a36d](https://github.com/pact-foundation/pact-js/commit/9a5a36db9d733bd13a1d68bb5b8d893720a915cb))
* import for metadata was wrong ([ba2a975](https://github.com/pact-foundation/pact-js/commit/ba2a9755aee672cbed73b236c44f68aab14939f0))
* lint ([78b4692](https://github.com/pact-foundation/pact-js/commit/78b46927bbeb96a4da6a924b7d8e86084ff6c355))

## [10.0.0-beta.12](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.11...v10.0.0-beta.12) (2020-06-12)

## [10.0.0-beta.11](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.10...v10.0.0-beta.11) (2020-06-12)

## [10.0.0-beta.10](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.9...v10.0.0-beta.10) (2020-06-12)

## [10.0.0-beta.9](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.8...v10.0.0-beta.9) (2020-06-11)

## [10.0.0-beta.8](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.7...v10.0.0-beta.8) (2020-06-11)

## [10.0.0-beta.7](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.6...v10.0.0-beta.7) (2020-06-11)

## [10.0.0-beta.6](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.5...v10.0.0-beta.6) (2020-06-11)


### Features

* enable publishing of verification results ([fcbdb3e](https://github.com/pact-foundation/pact-js/commit/fcbdb3e9729365039c30267996a7364e23ccdef1))
* release node 14 native binaries ([9ee832c](https://github.com/pact-foundation/pact-js/commit/9ee832c8dcfd896432ef34fb57595496bcac0077))

## [10.0.0-beta.5](https://github.com/pact-foundation/pact-js/compare/v9.11.0...v10.0.0-beta.5) (2020-05-27)


### Features

* support MIME multipart form posts with binary files ([d72a210](https://github.com/pact-foundation/pact-js/commit/d72a2103b4fb0d348d2601e88d9a34befc4f31a7))
* support regex matcher with a regexp object ([d92f6f5](https://github.com/pact-foundation/pact-js/commit/d92f6f5eee92667e5a3ce0ecdd44177d18a6b7ff))
* support text nodes configured from XML builder ([a2a7f55](https://github.com/pact-foundation/pact-js/commit/a2a7f55eff4a187cbe30a3e56917745ebc40e33d))
* support using matchers on XML text nodes ([b3b5e62](https://github.com/pact-foundation/pact-js/commit/b3b5e6231e9f0ade7be045ff117b441d0169114a))


### Fixes and Improvements

* correct the version of the pact_mock_server crate ([a17f2bb](https://github.com/pact-foundation/pact-js/commit/a17f2bb26d2964ac45b19704d91019ab2e7cdc4d))
* date/time matchers were being skipped due to defect in upstream matching lib ([dcc3a7f](https://github.com/pact-foundation/pact-js/commit/dcc3a7fbf212cfce02c7d3dcf50bdb8f47baf45e))
* travis matrix was doubled up ([fe08a70](https://github.com/pact-foundation/pact-js/commit/fe08a70769dbf7b3525b074f93731fb8d9ab3916))
* travis was not running the E2E tests after merge from master ([73257dc](https://github.com/pact-foundation/pact-js/commit/73257dc3f43e229103aca119b3369d5d3ec228eb))

## [10.0.0-beta.4](https://github.com/pact-foundation/pact-js/compare/v9.10.0...v10.0.0-beta.4) (2020-05-20)


### Features

* add support for binary payloads ([658ffa0](https://github.com/pact-foundation/pact-js/commit/658ffa0ee17adfe380b7cb1c68e10c48078c9cb6))


### Fixes and Improvements

* accidentially commited development paths in cargo manefest ([03cc16f](https://github.com/pact-foundation/pact-js/commit/03cc16f71d5f6a6cd646cdb6cf5421a134cb159e))
* format the error messages in a better way ([0a15772](https://github.com/pact-foundation/pact-js/commit/0a15772a710d3d159648672470084a1c99b45cc8))
* handle error when pact file cannot be written ([82832a8](https://github.com/pact-foundation/pact-js/commit/82832a81c115d06ef2d9c1fadd18c54f6f629e59))
* throw an exception when a request is configured but no interaction defined ([b317da7](https://github.com/pact-foundation/pact-js/commit/b317da79f28dce45102a55bcdcbc415d3fbdb9ab))
* throw an exception when a response is configured but no interaction defined ([6feacbe](https://github.com/pact-foundation/pact-js/commit/6feacbeef513420eddd9cbaed36abea80344de13))

## [10.0.0-beta.3](https://github.com/pact-foundation/pact-js/compare/v9.9.2...v10.0.0-beta.3) (2020-04-08)


### Fixes and Improvements

* correct invalid logger import ([5d4ba5b](https://github.com/pact-foundation/pact-js/commit/5d4ba5be629693b6608ea5f671b116a2ec3dad14))
* don't bundle the native lib in the NPM package ([24f43f3](https://github.com/pact-foundation/pact-js/commit/24f43f36f78269aef935381999dfe1e5802ea185))
* guard against panics in background thread ([b35aecd](https://github.com/pact-foundation/pact-js/commit/b35aecd2e907f4cb80ac4ba8ec3d99c9801f8c15))
* integer, decimal and number parameters are optional ([69f3983](https://github.com/pact-foundation/pact-js/commit/69f398333a10b649be4bf5a929234620d13d68d8))
* throw a JS error if there are no pacts to verify ([3bfd9da](https://github.com/pact-foundation/pact-js/commit/3bfd9dac007320e3ff14e476851d2f0aabef7ca0))
* try get the cause of any Rust panic ([f1f3d4a](https://github.com/pact-foundation/pact-js/commit/f1f3d4a4e287ec2c78a5b8f8eacfda459540dd5a))
* typo ([5d8dd37](https://github.com/pact-foundation/pact-js/commit/5d8dd37cf338478cc2a16532b9f2664e301294bf))
* update pact matching crate to 0.5.10 to fix invalid path matcher format ([ecce929](https://github.com/pact-foundation/pact-js/commit/ecce929af3d9aa51c3163d58e119924137a15195))

## [10.0.0-beta.2](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.1...v10.0.0-beta.2) (2020-03-18)


### Fixes and Improvements

* correct the path to the native lib in the NPM package ([300d915](https://github.com/pact-foundation/pact-js/commit/300d91516afebeefe979039566b02162e09992c0))

## [10.0.0-beta.1](https://github.com/pact-foundation/pact-js/compare/v9.8.1...v10.0.0-beta.1) (2020-03-17)


### Features

* got E2E consumer test passing ([904ed0b](https://github.com/pact-foundation/pact-js/commit/904ed0ba1115c81a07229e6a27c9e2d103c2dc36))
* got request filters working. Yay! ([de16880](https://github.com/pact-foundation/pact-js/commit/de16880171ee76fdb134593a7fc78725c81158ec))
* got the example V3 test working ([9ab43cc](https://github.com/pact-foundation/pact-js/commit/9ab43cc3541600653195c701b770dbdf1f44d5b0))
* handle the parameters and results from provider state callbacks [#372](https://github.com/pact-foundation/pact-js/issues/372) ([d3f73e5](https://github.com/pact-foundation/pact-js/commit/d3f73e5845023aa5168647daf711829a2d90f9ce))
* implement provider state parameters in consumer tests [#372](https://github.com/pact-foundation/pact-js/issues/372) ([af8bf32](https://github.com/pact-foundation/pact-js/commit/af8bf32f15551a7b86dc73682272074347143ffc))
* implemented provider state callbacks with parameters [#372](https://github.com/pact-foundation/pact-js/issues/372) ([50e4e61](https://github.com/pact-foundation/pact-js/commit/50e4e6199b6d9ce37cca8f10bdcd0d403cc1ad5d))
* Introduce an authenticated state [#372](https://github.com/pact-foundation/pact-js/issues/372) ([debebd7](https://github.com/pact-foundation/pact-js/commit/debebd73cce92a3988f99afbccc4d0091af4a3c9))


### Fixes and Improvements

* changes needed for the E2E consumer test ([6022f8b](https://github.com/pact-foundation/pact-js/commit/6022f8b33fce1cea1f60ba1cf62625f557a00572))
* correct the paths for the attribute matchers ([7629c92](https://github.com/pact-foundation/pact-js/commit/7629c9232308e1e51730f1567a2e6010ce852aac))
* correct the v3-todo example tests ([de205c7](https://github.com/pact-foundation/pact-js/commit/de205c7e5ca7c1922b187e29a6d44f0010afb27b))
* datetime matchers now generate a value if one is not given ([a910840](https://github.com/pact-foundation/pact-js/commit/a910840001f0e86201e82b2ca5759841392c9cca))
* fucking lint ([cdb72db](https://github.com/pact-foundation/pact-js/commit/cdb72db91eb1283423d21e3841ed3329a128a0af))
* Gah! Lint Nazis ([79082fd](https://github.com/pact-foundation/pact-js/commit/79082fddafbb7e76293103a3457292b02b8dfc95))
* got eachlike with number of examples working ([88c9a72](https://github.com/pact-foundation/pact-js/commit/88c9a72a8e11456d0afe94bbfc6ce212bd22153e))
* lint ([772224d](https://github.com/pact-foundation/pact-js/commit/772224d4d7eeaa7beafe27b55816e441a5d1ddb4))
* lint ([9717b47](https://github.com/pact-foundation/pact-js/commit/9717b47e2bc06087f0d8eafdeb86f73bdca46683))
* neon build should point to native directory ([fdea3eb](https://github.com/pact-foundation/pact-js/commit/fdea3eb6619f9281a377300b39d281b342ab588d))
* neon build should point to native directory ([16957a2](https://github.com/pact-foundation/pact-js/commit/16957a2dff8a7669ad848437591a02f306038dca))
* neon requires a C++ compiler ([bb8731f](https://github.com/pact-foundation/pact-js/commit/bb8731fae1dcf8797bbfa1ecfd0ad3a95a7ef3d5))
* removed node 6 and 7 because ancient ([2b45cfc](https://github.com/pact-foundation/pact-js/commit/2b45cfcca9adc92834cdfe74bf1dda5550f4d0ec))
* rustup: Unable to run interactively. Run with -y to accept defaults ([abfa9c9](https://github.com/pact-foundation/pact-js/commit/abfa9c9151eb27c3b5c503131bda4907a809c677))
* travis build needs the Rust source in dist ([e64402e](https://github.com/pact-foundation/pact-js/commit/e64402eae49ed2d5e290686860b357f1b4748812))
* travis build needs the Rust source in dist ([519fee5](https://github.com/pact-foundation/pact-js/commit/519fee59d6798771e6fc7aaf6fcde8babd340356))
* use 0.5.6 of matching lib to avoid dup rules ([d30d7b9](https://github.com/pact-foundation/pact-js/commit/d30d7b974bcdcf25cfd73fd93ade68fbcd73ecdb))

## [10.0.0-beta.54](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.53...v10.0.0-beta.54) (2021-10-29)


### Fixes and Improvements

* Bump version of pact-core to 13.3.0 ([97cc2ec](https://github.com/pact-foundation/pact-js/commit/97cc2ec797d6ccde62ad7d35e00dd634043b61c1))

## [10.0.0-beta.53](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.52...v10.0.0-beta.53) (2021-10-19)


### Fixes and Improvements

* Bump version of pact-core to fix regression in publisher API ([db434a5](https://github.com/pact-foundation/pact-js/commit/db434a5bf0acd726070c1db8a357cd68e81f6714))

## [10.0.0-beta.52](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.51...v10.0.0-beta.52) (2021-10-16)


### Fixes and Improvements

* Bump version of pact-core to fix [#760](https://github.com/pact-foundation/pact-js/issues/760) ([0cf7206](https://github.com/pact-foundation/pact-js/commit/0cf7206b8ae8e65e52e0e91fa8384278ccc78555))

## [10.0.0-beta.51](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.50...v10.0.0-beta.51) (2021-09-22)


### Fixes and Improvements

* Bump version of pact-core to obtain fix for a regression in VerifierOptions where the option was set to undefined ([b424136](https://github.com/pact-foundation/pact-js/commit/b4241363276d26ef5947f3b3637e52ce09a4e8e3))

## [10.0.0-beta.50](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.49...v10.0.0-beta.50) (2021-09-21)


### Fixes and Improvements

* Don't generate random numbers when the example given to V3 integer or decimal matchers is 0 ([#742](https://github.com/pact-foundation/pact-js/issues/742)) ([e5a443c](https://github.com/pact-foundation/pact-js/commit/e5a443c55a98c3e3011580d04f639260522e18db))

## [10.0.0-beta.49](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.48...v10.0.0-beta.49) (2021-09-15)


### Fixes and Improvements

* give up on node 16 musl until we can remove neon ([c8e5275](https://github.com/pact-foundation/pact-js/commit/c8e5275af5215f1259e524a2d6ce52270f261a2d))
* update or remove all packages that caused dependency warnings ([e1bb6ec](https://github.com/pact-foundation/pact-js/commit/e1bb6ecb31874ff07be603bde6683d9113a4dc30))

## [10.0.0-beta.48](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.47...v10.0.0-beta.48) (2021-09-15)


### Fixes and Improvements

* upgrade neon to (finally) support Node 16 (hopefully) ([6734a52](https://github.com/pact-foundation/pact-js/commit/6734a52f60a1a3881396c7b5f63b7b4745550f94))

## [10.0.0-beta.47](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.46...v10.0.0-beta.47) (2021-09-15)


### ⚠ BREAKING CHANGES

* **matchers:** `Matchers.rfc3339Timestamp()` has been renamed to `Matchers.rfc1123Timestamp()`. The behaviour is unchanged - it was always RFC1123, and never did match RFC3339 timestamps.

### Features

* support node 16 with native build ([5c5753e](https://github.com/pact-foundation/pact-js/commit/5c5753e3a8ac2ac93bc6c3ce68e9439388b8b639))


### Fixes and Improvements

* add support for request-mismatch error types ([fa63933](https://github.com/pact-foundation/pact-js/commit/fa639330f7bd535d597b765983216bbaed662742))
* Bump version of pact-core to obtain fix for Verifier not accepting broker token correctly ([#738](https://github.com/pact-foundation/pact-js/issues/738)) ([79d9930](https://github.com/pact-foundation/pact-js/commit/79d993016f907a6859a2cdeb950bc42ec9096a8f))
* **matchers:** Rename rfc3339Timestamp to rfc1123Timestamp ([#451](https://github.com/pact-foundation/pact-js/issues/451)) ([8e9c378](https://github.com/pact-foundation/pact-js/commit/8e9c378459c2de0f95ee1b91a7bb8dfaa1d9a60b))

## [10.0.0-beta.46](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.45...v10.0.0-beta.46) (2021-09-13)


### Features

* Support node 16 with native build ([79d43ff](https://github.com/pact-foundation/pact-js/commit/79d43ff695ae64137d083e9651c62482691cf1b8))

## [10.0.0-beta.45](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.44...v10.0.0-beta.45) (2021-09-10)


### ⚠ BREAKING CHANGES

* There are several changes to the `VerifierOptions`. To migrate:

  * Replace `verbose` with `logLevel: "DEBUG"` (logLevels of `DEBUG` and below now imply `verbose` where appropriate)
  * Replace `consumerVersionTag` with the `consumerVersionTags` array
  * Replace `providerVersionTag` with the `providerVersionTags` array
  * Replace `tags` with `consumerVersionTags` or `providerVersionTags` as appropriate.
* Some `VerifierOptions` have been removed entirely:
  * `customProviderHeaders` has been removed. If you need this functionality, set an
    appropriate request filter with the `requestFilters` option instead.
  * All logging and reporting is now on standard out (this was the default before).
    This means `logDir` / `format` / `out` have all been removed. If your ecosystem needs
    the ability to customise logging and reporting, please let us know by opening an issue.
  * The undocumented option `monkeypatch` has been removed. The use cases for this
    feature are mostly covered by other options.
* **logging:** 'fatal' log level has been removed. Nothing was logged at fatal, and the underlying core doesn't support it.

### Features

* Actually send message metadata during verification ([c373144](https://github.com/pact-foundation/pact-js/commit/c373144e040c78babaf48d5b14575dfe33233b88))
* Add ability to specify metadata in provider tests with ([824e49b](https://github.com/pact-foundation/pact-js/commit/824e49b5f7f6cfc9555fb988430dceb0a4ab875b))
* State handlers respect promises for all pact file formats ([72bfc0b](https://github.com/pact-foundation/pact-js/commit/72bfc0b78df471e1a37fd3c93658199493bb066f))


* **logging:** Improve trace logging and use clearer types ([060daa9](https://github.com/pact-foundation/pact-js/commit/060daa964e7b57a5e4ada634702de21c1e434921))
* update verifier options ([6df54b0](https://github.com/pact-foundation/pact-js/commit/6df54b01a68057e88cabee18743048a69db7c28e))


### Fixes and Improvements

* broken pact provider test not consistent with types ([29af342](https://github.com/pact-foundation/pact-js/commit/29af34250cdc308a5298553f5ee9bbb9daf182cb))
* correct VerfierV3Options so that it doesn't clobber VeriferOptions ([5796fde](https://github.com/pact-foundation/pact-js/commit/5796fdeb96c354316fe9606f0a9a7fc0c3d43532))
* using relative import. fixes problems with intellisense in vscode ([35de1c5](https://github.com/pact-foundation/pact-js/commit/35de1c57d744d5bc747e6af114c8d272b2a8cec4))
* You no longer need to import the verifier from /v3, it can be imported directly from @pact-foundation/pact ([c268497](https://github.com/pact-foundation/pact-js/commit/c268497e1fd848d3423d379a2671361ea56c9b53))

## [10.0.0-beta.44](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.43...v10.0.0-beta.44) (2021-07-22)


### Fixes and Improvements

* consumerVersionTags were overwritten with empty array ([#714](https://github.com/pact-foundation/pact-js/issues/714)) ([838d1cb](https://github.com/pact-foundation/pact-js/commit/838d1cbc8730592518abff16733a9a703437abb7))

## [10.0.0-beta.43](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.42...v10.0.0-beta.43) (2021-07-18)


### Fixes and Improvements

* return correct data type in fromProviderState ([#710](https://github.com/pact-foundation/pact-js/issues/710)) ([ec9192f](https://github.com/pact-foundation/pact-js/commit/ec9192fb44986b001634b8c44c877a8e3dd29c64)), closes [#633](https://github.com/pact-foundation/pact-js/issues/633)

## [10.0.0-beta.42](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.41...v10.0.0-beta.42) (2021-06-29)


### Features

* reset consumer test state to enable re-use of PactV3 class ([0134ea8](https://github.com/pact-foundation/pact-js/commit/0134ea8252b49a1639fdd78be4fe16283e1a7d70))

## [10.0.0-beta.41](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.40...v10.0.0-beta.41) (2021-06-26)


### ⚠ BREAKING CHANGES

* the signature of state handlers has been updated to
accept either a single function with parameters, or an object that
can specify optional teardown and setup functions that run on the
different state phases.
* callbackTimeout is now timeout

### Features

* support promises in filters + state handlers ([456567c](https://github.com/pact-foundation/pact-js/commit/456567c83a5f155381eebb7dd3f6b60d3bc0060b))


### Fixes and Improvements

* Make request tracer log in debug instead of trace ([24742e4](https://github.com/pact-foundation/pact-js/commit/24742e4c3d314de346e7fe430da2078cb475d7b1))

## [10.0.0-beta.40](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.39...v10.0.0-beta.40) (2021-06-24)


### Fixes and Improvements

* make fromProviderState Matcher compatible ([b608094](https://github.com/pact-foundation/pact-js/commit/b6080942f60c659c3947ecdd99e711eba088c5e8))

## [10.0.0-beta.39](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.38...v10.0.0-beta.39) (2021-06-23)


### Fixes and Improvements

* fromProviderState should accept any valid JSON. Fixes [#696](https://github.com/pact-foundation/pact-js/issues/696) ([1b03b2d](https://github.com/pact-foundation/pact-js/commit/1b03b2d35752529f1d77ce418ad2bb9c73e4b915))

## [10.0.0-beta.38](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.37...v10.0.0-beta.38) (2021-06-21)


### Fixes and Improvements

* Add InterfaceToTemplate&lt;&gt; generic type to address compile errors if users are using interfaces with matchers ([982c4d2](https://github.com/pact-foundation/pact-js/commit/982c4d2ccd47254e4a8466a38e07b35a7d066a5c))
* **verifier:** added StateHandler type and improved JSDocs ([4cad265](https://github.com/pact-foundation/pact-js/commit/4cad265e48a05539b7e99770852f7eaeba0bbd67))

## [10.0.0-beta.37](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.36...v10.0.0-beta.37) (2021-06-06)


### Features

* add consumer version selectors to v3 pact verifier ([3fe65ad](https://github.com/pact-foundation/pact-js/commit/3fe65ade2a478929309392e2fab030676373c4b4))


### Fixes and Improvements

* append text only works with Matchers ([ef56513](https://github.com/pact-foundation/pact-js/commit/ef56513b96d046a36ec1ff068a1a707591f986a9)), closes [/github.com/pact-foundation/pact-js/commit/b3b5e6231e9f0ade7be045ff117b441d0169114a#diff-254dbea027a5c57e2b14fb8ff30edc28fea1d39ff2392d95731f7a16f60d5782R70](https://github.com/pact-foundation//github.com/pact-foundation/pact-js/commit/b3b5e6231e9f0ade7be045ff117b441d0169114a/issues/diff-254dbea027a5c57e2b14fb8ff30edc28fea1d39ff2392d95731f7a16f60d5782R70)

## [10.0.0-beta.36](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.35...v10.0.0-beta.36) (2021-05-31)


### Features

* filter verification by description & state ([2eb529a](https://github.com/pact-foundation/pact-js/commit/2eb529a6ee5d56bc8a40d280e238c36405bb8f58))


### Fixes and Improvements

* **build:** restore to files from git before build ([dfb9b08](https://github.com/pact-foundation/pact-js/commit/dfb9b08693522557e509c508d90e2a97f370ec4c))
* Error message with no pactBrokerUrl and no pactUrls ([3f6b036](https://github.com/pact-foundation/pact-js/commit/3f6b036779382f826f3449999855931abd12174f))
* internal error in Neon module: called `Option::unwrap()` on a `None` value ([7cb6822](https://github.com/pact-foundation/pact-js/commit/7cb6822d35c0447bead4a9ddcf863dacc7562ee8))
* linting ([3b1d394](https://github.com/pact-foundation/pact-js/commit/3b1d3945516ad924c47b47ffa70f8f33550a1136))
* process body intermediate format when the content type is not JSON [#633](https://github.com/pact-foundation/pact-js/issues/633) ([2683224](https://github.com/pact-foundation/pact-js/commit/26832240ab4977897a77a87f5f6f32e9af9da975))
* rename pact-node to pact-core ([553c525](https://github.com/pact-foundation/pact-js/commit/553c525a73e244d00726e933aa000ca4b81cf137))
* windows tests ([c56db1b](https://github.com/pact-foundation/pact-js/commit/c56db1b4b9477288f041063ca4b6c44b742b1b6f))
* windows tests ([1ef2f7c](https://github.com/pact-foundation/pact-js/commit/1ef2f7cd5869d0f4778e22a92c60f0aeabb785e2))
* XMLBuilder needs to return intermediate format ([002d6bc](https://github.com/pact-foundation/pact-js/commit/002d6bcba1ec495e82d10ba3367d91831d02e62b))

## [10.0.0-beta.35](https://github.com/pact-foundation/pact-js/compare/v9.15.5...v10.0.0-beta.35) (2021-05-21)


### ⚠ BREAKING CHANGES

* Pact-js no longer officially supports node less than 10 (10 is only supported by nodejs for another few months anyway, so I doubt this will affect many users)
* Since some of the interface of pact-core is exposed, there are some breaking changes:
   * In `VerifierOptions`: replace use of `tags`, `consumerVersionTag` and `providerVersionTag` with the appropriate `consumerVersionTags` or `providerVersionTags` option.
   * The type for consumer version selectors in the verifier options has been corrected. This will affect typescript users who were using consumerVersionSelectors with the fields `pacticipant`, `all` or `version`. These fields never worked, and now will no longer compile in typescript. The correct type is:
    ```
    ConsumerVersionSelector {
      tag?: string;
      latest?: boolean;
      consumer?: string;
      fallbackTag?: string;
    }
    ```

* Drop support for node < 10 ([328de85](https://github.com/pact-foundation/pact-js/commit/328de859e0699f849cc515e8240f71d1fe296aec))
* Update pact-core to v11. ([9e5a67d](https://github.com/pact-foundation/pact-js/commit/9e5a67da37fbfbd3433c31760ec6c020ccb2527d))

## [10.0.0-beta.34](https://github.com/pact-foundation/pact-js/compare/v9.15.4...v10.0.0-beta.34) (2021-04-07)


### Features

* add support for ignoring keys via the eachKeyLike matcher ([2f59c9f](https://github.com/pact-foundation/pact-js/commit/2f59c9fd87aedfc37df8e746e695fe6c98f1773d))


### Fixes and Improvements

* Correct types for interaction chaining in graphql ([5043cc0](https://github.com/pact-foundation/pact-js/commit/5043cc0ad5a72559e2508175fffa15e076e77bb3))
* Remove deprecated ability to provide options to Vverifier outside the constructor. Temporarily disable nestjs example accordingly ([a7a3c0e](https://github.com/pact-foundation/pact-js/commit/a7a3c0e97bb052ade32c13f174356c56172df522))
* **package-name:** Use the new name (pact-core) for pact-node ([a42fee2](https://github.com/pact-foundation/pact-js/commit/a42fee28a630becdef4a85e61f4a03133d6aba4f))
* **typescript:** accept string array as query value ([69f74ba](https://github.com/pact-foundation/pact-js/commit/69f74ba81a100c2dbbadb1448141f4e8a7afdb2a))

## [10.0.0-beta.33](https://github.com/pact-foundation/pact-js/compare/v9.15.2...v10.0.0-beta.33) (2021-03-03)


### Fixes and Improvements

* use example in datetime matcher instead of generator if provided. Fixes [#620](https://github.com/pact-foundation/pact-js/issues/620) ([c0ca78b](https://github.com/pact-foundation/pact-js/commit/c0ca78b6995354154ed387f18c1d896789acf778))

## [10.0.0-beta.32](https://github.com/pact-foundation/pact-js/compare/v9.15.1...v10.0.0-beta.32) (2021-02-23)


### Features

* add experimental 'allow missing' behind env var PACT_EXPERIMENTAL_FEATURE_ALLOW_MISSING_REQUESTS ([2d3a1fe](https://github.com/pact-foundation/pact-js/commit/2d3a1fec0c8989d58d0384bd39888cd8eb76d0a7))


### Fixes and Improvements

* **pact-node:** Bump dependency on pact-node ([812e09e](https://github.com/pact-foundation/pact-js/commit/812e09e67a9789b8ab02c852fe689a7b39d092c0))

## [10.0.0-beta.31](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.30...v10.0.0-beta.31) (2021-02-10)


### Fixes and Improvements

* improve file locking behaviour ([0f73466](https://github.com/pact-foundation/pact-js/commit/0f7346663d3edd9ef36cdfa7f08adfbe8f4ab4d8))

## [10.0.0-beta.30](https://github.com/pact-foundation/pact-js/compare/v9.15.0...v10.0.0-beta.30) (2021-02-08)


### Features

* fix file locking, add 'overwrite' and 'callbackTimeout' flags ([e891fcc](https://github.com/pact-foundation/pact-js/commit/e891fccb5802491cf148f398c81406bf06ae43c8)), closes [#599](https://github.com/pact-foundation/pact-js/issues/599) [#600](https://github.com/pact-foundation/pact-js/issues/600)


### Fixes and Improvements

* make the callback timeout configurable with a 5 sec default ([a0f0876](https://github.com/pact-foundation/pact-js/commit/a0f0876b93e728379a289a5bfa6e2e8613ec1768))

## [10.0.0-beta.29](https://github.com/pact-foundation/pact-js/compare/v9.14.2...v10.0.0-beta.29) (2021-01-29)


### Fixes and Improvements

* added export to V3 matcher interfaces ([8d11c1a](https://github.com/pact-foundation/pact-js/commit/8d11c1a6d6d8033ae96f471665245baec750ca51))
* don't strigify response that is already a string ([a867147](https://github.com/pact-foundation/pact-js/commit/a867147566b182e1f9244d72d96c29db59a51007))

## [10.0.0-beta.26](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.25...v10.0.0-beta.26) (2021-01-27)


### Features

* add uuid matcher function ([49c3da8](https://github.com/pact-foundation/pact-js/commit/49c3da8183ae729fe6063bd27e3eeba57750d853))


### Fixes and Improvements

* don't JSON.stringify body if its already a string ([6d44059](https://github.com/pact-foundation/pact-js/commit/6d44059db1917c17e40f128a4b3eedfda16fd2c1))
* local pact URL ([1fd5fe4](https://github.com/pact-foundation/pact-js/commit/1fd5fe4806c62581be7c80504c806257a7b9020a))
* use correct id in consumer test ([3d7e9c0](https://github.com/pact-foundation/pact-js/commit/3d7e9c0fa1ccc36734d864bfa02eab220b054af1))

## [10.0.0-beta.25](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.24...v10.0.0-beta.25) (2021-01-12)


### Fixes and Improvements

* change the release trigger for native libs ([3f1bbfa](https://github.com/pact-foundation/pact-js/commit/3f1bbfa79a4eb11593bc26ad96d34cc852b82c9e))
* URLs were not being generated correctly when used with an array contains matcher ([4fccb8d](https://github.com/pact-foundation/pact-js/commit/4fccb8df1ac19fa858cd7c4f1ca2da68c068bd04))

## [10.0.0-beta.24](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.23...v10.0.0-beta.24) (2021-01-12)


### Fixes and Improvements

* exclude openssl from native build for musl versions ([3db75af](https://github.com/pact-foundation/pact-js/commit/3db75afe2e42da0747deabff946ade6afca30ba4))
* exclude the native lib from the NPM package ([208e750](https://github.com/pact-foundation/pact-js/commit/208e750c5d51968f7e643ed835a299c4bb48f00a))
* exclude the native lib from the NPM package ([69a6e5b](https://github.com/pact-foundation/pact-js/commit/69a6e5b5263750bbef84ae7cadbc20d95294ee1c))

## [10.0.0-beta.23](https://github.com/pact-foundation/pact-js/compare/v9.14.0...v10.0.0-beta.23) (2021-01-11)


### Features

* initial pacts for verification integration ([6428bbe](https://github.com/pact-foundation/pact-js/commit/6428bbef3c056b884c4225a1d05f9f3b7b2d1691))
* support for matchers on headers ([aa3d55e](https://github.com/pact-foundation/pact-js/commit/aa3d55e4bbc60a210cc4be568d1c9dab9b0998b7))
* Update URL matching functions to support mock server URL generation ([2733af9](https://github.com/pact-foundation/pact-js/commit/2733af9aa0f936928358ad6e40e2c17d3aeb48b5))


### Fixes and Improvements

* correct V3 matcher spec ([6b6ac6c](https://github.com/pact-foundation/pact-js/commit/6b6ac6c71878e96ccaf3f19a81903ba620d16b5d))

## [10.0.0-beta.22](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.21...v10.0.0-beta.22) (2020-11-17)


### Features

* add example consumer test with provider state injected values [#516](https://github.com/pact-foundation/pact-js/issues/516) ([190f332](https://github.com/pact-foundation/pact-js/commit/190f332559fe0b1717054796614aa2624e81818c))
* added consumer for provider state injected example ([bdc333c](https://github.com/pact-foundation/pact-js/commit/bdc333c57107ac62f44abfac83ec62645470cc71))
* got provider state injected values working with provider test [#516](https://github.com/pact-foundation/pact-js/issues/516) ([5fdf7eb](https://github.com/pact-foundation/pact-js/commit/5fdf7eb8284d73030049e1abf19c34445981510b))
* implemented matching query parameters and provider state injected values (in consumer DSL) [#516](https://github.com/pact-foundation/pact-js/issues/516) ([f798c13](https://github.com/pact-foundation/pact-js/commit/f798c13494b690d9f5348c61d143855e7117de33))


### Fixes and Improvements

* if query parameters are not supplied they will be null or undefined [#516](https://github.com/pact-foundation/pact-js/issues/516) ([17397be](https://github.com/pact-foundation/pact-js/commit/17397bea50f25d3ded1dc71739a935e39b1f9a52))

## [10.0.0-beta.21](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.20...v10.0.0-beta.21) (2020-10-30)


### Fixes and Improvements

* improve the test error to include the original stack trace ([c14cb97](https://github.com/pact-foundation/pact-js/commit/c14cb97492ad38f16d442bef5a6411999149501d))
* update to latest mock server crate, fixes [#520](https://github.com/pact-foundation/pact-js/issues/520) ([21774de](https://github.com/pact-foundation/pact-js/commit/21774de2cc83b62224cb5315e888fb9ccd09c20b))

## [10.0.0-beta.20](https://github.com/pact-foundation/pact-js/compare/v9.13.0...v10.0.0-beta.20) (2020-10-29)


### Fixes and Improvements

* can not use matrix expressions in uses: with GH actions ([d6942a4](https://github.com/pact-foundation/pact-js/commit/d6942a412a64d1edd11d4f0f4ce2836e020da1e5))
* support any values for provider state parameters ([df4df0b](https://github.com/pact-foundation/pact-js/commit/df4df0bcd944d18088c6f7241b925c66a83a2039))
* update the MUSL docker container for use with GH actions ([5647032](https://github.com/pact-foundation/pact-js/commit/564703202e6bb22443eb7d6b90a533d1f7a54a6e))

## [10.0.0-beta.19](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.18...v10.0.0-beta.19) (2020-10-19)

## [10.0.0-beta.18](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.17...v10.0.0-beta.18) (2020-10-16)


### Features

* add support for array contains matcher ([57bcc79](https://github.com/pact-foundation/pact-js/commit/57bcc792037eb05d17a6e6268d14dcabe0262712))


### Fixes and Improvements

* typo in comment ([7491383](https://github.com/pact-foundation/pact-js/commit/7491383ded889a4b25f3480c2601f715b4f49c69))
* update to latest matching lib ([23e1f39](https://github.com/pact-foundation/pact-js/commit/23e1f39bd690f2bbf80cf78cb2922939484c6838))

## [10.0.0-beta.17](https://github.com/pact-foundation/pact-js/compare/v9.12.2...v10.0.0-beta.17) (2020-10-12)


### Features

* improve the error messages for a failed test ([f01b57e](https://github.com/pact-foundation/pact-js/commit/f01b57e9b0606735669bc684517ceaac19269be1))


### Fixes and Improvements

* allow the mock server port to be configured ([9c63d28](https://github.com/pact-foundation/pact-js/commit/9c63d28eb6d0c3d361b07b2053dcd3853649b160))
* correct the imports [#514](https://github.com/pact-foundation/pact-js/issues/514) ([6764a84](https://github.com/pact-foundation/pact-js/commit/6764a84e5b3004cd7f0f814a9ef694e606481ebe))

## [10.0.0-beta.16](https://github.com/pact-foundation/pact-js/compare/v9.12.1...v10.0.0-beta.16) (2020-09-28)


### Features

* add flag to enable handling CORS pre-flight requests ([0adb3fc](https://github.com/pact-foundation/pact-js/commit/0adb3fcab90bcf491f291c3874dd8bff93d3ac48))


### Fixes and Improvements

* correct Rust code after upgrade to upstream libs ([aa6d803](https://github.com/pact-foundation/pact-js/commit/aa6d803bb611f7d89692abf4e4409c14e43e7cc9))
* need .mocharc.json after merge from master ([2525bf6](https://github.com/pact-foundation/pact-js/commit/2525bf6563e8cc93cd3522bcff8cdb9cb5931c4e))
* package.json after merge from master ([aef422b](https://github.com/pact-foundation/pact-js/commit/aef422b70d850032575bac8efc442bc6eecb0205))

## [10.0.0-beta.15](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.14...v10.0.0-beta.15) (2020-08-05)


### Fixes and Improvements

* correct matcher paths for text nodes in XML ([a217793](https://github.com/pact-foundation/pact-js/commit/a217793a5e538d9e9616ae1bab8cbd561fdd5377))

## [10.0.0-beta.14](https://github.com/pact-foundation/pact-js/compare/v9.11.1...v10.0.0-beta.14) (2020-08-04)


### Fixes and Improvements

* lint ([ae8397a](https://github.com/pact-foundation/pact-js/commit/ae8397af7a30af95fdcade718a6bd5c458da9e25))
* PactNative.init needs to be re-entrant ([16c22f6](https://github.com/pact-foundation/pact-js/commit/16c22f64e3b174b18f3a51cb1d157af66ea019ab))

## [10.0.0-beta.13](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.12...v10.0.0-beta.13) (2020-06-27)


### Features

* add some tests around the conusmer DSL matchers ([e6a153f](https://github.com/pact-foundation/pact-js/commit/e6a153fd62d48644b97018d69e5f23d1710e510f))
* handle XML matching with different types of child elements ([2143ca4](https://github.com/pact-foundation/pact-js/commit/2143ca4c968969e1c6218dd8e538097733ccfa56))
* implemented consumer DSL URL matcher ([f27a444](https://github.com/pact-foundation/pact-js/commit/f27a44409aed3ece1adbab6af9e853b7684c101c))


### Fixes and Improvements

* after upgrading crates ([9a5a36d](https://github.com/pact-foundation/pact-js/commit/9a5a36db9d733bd13a1d68bb5b8d893720a915cb))
* import for metadata was wrong ([ba2a975](https://github.com/pact-foundation/pact-js/commit/ba2a9755aee672cbed73b236c44f68aab14939f0))
* lint ([78b4692](https://github.com/pact-foundation/pact-js/commit/78b46927bbeb96a4da6a924b7d8e86084ff6c355))

## [10.0.0-beta.12](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.11...v10.0.0-beta.12) (2020-06-12)

## [10.0.0-beta.11](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.10...v10.0.0-beta.11) (2020-06-12)

## [10.0.0-beta.10](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.9...v10.0.0-beta.10) (2020-06-12)

## [10.0.0-beta.9](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.8...v10.0.0-beta.9) (2020-06-11)

## [10.0.0-beta.8](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.7...v10.0.0-beta.8) (2020-06-11)

## [10.0.0-beta.7](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.6...v10.0.0-beta.7) (2020-06-11)

## [10.0.0-beta.6](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.5...v10.0.0-beta.6) (2020-06-11)


### Features

* enable publishing of verification results ([fcbdb3e](https://github.com/pact-foundation/pact-js/commit/fcbdb3e9729365039c30267996a7364e23ccdef1))
* release node 14 native binaries ([9ee832c](https://github.com/pact-foundation/pact-js/commit/9ee832c8dcfd896432ef34fb57595496bcac0077))

## [10.0.0-beta.5](https://github.com/pact-foundation/pact-js/compare/v9.11.0...v10.0.0-beta.5) (2020-05-27)


### Features

* support MIME multipart form posts with binary files ([d72a210](https://github.com/pact-foundation/pact-js/commit/d72a2103b4fb0d348d2601e88d9a34befc4f31a7))
* support regex matcher with a regexp object ([d92f6f5](https://github.com/pact-foundation/pact-js/commit/d92f6f5eee92667e5a3ce0ecdd44177d18a6b7ff))
* support text nodes configured from XML builder ([a2a7f55](https://github.com/pact-foundation/pact-js/commit/a2a7f55eff4a187cbe30a3e56917745ebc40e33d))
* support using matchers on XML text nodes ([b3b5e62](https://github.com/pact-foundation/pact-js/commit/b3b5e6231e9f0ade7be045ff117b441d0169114a))


### Fixes and Improvements

* correct the version of the pact_mock_server crate ([a17f2bb](https://github.com/pact-foundation/pact-js/commit/a17f2bb26d2964ac45b19704d91019ab2e7cdc4d))
* date/time matchers were being skipped due to defect in upstream matching lib ([dcc3a7f](https://github.com/pact-foundation/pact-js/commit/dcc3a7fbf212cfce02c7d3dcf50bdb8f47baf45e))
* travis matrix was doubled up ([fe08a70](https://github.com/pact-foundation/pact-js/commit/fe08a70769dbf7b3525b074f93731fb8d9ab3916))
* travis was not running the E2E tests after merge from master ([73257dc](https://github.com/pact-foundation/pact-js/commit/73257dc3f43e229103aca119b3369d5d3ec228eb))

## [10.0.0-beta.4](https://github.com/pact-foundation/pact-js/compare/v9.10.0...v10.0.0-beta.4) (2020-05-20)


### Features

* add support for binary payloads ([658ffa0](https://github.com/pact-foundation/pact-js/commit/658ffa0ee17adfe380b7cb1c68e10c48078c9cb6))


### Fixes and Improvements

* accidentially commited development paths in cargo manefest ([03cc16f](https://github.com/pact-foundation/pact-js/commit/03cc16f71d5f6a6cd646cdb6cf5421a134cb159e))
* format the error messages in a better way ([0a15772](https://github.com/pact-foundation/pact-js/commit/0a15772a710d3d159648672470084a1c99b45cc8))
* handle error when pact file cannot be written ([82832a8](https://github.com/pact-foundation/pact-js/commit/82832a81c115d06ef2d9c1fadd18c54f6f629e59))
* throw an exception when a request is configured but no interaction defined ([b317da7](https://github.com/pact-foundation/pact-js/commit/b317da79f28dce45102a55bcdcbc415d3fbdb9ab))
* throw an exception when a response is configured but no interaction defined ([6feacbe](https://github.com/pact-foundation/pact-js/commit/6feacbeef513420eddd9cbaed36abea80344de13))

## [10.0.0-beta.3](https://github.com/pact-foundation/pact-js/compare/v9.9.2...v10.0.0-beta.3) (2020-04-08)


### Fixes and Improvements

* correct invalid logger import ([5d4ba5b](https://github.com/pact-foundation/pact-js/commit/5d4ba5be629693b6608ea5f671b116a2ec3dad14))
* don't bundle the native lib in the NPM package ([24f43f3](https://github.com/pact-foundation/pact-js/commit/24f43f36f78269aef935381999dfe1e5802ea185))
* guard against panics in background thread ([b35aecd](https://github.com/pact-foundation/pact-js/commit/b35aecd2e907f4cb80ac4ba8ec3d99c9801f8c15))
* integer, decimal and number parameters are optional ([69f3983](https://github.com/pact-foundation/pact-js/commit/69f398333a10b649be4bf5a929234620d13d68d8))
* throw a JS error if there are no pacts to verify ([3bfd9da](https://github.com/pact-foundation/pact-js/commit/3bfd9dac007320e3ff14e476851d2f0aabef7ca0))
* try get the cause of any Rust panic ([f1f3d4a](https://github.com/pact-foundation/pact-js/commit/f1f3d4a4e287ec2c78a5b8f8eacfda459540dd5a))
* typo ([5d8dd37](https://github.com/pact-foundation/pact-js/commit/5d8dd37cf338478cc2a16532b9f2664e301294bf))
* update pact matching crate to 0.5.10 to fix invalid path matcher format ([ecce929](https://github.com/pact-foundation/pact-js/commit/ecce929af3d9aa51c3163d58e119924137a15195))

## [10.0.0-beta.2](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.1...v10.0.0-beta.2) (2020-03-18)


### Fixes and Improvements

* correct the path to the native lib in the NPM package ([300d915](https://github.com/pact-foundation/pact-js/commit/300d91516afebeefe979039566b02162e09992c0))

## [10.0.0-beta.1](https://github.com/pact-foundation/pact-js/compare/v9.8.1...v10.0.0-beta.1) (2020-03-17)


### Features

* got E2E consumer test passing ([904ed0b](https://github.com/pact-foundation/pact-js/commit/904ed0ba1115c81a07229e6a27c9e2d103c2dc36))
* got request filters working. Yay! ([de16880](https://github.com/pact-foundation/pact-js/commit/de16880171ee76fdb134593a7fc78725c81158ec))
* got the example V3 test working ([9ab43cc](https://github.com/pact-foundation/pact-js/commit/9ab43cc3541600653195c701b770dbdf1f44d5b0))
* handle the parameters and results from provider state callbacks [#372](https://github.com/pact-foundation/pact-js/issues/372) ([d3f73e5](https://github.com/pact-foundation/pact-js/commit/d3f73e5845023aa5168647daf711829a2d90f9ce))
* implement provider state parameters in consumer tests [#372](https://github.com/pact-foundation/pact-js/issues/372) ([af8bf32](https://github.com/pact-foundation/pact-js/commit/af8bf32f15551a7b86dc73682272074347143ffc))
* implemented provider state callbacks with parameters [#372](https://github.com/pact-foundation/pact-js/issues/372) ([50e4e61](https://github.com/pact-foundation/pact-js/commit/50e4e6199b6d9ce37cca8f10bdcd0d403cc1ad5d))
* Introduce an authenticated state [#372](https://github.com/pact-foundation/pact-js/issues/372) ([debebd7](https://github.com/pact-foundation/pact-js/commit/debebd73cce92a3988f99afbccc4d0091af4a3c9))


### Fixes and Improvements

* changes needed for the E2E consumer test ([6022f8b](https://github.com/pact-foundation/pact-js/commit/6022f8b33fce1cea1f60ba1cf62625f557a00572))
* correct the paths for the attribute matchers ([7629c92](https://github.com/pact-foundation/pact-js/commit/7629c9232308e1e51730f1567a2e6010ce852aac))
* correct the v3-todo example tests ([de205c7](https://github.com/pact-foundation/pact-js/commit/de205c7e5ca7c1922b187e29a6d44f0010afb27b))
* datetime matchers now generate a value if one is not given ([a910840](https://github.com/pact-foundation/pact-js/commit/a910840001f0e86201e82b2ca5759841392c9cca))
* fucking lint ([cdb72db](https://github.com/pact-foundation/pact-js/commit/cdb72db91eb1283423d21e3841ed3329a128a0af))
* Gah! Lint Nazis ([79082fd](https://github.com/pact-foundation/pact-js/commit/79082fddafbb7e76293103a3457292b02b8dfc95))
* got eachlike with number of examples working ([88c9a72](https://github.com/pact-foundation/pact-js/commit/88c9a72a8e11456d0afe94bbfc6ce212bd22153e))
* lint ([772224d](https://github.com/pact-foundation/pact-js/commit/772224d4d7eeaa7beafe27b55816e441a5d1ddb4))
* lint ([9717b47](https://github.com/pact-foundation/pact-js/commit/9717b47e2bc06087f0d8eafdeb86f73bdca46683))
* neon build should point to native directory ([fdea3eb](https://github.com/pact-foundation/pact-js/commit/fdea3eb6619f9281a377300b39d281b342ab588d))
* neon build should point to native directory ([16957a2](https://github.com/pact-foundation/pact-js/commit/16957a2dff8a7669ad848437591a02f306038dca))
* neon requires a C++ compiler ([bb8731f](https://github.com/pact-foundation/pact-js/commit/bb8731fae1dcf8797bbfa1ecfd0ad3a95a7ef3d5))
* removed node 6 and 7 because ancient ([2b45cfc](https://github.com/pact-foundation/pact-js/commit/2b45cfcca9adc92834cdfe74bf1dda5550f4d0ec))
* rustup: Unable to run interactively. Run with -y to accept defaults ([abfa9c9](https://github.com/pact-foundation/pact-js/commit/abfa9c9151eb27c3b5c503131bda4907a809c677))
* travis build needs the Rust source in dist ([e64402e](https://github.com/pact-foundation/pact-js/commit/e64402eae49ed2d5e290686860b357f1b4748812))
* travis build needs the Rust source in dist ([519fee5](https://github.com/pact-foundation/pact-js/commit/519fee59d6798771e6fc7aaf6fcde8babd340356))
* use 0.5.6 of matching lib to avoid dup rules ([d30d7b9](https://github.com/pact-foundation/pact-js/commit/d30d7b974bcdcf25cfd73fd93ade68fbcd73ecdb))

## [10.0.0-beta.34](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.33...v10.0.0-beta.34) (2021-04-07)


### Features

* add support for ignoring keys via the eachKeyLike matcher ([2f59c9f](https://github.com/pact-foundation/pact-js/commit/2f59c9fd87aedfc37df8e746e695fe6c98f1773d))


### Fixes and Improvements

* Correct types for interaction chaining in graphql ([5043cc0](https://github.com/pact-foundation/pact-js/commit/5043cc0ad5a72559e2508175fffa15e076e77bb3))
* Remove deprecated ability to provide options to Vverifier outside the constructor. Temporarily disable nestjs example accordingly ([a7a3c0e](https://github.com/pact-foundation/pact-js/commit/a7a3c0e97bb052ade32c13f174356c56172df522))
* **package-name:** Use the new name (pact-core) for pact-node ([a42fee2](https://github.com/pact-foundation/pact-js/commit/a42fee28a630becdef4a85e61f4a03133d6aba4f))
* **pact-web-types:** Fix issue where typescript types were not exposed in pact-web ([d529082](https://github.com/pact-foundation/pact-js/commit/d529082f0b1e7d969ebdedae091adc54ad4be464))
* **typescript:** accept string array as query value ([69f74ba](https://github.com/pact-foundation/pact-js/commit/69f74ba81a100c2dbbadb1448141f4e8a7afdb2a))

### [9.15.2](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.32...v9.15.2) (2021-02-28)


### Fixes and Improvements

<<<<<<< HEAD
* **pact-node:** bump dependency on pact-node ([a200414](https://github.com/pact-foundation/pact-js/commit/a2004143782be418b59a8266834c6aa8e6d2a1ef))

### [9.15.1](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.31...v9.15.1) (2021-02-23)
* Bump pact-node version to get vulnerability fixes ([bc0e7f0](https://github.com/pact-foundation/pact-js/commit/bc0e7f019ef8585d4fc5c980575e0ec0a72f1b65))

### [9.15.3](https://github.com/pact-foundation/pact-js/compare/v9.15.2...v9.15.3) (2021-03-10)
<<<<<<< HEAD
* package.json & package-lock.json to reduce vulnerabilities ([aa8036c](https://github.com/pact-foundation/pact-js/commit/aa8036c2dd424d351d2afab003c1e539e2bc6e85))

## [9.15.0](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.29...v9.15.0) (2021-02-02)


### Features

* **provider-states:** Add beforeEach and afterEach hooks to provider verification ([#529](https://github.com/pact-foundation/pact-js/issues/529)) - Fixes [#526](https://github.com/pact-foundation/pact-js/issues/526) ([8147042](https://github.com/pact-foundation/pact-js/commit/8147042f8dcbc396e991331afaf6c23d6c362b10))

### [9.14.2](https://github.com/pact-foundation/pact-js/compare/v9.14.1...v9.14.2) (2021-01-28)


### Fixes and Improvements

* **pact-node:** Bump dependency on pact-node to avoid regression in query string matching ([9c733ce](https://github.com/pact-foundation/pact-js/commit/9c733ce5bd72c25ad5b71bb8bec0ec1903c9bf52))
* **pact-node:** bump dependency on pact-node to get verbose logging in verification [#583](https://github.com/pact-foundation/pact-js/issues/583) ([66e9dca](https://github.com/pact-foundation/pact-js/commit/66e9dcafd555b000de357b6dffa1b166cadb670e))

### [9.14.1](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.26...v9.14.1) (2021-01-27)


### Fixes and Improvements

* set permissions for Ruby binaries on GH Actions ([8881ee7](https://github.com/pact-foundation/pact-js/commit/8881ee79bbd24a4ef3e98ad098dda0117e7c78f6))
* set permissions for Ruby binaries on GH Actions ([5701c0f](https://github.com/pact-foundation/pact-js/commit/5701c0fbc290bddb97d1b9a035c615782b79f462))
* **logger:** lowercase log level ([8388776](https://github.com/pact-foundation/pact-js/commit/8388776df0f576d3860cf11280cebb96e9cd5aab))
* **logger:** replace bunyan with pino ([fe6dd30](https://github.com/pact-foundation/pact-js/commit/fe6dd302cc2de389d009eaf0136776d8366d0394))
* **pact-node:** bump dependency on pact-node to get verbose logging in verification [#583](https://github.com/pact-foundation/pact-js/issues/583) ([8b26262](https://github.com/pact-foundation/pact-js/commit/8b26262c2cf970a7b86e76c68c12d89ee689f9a4))

## [10.0.0-beta.33](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.32...v10.0.0-beta.33) (2021-03-03)


### Fixes and Improvements

* use example in datetime matcher instead of generator if provided. Fixes [#620](https://github.com/pact-foundation/pact-js/issues/620) ([c0ca78b](https://github.com/pact-foundation/pact-js/commit/c0ca78b6995354154ed387f18c1d896789acf778))
* **pact-node:** Bump dependency on pact-node ([812e09e](https://github.com/pact-foundation/pact-js/commit/812e09e67a9789b8ab02c852fe689a7b39d092c0))

## [10.0.0-beta.32](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.31...v10.0.0-beta.32) (2021-02-23)


### Features

* add experimental 'allow missing' behind env var PACT_EXPERIMENTAL_FEATURE_ALLOW_MISSING_REQUESTS ([2d3a1fe](https://github.com/pact-foundation/pact-js/commit/2d3a1fec0c8989d58d0384bd39888cd8eb76d0a7))

## [10.0.0-beta.31](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.30...v10.0.0-beta.31) (2021-02-10)
=======
* **pact-web-types:** Fix issue where typescript types were not exposed in pact-web ([d529082](https://github.com/pact-foundation/pact-js/commit/d529082f0b1e7d969ebdedae091adc54ad4be464))

### [9.15.2](https://github.com/pact-foundation/pact-js/compare/v9.15.1...v9.15.2) (2021-02-28)

### Fixes and Improvements

* improve file locking behaviour ([0f73466](https://github.com/pact-foundation/pact-js/commit/0f7346663d3edd9ef36cdfa7f08adfbe8f4ab4d8))

## [10.0.0-beta.30](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.29...v10.0.0-beta.30) (2021-02-08)


### Features

* fix file locking, add 'overwrite' and 'callbackTimeout' flags ([e891fcc](https://github.com/pact-foundation/pact-js/commit/e891fccb5802491cf148f398c81406bf06ae43c8)), closes [#599](https://github.com/pact-foundation/pact-js/issues/599) [#600](https://github.com/pact-foundation/pact-js/issues/600)


### Fixes and Improvements

* make the callback timeout configurable with a 5 sec default ([a0f0876](https://github.com/pact-foundation/pact-js/commit/a0f0876b93e728379a289a5bfa6e2e8613ec1768))

## [10.0.0-beta.29](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.26...v10.0.0-beta.29) (2021-01-29)


### Fixes and Improvements

* added export to V3 matcher interfaces ([8d11c1a](https://github.com/pact-foundation/pact-js/commit/8d11c1a6d6d8033ae96f471665245baec750ca51))
* don't strigify response that is already a string ([a867147](https://github.com/pact-foundation/pact-js/commit/a867147566b182e1f9244d72d96c29db59a51007))

## [10.0.0-beta.26](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.25...v10.0.0-beta.26) (2021-01-27)


### Features

* add uuid matcher function ([49c3da8](https://github.com/pact-foundation/pact-js/commit/49c3da8183ae729fe6063bd27e3eeba57750d853))


### Fixes and Improvements

* don't JSON.stringify body if its already a string ([6d44059](https://github.com/pact-foundation/pact-js/commit/6d44059db1917c17e40f128a4b3eedfda16fd2c1))
* increase provider test timeout ([f850859](https://github.com/pact-foundation/pact-js/commit/f850859f2cf47b741e070fd52665befc7f5e9b90))
* local pact URL ([1fd5fe4](https://github.com/pact-foundation/pact-js/commit/1fd5fe4806c62581be7c80504c806257a7b9020a))
* publish V3 was not kicking off the native libs release process ([23bd533](https://github.com/pact-foundation/pact-js/commit/23bd533c9f3e5e98c0326c3764d8113d63ddc5a4))
* use correct id in consumer test ([3d7e9c0](https://github.com/pact-foundation/pact-js/commit/3d7e9c0fa1ccc36734d864bfa02eab220b054af1))

## [10.0.0-beta.25](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.24...v10.0.0-beta.25) (2021-01-12)


### Fixes and Improvements

* change the release trigger for native libs ([3f1bbfa](https://github.com/pact-foundation/pact-js/commit/3f1bbfa79a4eb11593bc26ad96d34cc852b82c9e))
* URLs were not being generated correctly when used with an array contains matcher ([4fccb8d](https://github.com/pact-foundation/pact-js/commit/4fccb8df1ac19fa858cd7c4f1ca2da68c068bd04))

## [10.0.0-beta.24](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.23...v10.0.0-beta.24) (2021-01-12)


### Fixes and Improvements

* exclude openssl from native build for musl versions ([3db75af](https://github.com/pact-foundation/pact-js/commit/3db75afe2e42da0747deabff946ade6afca30ba4))
* exclude the native lib from the NPM package ([208e750](https://github.com/pact-foundation/pact-js/commit/208e750c5d51968f7e643ed835a299c4bb48f00a))
* exclude the native lib from the NPM package ([69a6e5b](https://github.com/pact-foundation/pact-js/commit/69a6e5b5263750bbef84ae7cadbc20d95294ee1c))

## [10.0.0-beta.23](https://github.com/pact-foundation/pact-js/compare/v9.14.0...v10.0.0-beta.23) (2021-01-11)


### Features

* initial pacts for verification integration ([6428bbe](https://github.com/pact-foundation/pact-js/commit/6428bbef3c056b884c4225a1d05f9f3b7b2d1691))
* support for matchers on headers ([aa3d55e](https://github.com/pact-foundation/pact-js/commit/aa3d55e4bbc60a210cc4be568d1c9dab9b0998b7))
* Update URL matching functions to support mock server URL generation ([2733af9](https://github.com/pact-foundation/pact-js/commit/2733af9aa0f936928358ad6e40e2c17d3aeb48b5))


### Fixes and Improvements

* correct V3 matcher spec ([6b6ac6c](https://github.com/pact-foundation/pact-js/commit/6b6ac6c71878e96ccaf3f19a81903ba620d16b5d))

## [10.0.0-beta.22](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.21...v10.0.0-beta.22) (2020-11-17)


### Features

* add example consumer test with provider state injected values [#516](https://github.com/pact-foundation/pact-js/issues/516) ([190f332](https://github.com/pact-foundation/pact-js/commit/190f332559fe0b1717054796614aa2624e81818c))
* added consumer for provider state injected example ([bdc333c](https://github.com/pact-foundation/pact-js/commit/bdc333c57107ac62f44abfac83ec62645470cc71))
* got provider state injected values working with provider test [#516](https://github.com/pact-foundation/pact-js/issues/516) ([5fdf7eb](https://github.com/pact-foundation/pact-js/commit/5fdf7eb8284d73030049e1abf19c34445981510b))
* implemented matching query parameters and provider state injected values (in consumer DSL) [#516](https://github.com/pact-foundation/pact-js/issues/516) ([f798c13](https://github.com/pact-foundation/pact-js/commit/f798c13494b690d9f5348c61d143855e7117de33))


### Fixes and Improvements

* if query parameters are not supplied they will be null or undefined [#516](https://github.com/pact-foundation/pact-js/issues/516) ([17397be](https://github.com/pact-foundation/pact-js/commit/17397bea50f25d3ded1dc71739a935e39b1f9a52))

## [10.0.0-beta.21](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.20...v10.0.0-beta.21) (2020-10-30)


### Fixes and Improvements

* improve the test error to include the original stack trace ([c14cb97](https://github.com/pact-foundation/pact-js/commit/c14cb97492ad38f16d442bef5a6411999149501d))
* update to latest mock server crate, fixes [#520](https://github.com/pact-foundation/pact-js/issues/520) ([21774de](https://github.com/pact-foundation/pact-js/commit/21774de2cc83b62224cb5315e888fb9ccd09c20b))

## [10.0.0-beta.20](https://github.com/pact-foundation/pact-js/compare/v9.13.0...v10.0.0-beta.20) (2020-10-29)


### Fixes and Improvements

* can not use matrix expressions in uses: with GH actions ([d6942a4](https://github.com/pact-foundation/pact-js/commit/d6942a412a64d1edd11d4f0f4ce2836e020da1e5))
* support any values for provider state parameters ([df4df0b](https://github.com/pact-foundation/pact-js/commit/df4df0bcd944d18088c6f7241b925c66a83a2039))
* update the MUSL docker container for use with GH actions ([5647032](https://github.com/pact-foundation/pact-js/commit/564703202e6bb22443eb7d6b90a533d1f7a54a6e))

## [10.0.0-beta.19](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.18...v10.0.0-beta.19) (2020-10-19)

## [10.0.0-beta.18](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.17...v10.0.0-beta.18) (2020-10-16)


### Features

* add support for array contains matcher ([57bcc79](https://github.com/pact-foundation/pact-js/commit/57bcc792037eb05d17a6e6268d14dcabe0262712))


### Fixes and Improvements

* typo in comment ([7491383](https://github.com/pact-foundation/pact-js/commit/7491383ded889a4b25f3480c2601f715b4f49c69))
* update to latest matching lib ([23e1f39](https://github.com/pact-foundation/pact-js/commit/23e1f39bd690f2bbf80cf78cb2922939484c6838))

## [10.0.0-beta.17](https://github.com/pact-foundation/pact-js/compare/v9.12.2...v10.0.0-beta.17) (2020-10-12)


### Features

* improve the error messages for a failed test ([f01b57e](https://github.com/pact-foundation/pact-js/commit/f01b57e9b0606735669bc684517ceaac19269be1))


### Fixes and Improvements

* allow the mock server port to be configured ([9c63d28](https://github.com/pact-foundation/pact-js/commit/9c63d28eb6d0c3d361b07b2053dcd3853649b160))
* correct the imports [#514](https://github.com/pact-foundation/pact-js/issues/514) ([6764a84](https://github.com/pact-foundation/pact-js/commit/6764a84e5b3004cd7f0f814a9ef694e606481ebe))

## [10.0.0-beta.16](https://github.com/pact-foundation/pact-js/compare/v9.12.1...v10.0.0-beta.16) (2020-09-28)


### Features

* add flag to enable handling CORS pre-flight requests ([0adb3fc](https://github.com/pact-foundation/pact-js/commit/0adb3fcab90bcf491f291c3874dd8bff93d3ac48))


### Fixes and Improvements

* correct Rust code after upgrade to upstream libs ([aa6d803](https://github.com/pact-foundation/pact-js/commit/aa6d803bb611f7d89692abf4e4409c14e43e7cc9))
* need .mocharc.json after merge from master ([2525bf6](https://github.com/pact-foundation/pact-js/commit/2525bf6563e8cc93cd3522bcff8cdb9cb5931c4e))
* package.json after merge from master ([aef422b](https://github.com/pact-foundation/pact-js/commit/aef422b70d850032575bac8efc442bc6eecb0205))

## [10.0.0-beta.15](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.14...v10.0.0-beta.15) (2020-08-05)


### Fixes and Improvements

* correct matcher paths for text nodes in XML ([a217793](https://github.com/pact-foundation/pact-js/commit/a217793a5e538d9e9616ae1bab8cbd561fdd5377))

## [10.0.0-beta.14](https://github.com/pact-foundation/pact-js/compare/v9.11.1...v10.0.0-beta.14) (2020-08-04)


### Fixes and Improvements

* lint ([ae8397a](https://github.com/pact-foundation/pact-js/commit/ae8397af7a30af95fdcade718a6bd5c458da9e25))
* PactNative.init needs to be re-entrant ([16c22f6](https://github.com/pact-foundation/pact-js/commit/16c22f64e3b174b18f3a51cb1d157af66ea019ab))

## [10.0.0-beta.13](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.12...v10.0.0-beta.13) (2020-06-27)


### Features

* add some tests around the conusmer DSL matchers ([e6a153f](https://github.com/pact-foundation/pact-js/commit/e6a153fd62d48644b97018d69e5f23d1710e510f))
* handle XML matching with different types of child elements ([2143ca4](https://github.com/pact-foundation/pact-js/commit/2143ca4c968969e1c6218dd8e538097733ccfa56))
* implemented consumer DSL URL matcher ([f27a444](https://github.com/pact-foundation/pact-js/commit/f27a44409aed3ece1adbab6af9e853b7684c101c))


### Fixes and Improvements

* after upgrading crates ([9a5a36d](https://github.com/pact-foundation/pact-js/commit/9a5a36db9d733bd13a1d68bb5b8d893720a915cb))
* import for metadata was wrong ([ba2a975](https://github.com/pact-foundation/pact-js/commit/ba2a9755aee672cbed73b236c44f68aab14939f0))
* lint ([78b4692](https://github.com/pact-foundation/pact-js/commit/78b46927bbeb96a4da6a924b7d8e86084ff6c355))

## [10.0.0-beta.12](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.11...v10.0.0-beta.12) (2020-06-12)

## [10.0.0-beta.11](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.10...v10.0.0-beta.11) (2020-06-12)

## [10.0.0-beta.10](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.9...v10.0.0-beta.10) (2020-06-12)

## [10.0.0-beta.9](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.8...v10.0.0-beta.9) (2020-06-11)

## [10.0.0-beta.8](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.7...v10.0.0-beta.8) (2020-06-11)

## [10.0.0-beta.7](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.6...v10.0.0-beta.7) (2020-06-11)

## [10.0.0-beta.6](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.5...v10.0.0-beta.6) (2020-06-11)


### Features

* enable publishing of verification results ([fcbdb3e](https://github.com/pact-foundation/pact-js/commit/fcbdb3e9729365039c30267996a7364e23ccdef1))
* release node 14 native binaries ([9ee832c](https://github.com/pact-foundation/pact-js/commit/9ee832c8dcfd896432ef34fb57595496bcac0077))

## [10.0.0-beta.5](https://github.com/pact-foundation/pact-js/compare/v9.11.0...v10.0.0-beta.5) (2020-05-27)


### Features

* support MIME multipart form posts with binary files ([d72a210](https://github.com/pact-foundation/pact-js/commit/d72a2103b4fb0d348d2601e88d9a34befc4f31a7))
* support regex matcher with a regexp object ([d92f6f5](https://github.com/pact-foundation/pact-js/commit/d92f6f5eee92667e5a3ce0ecdd44177d18a6b7ff))
* support text nodes configured from XML builder ([a2a7f55](https://github.com/pact-foundation/pact-js/commit/a2a7f55eff4a187cbe30a3e56917745ebc40e33d))
* support using matchers on XML text nodes ([b3b5e62](https://github.com/pact-foundation/pact-js/commit/b3b5e6231e9f0ade7be045ff117b441d0169114a))


### Fixes and Improvements

* correct the version of the pact_mock_server crate ([a17f2bb](https://github.com/pact-foundation/pact-js/commit/a17f2bb26d2964ac45b19704d91019ab2e7cdc4d))
* date/time matchers were being skipped due to defect in upstream matching lib ([dcc3a7f](https://github.com/pact-foundation/pact-js/commit/dcc3a7fbf212cfce02c7d3dcf50bdb8f47baf45e))
* travis matrix was doubled up ([fe08a70](https://github.com/pact-foundation/pact-js/commit/fe08a70769dbf7b3525b074f93731fb8d9ab3916))
* travis was not running the E2E tests after merge from master ([73257dc](https://github.com/pact-foundation/pact-js/commit/73257dc3f43e229103aca119b3369d5d3ec228eb))

## [10.0.0-beta.4](https://github.com/pact-foundation/pact-js/compare/v9.10.0...v10.0.0-beta.4) (2020-05-20)


### Features

* add support for binary payloads ([658ffa0](https://github.com/pact-foundation/pact-js/commit/658ffa0ee17adfe380b7cb1c68e10c48078c9cb6))


### Fixes and Improvements

* accidentially commited development paths in cargo manefest ([03cc16f](https://github.com/pact-foundation/pact-js/commit/03cc16f71d5f6a6cd646cdb6cf5421a134cb159e))
* format the error messages in a better way ([0a15772](https://github.com/pact-foundation/pact-js/commit/0a15772a710d3d159648672470084a1c99b45cc8))
* handle error when pact file cannot be written ([82832a8](https://github.com/pact-foundation/pact-js/commit/82832a81c115d06ef2d9c1fadd18c54f6f629e59))
* throw an exception when a request is configured but no interaction defined ([b317da7](https://github.com/pact-foundation/pact-js/commit/b317da79f28dce45102a55bcdcbc415d3fbdb9ab))
* throw an exception when a response is configured but no interaction defined ([6feacbe](https://github.com/pact-foundation/pact-js/commit/6feacbeef513420eddd9cbaed36abea80344de13))

## [10.0.0-beta.3](https://github.com/pact-foundation/pact-js/compare/v9.9.2...v10.0.0-beta.3) (2020-04-08)


### Fixes and Improvements

* correct invalid logger import ([5d4ba5b](https://github.com/pact-foundation/pact-js/commit/5d4ba5be629693b6608ea5f671b116a2ec3dad14))
* don't bundle the native lib in the NPM package ([24f43f3](https://github.com/pact-foundation/pact-js/commit/24f43f36f78269aef935381999dfe1e5802ea185))
* guard against panics in background thread ([b35aecd](https://github.com/pact-foundation/pact-js/commit/b35aecd2e907f4cb80ac4ba8ec3d99c9801f8c15))
* integer, decimal and number parameters are optional ([69f3983](https://github.com/pact-foundation/pact-js/commit/69f398333a10b649be4bf5a929234620d13d68d8))
* throw a JS error if there are no pacts to verify ([3bfd9da](https://github.com/pact-foundation/pact-js/commit/3bfd9dac007320e3ff14e476851d2f0aabef7ca0))
* try get the cause of any Rust panic ([f1f3d4a](https://github.com/pact-foundation/pact-js/commit/f1f3d4a4e287ec2c78a5b8f8eacfda459540dd5a))
* typo ([5d8dd37](https://github.com/pact-foundation/pact-js/commit/5d8dd37cf338478cc2a16532b9f2664e301294bf))
* update pact matching crate to 0.5.10 to fix invalid path matcher format ([ecce929](https://github.com/pact-foundation/pact-js/commit/ecce929af3d9aa51c3163d58e119924137a15195))

## [10.0.0-beta.2](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.1...v10.0.0-beta.2) (2020-03-18)


### Fixes and Improvements

* correct the path to the native lib in the NPM package ([300d915](https://github.com/pact-foundation/pact-js/commit/300d91516afebeefe979039566b02162e09992c0))

## [10.0.0-beta.1](https://github.com/pact-foundation/pact-js/compare/v9.8.1...v10.0.0-beta.1) (2020-03-17)


### Features

* got E2E consumer test passing ([904ed0b](https://github.com/pact-foundation/pact-js/commit/904ed0ba1115c81a07229e6a27c9e2d103c2dc36))
* got request filters working. Yay! ([de16880](https://github.com/pact-foundation/pact-js/commit/de16880171ee76fdb134593a7fc78725c81158ec))
* got the example V3 test working ([9ab43cc](https://github.com/pact-foundation/pact-js/commit/9ab43cc3541600653195c701b770dbdf1f44d5b0))
* handle the parameters and results from provider state callbacks [#372](https://github.com/pact-foundation/pact-js/issues/372) ([d3f73e5](https://github.com/pact-foundation/pact-js/commit/d3f73e5845023aa5168647daf711829a2d90f9ce))
* implement provider state parameters in consumer tests [#372](https://github.com/pact-foundation/pact-js/issues/372) ([af8bf32](https://github.com/pact-foundation/pact-js/commit/af8bf32f15551a7b86dc73682272074347143ffc))
* implemented provider state callbacks with parameters [#372](https://github.com/pact-foundation/pact-js/issues/372) ([50e4e61](https://github.com/pact-foundation/pact-js/commit/50e4e6199b6d9ce37cca8f10bdcd0d403cc1ad5d))
* Introduce an authenticated state [#372](https://github.com/pact-foundation/pact-js/issues/372) ([debebd7](https://github.com/pact-foundation/pact-js/commit/debebd73cce92a3988f99afbccc4d0091af4a3c9))


### Fixes and Improvements

* changes needed for the E2E consumer test ([6022f8b](https://github.com/pact-foundation/pact-js/commit/6022f8b33fce1cea1f60ba1cf62625f557a00572))
* correct the paths for the attribute matchers ([7629c92](https://github.com/pact-foundation/pact-js/commit/7629c9232308e1e51730f1567a2e6010ce852aac))
* correct the v3-todo example tests ([de205c7](https://github.com/pact-foundation/pact-js/commit/de205c7e5ca7c1922b187e29a6d44f0010afb27b))
* datetime matchers now generate a value if one is not given ([a910840](https://github.com/pact-foundation/pact-js/commit/a910840001f0e86201e82b2ca5759841392c9cca))
* fucking lint ([cdb72db](https://github.com/pact-foundation/pact-js/commit/cdb72db91eb1283423d21e3841ed3329a128a0af))
* Gah! Lint Nazis ([79082fd](https://github.com/pact-foundation/pact-js/commit/79082fddafbb7e76293103a3457292b02b8dfc95))
* got eachlike with number of examples working ([88c9a72](https://github.com/pact-foundation/pact-js/commit/88c9a72a8e11456d0afe94bbfc6ce212bd22153e))
* lint ([772224d](https://github.com/pact-foundation/pact-js/commit/772224d4d7eeaa7beafe27b55816e441a5d1ddb4))
* lint ([9717b47](https://github.com/pact-foundation/pact-js/commit/9717b47e2bc06087f0d8eafdeb86f73bdca46683))
* neon build should point to native directory ([fdea3eb](https://github.com/pact-foundation/pact-js/commit/fdea3eb6619f9281a377300b39d281b342ab588d))
* neon build should point to native directory ([16957a2](https://github.com/pact-foundation/pact-js/commit/16957a2dff8a7669ad848437591a02f306038dca))
* neon requires a C++ compiler ([bb8731f](https://github.com/pact-foundation/pact-js/commit/bb8731fae1dcf8797bbfa1ecfd0ad3a95a7ef3d5))
* removed node 6 and 7 because ancient ([2b45cfc](https://github.com/pact-foundation/pact-js/commit/2b45cfcca9adc92834cdfe74bf1dda5550f4d0ec))
* rustup: Unable to run interactively. Run with -y to accept defaults ([abfa9c9](https://github.com/pact-foundation/pact-js/commit/abfa9c9151eb27c3b5c503131bda4907a809c677))
* travis build needs the Rust source in dist ([e64402e](https://github.com/pact-foundation/pact-js/commit/e64402eae49ed2d5e290686860b357f1b4748812))
* travis build needs the Rust source in dist ([519fee5](https://github.com/pact-foundation/pact-js/commit/519fee59d6798771e6fc7aaf6fcde8babd340356))
* use 0.5.6 of matching lib to avoid dup rules ([d30d7b9](https://github.com/pact-foundation/pact-js/commit/d30d7b974bcdcf25cfd73fd93ade68fbcd73ecdb))

## [10.0.0-beta.23](https://github.com/pact-foundation/pact-js/compare/v9.13.1...v10.0.0-beta.23) (2021-01-05)


### Features

* initial pacts for verification integration ([6428bbe](https://github.com/pact-foundation/pact-js/commit/6428bbef3c056b884c4225a1d05f9f3b7b2d1691))
* support for matchers on headers ([aa3d55e](https://github.com/pact-foundation/pact-js/commit/aa3d55e4bbc60a210cc4be568d1c9dab9b0998b7))
* Update URL matching functions to support mock server URL generation ([2733af9](https://github.com/pact-foundation/pact-js/commit/2733af9aa0f936928358ad6e40e2c17d3aeb48b5))

## [9.14.0](https://github.com/pact-foundation/pact-js/compare/v9.13.2...v9.14.0) (2021-01-09)


### Features

* add request/response tracing ([37c3dc3](https://github.com/pact-foundation/pact-js/commit/37c3dc356c819d08bca114d7d76983ea606368fd))


### Fixes and Improvements

* **logger:** Message consumers now respect the specified log level ([98e601c](https://github.com/pact-foundation/pact-js/commit/98e601c7b5ee97b5f9d620abc1542f702cfe84b7))
* **pact-web:** Pact-web is now built using webpack 4. Please let us know if there are any issues ([27fd1b5](https://github.com/pact-foundation/pact-js/commit/27fd1b5fb737f29a1c0b326ddd89ab9b2a21aaa6))

### [9.13.2](https://github.com/pact-foundation/pact-js/compare/v9.13.1...v9.13.2) (2021-01-04)


### Bug Fixes

* **popsicle:** Increase maxBufferSize of requests to infinity ([8fd751a](https://github.com/pact-foundation/pact-js/commit/8fd751a9e73b7f9150eb938f4d083d2ab235d747))
* small errors ([076549e](https://github.com/pact-foundation/pact-js/commit/076549e9cf5c9cb5798104bcda7d1cb97c1daf83))

## [10.0.0-beta.22](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.21...v10.0.0-beta.22) (2020-11-17)


### Features

* add example consumer test with provider state injected values [#516](https://github.com/pact-foundation/pact-js/issues/516) ([190f332](https://github.com/pact-foundation/pact-js/commit/190f332559fe0b1717054796614aa2624e81818c))
* added consumer for provider state injected example ([bdc333c](https://github.com/pact-foundation/pact-js/commit/bdc333c57107ac62f44abfac83ec62645470cc71))
* got provider state injected values working with provider test [#516](https://github.com/pact-foundation/pact-js/issues/516) ([5fdf7eb](https://github.com/pact-foundation/pact-js/commit/5fdf7eb8284d73030049e1abf19c34445981510b))
* implemented matching query parameters and provider state injected values (in consumer DSL) [#516](https://github.com/pact-foundation/pact-js/issues/516) ([f798c13](https://github.com/pact-foundation/pact-js/commit/f798c13494b690d9f5348c61d143855e7117de33))


### Bug Fixes

* if query parameters are not supplied they will be null or undefined [#516](https://github.com/pact-foundation/pact-js/issues/516) ([17397be](https://github.com/pact-foundation/pact-js/commit/17397bea50f25d3ded1dc71739a935e39b1f9a52))

## [10.0.0-beta.21](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.20...v10.0.0-beta.21) (2020-10-30)


### Bug Fixes

* improve the test error to include the original stack trace ([c14cb97](https://github.com/pact-foundation/pact-js/commit/c14cb97492ad38f16d442bef5a6411999149501d))
* update to latest mock server crate, fixes [#520](https://github.com/pact-foundation/pact-js/issues/520) ([21774de](https://github.com/pact-foundation/pact-js/commit/21774de2cc83b62224cb5315e888fb9ccd09c20b))

## [10.0.0-beta.20](https://github.com/pact-foundation/pact-js/compare/v9.13.0...v10.0.0-beta.20) (2020-10-29)


### Bug Fixes

* can not use matrix expressions in uses: with GH actions ([d6942a4](https://github.com/pact-foundation/pact-js/commit/d6942a412a64d1edd11d4f0f4ce2836e020da1e5))
* support any values for provider state parameters ([df4df0b](https://github.com/pact-foundation/pact-js/commit/df4df0bcd944d18088c6f7241b925c66a83a2039))
* update the MUSL docker container for use with GH actions ([5647032](https://github.com/pact-foundation/pact-js/commit/564703202e6bb22443eb7d6b90a533d1f7a54a6e))

## [10.0.0-beta.19](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.18...v10.0.0-beta.19) (2020-10-19)

## [10.0.0-beta.18](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.17...v10.0.0-beta.18) (2020-10-16)


### Features

* add support for array contains matcher ([57bcc79](https://github.com/pact-foundation/pact-js/commit/57bcc792037eb05d17a6e6268d14dcabe0262712))


### Bug Fixes

* typo in comment ([7491383](https://github.com/pact-foundation/pact-js/commit/7491383ded889a4b25f3480c2601f715b4f49c69))
* update to latest matching lib ([23e1f39](https://github.com/pact-foundation/pact-js/commit/23e1f39bd690f2bbf80cf78cb2922939484c6838))

## [10.0.0-beta.17](https://github.com/pact-foundation/pact-js/compare/v9.12.2...v10.0.0-beta.17) (2020-10-12)


### Features

* improve the error messages for a failed test ([f01b57e](https://github.com/pact-foundation/pact-js/commit/f01b57e9b0606735669bc684517ceaac19269be1))


### Bug Fixes

* allow the mock server port to be configured ([9c63d28](https://github.com/pact-foundation/pact-js/commit/9c63d28eb6d0c3d361b07b2053dcd3853649b160))
* correct the imports [#514](https://github.com/pact-foundation/pact-js/issues/514) ([6764a84](https://github.com/pact-foundation/pact-js/commit/6764a84e5b3004cd7f0f814a9ef694e606481ebe))

## [10.0.0-beta.16](https://github.com/pact-foundation/pact-js/compare/v9.12.1...v10.0.0-beta.16) (2020-09-28)


### Features

* add flag to enable handling CORS pre-flight requests ([0adb3fc](https://github.com/pact-foundation/pact-js/commit/0adb3fcab90bcf491f291c3874dd8bff93d3ac48))


### Bug Fixes

* correct Rust code after upgrade to upstream libs ([aa6d803](https://github.com/pact-foundation/pact-js/commit/aa6d803bb611f7d89692abf4e4409c14e43e7cc9))
* need .mocharc.json after merge from master ([2525bf6](https://github.com/pact-foundation/pact-js/commit/2525bf6563e8cc93cd3522bcff8cdb9cb5931c4e))
* package.json after merge from master ([aef422b](https://github.com/pact-foundation/pact-js/commit/aef422b70d850032575bac8efc442bc6eecb0205))

## [10.0.0-beta.15](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.14...v10.0.0-beta.15) (2020-08-05)


### Bug Fixes

* correct matcher paths for text nodes in XML ([a217793](https://github.com/pact-foundation/pact-js/commit/a217793a5e538d9e9616ae1bab8cbd561fdd5377))

## [10.0.0-beta.14](https://github.com/pact-foundation/pact-js/compare/v9.11.1...v10.0.0-beta.14) (2020-08-04)


### Bug Fixes

* lint ([ae8397a](https://github.com/pact-foundation/pact-js/commit/ae8397af7a30af95fdcade718a6bd5c458da9e25))
* PactNative.init needs to be re-entrant ([16c22f6](https://github.com/pact-foundation/pact-js/commit/16c22f64e3b174b18f3a51cb1d157af66ea019ab))

## [10.0.0-beta.13](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.12...v10.0.0-beta.13) (2020-06-27)


### Features

* add some tests around the conusmer DSL matchers ([e6a153f](https://github.com/pact-foundation/pact-js/commit/e6a153fd62d48644b97018d69e5f23d1710e510f))
* handle XML matching with different types of child elements ([2143ca4](https://github.com/pact-foundation/pact-js/commit/2143ca4c968969e1c6218dd8e538097733ccfa56))
* implemented consumer DSL URL matcher ([f27a444](https://github.com/pact-foundation/pact-js/commit/f27a44409aed3ece1adbab6af9e853b7684c101c))


### Bug Fixes

* after upgrading crates ([9a5a36d](https://github.com/pact-foundation/pact-js/commit/9a5a36db9d733bd13a1d68bb5b8d893720a915cb))
* import for metadata was wrong ([ba2a975](https://github.com/pact-foundation/pact-js/commit/ba2a9755aee672cbed73b236c44f68aab14939f0))
* lint ([78b4692](https://github.com/pact-foundation/pact-js/commit/78b46927bbeb96a4da6a924b7d8e86084ff6c355))

## [10.0.0-beta.12](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.11...v10.0.0-beta.12) (2020-06-12)

## [10.0.0-beta.11](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.10...v10.0.0-beta.11) (2020-06-12)

## [10.0.0-beta.10](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.9...v10.0.0-beta.10) (2020-06-12)

## [10.0.0-beta.9](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.8...v10.0.0-beta.9) (2020-06-11)

## [10.0.0-beta.8](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.7...v10.0.0-beta.8) (2020-06-11)

## [10.0.0-beta.7](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.6...v10.0.0-beta.7) (2020-06-11)

## [10.0.0-beta.6](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.5...v10.0.0-beta.6) (2020-06-11)


### Features

* enable publishing of verification results ([fcbdb3e](https://github.com/pact-foundation/pact-js/commit/fcbdb3e9729365039c30267996a7364e23ccdef1))
* release node 14 native binaries ([9ee832c](https://github.com/pact-foundation/pact-js/commit/9ee832c8dcfd896432ef34fb57595496bcac0077))

## [10.0.0-beta.5](https://github.com/pact-foundation/pact-js/compare/v9.11.0...v10.0.0-beta.5) (2020-05-27)


### Features

* support MIME multipart form posts with binary files ([d72a210](https://github.com/pact-foundation/pact-js/commit/d72a2103b4fb0d348d2601e88d9a34befc4f31a7))
* support regex matcher with a regexp object ([d92f6f5](https://github.com/pact-foundation/pact-js/commit/d92f6f5eee92667e5a3ce0ecdd44177d18a6b7ff))
* support text nodes configured from XML builder ([a2a7f55](https://github.com/pact-foundation/pact-js/commit/a2a7f55eff4a187cbe30a3e56917745ebc40e33d))
* support using matchers on XML text nodes ([b3b5e62](https://github.com/pact-foundation/pact-js/commit/b3b5e6231e9f0ade7be045ff117b441d0169114a))


### Bug Fixes

* correct the version of the pact_mock_server crate ([a17f2bb](https://github.com/pact-foundation/pact-js/commit/a17f2bb26d2964ac45b19704d91019ab2e7cdc4d))
* date/time matchers were being skipped due to defect in upstream matching lib ([dcc3a7f](https://github.com/pact-foundation/pact-js/commit/dcc3a7fbf212cfce02c7d3dcf50bdb8f47baf45e))
* travis matrix was doubled up ([fe08a70](https://github.com/pact-foundation/pact-js/commit/fe08a70769dbf7b3525b074f93731fb8d9ab3916))
* travis was not running the E2E tests after merge from master ([73257dc](https://github.com/pact-foundation/pact-js/commit/73257dc3f43e229103aca119b3369d5d3ec228eb))

## [10.0.0-beta.4](https://github.com/pact-foundation/pact-js/compare/v9.10.0...v10.0.0-beta.4) (2020-05-20)


### Features

* add support for binary payloads ([658ffa0](https://github.com/pact-foundation/pact-js/commit/658ffa0ee17adfe380b7cb1c68e10c48078c9cb6))


### Bug Fixes

* accidentially commited development paths in cargo manefest ([03cc16f](https://github.com/pact-foundation/pact-js/commit/03cc16f71d5f6a6cd646cdb6cf5421a134cb159e))
* format the error messages in a better way ([0a15772](https://github.com/pact-foundation/pact-js/commit/0a15772a710d3d159648672470084a1c99b45cc8))
* handle error when pact file cannot be written ([82832a8](https://github.com/pact-foundation/pact-js/commit/82832a81c115d06ef2d9c1fadd18c54f6f629e59))
* throw an exception when a request is configured but no interaction defined ([b317da7](https://github.com/pact-foundation/pact-js/commit/b317da79f28dce45102a55bcdcbc415d3fbdb9ab))
* throw an exception when a response is configured but no interaction defined ([6feacbe](https://github.com/pact-foundation/pact-js/commit/6feacbeef513420eddd9cbaed36abea80344de13))

## [10.0.0-beta.3](https://github.com/pact-foundation/pact-js/compare/v9.9.2...v10.0.0-beta.3) (2020-04-08)


### Bug Fixes

* correct invalid logger import ([5d4ba5b](https://github.com/pact-foundation/pact-js/commit/5d4ba5be629693b6608ea5f671b116a2ec3dad14))
* don't bundle the native lib in the NPM package ([24f43f3](https://github.com/pact-foundation/pact-js/commit/24f43f36f78269aef935381999dfe1e5802ea185))
* guard against panics in background thread ([b35aecd](https://github.com/pact-foundation/pact-js/commit/b35aecd2e907f4cb80ac4ba8ec3d99c9801f8c15))
* integer, decimal and number parameters are optional ([69f3983](https://github.com/pact-foundation/pact-js/commit/69f398333a10b649be4bf5a929234620d13d68d8))
* throw a JS error if there are no pacts to verify ([3bfd9da](https://github.com/pact-foundation/pact-js/commit/3bfd9dac007320e3ff14e476851d2f0aabef7ca0))
* try get the cause of any Rust panic ([f1f3d4a](https://github.com/pact-foundation/pact-js/commit/f1f3d4a4e287ec2c78a5b8f8eacfda459540dd5a))
* typo ([5d8dd37](https://github.com/pact-foundation/pact-js/commit/5d8dd37cf338478cc2a16532b9f2664e301294bf))
* update pact matching crate to 0.5.10 to fix invalid path matcher format ([ecce929](https://github.com/pact-foundation/pact-js/commit/ecce929af3d9aa51c3163d58e119924137a15195))

## [10.0.0-beta.2](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.1...v10.0.0-beta.2) (2020-03-18)


### Bug Fixes

* correct the path to the native lib in the NPM package ([300d915](https://github.com/pact-foundation/pact-js/commit/300d91516afebeefe979039566b02162e09992c0))

## [10.0.0-beta.1](https://github.com/pact-foundation/pact-js/compare/v9.8.1...v10.0.0-beta.1) (2020-03-17)


### Features

* got E2E consumer test passing ([904ed0b](https://github.com/pact-foundation/pact-js/commit/904ed0ba1115c81a07229e6a27c9e2d103c2dc36))
* got request filters working. Yay! ([de16880](https://github.com/pact-foundation/pact-js/commit/de16880171ee76fdb134593a7fc78725c81158ec))
* got the example V3 test working ([9ab43cc](https://github.com/pact-foundation/pact-js/commit/9ab43cc3541600653195c701b770dbdf1f44d5b0))
* handle the parameters and results from provider state callbacks [#372](https://github.com/pact-foundation/pact-js/issues/372) ([d3f73e5](https://github.com/pact-foundation/pact-js/commit/d3f73e5845023aa5168647daf711829a2d90f9ce))
* implement provider state parameters in consumer tests [#372](https://github.com/pact-foundation/pact-js/issues/372) ([af8bf32](https://github.com/pact-foundation/pact-js/commit/af8bf32f15551a7b86dc73682272074347143ffc))
* implemented provider state callbacks with parameters [#372](https://github.com/pact-foundation/pact-js/issues/372) ([50e4e61](https://github.com/pact-foundation/pact-js/commit/50e4e6199b6d9ce37cca8f10bdcd0d403cc1ad5d))
* Introduce an authenticated state [#372](https://github.com/pact-foundation/pact-js/issues/372) ([debebd7](https://github.com/pact-foundation/pact-js/commit/debebd73cce92a3988f99afbccc4d0091af4a3c9))


### Bug Fixes

* changes needed for the E2E consumer test ([6022f8b](https://github.com/pact-foundation/pact-js/commit/6022f8b33fce1cea1f60ba1cf62625f557a00572))
* correct the paths for the attribute matchers ([7629c92](https://github.com/pact-foundation/pact-js/commit/7629c9232308e1e51730f1567a2e6010ce852aac))
* correct the v3-todo example tests ([de205c7](https://github.com/pact-foundation/pact-js/commit/de205c7e5ca7c1922b187e29a6d44f0010afb27b))
* datetime matchers now generate a value if one is not given ([a910840](https://github.com/pact-foundation/pact-js/commit/a910840001f0e86201e82b2ca5759841392c9cca))
* fucking lint ([cdb72db](https://github.com/pact-foundation/pact-js/commit/cdb72db91eb1283423d21e3841ed3329a128a0af))
* Gah! Lint Nazis ([79082fd](https://github.com/pact-foundation/pact-js/commit/79082fddafbb7e76293103a3457292b02b8dfc95))
* got eachlike with number of examples working ([88c9a72](https://github.com/pact-foundation/pact-js/commit/88c9a72a8e11456d0afe94bbfc6ce212bd22153e))
* lint ([772224d](https://github.com/pact-foundation/pact-js/commit/772224d4d7eeaa7beafe27b55816e441a5d1ddb4))
* lint ([9717b47](https://github.com/pact-foundation/pact-js/commit/9717b47e2bc06087f0d8eafdeb86f73bdca46683))
* neon build should point to native directory ([fdea3eb](https://github.com/pact-foundation/pact-js/commit/fdea3eb6619f9281a377300b39d281b342ab588d))
* neon build should point to native directory ([16957a2](https://github.com/pact-foundation/pact-js/commit/16957a2dff8a7669ad848437591a02f306038dca))
* neon requires a C++ compiler ([bb8731f](https://github.com/pact-foundation/pact-js/commit/bb8731fae1dcf8797bbfa1ecfd0ad3a95a7ef3d5))
* removed node 6 and 7 because ancient ([2b45cfc](https://github.com/pact-foundation/pact-js/commit/2b45cfcca9adc92834cdfe74bf1dda5550f4d0ec))
* rustup: Unable to run interactively. Run with -y to accept defaults ([abfa9c9](https://github.com/pact-foundation/pact-js/commit/abfa9c9151eb27c3b5c503131bda4907a809c677))
* travis build needs the Rust source in dist ([e64402e](https://github.com/pact-foundation/pact-js/commit/e64402eae49ed2d5e290686860b357f1b4748812))
* travis build needs the Rust source in dist ([519fee5](https://github.com/pact-foundation/pact-js/commit/519fee59d6798771e6fc7aaf6fcde8babd340356))
* use 0.5.6 of matching lib to avoid dup rules ([d30d7b9](https://github.com/pact-foundation/pact-js/commit/d30d7b974bcdcf25cfd73fd93ade68fbcd73ecdb))

## [10.0.0-beta.22](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.21...v10.0.0-beta.22) (2020-11-17)


### Features

* add example consumer test with provider state injected values [#516](https://github.com/pact-foundation/pact-js/issues/516) ([190f332](https://github.com/pact-foundation/pact-js/commit/190f332559fe0b1717054796614aa2624e81818c))
* added consumer for provider state injected example ([bdc333c](https://github.com/pact-foundation/pact-js/commit/bdc333c57107ac62f44abfac83ec62645470cc71))
* got provider state injected values working with provider test [#516](https://github.com/pact-foundation/pact-js/issues/516) ([5fdf7eb](https://github.com/pact-foundation/pact-js/commit/5fdf7eb8284d73030049e1abf19c34445981510b))
* implemented matching query parameters and provider state injected values (in consumer DSL) [#516](https://github.com/pact-foundation/pact-js/issues/516) ([f798c13](https://github.com/pact-foundation/pact-js/commit/f798c13494b690d9f5348c61d143855e7117de33))


### Bug Fixes

* if query parameters are not supplied they will be null or undefined [#516](https://github.com/pact-foundation/pact-js/issues/516) ([17397be](https://github.com/pact-foundation/pact-js/commit/17397bea50f25d3ded1dc71739a935e39b1f9a52))

## [10.0.0-beta.21](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.20...v10.0.0-beta.21) (2020-10-30)


### Bug Fixes

* improve the test error to include the original stack trace ([c14cb97](https://github.com/pact-foundation/pact-js/commit/c14cb97492ad38f16d442bef5a6411999149501d))
* update to latest mock server crate, fixes [#520](https://github.com/pact-foundation/pact-js/issues/520) ([21774de](https://github.com/pact-foundation/pact-js/commit/21774de2cc83b62224cb5315e888fb9ccd09c20b))

## [10.0.0-beta.20](https://github.com/pact-foundation/pact-js/compare/v9.13.0...v10.0.0-beta.20) (2020-10-28)


### Bug Fixes

* support any values for provider state parameters ([df4df0b](https://github.com/pact-foundation/pact-js/commit/df4df0bcd944d18088c6f7241b925c66a83a2039))

## [10.0.0-beta.19](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.18...v10.0.0-beta.19) (2020-10-19)

## [10.0.0-beta.18](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.17...v10.0.0-beta.18) (2020-10-16)


### Features

* add support for array contains matcher ([57bcc79](https://github.com/pact-foundation/pact-js/commit/57bcc792037eb05d17a6e6268d14dcabe0262712))


### Bug Fixes

* typo in comment ([7491383](https://github.com/pact-foundation/pact-js/commit/7491383ded889a4b25f3480c2601f715b4f49c69))
* update to latest matching lib ([23e1f39](https://github.com/pact-foundation/pact-js/commit/23e1f39bd690f2bbf80cf78cb2922939484c6838))

## [10.0.0-beta.17](https://github.com/pact-foundation/pact-js/compare/v9.12.2...v10.0.0-beta.17) (2020-10-12)


### Features

* improve the error messages for a failed test ([f01b57e](https://github.com/pact-foundation/pact-js/commit/f01b57e9b0606735669bc684517ceaac19269be1))


### Bug Fixes

* allow the mock server port to be configured ([9c63d28](https://github.com/pact-foundation/pact-js/commit/9c63d28eb6d0c3d361b07b2053dcd3853649b160))
* correct the imports [#514](https://github.com/pact-foundation/pact-js/issues/514) ([6764a84](https://github.com/pact-foundation/pact-js/commit/6764a84e5b3004cd7f0f814a9ef694e606481ebe))

## [10.0.0-beta.16](https://github.com/pact-foundation/pact-js/compare/v9.12.1...v10.0.0-beta.16) (2020-09-28)


### Features

* add flag to enable handling CORS pre-flight requests ([0adb3fc](https://github.com/pact-foundation/pact-js/commit/0adb3fcab90bcf491f291c3874dd8bff93d3ac48))


### Bug Fixes

* correct Rust code after upgrade to upstream libs ([aa6d803](https://github.com/pact-foundation/pact-js/commit/aa6d803bb611f7d89692abf4e4409c14e43e7cc9))
* need .mocharc.json after merge from master ([2525bf6](https://github.com/pact-foundation/pact-js/commit/2525bf6563e8cc93cd3522bcff8cdb9cb5931c4e))
* package.json after merge from master ([aef422b](https://github.com/pact-foundation/pact-js/commit/aef422b70d850032575bac8efc442bc6eecb0205))

## [10.0.0-beta.15](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.14...v10.0.0-beta.15) (2020-08-05)


### Bug Fixes

* correct matcher paths for text nodes in XML ([a217793](https://github.com/pact-foundation/pact-js/commit/a217793a5e538d9e9616ae1bab8cbd561fdd5377))

## [10.0.0-beta.14](https://github.com/pact-foundation/pact-js/compare/v9.11.1...v10.0.0-beta.14) (2020-08-04)


### Bug Fixes

* lint ([ae8397a](https://github.com/pact-foundation/pact-js/commit/ae8397af7a30af95fdcade718a6bd5c458da9e25))
* PactNative.init needs to be re-entrant ([16c22f6](https://github.com/pact-foundation/pact-js/commit/16c22f64e3b174b18f3a51cb1d157af66ea019ab))

## [10.0.0-beta.13](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.12...v10.0.0-beta.13) (2020-06-27)


### Features

* add some tests around the conusmer DSL matchers ([e6a153f](https://github.com/pact-foundation/pact-js/commit/e6a153fd62d48644b97018d69e5f23d1710e510f))
* handle XML matching with different types of child elements ([2143ca4](https://github.com/pact-foundation/pact-js/commit/2143ca4c968969e1c6218dd8e538097733ccfa56))
* implemented consumer DSL URL matcher ([f27a444](https://github.com/pact-foundation/pact-js/commit/f27a44409aed3ece1adbab6af9e853b7684c101c))


### Bug Fixes

* after upgrading crates ([9a5a36d](https://github.com/pact-foundation/pact-js/commit/9a5a36db9d733bd13a1d68bb5b8d893720a915cb))
* import for metadata was wrong ([ba2a975](https://github.com/pact-foundation/pact-js/commit/ba2a9755aee672cbed73b236c44f68aab14939f0))
* lint ([78b4692](https://github.com/pact-foundation/pact-js/commit/78b46927bbeb96a4da6a924b7d8e86084ff6c355))

## [10.0.0-beta.12](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.11...v10.0.0-beta.12) (2020-06-12)

## [10.0.0-beta.11](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.10...v10.0.0-beta.11) (2020-06-12)

## [10.0.0-beta.10](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.9...v10.0.0-beta.10) (2020-06-12)

## [10.0.0-beta.9](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.8...v10.0.0-beta.9) (2020-06-11)

## [10.0.0-beta.8](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.7...v10.0.0-beta.8) (2020-06-11)

## [10.0.0-beta.7](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.6...v10.0.0-beta.7) (2020-06-11)

## [10.0.0-beta.6](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.5...v10.0.0-beta.6) (2020-06-11)


### Features

* enable publishing of verification results ([fcbdb3e](https://github.com/pact-foundation/pact-js/commit/fcbdb3e9729365039c30267996a7364e23ccdef1))
* release node 14 native binaries ([9ee832c](https://github.com/pact-foundation/pact-js/commit/9ee832c8dcfd896432ef34fb57595496bcac0077))

## [10.0.0-beta.5](https://github.com/pact-foundation/pact-js/compare/v9.11.0...v10.0.0-beta.5) (2020-05-27)


### Features

* support MIME multipart form posts with binary files ([d72a210](https://github.com/pact-foundation/pact-js/commit/d72a2103b4fb0d348d2601e88d9a34befc4f31a7))
* support regex matcher with a regexp object ([d92f6f5](https://github.com/pact-foundation/pact-js/commit/d92f6f5eee92667e5a3ce0ecdd44177d18a6b7ff))
* support text nodes configured from XML builder ([a2a7f55](https://github.com/pact-foundation/pact-js/commit/a2a7f55eff4a187cbe30a3e56917745ebc40e33d))
* support using matchers on XML text nodes ([b3b5e62](https://github.com/pact-foundation/pact-js/commit/b3b5e6231e9f0ade7be045ff117b441d0169114a))


### Bug Fixes

* correct the version of the pact_mock_server crate ([a17f2bb](https://github.com/pact-foundation/pact-js/commit/a17f2bb26d2964ac45b19704d91019ab2e7cdc4d))
* date/time matchers were being skipped due to defect in upstream matching lib ([dcc3a7f](https://github.com/pact-foundation/pact-js/commit/dcc3a7fbf212cfce02c7d3dcf50bdb8f47baf45e))
* travis matrix was doubled up ([fe08a70](https://github.com/pact-foundation/pact-js/commit/fe08a70769dbf7b3525b074f93731fb8d9ab3916))
* travis was not running the E2E tests after merge from master ([73257dc](https://github.com/pact-foundation/pact-js/commit/73257dc3f43e229103aca119b3369d5d3ec228eb))

## [10.0.0-beta.4](https://github.com/pact-foundation/pact-js/compare/v9.10.0...v10.0.0-beta.4) (2020-05-20)


### Features

* add support for binary payloads ([658ffa0](https://github.com/pact-foundation/pact-js/commit/658ffa0ee17adfe380b7cb1c68e10c48078c9cb6))


### Bug Fixes

* accidentially commited development paths in cargo manefest ([03cc16f](https://github.com/pact-foundation/pact-js/commit/03cc16f71d5f6a6cd646cdb6cf5421a134cb159e))
* format the error messages in a better way ([0a15772](https://github.com/pact-foundation/pact-js/commit/0a15772a710d3d159648672470084a1c99b45cc8))
* handle error when pact file cannot be written ([82832a8](https://github.com/pact-foundation/pact-js/commit/82832a81c115d06ef2d9c1fadd18c54f6f629e59))
* throw an exception when a request is configured but no interaction defined ([b317da7](https://github.com/pact-foundation/pact-js/commit/b317da79f28dce45102a55bcdcbc415d3fbdb9ab))
* throw an exception when a response is configured but no interaction defined ([6feacbe](https://github.com/pact-foundation/pact-js/commit/6feacbeef513420eddd9cbaed36abea80344de13))

## [10.0.0-beta.3](https://github.com/pact-foundation/pact-js/compare/v9.9.2...v10.0.0-beta.3) (2020-04-08)


### Bug Fixes

* correct invalid logger import ([5d4ba5b](https://github.com/pact-foundation/pact-js/commit/5d4ba5be629693b6608ea5f671b116a2ec3dad14))
* don't bundle the native lib in the NPM package ([24f43f3](https://github.com/pact-foundation/pact-js/commit/24f43f36f78269aef935381999dfe1e5802ea185))
* guard against panics in background thread ([b35aecd](https://github.com/pact-foundation/pact-js/commit/b35aecd2e907f4cb80ac4ba8ec3d99c9801f8c15))
* integer, decimal and number parameters are optional ([69f3983](https://github.com/pact-foundation/pact-js/commit/69f398333a10b649be4bf5a929234620d13d68d8))
* throw a JS error if there are no pacts to verify ([3bfd9da](https://github.com/pact-foundation/pact-js/commit/3bfd9dac007320e3ff14e476851d2f0aabef7ca0))
* try get the cause of any Rust panic ([f1f3d4a](https://github.com/pact-foundation/pact-js/commit/f1f3d4a4e287ec2c78a5b8f8eacfda459540dd5a))
* typo ([5d8dd37](https://github.com/pact-foundation/pact-js/commit/5d8dd37cf338478cc2a16532b9f2664e301294bf))
* update pact matching crate to 0.5.10 to fix invalid path matcher format ([ecce929](https://github.com/pact-foundation/pact-js/commit/ecce929af3d9aa51c3163d58e119924137a15195))

## [10.0.0-beta.2](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.1...v10.0.0-beta.2) (2020-03-18)


### Bug Fixes

* correct the path to the native lib in the NPM package ([300d915](https://github.com/pact-foundation/pact-js/commit/300d91516afebeefe979039566b02162e09992c0))

## [10.0.0-beta.1](https://github.com/pact-foundation/pact-js/compare/v9.8.1...v10.0.0-beta.1) (2020-03-17)


### Features

* got E2E consumer test passing ([904ed0b](https://github.com/pact-foundation/pact-js/commit/904ed0ba1115c81a07229e6a27c9e2d103c2dc36))
* got request filters working. Yay! ([de16880](https://github.com/pact-foundation/pact-js/commit/de16880171ee76fdb134593a7fc78725c81158ec))
* got the example V3 test working ([9ab43cc](https://github.com/pact-foundation/pact-js/commit/9ab43cc3541600653195c701b770dbdf1f44d5b0))
* handle the parameters and results from provider state callbacks [#372](https://github.com/pact-foundation/pact-js/issues/372) ([d3f73e5](https://github.com/pact-foundation/pact-js/commit/d3f73e5845023aa5168647daf711829a2d90f9ce))
* implement provider state parameters in consumer tests [#372](https://github.com/pact-foundation/pact-js/issues/372) ([af8bf32](https://github.com/pact-foundation/pact-js/commit/af8bf32f15551a7b86dc73682272074347143ffc))
* implemented provider state callbacks with parameters [#372](https://github.com/pact-foundation/pact-js/issues/372) ([50e4e61](https://github.com/pact-foundation/pact-js/commit/50e4e6199b6d9ce37cca8f10bdcd0d403cc1ad5d))
* Introduce an authenticated state [#372](https://github.com/pact-foundation/pact-js/issues/372) ([debebd7](https://github.com/pact-foundation/pact-js/commit/debebd73cce92a3988f99afbccc4d0091af4a3c9))


### Bug Fixes

* changes needed for the E2E consumer test ([6022f8b](https://github.com/pact-foundation/pact-js/commit/6022f8b33fce1cea1f60ba1cf62625f557a00572))
* correct the paths for the attribute matchers ([7629c92](https://github.com/pact-foundation/pact-js/commit/7629c9232308e1e51730f1567a2e6010ce852aac))
* correct the v3-todo example tests ([de205c7](https://github.com/pact-foundation/pact-js/commit/de205c7e5ca7c1922b187e29a6d44f0010afb27b))
* datetime matchers now generate a value if one is not given ([a910840](https://github.com/pact-foundation/pact-js/commit/a910840001f0e86201e82b2ca5759841392c9cca))
* fucking lint ([cdb72db](https://github.com/pact-foundation/pact-js/commit/cdb72db91eb1283423d21e3841ed3329a128a0af))
* Gah! Lint Nazis ([79082fd](https://github.com/pact-foundation/pact-js/commit/79082fddafbb7e76293103a3457292b02b8dfc95))
* got eachlike with number of examples working ([88c9a72](https://github.com/pact-foundation/pact-js/commit/88c9a72a8e11456d0afe94bbfc6ce212bd22153e))
* lint ([772224d](https://github.com/pact-foundation/pact-js/commit/772224d4d7eeaa7beafe27b55816e441a5d1ddb4))
* lint ([9717b47](https://github.com/pact-foundation/pact-js/commit/9717b47e2bc06087f0d8eafdeb86f73bdca46683))
* neon build should point to native directory ([fdea3eb](https://github.com/pact-foundation/pact-js/commit/fdea3eb6619f9281a377300b39d281b342ab588d))
* neon build should point to native directory ([16957a2](https://github.com/pact-foundation/pact-js/commit/16957a2dff8a7669ad848437591a02f306038dca))
* neon requires a C++ compiler ([bb8731f](https://github.com/pact-foundation/pact-js/commit/bb8731fae1dcf8797bbfa1ecfd0ad3a95a7ef3d5))
* removed node 6 and 7 because ancient ([2b45cfc](https://github.com/pact-foundation/pact-js/commit/2b45cfcca9adc92834cdfe74bf1dda5550f4d0ec))
* rustup: Unable to run interactively. Run with -y to accept defaults ([abfa9c9](https://github.com/pact-foundation/pact-js/commit/abfa9c9151eb27c3b5c503131bda4907a809c677))
* travis build needs the Rust source in dist ([e64402e](https://github.com/pact-foundation/pact-js/commit/e64402eae49ed2d5e290686860b357f1b4748812))
* travis build needs the Rust source in dist ([519fee5](https://github.com/pact-foundation/pact-js/commit/519fee59d6798771e6fc7aaf6fcde8babd340356))
* use 0.5.6 of matching lib to avoid dup rules ([d30d7b9](https://github.com/pact-foundation/pact-js/commit/d30d7b974bcdcf25cfd73fd93ade68fbcd73ecdb))

## [10.0.0-beta.19](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.18...v10.0.0-beta.19) (2020-10-19)

## [10.0.0-beta.18](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.17...v10.0.0-beta.18) (2020-10-16)


### Features

* add support for array contains matcher ([57bcc79](https://github.com/pact-foundation/pact-js/commit/57bcc792037eb05d17a6e6268d14dcabe0262712))


### Bug Fixes

* typo in comment ([7491383](https://github.com/pact-foundation/pact-js/commit/7491383ded889a4b25f3480c2601f715b4f49c69))
* update to latest matching lib ([23e1f39](https://github.com/pact-foundation/pact-js/commit/23e1f39bd690f2bbf80cf78cb2922939484c6838))

## [10.0.0-beta.17](https://github.com/pact-foundation/pact-js/compare/v9.12.2...v10.0.0-beta.17) (2020-10-12)


### Features

* improve the error messages for a failed test ([f01b57e](https://github.com/pact-foundation/pact-js/commit/f01b57e9b0606735669bc684517ceaac19269be1))
* **web:** Use latest can-i-use database when producing distribution ([cae3ea2](https://github.com/pact-foundation/pact-js/commit/cae3ea28199e55397b74c56d5e99e2f0430a6c5d))
* small errors ([076549e](https://github.com/pact-foundation/pact-js/commit/076549e9cf5c9cb5798104bcda7d1cb97c1daf83))

### [9.13.1](https://github.com/pact-foundation/pact-js/compare/v9.13.0...v9.13.1) (2020-12-11)


### Bug Fixes

* allow the mock server port to be configured ([9c63d28](https://github.com/pact-foundation/pact-js/commit/9c63d28eb6d0c3d361b07b2053dcd3853649b160))
* correct the imports [#514](https://github.com/pact-foundation/pact-js/issues/514) ([6764a84](https://github.com/pact-foundation/pact-js/commit/6764a84e5b3004cd7f0f814a9ef694e606481ebe))

## [10.0.0-beta.16](https://github.com/pact-foundation/pact-js/compare/v9.12.1...v10.0.0-beta.16) (2020-09-28)
* Expect at least one millisecond digit in iso8601DateTimeWithMillis ([4f48823](https://github.com/pact-foundation/pact-js/commit/4f48823586467fcdf3932b391cb961cfccb8d4eb))

## [9.13.0](https://github.com/pact-foundation/pact-js/compare/v9.12.2...v9.13.0) (2020-10-23)


### Features

* add flag to enable handling CORS pre-flight requests ([0adb3fc](https://github.com/pact-foundation/pact-js/commit/0adb3fcab90bcf491f291c3874dd8bff93d3ac48))


### Bug Fixes

* correct Rust code after upgrade to upstream libs ([aa6d803](https://github.com/pact-foundation/pact-js/commit/aa6d803bb611f7d89692abf4e4409c14e43e7cc9))
* need .mocharc.json after merge from master ([2525bf6](https://github.com/pact-foundation/pact-js/commit/2525bf6563e8cc93cd3522bcff8cdb9cb5931c4e))
* package.json after merge from master ([aef422b](https://github.com/pact-foundation/pact-js/commit/aef422b70d850032575bac8efc442bc6eecb0205))

## [10.0.0-beta.15](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.14...v10.0.0-beta.15) (2020-08-05)


### Bug Fixes

* correct matcher paths for text nodes in XML ([a217793](https://github.com/pact-foundation/pact-js/commit/a217793a5e538d9e9616ae1bab8cbd561fdd5377))

## [10.0.0-beta.14](https://github.com/pact-foundation/pact-js/compare/v9.11.1...v10.0.0-beta.14) (2020-08-04)


### Bug Fixes

* lint ([ae8397a](https://github.com/pact-foundation/pact-js/commit/ae8397af7a30af95fdcade718a6bd5c458da9e25))
* PactNative.init needs to be re-entrant ([16c22f6](https://github.com/pact-foundation/pact-js/commit/16c22f64e3b174b18f3a51cb1d157af66ea019ab))

## [10.0.0-beta.13](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.12...v10.0.0-beta.13) (2020-06-27)


### Features

* add some tests around the conusmer DSL matchers ([e6a153f](https://github.com/pact-foundation/pact-js/commit/e6a153fd62d48644b97018d69e5f23d1710e510f))
* handle XML matching with different types of child elements ([2143ca4](https://github.com/pact-foundation/pact-js/commit/2143ca4c968969e1c6218dd8e538097733ccfa56))
* implemented consumer DSL URL matcher ([f27a444](https://github.com/pact-foundation/pact-js/commit/f27a44409aed3ece1adbab6af9e853b7684c101c))


### Bug Fixes

* after upgrading crates ([9a5a36d](https://github.com/pact-foundation/pact-js/commit/9a5a36db9d733bd13a1d68bb5b8d893720a915cb))
* import for metadata was wrong ([ba2a975](https://github.com/pact-foundation/pact-js/commit/ba2a9755aee672cbed73b236c44f68aab14939f0))
* lint ([78b4692](https://github.com/pact-foundation/pact-js/commit/78b46927bbeb96a4da6a924b7d8e86084ff6c355))

## [10.0.0-beta.12](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.11...v10.0.0-beta.12) (2020-06-12)

## [10.0.0-beta.11](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.10...v10.0.0-beta.11) (2020-06-12)

## [10.0.0-beta.10](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.9...v10.0.0-beta.10) (2020-06-12)

## [10.0.0-beta.9](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.8...v10.0.0-beta.9) (2020-06-11)

## [10.0.0-beta.8](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.7...v10.0.0-beta.8) (2020-06-11)

## [10.0.0-beta.7](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.6...v10.0.0-beta.7) (2020-06-11)

## [10.0.0-beta.6](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.5...v10.0.0-beta.6) (2020-06-11)


### Features

* enable publishing of verification results ([fcbdb3e](https://github.com/pact-foundation/pact-js/commit/fcbdb3e9729365039c30267996a7364e23ccdef1))
* release node 14 native binaries ([9ee832c](https://github.com/pact-foundation/pact-js/commit/9ee832c8dcfd896432ef34fb57595496bcac0077))

## [10.0.0-beta.5](https://github.com/pact-foundation/pact-js/compare/v9.11.0...v10.0.0-beta.5) (2020-05-27)


### Features

* support MIME multipart form posts with binary files ([d72a210](https://github.com/pact-foundation/pact-js/commit/d72a2103b4fb0d348d2601e88d9a34befc4f31a7))
* support regex matcher with a regexp object ([d92f6f5](https://github.com/pact-foundation/pact-js/commit/d92f6f5eee92667e5a3ce0ecdd44177d18a6b7ff))
* support text nodes configured from XML builder ([a2a7f55](https://github.com/pact-foundation/pact-js/commit/a2a7f55eff4a187cbe30a3e56917745ebc40e33d))
* support using matchers on XML text nodes ([b3b5e62](https://github.com/pact-foundation/pact-js/commit/b3b5e6231e9f0ade7be045ff117b441d0169114a))


### Bug Fixes

* correct the version of the pact_mock_server crate ([a17f2bb](https://github.com/pact-foundation/pact-js/commit/a17f2bb26d2964ac45b19704d91019ab2e7cdc4d))
* date/time matchers were being skipped due to defect in upstream matching lib ([dcc3a7f](https://github.com/pact-foundation/pact-js/commit/dcc3a7fbf212cfce02c7d3dcf50bdb8f47baf45e))
* travis matrix was doubled up ([fe08a70](https://github.com/pact-foundation/pact-js/commit/fe08a70769dbf7b3525b074f93731fb8d9ab3916))
* travis was not running the E2E tests after merge from master ([73257dc](https://github.com/pact-foundation/pact-js/commit/73257dc3f43e229103aca119b3369d5d3ec228eb))

## [10.0.0-beta.4](https://github.com/pact-foundation/pact-js/compare/v9.10.0...v10.0.0-beta.4) (2020-05-20)


### Features

* add support for binary payloads ([658ffa0](https://github.com/pact-foundation/pact-js/commit/658ffa0ee17adfe380b7cb1c68e10c48078c9cb6))


### Bug Fixes

* accidentially commited development paths in cargo manefest ([03cc16f](https://github.com/pact-foundation/pact-js/commit/03cc16f71d5f6a6cd646cdb6cf5421a134cb159e))
* format the error messages in a better way ([0a15772](https://github.com/pact-foundation/pact-js/commit/0a15772a710d3d159648672470084a1c99b45cc8))
* handle error when pact file cannot be written ([82832a8](https://github.com/pact-foundation/pact-js/commit/82832a81c115d06ef2d9c1fadd18c54f6f629e59))
* throw an exception when a request is configured but no interaction defined ([b317da7](https://github.com/pact-foundation/pact-js/commit/b317da79f28dce45102a55bcdcbc415d3fbdb9ab))
* throw an exception when a response is configured but no interaction defined ([6feacbe](https://github.com/pact-foundation/pact-js/commit/6feacbeef513420eddd9cbaed36abea80344de13))

## [10.0.0-beta.3](https://github.com/pact-foundation/pact-js/compare/v9.9.2...v10.0.0-beta.3) (2020-04-08)


### Bug Fixes

* correct invalid logger import ([5d4ba5b](https://github.com/pact-foundation/pact-js/commit/5d4ba5be629693b6608ea5f671b116a2ec3dad14))
* don't bundle the native lib in the NPM package ([24f43f3](https://github.com/pact-foundation/pact-js/commit/24f43f36f78269aef935381999dfe1e5802ea185))
* guard against panics in background thread ([b35aecd](https://github.com/pact-foundation/pact-js/commit/b35aecd2e907f4cb80ac4ba8ec3d99c9801f8c15))
* integer, decimal and number parameters are optional ([69f3983](https://github.com/pact-foundation/pact-js/commit/69f398333a10b649be4bf5a929234620d13d68d8))
* throw a JS error if there are no pacts to verify ([3bfd9da](https://github.com/pact-foundation/pact-js/commit/3bfd9dac007320e3ff14e476851d2f0aabef7ca0))
* try get the cause of any Rust panic ([f1f3d4a](https://github.com/pact-foundation/pact-js/commit/f1f3d4a4e287ec2c78a5b8f8eacfda459540dd5a))
* typo ([5d8dd37](https://github.com/pact-foundation/pact-js/commit/5d8dd37cf338478cc2a16532b9f2664e301294bf))
* update pact matching crate to 0.5.10 to fix invalid path matcher format ([ecce929](https://github.com/pact-foundation/pact-js/commit/ecce929af3d9aa51c3163d58e119924137a15195))

## [10.0.0-beta.2](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.1...v10.0.0-beta.2) (2020-03-18)


### Bug Fixes

* correct the path to the native lib in the NPM package ([300d915](https://github.com/pact-foundation/pact-js/commit/300d91516afebeefe979039566b02162e09992c0))

## [10.0.0-beta.1](https://github.com/pact-foundation/pact-js/compare/v9.8.1...v10.0.0-beta.1) (2020-03-17)


### Features

* got E2E consumer test passing ([904ed0b](https://github.com/pact-foundation/pact-js/commit/904ed0ba1115c81a07229e6a27c9e2d103c2dc36))
* got request filters working. Yay! ([de16880](https://github.com/pact-foundation/pact-js/commit/de16880171ee76fdb134593a7fc78725c81158ec))
* got the example V3 test working ([9ab43cc](https://github.com/pact-foundation/pact-js/commit/9ab43cc3541600653195c701b770dbdf1f44d5b0))
* handle the parameters and results from provider state callbacks [#372](https://github.com/pact-foundation/pact-js/issues/372) ([d3f73e5](https://github.com/pact-foundation/pact-js/commit/d3f73e5845023aa5168647daf711829a2d90f9ce))
* implement provider state parameters in consumer tests [#372](https://github.com/pact-foundation/pact-js/issues/372) ([af8bf32](https://github.com/pact-foundation/pact-js/commit/af8bf32f15551a7b86dc73682272074347143ffc))
* implemented provider state callbacks with parameters [#372](https://github.com/pact-foundation/pact-js/issues/372) ([50e4e61](https://github.com/pact-foundation/pact-js/commit/50e4e6199b6d9ce37cca8f10bdcd0d403cc1ad5d))
* Introduce an authenticated state [#372](https://github.com/pact-foundation/pact-js/issues/372) ([debebd7](https://github.com/pact-foundation/pact-js/commit/debebd73cce92a3988f99afbccc4d0091af4a3c9))


### Bug Fixes

* changes needed for the E2E consumer test ([6022f8b](https://github.com/pact-foundation/pact-js/commit/6022f8b33fce1cea1f60ba1cf62625f557a00572))
* correct the paths for the attribute matchers ([7629c92](https://github.com/pact-foundation/pact-js/commit/7629c9232308e1e51730f1567a2e6010ce852aac))
* correct the v3-todo example tests ([de205c7](https://github.com/pact-foundation/pact-js/commit/de205c7e5ca7c1922b187e29a6d44f0010afb27b))
* datetime matchers now generate a value if one is not given ([a910840](https://github.com/pact-foundation/pact-js/commit/a910840001f0e86201e82b2ca5759841392c9cca))
* fucking lint ([cdb72db](https://github.com/pact-foundation/pact-js/commit/cdb72db91eb1283423d21e3841ed3329a128a0af))
* Gah! Lint Nazis ([79082fd](https://github.com/pact-foundation/pact-js/commit/79082fddafbb7e76293103a3457292b02b8dfc95))
* got eachlike with number of examples working ([88c9a72](https://github.com/pact-foundation/pact-js/commit/88c9a72a8e11456d0afe94bbfc6ce212bd22153e))
* lint ([772224d](https://github.com/pact-foundation/pact-js/commit/772224d4d7eeaa7beafe27b55816e441a5d1ddb4))
* lint ([9717b47](https://github.com/pact-foundation/pact-js/commit/9717b47e2bc06087f0d8eafdeb86f73bdca46683))
* neon build should point to native directory ([fdea3eb](https://github.com/pact-foundation/pact-js/commit/fdea3eb6619f9281a377300b39d281b342ab588d))
* neon build should point to native directory ([16957a2](https://github.com/pact-foundation/pact-js/commit/16957a2dff8a7669ad848437591a02f306038dca))
* neon requires a C++ compiler ([bb8731f](https://github.com/pact-foundation/pact-js/commit/bb8731fae1dcf8797bbfa1ecfd0ad3a95a7ef3d5))
* removed node 6 and 7 because ancient ([2b45cfc](https://github.com/pact-foundation/pact-js/commit/2b45cfcca9adc92834cdfe74bf1dda5550f4d0ec))
* rustup: Unable to run interactively. Run with -y to accept defaults ([abfa9c9](https://github.com/pact-foundation/pact-js/commit/abfa9c9151eb27c3b5c503131bda4907a809c677))
* travis build needs the Rust source in dist ([e64402e](https://github.com/pact-foundation/pact-js/commit/e64402eae49ed2d5e290686860b357f1b4748812))
* travis build needs the Rust source in dist ([519fee5](https://github.com/pact-foundation/pact-js/commit/519fee59d6798771e6fc7aaf6fcde8babd340356))
* use 0.5.6 of matching lib to avoid dup rules ([d30d7b9](https://github.com/pact-foundation/pact-js/commit/d30d7b974bcdcf25cfd73fd93ade68fbcd73ecdb))

## [10.0.0-beta.16](https://github.com/pact-foundation/pact-js/compare/v9.12.0...v10.0.0-beta.16) (2020-09-28)


### Features

* add flag to enable handling CORS pre-flight requests ([0adb3fc](https://github.com/pact-foundation/pact-js/commit/0adb3fcab90bcf491f291c3874dd8bff93d3ac48))


### Bug Fixes

* correct Rust code after upgrade to upstream libs ([aa6d803](https://github.com/pact-foundation/pact-js/commit/aa6d803bb611f7d89692abf4e4409c14e43e7cc9))
* need .mocharc.json after merge from master ([2525bf6](https://github.com/pact-foundation/pact-js/commit/2525bf6563e8cc93cd3522bcff8cdb9cb5931c4e))
* package.json after merge from master ([aef422b](https://github.com/pact-foundation/pact-js/commit/aef422b70d850032575bac8efc442bc6eecb0205))

## [10.0.0-beta.15](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.14...v10.0.0-beta.15) (2020-08-05)


### Bug Fixes

* correct matcher paths for text nodes in XML ([a217793](https://github.com/pact-foundation/pact-js/commit/a217793a5e538d9e9616ae1bab8cbd561fdd5377))

## [10.0.0-beta.14](https://github.com/pact-foundation/pact-js/compare/v9.11.1...v10.0.0-beta.14) (2020-08-04)


### Bug Fixes



* add some tests around the conusmer DSL matchers ([e6a153f](https://github.com/pact-foundation/pact-js/commit/e6a153fd62d48644b97018d69e5f23d1710e510f))
* handle XML matching with different types of child elements ([2143ca4](https://github.com/pact-foundation/pact-js/commit/2143ca4c968969e1c6218dd8e538097733ccfa56))
* implemented consumer DSL URL matcher ([f27a444](https://github.com/pact-foundation/pact-js/commit/f27a44409aed3ece1adbab6af9e853b7684c101c))


### Bug Fixes

* after upgrading crates ([9a5a36d](https://github.com/pact-foundation/pact-js/commit/9a5a36db9d733bd13a1d68bb5b8d893720a915cb))
* import for metadata was wrong ([ba2a975](https://github.com/pact-foundation/pact-js/commit/ba2a9755aee672cbed73b236c44f68aab14939f0))
* lint ([78b4692](https://github.com/pact-foundation/pact-js/commit/78b46927bbeb96a4da6a924b7d8e86084ff6c355))

## [10.0.0-beta.12](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.11...v10.0.0-beta.12) (2020-06-12)

## [10.0.0-beta.11](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.10...v10.0.0-beta.11) (2020-06-12)

## [10.0.0-beta.10](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.9...v10.0.0-beta.10) (2020-06-12)

## [10.0.0-beta.9](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.8...v10.0.0-beta.9) (2020-06-11)

## [10.0.0-beta.8](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.7...v10.0.0-beta.8) (2020-06-11)

## [10.0.0-beta.7](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.6...v10.0.0-beta.7) (2020-06-11)

## [10.0.0-beta.6](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.5...v10.0.0-beta.6) (2020-06-11)


### Features

* enable publishing of verification results ([fcbdb3e](https://github.com/pact-foundation/pact-js/commit/fcbdb3e9729365039c30267996a7364e23ccdef1))
* release node 14 native binaries ([9ee832c](https://github.com/pact-foundation/pact-js/commit/9ee832c8dcfd896432ef34fb57595496bcac0077))

## [10.0.0-beta.5](https://github.com/pact-foundation/pact-js/compare/v9.11.0...v10.0.0-beta.5) (2020-05-27)


### Features

* support MIME multipart form posts with binary files ([d72a210](https://github.com/pact-foundation/pact-js/commit/d72a2103b4fb0d348d2601e88d9a34befc4f31a7))
* support regex matcher with a regexp object ([d92f6f5](https://github.com/pact-foundation/pact-js/commit/d92f6f5eee92667e5a3ce0ecdd44177d18a6b7ff))
* support text nodes configured from XML builder ([a2a7f55](https://github.com/pact-foundation/pact-js/commit/a2a7f55eff4a187cbe30a3e56917745ebc40e33d))
* support using matchers on XML text nodes ([b3b5e62](https://github.com/pact-foundation/pact-js/commit/b3b5e6231e9f0ade7be045ff117b441d0169114a))

* allow WebDav REPORT request ([2928613](https://github.com/pact-foundation/pact-js/commit/2928613e35a52d76dff90981a8319df20ea1fccc))

### [9.12.2](https://github.com/pact-foundation/pact-js/compare/v9.12.1...v9.12.2) (2020-10-06)


### Bug Fixes

* **types:** Export LogLevel, PactOptions and MessageProviderOptions at the root of @pact-foundation/pact ([a6b50d3](https://github.com/pact-foundation/pact-js/commit/a6b50d387dcfb34b46a0602462104fa0a4f67db4))

### [9.12.1](https://github.com/pact-foundation/pact-js/compare/v9.12.0...v9.12.1) (2020-09-24)


### Bug Fixes

* allow matcher as the top-level value of a query string ([2922f8f](https://github.com/pact-foundation/pact-js/commit/2922f8fee871bfb1f220df37cfa76745e57f4e5e)), closes [#510](https://github.com/pact-foundation/pact-js/issues/510)

## [9.12.0](https://github.com/pact-foundation/pact-js/compare/v9.11.1...v9.12.0) (2020-09-21)


### Features

* support MIME multipart form posts with binary files ([d72a210](https://github.com/pact-foundation/pact-js/commit/d72a2103b4fb0d348d2601e88d9a34befc4f31a7))
* support regex matcher with a regexp object ([d92f6f5](https://github.com/pact-foundation/pact-js/commit/d92f6f5eee92667e5a3ce0ecdd44177d18a6b7ff))
* support text nodes configured from XML builder ([a2a7f55](https://github.com/pact-foundation/pact-js/commit/a2a7f55eff4a187cbe30a3e56917745ebc40e33d))
* support using matchers on XML text nodes ([b3b5e62](https://github.com/pact-foundation/pact-js/commit/b3b5e6231e9f0ade7be045ff117b441d0169114a))
* allow also WebDAV HTTP Requests ([2ac811d](https://github.com/pact-foundation/pact-js/commit/2ac811d514a6a419a0e2d1abec1ac46e854d4770))


### Bug Fixes

* correct the version of the pact_mock_server crate ([a17f2bb](https://github.com/pact-foundation/pact-js/commit/a17f2bb26d2964ac45b19704d91019ab2e7cdc4d))
* date/time matchers were being skipped due to defect in upstream matching lib ([dcc3a7f](https://github.com/pact-foundation/pact-js/commit/dcc3a7fbf212cfce02c7d3dcf50bdb8f47baf45e))
* travis matrix was doubled up ([fe08a70](https://github.com/pact-foundation/pact-js/commit/fe08a70769dbf7b3525b074f93731fb8d9ab3916))
* travis was not running the E2E tests after merge from master ([73257dc](https://github.com/pact-foundation/pact-js/commit/73257dc3f43e229103aca119b3369d5d3ec228eb))

## [10.0.0-beta.4](https://github.com/pact-foundation/pact-js/compare/v9.10.0...v10.0.0-beta.4) (2020-05-20)


### Features

* add support for binary payloads ([658ffa0](https://github.com/pact-foundation/pact-js/commit/658ffa0ee17adfe380b7cb1c68e10c48078c9cb6))


### Bug Fixes

* accidentially commited development paths in cargo manefest ([03cc16f](https://github.com/pact-foundation/pact-js/commit/03cc16f71d5f6a6cd646cdb6cf5421a134cb159e))
* format the error messages in a better way ([0a15772](https://github.com/pact-foundation/pact-js/commit/0a15772a710d3d159648672470084a1c99b45cc8))
* handle error when pact file cannot be written ([82832a8](https://github.com/pact-foundation/pact-js/commit/82832a81c115d06ef2d9c1fadd18c54f6f629e59))
* throw an exception when a request is configured but no interaction defined ([b317da7](https://github.com/pact-foundation/pact-js/commit/b317da79f28dce45102a55bcdcbc415d3fbdb9ab))
* throw an exception when a response is configured but no interaction defined ([6feacbe](https://github.com/pact-foundation/pact-js/commit/6feacbeef513420eddd9cbaed36abea80344de13))

## [10.0.0-beta.3](https://github.com/pact-foundation/pact-js/compare/v9.9.2...v10.0.0-beta.3) (2020-04-08)


### Bug Fixes

* correct invalid logger import ([5d4ba5b](https://github.com/pact-foundation/pact-js/commit/5d4ba5be629693b6608ea5f671b116a2ec3dad14))
* don't bundle the native lib in the NPM package ([24f43f3](https://github.com/pact-foundation/pact-js/commit/24f43f36f78269aef935381999dfe1e5802ea185))
* guard against panics in background thread ([b35aecd](https://github.com/pact-foundation/pact-js/commit/b35aecd2e907f4cb80ac4ba8ec3d99c9801f8c15))
* integer, decimal and number parameters are optional ([69f3983](https://github.com/pact-foundation/pact-js/commit/69f398333a10b649be4bf5a929234620d13d68d8))
* throw a JS error if there are no pacts to verify ([3bfd9da](https://github.com/pact-foundation/pact-js/commit/3bfd9dac007320e3ff14e476851d2f0aabef7ca0))
* try get the cause of any Rust panic ([f1f3d4a](https://github.com/pact-foundation/pact-js/commit/f1f3d4a4e287ec2c78a5b8f8eacfda459540dd5a))
* typo ([5d8dd37](https://github.com/pact-foundation/pact-js/commit/5d8dd37cf338478cc2a16532b9f2664e301294bf))
* update pact matching crate to 0.5.10 to fix invalid path matcher format ([ecce929](https://github.com/pact-foundation/pact-js/commit/ecce929af3d9aa51c3163d58e119924137a15195))

## [10.0.0-beta.2](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.1...v10.0.0-beta.2) (2020-03-18)


### Bug Fixes

* correct the path to the native lib in the NPM package ([300d915](https://github.com/pact-foundation/pact-js/commit/300d91516afebeefe979039566b02162e09992c0))

## [10.0.0-beta.1](https://github.com/pact-foundation/pact-js/compare/v9.8.1...v10.0.0-beta.1) (2020-03-17)


### Features

* got E2E consumer test passing ([904ed0b](https://github.com/pact-foundation/pact-js/commit/904ed0ba1115c81a07229e6a27c9e2d103c2dc36))
* got request filters working. Yay! ([de16880](https://github.com/pact-foundation/pact-js/commit/de16880171ee76fdb134593a7fc78725c81158ec))
* got the example V3 test working ([9ab43cc](https://github.com/pact-foundation/pact-js/commit/9ab43cc3541600653195c701b770dbdf1f44d5b0))
* handle the parameters and results from provider state callbacks [#372](https://github.com/pact-foundation/pact-js/issues/372) ([d3f73e5](https://github.com/pact-foundation/pact-js/commit/d3f73e5845023aa5168647daf711829a2d90f9ce))
* implement provider state parameters in consumer tests [#372](https://github.com/pact-foundation/pact-js/issues/372) ([af8bf32](https://github.com/pact-foundation/pact-js/commit/af8bf32f15551a7b86dc73682272074347143ffc))
* implemented provider state callbacks with parameters [#372](https://github.com/pact-foundation/pact-js/issues/372) ([50e4e61](https://github.com/pact-foundation/pact-js/commit/50e4e6199b6d9ce37cca8f10bdcd0d403cc1ad5d))
* Introduce an authenticated state [#372](https://github.com/pact-foundation/pact-js/issues/372) ([debebd7](https://github.com/pact-foundation/pact-js/commit/debebd73cce92a3988f99afbccc4d0091af4a3c9))


### Bug Fixes

* changes needed for the E2E consumer test ([6022f8b](https://github.com/pact-foundation/pact-js/commit/6022f8b33fce1cea1f60ba1cf62625f557a00572))
* correct the paths for the attribute matchers ([7629c92](https://github.com/pact-foundation/pact-js/commit/7629c9232308e1e51730f1567a2e6010ce852aac))
* correct the v3-todo example tests ([de205c7](https://github.com/pact-foundation/pact-js/commit/de205c7e5ca7c1922b187e29a6d44f0010afb27b))
* datetime matchers now generate a value if one is not given ([a910840](https://github.com/pact-foundation/pact-js/commit/a910840001f0e86201e82b2ca5759841392c9cca))
* fucking lint ([cdb72db](https://github.com/pact-foundation/pact-js/commit/cdb72db91eb1283423d21e3841ed3329a128a0af))
* Gah! Lint Nazis ([79082fd](https://github.com/pact-foundation/pact-js/commit/79082fddafbb7e76293103a3457292b02b8dfc95))
* got eachlike with number of examples working ([88c9a72](https://github.com/pact-foundation/pact-js/commit/88c9a72a8e11456d0afe94bbfc6ce212bd22153e))
* lint ([772224d](https://github.com/pact-foundation/pact-js/commit/772224d4d7eeaa7beafe27b55816e441a5d1ddb4))
* lint ([9717b47](https://github.com/pact-foundation/pact-js/commit/9717b47e2bc06087f0d8eafdeb86f73bdca46683))
* neon build should point to native directory ([fdea3eb](https://github.com/pact-foundation/pact-js/commit/fdea3eb6619f9281a377300b39d281b342ab588d))
* neon build should point to native directory ([16957a2](https://github.com/pact-foundation/pact-js/commit/16957a2dff8a7669ad848437591a02f306038dca))
* neon requires a C++ compiler ([bb8731f](https://github.com/pact-foundation/pact-js/commit/bb8731fae1dcf8797bbfa1ecfd0ad3a95a7ef3d5))
* removed node 6 and 7 because ancient ([2b45cfc](https://github.com/pact-foundation/pact-js/commit/2b45cfcca9adc92834cdfe74bf1dda5550f4d0ec))
* rustup: Unable to run interactively. Run with -y to accept defaults ([abfa9c9](https://github.com/pact-foundation/pact-js/commit/abfa9c9151eb27c3b5c503131bda4907a809c677))
* travis build needs the Rust source in dist ([e64402e](https://github.com/pact-foundation/pact-js/commit/e64402eae49ed2d5e290686860b357f1b4748812))
* travis build needs the Rust source in dist ([519fee5](https://github.com/pact-foundation/pact-js/commit/519fee59d6798771e6fc7aaf6fcde8babd340356))
* use 0.5.6 of matching lib to avoid dup rules ([d30d7b9](https://github.com/pact-foundation/pact-js/commit/d30d7b974bcdcf25cfd73fd93ade68fbcd73ecdb))

## [10.0.0-beta.13](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.12...v10.0.0-beta.13) (2020-06-27)


### Features

* add some tests around the conusmer DSL matchers ([e6a153f](https://github.com/pact-foundation/pact-js/commit/e6a153fd62d48644b97018d69e5f23d1710e510f))
* handle XML matching with different types of child elements ([2143ca4](https://github.com/pact-foundation/pact-js/commit/2143ca4c968969e1c6218dd8e538097733ccfa56))
* implemented consumer DSL URL matcher ([f27a444](https://github.com/pact-foundation/pact-js/commit/f27a44409aed3ece1adbab6af9e853b7684c101c))
* package.json & package-lock.json to reduce vulnerabilities ([0bb8512](https://github.com/pact-foundation/pact-js/commit/0bb851255c0f08d25fd935e5bd164ce99063a9ae))
* **pact-node:** Bump version of pact-node to pick up improved logging options ([1e09e1e](https://github.com/pact-foundation/pact-js/commit/1e09e1e44017811966defd9ba87c24066385d059))

### [9.11.1](https://github.com/pact-foundation/pact-js/compare/v9.11.0...v9.11.1) (2020-07-18)


### Bug Fixes

* after upgrading crates ([9a5a36d](https://github.com/pact-foundation/pact-js/commit/9a5a36db9d733bd13a1d68bb5b8d893720a915cb))
* import for metadata was wrong ([ba2a975](https://github.com/pact-foundation/pact-js/commit/ba2a9755aee672cbed73b236c44f68aab14939f0))
* lint ([78b4692](https://github.com/pact-foundation/pact-js/commit/78b46927bbeb96a4da6a924b7d8e86084ff6c355))
* **deps:** Update vulnerable dependencies ([2b2ce6e](https://github.com/pact-foundation/pact-js/commit/2b2ce6e30c161c967331c8c0f00b7319d3158489))

## [9.11.0](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.4...v9.11.0) (2020-05-20)


### Bug Fixes

* **dsl:** Fix extractPayload so that it passes through object properties that are not matchers (fixes [#454](https://github.com/pact-foundation/pact-js/issues/454)) ([c0f3d37](https://github.com/pact-foundation/pact-js/commit/c0f3d37b3a1f1843d4e92182b388bfe23d95e5c8))

## [10.0.0-beta.12](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.11...v10.0.0-beta.12) (2020-06-12)

## [10.0.0-beta.11](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.10...v10.0.0-beta.11) (2020-06-12)

## [10.0.0-beta.10](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.9...v10.0.0-beta.10) (2020-06-12)

## [10.0.0-beta.9](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.8...v10.0.0-beta.9) (2020-06-11)

## [10.0.0-beta.8](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.7...v10.0.0-beta.8) (2020-06-11)

## [10.0.0-beta.7](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.6...v10.0.0-beta.7) (2020-06-11)

## [10.0.0-beta.6](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.5...v10.0.0-beta.6) (2020-06-11)


### Features

* enable publishing of verification results ([fcbdb3e](https://github.com/pact-foundation/pact-js/commit/fcbdb3e9729365039c30267996a7364e23ccdef1))
* release node 14 native binaries ([9ee832c](https://github.com/pact-foundation/pact-js/commit/9ee832c8dcfd896432ef34fb57595496bcac0077))

## [10.0.0-beta.5](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.4...v10.0.0-beta.5) (2020-05-27)
* **deps:** Bump lodash dependency version to obtain security fix ([c035482](https://github.com/pact-foundation/pact-js/commit/c035482524f1b27f7de0b2fe60d104e1cf25a601))
* package.json & package-lock.json to reduce vulnerabilities ([f147ad2](https://github.com/pact-foundation/pact-js/commit/f147ad2b97bc384b8ccdf965bf4d47b65901cdf0))
* package.json & package-lock.json to reduce vulnerabilities ([c620dc1](https://github.com/pact-foundation/pact-js/commit/c620dc1965ff2b73c5d649dd2192e206e9a24e0e))
* **deps:** Update vulnerable dependencies ([2b2ce6e](https://github.com/pact-foundation/pact-js/commit/2b2ce6e30c161c967331c8c0f00b7319d3158489))

## [9.11.0](https://github.com/pact-foundation/pact-js/compare/v9.10.0...v9.11.0) (2020-05-20)


### Features

* support MIME multipart form posts with binary files ([d72a210](https://github.com/pact-foundation/pact-js/commit/d72a2103b4fb0d348d2601e88d9a34befc4f31a7))
* support regex matcher with a regexp object ([d92f6f5](https://github.com/pact-foundation/pact-js/commit/d92f6f5eee92667e5a3ce0ecdd44177d18a6b7ff))
* support text nodes configured from XML builder ([a2a7f55](https://github.com/pact-foundation/pact-js/commit/a2a7f55eff4a187cbe30a3e56917745ebc40e33d))
* support using matchers on XML text nodes ([b3b5e62](https://github.com/pact-foundation/pact-js/commit/b3b5e6231e9f0ade7be045ff117b441d0169114a))


### Bug Fixes

* correct the version of the pact_mock_server crate ([a17f2bb](https://github.com/pact-foundation/pact-js/commit/a17f2bb26d2964ac45b19704d91019ab2e7cdc4d))
* date/time matchers were being skipped due to defect in upstream matching lib ([dcc3a7f](https://github.com/pact-foundation/pact-js/commit/dcc3a7fbf212cfce02c7d3dcf50bdb8f47baf45e))
* travis matrix was doubled up ([fe08a70](https://github.com/pact-foundation/pact-js/commit/fe08a70769dbf7b3525b074f93731fb8d9ab3916))
* travis was not running the E2E tests after merge from master ([73257dc](https://github.com/pact-foundation/pact-js/commit/73257dc3f43e229103aca119b3369d5d3ec228eb))

## [10.0.0-beta.4](https://github.com/pact-foundation/pact-js/compare/v9.10.0...v10.0.0-beta.4) (2020-05-20)


### Features

* add support for binary payloads ([658ffa0](https://github.com/pact-foundation/pact-js/commit/658ffa0ee17adfe380b7cb1c68e10c48078c9cb6))
* error thrown when query not string ([c3ff00f](https://github.com/pact-foundation/pact-js/commit/c3ff00f3bac1a67826a9f57311e5137694c4c788))
* support array as query param ([d140d0c](https://github.com/pact-foundation/pact-js/commit/d140d0ce8a3d3eadb1d7e05eefad0c7df6218ecb))
* support arrays ([57288ff](https://github.com/pact-foundation/pact-js/commit/57288ffaaf876fe0c8d3c133ef3328e7182f2864))
* validate object values are strings ([3863527](https://github.com/pact-foundation/pact-js/commit/3863527dfb0df712b537ccc46ed213338730edb9))


### Bug Fixes

* accidentially commited development paths in cargo manefest ([03cc16f](https://github.com/pact-foundation/pact-js/commit/03cc16f71d5f6a6cd646cdb6cf5421a134cb159e))
* comments and accidental package ([efe2f4e](https://github.com/pact-foundation/pact-js/commit/efe2f4eef3f05e8ea4a067403c69b75e3236aea9))
* dir file location error ([86ab843](https://github.com/pact-foundation/pact-js/commit/86ab8433a5c4400330c71b6e9a64cfde49c75461))
* format the error messages in a better way ([0a15772](https://github.com/pact-foundation/pact-js/commit/0a15772a710d3d159648672470084a1c99b45cc8))
* handle error when pact file cannot be written ([82832a8](https://github.com/pact-foundation/pact-js/commit/82832a81c115d06ef2d9c1fadd18c54f6f629e59))
* package.json & package-lock.json to reduce vulnerabilities ([69d97e0](https://github.com/pact-foundation/pact-js/commit/69d97e0680e1d21e87ee491b0be0d1bd7e367e71))
* package.json & package-lock.json to reduce vulnerabilities ([2184a5d](https://github.com/pact-foundation/pact-js/commit/2184a5dedd7adb2070e7094e8f1b25dc4a374696))
* throw an exception when a request is configured but no interaction defined ([b317da7](https://github.com/pact-foundation/pact-js/commit/b317da79f28dce45102a55bcdcbc415d3fbdb9ab))
* throw an exception when a response is configured but no interaction defined ([6feacbe](https://github.com/pact-foundation/pact-js/commit/6feacbeef513420eddd9cbaed36abea80344de13))

## [10.0.0-beta.3](https://github.com/pact-foundation/pact-js/compare/v9.9.2...v10.0.0-beta.3) (2020-04-08)


### Bug Fixes

* correct invalid logger import ([5d4ba5b](https://github.com/pact-foundation/pact-js/commit/5d4ba5be629693b6608ea5f671b116a2ec3dad14))
* don't bundle the native lib in the NPM package ([24f43f3](https://github.com/pact-foundation/pact-js/commit/24f43f36f78269aef935381999dfe1e5802ea185))
* guard against panics in background thread ([b35aecd](https://github.com/pact-foundation/pact-js/commit/b35aecd2e907f4cb80ac4ba8ec3d99c9801f8c15))
* integer, decimal and number parameters are optional ([69f3983](https://github.com/pact-foundation/pact-js/commit/69f398333a10b649be4bf5a929234620d13d68d8))
* throw a JS error if there are no pacts to verify ([3bfd9da](https://github.com/pact-foundation/pact-js/commit/3bfd9dac007320e3ff14e476851d2f0aabef7ca0))
* try get the cause of any Rust panic ([f1f3d4a](https://github.com/pact-foundation/pact-js/commit/f1f3d4a4e287ec2c78a5b8f8eacfda459540dd5a))
* typo ([5d8dd37](https://github.com/pact-foundation/pact-js/commit/5d8dd37cf338478cc2a16532b9f2664e301294bf))
* update pact matching crate to 0.5.10 to fix invalid path matcher format ([ecce929](https://github.com/pact-foundation/pact-js/commit/ecce929af3d9aa51c3163d58e119924137a15195))

## [10.0.0-beta.2](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.1...v10.0.0-beta.2) (2020-03-18)


### Bug Fixes

* correct the path to the native lib in the NPM package ([300d915](https://github.com/pact-foundation/pact-js/commit/300d91516afebeefe979039566b02162e09992c0))

## [10.0.0-beta.1](https://github.com/pact-foundation/pact-js/compare/v9.8.1...v10.0.0-beta.1) (2020-03-17)


### Features

* got E2E consumer test passing ([904ed0b](https://github.com/pact-foundation/pact-js/commit/904ed0ba1115c81a07229e6a27c9e2d103c2dc36))
* got request filters working. Yay! ([de16880](https://github.com/pact-foundation/pact-js/commit/de16880171ee76fdb134593a7fc78725c81158ec))
* got the example V3 test working ([9ab43cc](https://github.com/pact-foundation/pact-js/commit/9ab43cc3541600653195c701b770dbdf1f44d5b0))
* handle the parameters and results from provider state callbacks [#372](https://github.com/pact-foundation/pact-js/issues/372) ([d3f73e5](https://github.com/pact-foundation/pact-js/commit/d3f73e5845023aa5168647daf711829a2d90f9ce))
* implement provider state parameters in consumer tests [#372](https://github.com/pact-foundation/pact-js/issues/372) ([af8bf32](https://github.com/pact-foundation/pact-js/commit/af8bf32f15551a7b86dc73682272074347143ffc))
* implemented provider state callbacks with parameters [#372](https://github.com/pact-foundation/pact-js/issues/372) ([50e4e61](https://github.com/pact-foundation/pact-js/commit/50e4e6199b6d9ce37cca8f10bdcd0d403cc1ad5d))
* Introduce an authenticated state [#372](https://github.com/pact-foundation/pact-js/issues/372) ([debebd7](https://github.com/pact-foundation/pact-js/commit/debebd73cce92a3988f99afbccc4d0091af4a3c9))


### Bug Fixes

* changes needed for the E2E consumer test ([6022f8b](https://github.com/pact-foundation/pact-js/commit/6022f8b33fce1cea1f60ba1cf62625f557a00572))
* correct the paths for the attribute matchers ([7629c92](https://github.com/pact-foundation/pact-js/commit/7629c9232308e1e51730f1567a2e6010ce852aac))
* correct the v3-todo example tests ([de205c7](https://github.com/pact-foundation/pact-js/commit/de205c7e5ca7c1922b187e29a6d44f0010afb27b))
* datetime matchers now generate a value if one is not given ([a910840](https://github.com/pact-foundation/pact-js/commit/a910840001f0e86201e82b2ca5759841392c9cca))
* fucking lint ([cdb72db](https://github.com/pact-foundation/pact-js/commit/cdb72db91eb1283423d21e3841ed3329a128a0af))
* Gah! Lint Nazis ([79082fd](https://github.com/pact-foundation/pact-js/commit/79082fddafbb7e76293103a3457292b02b8dfc95))
* got eachlike with number of examples working ([88c9a72](https://github.com/pact-foundation/pact-js/commit/88c9a72a8e11456d0afe94bbfc6ce212bd22153e))
* lint ([772224d](https://github.com/pact-foundation/pact-js/commit/772224d4d7eeaa7beafe27b55816e441a5d1ddb4))
* lint ([9717b47](https://github.com/pact-foundation/pact-js/commit/9717b47e2bc06087f0d8eafdeb86f73bdca46683))
* neon build should point to native directory ([fdea3eb](https://github.com/pact-foundation/pact-js/commit/fdea3eb6619f9281a377300b39d281b342ab588d))
* neon build should point to native directory ([16957a2](https://github.com/pact-foundation/pact-js/commit/16957a2dff8a7669ad848437591a02f306038dca))
* neon requires a C++ compiler ([bb8731f](https://github.com/pact-foundation/pact-js/commit/bb8731fae1dcf8797bbfa1ecfd0ad3a95a7ef3d5))
* removed node 6 and 7 because ancient ([2b45cfc](https://github.com/pact-foundation/pact-js/commit/2b45cfcca9adc92834cdfe74bf1dda5550f4d0ec))
* rustup: Unable to run interactively. Run with -y to accept defaults ([abfa9c9](https://github.com/pact-foundation/pact-js/commit/abfa9c9151eb27c3b5c503131bda4907a809c677))
* travis build needs the Rust source in dist ([e64402e](https://github.com/pact-foundation/pact-js/commit/e64402eae49ed2d5e290686860b357f1b4748812))
* travis build needs the Rust source in dist ([519fee5](https://github.com/pact-foundation/pact-js/commit/519fee59d6798771e6fc7aaf6fcde8babd340356))
* use 0.5.6 of matching lib to avoid dup rules ([d30d7b9](https://github.com/pact-foundation/pact-js/commit/d30d7b974bcdcf25cfd73fd93ade68fbcd73ecdb))

## [10.0.0-beta.3](https://github.com/pact-foundation/pact-js/compare/v9.9.2...v10.0.0-beta.3) (2020-04-07)


### Bug Fixes

* update pact matching crate to 0.5.10 to fix invalid path matcher format ([ecce929](https://github.com/pact-foundation/pact-js/commit/ecce929af3d9aa51c3163d58e119924137a15195))
* **build:** travis formatting ([41afa50](https://github.com/pact-foundation/pact-js/commit/41afa50c88a38113fdc7d49d734997fd92538448))
* correct invalid logger import ([5d4ba5b](https://github.com/pact-foundation/pact-js/commit/5d4ba5be629693b6608ea5f671b116a2ec3dad14))
* don't bundle the native lib in the NPM package ([24f43f3](https://github.com/pact-foundation/pact-js/commit/24f43f36f78269aef935381999dfe1e5802ea185))
* guard against panics in background thread ([b35aecd](https://github.com/pact-foundation/pact-js/commit/b35aecd2e907f4cb80ac4ba8ec3d99c9801f8c15))
* integer, decimal and number parameters are optional ([69f3983](https://github.com/pact-foundation/pact-js/commit/69f398333a10b649be4bf5a929234620d13d68d8))
* throw a JS error if there are no pacts to verify ([3bfd9da](https://github.com/pact-foundation/pact-js/commit/3bfd9dac007320e3ff14e476851d2f0aabef7ca0))
* try get the cause of any Rust panic ([f1f3d4a](https://github.com/pact-foundation/pact-js/commit/f1f3d4a4e287ec2c78a5b8f8eacfda459540dd5a))
* typo ([5d8dd37](https://github.com/pact-foundation/pact-js/commit/5d8dd37cf338478cc2a16532b9f2664e301294bf))

## [10.0.0-beta.2](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.1...v10.0.0-beta.2) (2020-03-18)
* **dsl:** Fix extractPayload so that it passes through object properties that are not matchers (fixes [#454](https://github.com/pact-foundation/pact-js/issues/454)) ([c0f3d37](https://github.com/pact-foundation/pact-js/commit/c0f3d37b3a1f1843d4e92182b388bfe23d95e5c8))
* package.json & package-lock.json to reduce vulnerabilities ([69d97e0](https://github.com/pact-foundation/pact-js/commit/69d97e0680e1d21e87ee491b0be0d1bd7e367e71))
* package.json & package-lock.json to reduce vulnerabilities ([2184a5d](https://github.com/pact-foundation/pact-js/commit/2184a5dedd7adb2070e7094e8f1b25dc4a374696))

## [9.10.0](https://github.com/pact-foundation/pact-js/compare/v9.9.12...v9.10.0) (2020-04-24)


### Features

* remove need for pact-node in almost all uses, including examples ([4e22828](https://github.com/pact-foundation/pact-js/commit/4e228282bbf1f31d8dae35e3cc00e4a6347110ba))
* update PactWeb and MessageProviderPact interface ([b82976f](https://github.com/pact-foundation/pact-js/commit/b82976f34b607535bf9deb07987140b487ab87e7))

### [9.9.12](https://github.com/pact-foundation/pact-js/compare/v9.9.11...v9.9.12) (2020-04-19)

### [9.9.11](https://github.com/pact-foundation/pact-js/compare/v9.9.10...v9.9.11) (2020-04-19)

### [9.9.10](https://github.com/pact-foundation/pact-js/compare/v9.9.9...v9.9.10) (2020-04-19)

### [9.9.9](https://github.com/pact-foundation/pact-js/compare/v9.9.8...v9.9.9) (2020-04-19)

### [9.9.8](https://github.com/pact-foundation/pact-js/compare/v9.9.7...v9.9.8) (2020-04-19)

### [9.9.7](https://github.com/pact-foundation/pact-js/compare/v9.9.6...v9.9.7) (2020-04-19)

### [9.9.6](https://github.com/pact-foundation/pact-js/compare/v9.9.5...v9.9.6) (2020-04-19)

### [9.9.5](https://github.com/pact-foundation/pact-js/compare/v9.9.4...v9.9.5) (2020-04-16)

### [9.9.4](https://github.com/pact-foundation/pact-js/compare/v9.9.3...v9.9.4) (2020-04-16)

### [9.9.3](https://github.com/pact-foundation/pact-js/compare/v9.9.2...v9.9.3) (2020-04-10)


### Bug Fixes

* correct the path to the native lib in the NPM package ([300d915](https://github.com/pact-foundation/pact-js/commit/300d91516afebeefe979039566b02162e09992c0))

## [10.0.0-beta.1](https://github.com/pact-foundation/pact-js/compare/v9.8.1...v10.0.0-beta.1) (2020-03-17)


### Features

* got E2E consumer test passing ([904ed0b](https://github.com/pact-foundation/pact-js/commit/904ed0ba1115c81a07229e6a27c9e2d103c2dc36))
* got request filters working. Yay! ([de16880](https://github.com/pact-foundation/pact-js/commit/de16880171ee76fdb134593a7fc78725c81158ec))
* got the example V3 test working ([9ab43cc](https://github.com/pact-foundation/pact-js/commit/9ab43cc3541600653195c701b770dbdf1f44d5b0))
* handle the parameters and results from provider state callbacks [#372](https://github.com/pact-foundation/pact-js/issues/372) ([d3f73e5](https://github.com/pact-foundation/pact-js/commit/d3f73e5845023aa5168647daf711829a2d90f9ce))
* implement provider state parameters in consumer tests [#372](https://github.com/pact-foundation/pact-js/issues/372) ([af8bf32](https://github.com/pact-foundation/pact-js/commit/af8bf32f15551a7b86dc73682272074347143ffc))
* implemented provider state callbacks with parameters [#372](https://github.com/pact-foundation/pact-js/issues/372) ([50e4e61](https://github.com/pact-foundation/pact-js/commit/50e4e6199b6d9ce37cca8f10bdcd0d403cc1ad5d))
* Introduce an authenticated state [#372](https://github.com/pact-foundation/pact-js/issues/372) ([debebd7](https://github.com/pact-foundation/pact-js/commit/debebd73cce92a3988f99afbccc4d0091af4a3c9))
* **build:** travis formatting ([41afa50](https://github.com/pact-foundation/pact-js/commit/41afa50c88a38113fdc7d49d734997fd92538448))
* **pact-node:** Bump dependency on pact-node to get support for wip pacts ([5e165fb](https://github.com/pact-foundation/pact-js/commit/5e165fb4824e9b21be13a8f0884225cea0040962))

### [9.9.3](https://github.com/pact-foundation/pact-js/compare/v9.9.2...v9.9.3) (2020-04-10)


### Bug Fixes

* **build:** travis formatting ([41afa50](https://github.com/pact-foundation/pact-js/commit/41afa50c88a38113fdc7d49d734997fd92538448))
* **pact-node:** Bump dependency on pact-node to get support for wip pacts ([5e165fb](https://github.com/pact-foundation/pact-js/commit/5e165fb4824e9b21be13a8f0884225cea0040962))

### [9.9.3](https://github.com/pact-foundation/pact-js/compare/v9.9.2...v9.9.3) (2020-04-10)


### Bug Fixes

* changes needed for the E2E consumer test ([6022f8b](https://github.com/pact-foundation/pact-js/commit/6022f8b33fce1cea1f60ba1cf62625f557a00572))
* correct the paths for the attribute matchers ([7629c92](https://github.com/pact-foundation/pact-js/commit/7629c9232308e1e51730f1567a2e6010ce852aac))
* correct the v3-todo example tests ([de205c7](https://github.com/pact-foundation/pact-js/commit/de205c7e5ca7c1922b187e29a6d44f0010afb27b))
* datetime matchers now generate a value if one is not given ([a910840](https://github.com/pact-foundation/pact-js/commit/a910840001f0e86201e82b2ca5759841392c9cca))
* fucking lint ([cdb72db](https://github.com/pact-foundation/pact-js/commit/cdb72db91eb1283423d21e3841ed3329a128a0af))
* Gah! Lint Nazis ([79082fd](https://github.com/pact-foundation/pact-js/commit/79082fddafbb7e76293103a3457292b02b8dfc95))
* got eachlike with number of examples working ([88c9a72](https://github.com/pact-foundation/pact-js/commit/88c9a72a8e11456d0afe94bbfc6ce212bd22153e))
* lint ([772224d](https://github.com/pact-foundation/pact-js/commit/772224d4d7eeaa7beafe27b55816e441a5d1ddb4))
* lint ([9717b47](https://github.com/pact-foundation/pact-js/commit/9717b47e2bc06087f0d8eafdeb86f73bdca46683))
* neon build should point to native directory ([fdea3eb](https://github.com/pact-foundation/pact-js/commit/fdea3eb6619f9281a377300b39d281b342ab588d))
* neon build should point to native directory ([16957a2](https://github.com/pact-foundation/pact-js/commit/16957a2dff8a7669ad848437591a02f306038dca))
* neon requires a C++ compiler ([bb8731f](https://github.com/pact-foundation/pact-js/commit/bb8731fae1dcf8797bbfa1ecfd0ad3a95a7ef3d5))
* removed node 6 and 7 because ancient ([2b45cfc](https://github.com/pact-foundation/pact-js/commit/2b45cfcca9adc92834cdfe74bf1dda5550f4d0ec))
* rustup: Unable to run interactively. Run with -y to accept defaults ([abfa9c9](https://github.com/pact-foundation/pact-js/commit/abfa9c9151eb27c3b5c503131bda4907a809c677))
* travis build needs the Rust source in dist ([e64402e](https://github.com/pact-foundation/pact-js/commit/e64402eae49ed2d5e290686860b357f1b4748812))
* travis build needs the Rust source in dist ([519fee5](https://github.com/pact-foundation/pact-js/commit/519fee59d6798771e6fc7aaf6fcde8babd340356))
* use 0.5.6 of matching lib to avoid dup rules ([d30d7b9](https://github.com/pact-foundation/pact-js/commit/d30d7b974bcdcf25cfd73fd93ade68fbcd73ecdb))
* **build:** travis formatting ([41afa50](https://github.com/pact-foundation/pact-js/commit/41afa50c88a38113fdc7d49d734997fd92538448))
* **pact-node:** Bump dependency on pact-node to get support for wip pacts ([5e165fb](https://github.com/pact-foundation/pact-js/commit/5e165fb4824e9b21be13a8f0884225cea0040962))

### [9.9.2](https://github.com/pact-foundation/pact-js/compare/v9.9.1...v9.9.2) (2020-03-30)

### [9.9.1](https://github.com/pact-foundation/pact-js/compare/v9.9.0...v9.9.1) (2020-03-30)

## [9.9.0](https://github.com/pact-foundation/pact-js/compare/v9.8.2...v9.9.0) (2020-03-26)


### Features

* support pending pacts and version selectors ([51aacc3](https://github.com/pact-foundation/pact-js/commit/51aacc36f3ee5360fd7a5c10176fc40d2e953e53))


### Bug Fixes

* **deps:** Update vulnerable dependencies ([cae591e](https://github.com/pact-foundation/pact-js/commit/cae591e8290dc03dad61f5456e640ce1652e0abe))
* **pact-node:** Bump pact-node to ^10.7.0, bringing a couple of fixes useful for debugging ([25ecd71](https://github.com/pact-foundation/pact-js/commit/25ecd713cadd60318d2238a643843783683f1789))

### [9.8.2](https://github.com/pact-foundation/pact-js/compare/v9.8.1...v9.8.2) (2020-03-20)

## [10.0.0-beta.2](https://github.com/pact-foundation/pact-js/compare/v10.0.0-beta.1...v10.0.0-beta.2) (2020-03-18)


### Bug Fixes

* correct the path to the native lib in the NPM package ([300d915](https://github.com/pact-foundation/pact-js/commit/300d91516afebeefe979039566b02162e09992c0))

## [10.0.0-beta.1](https://github.com/pact-foundation/pact-js/compare/v9.8.1...v10.0.0-beta.1) (2020-03-17)


### Features

* got E2E consumer test passing ([904ed0b](https://github.com/pact-foundation/pact-js/commit/904ed0ba1115c81a07229e6a27c9e2d103c2dc36))
* got request filters working. Yay! ([de16880](https://github.com/pact-foundation/pact-js/commit/de16880171ee76fdb134593a7fc78725c81158ec))
* got the example V3 test working ([9ab43cc](https://github.com/pact-foundation/pact-js/commit/9ab43cc3541600653195c701b770dbdf1f44d5b0))
* handle the parameters and results from provider state callbacks [#372](https://github.com/pact-foundation/pact-js/issues/372) ([d3f73e5](https://github.com/pact-foundation/pact-js/commit/d3f73e5845023aa5168647daf711829a2d90f9ce))
* implement provider state parameters in consumer tests [#372](https://github.com/pact-foundation/pact-js/issues/372) ([af8bf32](https://github.com/pact-foundation/pact-js/commit/af8bf32f15551a7b86dc73682272074347143ffc))
* implemented provider state callbacks with parameters [#372](https://github.com/pact-foundation/pact-js/issues/372) ([50e4e61](https://github.com/pact-foundation/pact-js/commit/50e4e6199b6d9ce37cca8f10bdcd0d403cc1ad5d))
* Introduce an authenticated state [#372](https://github.com/pact-foundation/pact-js/issues/372) ([debebd7](https://github.com/pact-foundation/pact-js/commit/debebd73cce92a3988f99afbccc4d0091af4a3c9))


### Bug Fixes

* changes needed for the E2E consumer test ([6022f8b](https://github.com/pact-foundation/pact-js/commit/6022f8b33fce1cea1f60ba1cf62625f557a00572))
* correct the paths for the attribute matchers ([7629c92](https://github.com/pact-foundation/pact-js/commit/7629c9232308e1e51730f1567a2e6010ce852aac))
* correct the v3-todo example tests ([de205c7](https://github.com/pact-foundation/pact-js/commit/de205c7e5ca7c1922b187e29a6d44f0010afb27b))
* datetime matchers now generate a value if one is not given ([a910840](https://github.com/pact-foundation/pact-js/commit/a910840001f0e86201e82b2ca5759841392c9cca))
* fucking lint ([cdb72db](https://github.com/pact-foundation/pact-js/commit/cdb72db91eb1283423d21e3841ed3329a128a0af))
* Gah! Lint Nazis ([79082fd](https://github.com/pact-foundation/pact-js/commit/79082fddafbb7e76293103a3457292b02b8dfc95))
* got eachlike with number of examples working ([88c9a72](https://github.com/pact-foundation/pact-js/commit/88c9a72a8e11456d0afe94bbfc6ce212bd22153e))
* lint ([772224d](https://github.com/pact-foundation/pact-js/commit/772224d4d7eeaa7beafe27b55816e441a5d1ddb4))
* lint ([9717b47](https://github.com/pact-foundation/pact-js/commit/9717b47e2bc06087f0d8eafdeb86f73bdca46683))
* neon build should point to native directory ([fdea3eb](https://github.com/pact-foundation/pact-js/commit/fdea3eb6619f9281a377300b39d281b342ab588d))
* neon build should point to native directory ([16957a2](https://github.com/pact-foundation/pact-js/commit/16957a2dff8a7669ad848437591a02f306038dca))
* neon requires a C++ compiler ([bb8731f](https://github.com/pact-foundation/pact-js/commit/bb8731fae1dcf8797bbfa1ecfd0ad3a95a7ef3d5))
* removed node 6 and 7 because ancient ([2b45cfc](https://github.com/pact-foundation/pact-js/commit/2b45cfcca9adc92834cdfe74bf1dda5550f4d0ec))
* rustup: Unable to run interactively. Run with -y to accept defaults ([abfa9c9](https://github.com/pact-foundation/pact-js/commit/abfa9c9151eb27c3b5c503131bda4907a809c677))
* travis build needs the Rust source in dist ([e64402e](https://github.com/pact-foundation/pact-js/commit/e64402eae49ed2d5e290686860b357f1b4748812))
* travis build needs the Rust source in dist ([519fee5](https://github.com/pact-foundation/pact-js/commit/519fee59d6798771e6fc7aaf6fcde8babd340356))
* use 0.5.6 of matching lib to avoid dup rules ([d30d7b9](https://github.com/pact-foundation/pact-js/commit/d30d7b974bcdcf25cfd73fd93ade68fbcd73ecdb))

### [9.8.1](https://github.com/pact-foundation/pact-js/compare/v9.8.0...v9.8.1) (2020-03-16)


### Bug Fixes

* package.json & package-lock.json to reduce vulnerabilities ([#418](https://github.com/pact-foundation/pact-js/issues/418)) ([c1c7090](https://github.com/pact-foundation/pact-js/commit/c1c7090c73085523d1ffd653bd13560419266903))

## [9.8.0](https://github.com/pact-foundation/pact-js/compare/v9.7.0...v9.8.0) (2020-03-02)


### Features

* upgrade Pact Node to 10.5.0. Fixes [#411](https://github.com/pact-foundation/pact-js/issues/411) ([e5a50ab](https://github.com/pact-foundation/pact-js/commit/e5a50abdcf4fab972fcdf2d0ec395b17c2f320d3))

## [9.7.0](https://github.com/pact-foundation/pact-js/compare/v9.6.1...v9.7.0) (2020-02-17)


### Features

* upgrade Pact Node to 10.3.1 ([4503b32](https://github.com/pact-foundation/pact-js/commit/4503b32a6a434a21f0ba22520117c2dbb7967ad8))

### [9.6.1](https://github.com/pact-foundation/pact-js/compare/v9.6.0...v9.6.1) (2020-01-23)


### Bug Fixes

* **dependencies:** Move bunyan-prettystream to a dependency instead of a dev dependency ([805ed11](https://github.com/pact-foundation/pact-js/commit/805ed11daf57a11ae120ea1eaa3227dd0176e4c1))

<a name="9.6.0"></a>
# [9.6.0](https://github.com/pact-foundation/pact-js/compare/v9.5.1...v9.6.0) (2020-01-01)


### Features

* add email address matcher ([14e8974](https://github.com/pact-foundation/pact-js/commit/14e8974))
* **email:** add simplified email address format ([f5ea38e](https://github.com/pact-foundation/pact-js/commit/f5ea38e))



<a name="9.5.0"></a>
# [9.5.0](https://github.com/pact-foundation/pact-js/compare/v9.4.0...v9.5.0) (2019-11-10)


### Features

* update pact-node to ^10.2.1 ([100914f](https://github.com/pact-foundation/pact-js/commit/100914f))



<a name="9.4.0"></a>
# [9.4.0](https://github.com/pact-foundation/pact-js/compare/v9.3.0...v9.4.0) (2019-11-08)


### Features

* update pact-node to ^10.2.0 ([c96cc89](https://github.com/pact-foundation/pact-js/commit/c96cc89))



<a name="9.3.0"></a>
# [9.3.0](https://github.com/pact-foundation/pact-js/compare/v9.2.4...v9.3.0) (2019-11-08)


### Features

* update pact-node to ^10.2.0 ([f64cf69](https://github.com/pact-foundation/pact-js/commit/f64cf69))



<a name="9.2.4"></a>
## [9.2.4](https://github.com/pact-foundation/pact-js/compare/v9.2.3...v9.2.4) (2019-11-08)


### Bug Fixes

* **deps:** Update vulnerable dependencies ([f5d798a](https://github.com/pact-foundation/pact-js/commit/f5d798a))



<a name="9.2.3"></a>
## [9.2.3](https://github.com/pact-foundation/pact-js/compare/v9.2.2...v9.2.3) (2019-11-08)


### Bug Fixes

* **deps:** Upgrade vulnerable dependencies and correct peer dependencies ([#388](https://github.com/pact-foundation/pact-js/issues/388)) ([4a19161](https://github.com/pact-foundation/pact-js/commit/4a19161))
* **examples:** Set jasmine timeout in Jest example, preventing brittle tests (fixes [#383](https://github.com/pact-foundation/pact-js/issues/383)) ([#386](https://github.com/pact-foundation/pact-js/issues/386)) ([5f76433](https://github.com/pact-foundation/pact-js/commit/5f76433))
* **net:** stop port check from failing due to ipv6 unavailability ([#381](https://github.com/pact-foundation/pact-js/issues/381)) ([#389](https://github.com/pact-foundation/pact-js/issues/389)) ([9ae53c2](https://github.com/pact-foundation/pact-js/commit/9ae53c2))



<a name="9.2.2"></a>
## [9.2.2](https://github.com/pact-foundation/pact-js/compare/v9.2.1...v9.2.2) (2019-10-28)


### Bug Fixes

* **deps:** Update pact-node to ^10.0.1 ([844870d](https://github.com/pact-foundation/pact-js/commit/844870d))



<a name="9.2.1"></a>
## [9.2.1](https://github.com/pact-foundation/pact-js/compare/v9.2.0...v9.2.1) (2019-10-17)



<a name="9.2.0"></a>
# [9.2.0](https://github.com/pact-foundation/pact-js/compare/v9.1.1...v9.2.0) (2019-10-08)


### Bug Fixes

* **examples:** correct karma/jasmine example to use jasmine instead of mocha ([#365](https://github.com/pact-foundation/pact-js/issues/365)) ([96a0758](https://github.com/pact-foundation/pact-js/commit/96a0758))
* **MessageProvider:** Shut down test environment even if message provider throws an error ([#366](https://github.com/pact-foundation/pact-js/issues/366)) ([3d66117](https://github.com/pact-foundation/pact-js/commit/3d66117))
* upgrade vulnerable dependencies ([2380b75](https://github.com/pact-foundation/pact-js/commit/2380b75))


### Features

* Automatically set `changeOrigin: true` for non-local verifications  ([#319](https://github.com/pact-foundation/pact-js/issues/319)) ([60f2dc3](https://github.com/pact-foundation/pact-js/commit/60f2dc3)), closes [#280](https://github.com/pact-foundation/pact-js/issues/280) [#281](https://github.com/pact-foundation/pact-js/issues/281) [#282](https://github.com/pact-foundation/pact-js/issues/282)
* **grahpql:** allow operation to have null ([88acdc0](https://github.com/pact-foundation/pact-js/commit/88acdc0))



<a name="9.1.1"></a>
## [9.1.1](https://github.com/pact-foundation/pact-js/compare/v9.1.0...v9.1.1) (2019-09-05)


### Bug Fixes

* Upgrade pact-node minimum version to bring in broker auth with token ([41844fe](https://github.com/pact-foundation/pact-js/commit/41844fe))



<a name="9.1.0"></a>
# [9.1.0](https://github.com/pact-foundation/pact-js/compare/v9.0.1...v9.1.0) (2019-08-07)


### Bug Fixes

* **tests:** correct test that would not compile ([8cafbbf](https://github.com/pact-foundation/pact-js/commit/8cafbbf))
* **types:** correct consumerVersionTag in verifier type (fixes [#341](https://github.com/pact-foundation/pact-js/issues/341)) ([7f6a87d](https://github.com/pact-foundation/pact-js/commit/7f6a87d))


### Features

* **matching:** add string type matcher. See https://github.com/pact-foundation/pact-js/issues/323 ([#335](https://github.com/pact-foundation/pact-js/issues/335)) ([9f49588](https://github.com/pact-foundation/pact-js/commit/9f49588))



<a name="9.0.1"></a>
## [9.0.1](https://github.com/pact-foundation/pact-js/compare/v9.0.0...v9.0.1) (2019-07-17)


### Bug Fixes

* add pactBrokerToken to match pact-node VerifierOptions ([89df786](https://github.com/pact-foundation/pact-js/commit/89df786))



<a name="9.0.0"></a>
# [9.0.0](https://github.com/pact-foundation/pact-js/compare/v8.2.6...v9.0.0) (2019-07-16)


### Bug Fixes

* readme example ([#320](https://github.com/pact-foundation/pact-js/issues/320)) ([e57ef2b](https://github.com/pact-foundation/pact-js/commit/e57ef2b))


### deps

* **pact-node:** bump version of pact-node to 9.0.0 ([cede852](https://github.com/pact-foundation/pact-js/commit/cede852))


### BREAKING CHANGES

* **pact-node:** pact-node 9.0.0 removes the pact-cli wrapper in favour of exposing the pact-standalone binaries as binstubs. Scripts using the pact cli will need to be updated to use the standalone binaries.



<a name="8.2.6"></a>
## [8.2.6](https://github.com/pact-foundation/pact-js/compare/v8.2.5...v8.2.6) (2019-06-18)



<a name="8.2.5"></a>
## [8.2.5](https://github.com/pact-foundation/pact-js/compare/v8.2.4...v8.2.5) (2019-06-18)



<a name="8.2.4"></a>
## [8.2.4](https://github.com/pact-foundation/pact-js/compare/v8.2.3...v8.2.4) (2019-05-15)



<a name="8.2.3"></a>
## [8.2.3](https://github.com/pact-foundation/pact-js/compare/v8.2.2...v8.2.3) (2019-05-15)



<a name="8.2.2"></a>
## [8.2.2](https://github.com/pact-foundation/pact-js/compare/v8.2.1...v8.2.2) (2019-04-26)



<a name="8.2.1"></a>
## [8.2.1](https://github.com/pact-foundation/pact-js/compare/v8.2.0...v8.2.1) (2019-04-26)


### Bug Fixes

* **verifier:** providerStateSetupUrl passed to Verifier constructor should take precedence ([#295](https://github.com/pact-foundation/pact-js/issues/295)) ([9d118a8](https://github.com/pact-foundation/pact-js/commit/9d118a8))



<a name="8.2.0"></a>
# [8.2.0](https://github.com/pact-foundation/pact-js/compare/v8.1.2...v8.2.0) (2019-04-12)


### Features

* **graphql:** export graphql apis for pact web. Fixes [#283](https://github.com/pact-foundation/pact-js/issues/283) ([36ea8d1](https://github.com/pact-foundation/pact-js/commit/36ea8d1))



<a name="8.1.2"></a>
## [8.1.2](https://github.com/pact-foundation/pact-js/compare/v8.1.1...v8.1.2) (2019-04-12)


### Bug Fixes

* **example:** ensure 401 case has invalid bearer token ([0dd519b](https://github.com/pact-foundation/pact-js/commit/0dd519b))



<a name="8.1.1"></a>
## [8.1.1](https://github.com/pact-foundation/pact-js/compare/v8.1.0...v8.1.1) (2019-04-11)



<a name="8.1.0"></a>
# [8.1.0](https://github.com/pact-foundation/pact-js/compare/v8.0.5...v8.1.0) (2019-03-29)


### Features

* upgrade to [@pact-foundation](https://github.com/pact-foundation)/pact-node@^8.1.1 ([087d79d](https://github.com/pact-foundation/pact-js/commit/087d79d)), closes [#287](https://github.com/pact-foundation/pact-js/issues/287)



<a name="8.0.5"></a>
## [8.0.5](https://github.com/pact-foundation/pact-js/compare/v8.0.4...v8.0.5) (2019-03-12)


### Bug Fixes

* **verifier:** add changeOrigin flag for http-proxy ([4536be5](https://github.com/pact-foundation/pact-js/commit/4536be5)), closes [#282](https://github.com/pact-foundation/pact-js/issues/282)



<a name="8.0.4"></a>
## [8.0.4](https://github.com/pact-foundation/pact-js/compare/v8.0.2...v8.0.4) (2019-03-11)


### Bug Fixes

* **messages:** prevent message proxy from running twice ([50219b1](https://github.com/pact-foundation/pact-js/commit/50219b1))
* **veriry:** allow self-signed certificates in provider verification. Fixes [#280](https://github.com/pact-foundation/pact-js/issues/280) ([122eb24](https://github.com/pact-foundation/pact-js/commit/122eb24))



<a name="8.0.3"></a>
## [8.0.3](https://github.com/pact-foundation/pact-js/compare/v8.0.2...v8.0.3) (2019-03-11)


### Bug Fixes

* **messages:** prevent message proxy from running twice ([50219b1](https://github.com/pact-foundation/pact-js/commit/50219b1))
* **veriry:** allow self-signed certificates in provider verification. Fixes [#280](https://github.com/pact-foundation/pact-js/issues/280) ([122eb24](https://github.com/pact-foundation/pact-js/commit/122eb24))



<a name="8.0.2"></a>
## [8.0.2](https://github.com/pact-foundation/pact-js/compare/v8.0.1...v8.0.2) (2019-02-23)



<a name="8.0.1"></a>
## [8.0.1](https://github.com/pact-foundation/pact-js/compare/v8.0.0...v8.0.1) (2019-02-23)



<a name="8.0.0"></a>
# [8.0.0](https://github.com/pact-foundation/pact-js/compare/v7.4.0...v8.0.0) (2019-02-23)


### Bug Fixes

* **npm:** npm lock got out of sync ([a9bed4f](https://github.com/pact-foundation/pact-js/commit/a9bed4f))
* rename error classes to lowercase ([16b7686](https://github.com/pact-foundation/pact-js/commit/16b7686))


### Features

* **dynamic-proxy:** working dynamic proxy code with tests ([d8e2eec](https://github.com/pact-foundation/pact-js/commit/d8e2eec))
* **proxy:** add docs and e2e examples of filters and stateHandlers ([5561980](https://github.com/pact-foundation/pact-js/commit/5561980))
* **proxy:** cleanup verifier interface ([63a661b](https://github.com/pact-foundation/pact-js/commit/63a661b))



<a name="7.4.0"></a>
# [7.4.0](https://github.com/pact-foundation/pact-js/compare/v7.3.0...v7.4.0) (2019-02-22)


### Bug Fixes

* **matchers:** remove hardcoded true value from a boolean matcher ([499c02c](https://github.com/pact-foundation/pact-js/commit/499c02c))
* **portcheck:** feedback from PR 266#discussion_r255314895 ([c583224](https://github.com/pact-foundation/pact-js/commit/c583224)), closes [266#discussion_r255314895](https://github.com/266/issues/discussion_r255314895)


### Features

* pact-web provider.addInteraction to allow Interaction instance [[#270](https://github.com/pact-foundation/pact-js/issues/270)] ([0814d68](https://github.com/pact-foundation/pact-js/commit/0814d68))



<a name="7.3.0"></a>
# [7.3.0](https://github.com/pact-foundation/pact-js/compare/v7.2.0...v7.3.0) (2019-02-09)


### Bug Fixes

* **port-check:** make port check more resilient. Fixes [#49](https://github.com/pact-foundation/pact-js/issues/49) ([ee0aa71](https://github.com/pact-foundation/pact-js/commit/ee0aa71))


### Features

* **configuration:** return configuration from setup() ([11af9e4](https://github.com/pact-foundation/pact-js/commit/11af9e4)), closes [#259](https://github.com/pact-foundation/pact-js/issues/259)



<a name="7.2.0"></a>
# [7.2.0](https://github.com/pact-foundation/pact-js/compare/v7.1.0...v7.2.0) (2018-11-28)


### Bug Fixes

* remove done due to async test ([81e5510](https://github.com/pact-foundation/pact-js/commit/81e5510))
* remove test guidelines ([04206c0](https://github.com/pact-foundation/pact-js/commit/04206c0))
* variable scope ([3e985a3](https://github.com/pact-foundation/pact-js/commit/3e985a3))


### Features

* **examples:** add array bracket notation example to jest tests ([93c1572](https://github.com/pact-foundation/pact-js/commit/93c1572))
* **isodate-matcher:** ensure minimum 3 precision on iso data matcher ([b9144bb](https://github.com/pact-foundation/pact-js/commit/b9144bb))



<a name="7.1.0"></a>
# [7.1.0](https://github.com/pact-foundation/pact-js/compare/v7.0.4...v7.1.0) (2018-11-28)


### Features

* **apollo-graphql:** add Apollo specific GraphQL interface. Fixes [#254](https://github.com/pact-foundation/pact-js/issues/254) ([cab8328](https://github.com/pact-foundation/pact-js/commit/cab8328))



<a name="7.0.4"></a>
## [7.0.4](https://github.com/pact-foundation/pact-js/compare/v7.0.3...v7.0.4) (2018-11-24)


### Bug Fixes

* **graphql:** omit variables and operation name if empty. Fixes [#243](https://github.com/pact-foundation/pact-js/issues/243) ([0ac2709](https://github.com/pact-foundation/pact-js/commit/0ac2709))
* **vulnerabilities:** upgrade version of pact-node ([#244](https://github.com/pact-foundation/pact-js/issues/244)) ([d8214e6](https://github.com/pact-foundation/pact-js/commit/d8214e6))



<a name="7.0.3"></a>
## [7.0.3](https://github.com/pact-foundation/pact-js/compare/v7.0.2...v7.0.3) (2018-11-07)


### Bug Fixes

* apply logLevel to local logger ([6e31407](https://github.com/pact-foundation/pact-js/commit/6e31407))



<a name="7.0.2"></a>
## [7.0.2](https://github.com/pact-foundation/pact-js/compare/v7.0.1...v7.0.2) (2018-10-27)


### Bug Fixes

* **graphql:** allow arbitrary operation names in GraphQL interface [#235](https://github.com/pact-foundation/pact-js/issues/235) ([16df628](https://github.com/pact-foundation/pact-js/commit/16df628))
* **interaction-failure:** clear interactions on any verify() ([fbc5ac0](https://github.com/pact-foundation/pact-js/commit/fbc5ac0)), closes [#231](https://github.com/pact-foundation/pact-js/issues/231)
* **matchers:** allow integers/decimals to be 0 ([#236](https://github.com/pact-foundation/pact-js/issues/236)) ([c40ce32](https://github.com/pact-foundation/pact-js/commit/c40ce32))



<a name="7.0.1"></a>
## [7.0.1](https://github.com/pact-foundation/pact-js/compare/v7.0.0...v7.0.1) (2018-10-15)


### Bug Fixes

* **api:** repair incorrect absolute import to 'pact'. Fixes [#229](https://github.com/pact-foundation/pact-js/issues/229) ([aa22fae](https://github.com/pact-foundation/pact-js/commit/aa22fae))



<a name="7.0.0"></a>
# [7.0.0](https://github.com/pact-foundation/pact-js/compare/v6.0.2...v7.0.0) (2018-10-09)


### Bug Fixes

* **README.md:** providerVersion is a string not a boolean ([#217](https://github.com/pact-foundation/pact-js/issues/217)) ([15706cc](https://github.com/pact-foundation/pact-js/commit/15706cc))
* **test:** fix port unavailable test on windows ([c41a934](https://github.com/pact-foundation/pact-js/commit/c41a934))


### Chores

* **deprecate:** deprecate Node version < 6 ([c778880](https://github.com/pact-foundation/pact-js/commit/c778880))


### BREAKING CHANGES

* **deprecate:** No longer supporting Node versions 4 or 5.



<a name="6.0.2"></a>
## [6.0.2](https://github.com/pact-foundation/pact-js/compare/v6.0.1...v6.0.2) (2018-10-01)


### Bug Fixes

* **examples/typescript:** fix example failing to run ([f2ed7d7](https://github.com/pact-foundation/pact-js/commit/f2ed7d7))
* **examples/typescript:** fix the typings for getMeDogs ([42bbb9a](https://github.com/pact-foundation/pact-js/commit/42bbb9a))
* **examples/typescript:** missing dependencies ([314119d](https://github.com/pact-foundation/pact-js/commit/314119d))
* **vulnerabilities:** run npm audit fix on e2e tests ([934789f](https://github.com/pact-foundation/pact-js/commit/934789f))



<a name="6.0.1"></a>
## [6.0.1](https://github.com/pact-foundation/pact-js/compare/v6.0.0-alpha.15...v6.0.1) (2018-08-19)


### Bug Fixes

* **test:** add mocha.opts for mocha tests ([765f272](https://github.com/pact-foundation/pact-js/commit/765f272))
* **test:** remove async usage in examples ([11368c8](https://github.com/pact-foundation/pact-js/commit/11368c8))



<a name="5.9.1"></a>
## [5.9.1](https://github.com/pact-foundation/pact-js/compare/v6.0.0-alpha.14...v5.9.1) (2018-05-10)


### Bug Fixes

* **interaction:** include response body if set to empty string ([2db0f23](https://github.com/pact-foundation/pact-js/commit/2db0f23))



<a name="6.0.0-alpha.15"></a>
# [6.0.0-alpha.15](https://github.com/pact-foundation/pact-js/compare/v6.0.0-alpha.14...v6.0.0-alpha.15) (2018-07-17)


### Bug Fixes

* **interaction:** include response body if set to empty string ([abc20d4](https://github.com/pact-foundation/pact-js/commit/abc20d4))



<a name="6.0.0-alpha.14"></a>
# [6.0.0-alpha.14](https://github.com/pact-foundation/pact-js/compare/v6.0.0-alpha.13...v6.0.0-alpha.14) (2018-05-08)


### Features

* **message:** modify message: content -> contents ([38e57a8](https://github.com/pact-foundation/pact-js/commit/38e57a8))
* **upgrade:** update to pact-node 6.16.x ([c1d938b](https://github.com/pact-foundation/pact-js/commit/c1d938b))



<a name="6.0.0-alpha.13"></a>
# [6.0.0-alpha.13](https://github.com/pact-foundation/pact-js/compare/v6.0.0-alpha.12...v6.0.0-alpha.13) (2018-04-29)


### Features

* **graphql:** escape queries with variables ([8b64dd4](https://github.com/pact-foundation/pact-js/commit/8b64dd4))



<a name="6.0.0-alpha.12"></a>
# [6.0.0-alpha.12](https://github.com/pact-foundation/pact-js/compare/v6.0.0-alpha.10...v6.0.0-alpha.12) (2018-04-22)


### Features

* **example:** example GraphQL pact test ([3280a81](https://github.com/pact-foundation/pact-js/commit/3280a81))
* **graphql:** add basic GraphQL wrapper function ([641e0e7](https://github.com/pact-foundation/pact-js/commit/641e0e7))
* **message:** tidy up Message interface and tests ([58c334c](https://github.com/pact-foundation/pact-js/commit/58c334c))



<a name="6.0.0-alpha.11"></a>
# [6.0.0-alpha.11](https://github.com/pact-foundation/pact-js/compare/v6.0.0-alpha.10...v6.0.0-alpha.11) (2018-04-22)


### Features

* **example:** example GraphQL pact test ([3280a81](https://github.com/pact-foundation/pact-js/commit/3280a81))
* **graphql:** add basic GraphQL wrapper function ([641e0e7](https://github.com/pact-foundation/pact-js/commit/641e0e7))
* **message:** tidy up Message interface and tests ([58c334c](https://github.com/pact-foundation/pact-js/commit/58c334c))



<a name="6.0.0-alpha.10"></a>
# [6.0.0-alpha.10](https://github.com/pact-foundation/pact-js/compare/v6.0.0-alpha.9...v6.0.0-alpha.10) (2018-04-20)


### Bug Fixes

* Replace packpath with pkginfo to get metadata in more reliable f… ([#175](https://github.com/pact-foundation/pact-js/issues/175)) ([5abb32e](https://github.com/pact-foundation/pact-js/commit/5abb32e))



<a name="6.0.0-alpha.9"></a>
# [6.0.0-alpha.9](https://github.com/pact-foundation/pact-js/compare/v6.0.0-alpha.8...v6.0.0-alpha.9) (2018-04-20)


### Bug Fixes

* resolve package.json for version metadata regardless of nesting ([#174](https://github.com/pact-foundation/pact-js/issues/174)) ([9b771c6](https://github.com/pact-foundation/pact-js/commit/9b771c6))



<a name="6.0.0-alpha.8"></a>
# [6.0.0-alpha.8](https://github.com/pact-foundation/pact-js/compare/v6.0.0-alpha.7...v6.0.0-alpha.8) (2018-04-15)


### Features

* **messages:** setup provider states in verification ([57f7352](https://github.com/pact-foundation/pact-js/commit/57f7352))



<a name="6.0.0-alpha.7"></a>
# [6.0.0-alpha.7](https://github.com/pact-foundation/pact-js/compare/v6.0.0-alpha.6...v6.0.0-alpha.7) (2018-04-05)



<a name="6.0.0-alpha.6"></a>
# [6.0.0-alpha.6](https://github.com/pact-foundation/pact-js/compare/v6.0.0-alpha.5...v6.0.0-alpha.6) (2018-04-05)



<a name="6.0.0-alpha.5"></a>
# [6.0.0-alpha.5](https://github.com/pact-foundation/pact-js/compare/v6.0.0-alpha.4...v6.0.0-alpha.5) (2018-04-04)


### Features

* **messages:** implement v3 compatible provider states ([8e113a5](https://github.com/pact-foundation/pact-js/commit/8e113a5))



<a name="6.0.0-alpha.4"></a>
# [6.0.0-alpha.4](https://github.com/pact-foundation/pact-js/compare/v6.0.0-alpha.2...v6.0.0-alpha.4) (2018-04-01)


### Bug Fixes

* **test:** fix promise resolution in test ([ce31f31](https://github.com/pact-foundation/pact-js/commit/ce31f31))


### Features

* **example:** working serverless example with pact. [#166](https://github.com/pact-foundation/pact-js/issues/166) ([d4a49f5](https://github.com/pact-foundation/pact-js/commit/d4a49f5))
* **message:** fix message structure sent to consumer verify(). [#166](https://github.com/pact-foundation/pact-js/issues/166) ([ee1ddf0](https://github.com/pact-foundation/pact-js/commit/ee1ddf0))
* **serverless-example:** add basic serverless SNS example ([08cd73b](https://github.com/pact-foundation/pact-js/commit/08cd73b))



<a name="6.0.0-alpha.2"></a>
# [6.0.0-alpha.2](https://github.com/pact-foundation/pact-js/compare/v6.0.0-alpha.0...v6.0.0-alpha.2) (2018-03-31)



<a name="6.0.0-alpha.1"></a>
# [6.0.0-alpha.1](https://github.com/pact-foundation/pact-js/compare/v6.0.0-alpha.0...v6.0.0-alpha.1) (2018-03-31)



<a name="6.0.0-alpha.0"></a>
# [6.0.0-alpha.0](https://github.com/pact-foundation/pact-js/compare/v5.9.0...v6.0.0-alpha.0) (2018-03-31)


### Features

* **messages:** initial WIP for message pacts ([fd3526e](https://github.com/pact-foundation/pact-js/commit/fd3526e))



<a name="5.9.0"></a>
# [5.9.0](https://github.com/pact-foundation/pact-js/compare/v5.8.0...v5.9.0) (2018-03-27)


### Features

* **upgrade:** update to pact-node 6.13.x ([b19f069](https://github.com/pact-foundation/pact-js/commit/b19f069))



<a name="5.8.0"></a>
# [5.8.0](https://github.com/pact-foundation/pact-js/compare/v5.7.0...v5.8.0) (2018-03-25)


### Features

* **upgrade:** update to pact-node 6.12.x ([6e5c2e1](https://github.com/pact-foundation/pact-js/commit/6e5c2e1))



<a name="5.7.0"></a>
# [5.7.0](https://github.com/pact-foundation/pact-js/compare/v5.6.0...v5.7.0) (2018-02-28)


### Features

* **upgrade:** update to pact-node 6.11.x. Fixes [#63](https://github.com/pact-foundation/pact-js/issues/63) ([f0063c9](https://github.com/pact-foundation/pact-js/commit/f0063c9))



<a name="5.6.1"></a>
## [5.6.1](https://github.com/pact-foundation/pact-js/compare/v5.6.0...v5.6.1) (2018-02-25)



<a name="5.6.0"></a>
# [5.6.0](https://github.com/pact-foundation/pact-js/compare/v5.5.1...v5.6.0) (2018-02-22)


### Features

* **upgrade:** update to pact-node 6.10.x. Fixes [#150](https://github.com/pact-foundation/pact-js/issues/150) ([99ab454](https://github.com/pact-foundation/pact-js/commit/99ab454))



<a name="5.5.1"></a>
## [5.5.1](https://github.com/pact-foundation/pact-js/compare/v5.5.0...v5.5.1) (2018-02-20)



<a name="5.5.0"></a>
# [5.5.0](https://github.com/pact-foundation/pact-js/compare/v5.4.0...v5.5.0) (2018-02-09)


### Features

* **upgrade:** update to pact-node 6.8.x ([fd4ae99](https://github.com/pact-foundation/pact-js/commit/fd4ae99))



<a name="5.4.0"></a>
# [5.4.0](https://github.com/pact-foundation/pact-js/compare/v5.3.2...v5.4.0) (2018-02-08)


### Features

* **types:** allow builder usage in Pact tests ([cb6305b](https://github.com/pact-foundation/pact-js/commit/cb6305b))



<a name="5.3.2"></a>
## [5.3.2](https://github.com/pact-foundation/pact-js/compare/v5.3.1...v5.3.2) (2018-01-11)



<a name="5.3.1"></a>
## [5.3.1](https://github.com/pact-foundation/pact-js/compare/v5.3.0...v5.3.1) (2018-01-06)


### Bug Fixes

* **logging:** set pact-node log level before constructing server [#139](https://github.com/pact-foundation/pact-js/issues/139) ([b2f5c2d](https://github.com/pact-foundation/pact-js/commit/b2f5c2d))
* **verifier:** properly wrap pact-node q promise in verifier ([affca89](https://github.com/pact-foundation/pact-js/commit/affca89))



<a name="5.3.0"></a>
# [5.3.0](https://github.com/pact-foundation/pact-js/compare/v5.2.0...v5.3.0) (2017-12-11)


### Features

* **parallel:** allow pactfileWriteMode to support 'merge'. [#124](https://github.com/pact-foundation/pact-js/issues/124) ([81e1078](https://github.com/pact-foundation/pact-js/commit/81e1078))



<a name="5.2.0"></a>
# [5.2.0](https://github.com/pact-foundation/pact-js/compare/v5.0.3...v5.2.0) (2017-12-10)


### Bug Fixes

* **jest:** update jest example to be compatible with v21.x.x ([#132](https://github.com/pact-foundation/pact-js/issues/132)) ([7fabfc4](https://github.com/pact-foundation/pact-js/commit/7fabfc4))


### Features

* **examples:** extending ava examples with matchers ([51fb8ae](https://github.com/pact-foundation/pact-js/commit/51fb8ae))
* **mock-service:** pass arguments to CLI not API ([2b9053c](https://github.com/pact-foundation/pact-js/commit/2b9053c)), closes [#105](https://github.com/pact-foundation/pact-js/issues/105)
* **pact-node:** update to latest pact-node 6.4.x ([2430ee0](https://github.com/pact-foundation/pact-js/commit/2430ee0)), closes [#131](https://github.com/pact-foundation/pact-js/issues/131)



<a name="5.1.0"></a>
# [5.1.0](https://github.com/pact-foundation/pact-js/compare/v5.0.3...v5.1.0) (2017-12-08)


### Bug Fixes

* **jest:** update jest example to be compatible with v21.x.x ([#132](https://github.com/pact-foundation/pact-js/issues/132)) ([7fabfc4](https://github.com/pact-foundation/pact-js/commit/7fabfc4))


### Features

* **examples:** extending ava examples with matchers ([51fb8ae](https://github.com/pact-foundation/pact-js/commit/51fb8ae))
* **pact-node:** update to latest pact-node 6.4.x ([3d8aef0](https://github.com/pact-foundation/pact-js/commit/3d8aef0))



<a name="5.0.3"></a>
## [5.0.3](https://github.com/pact-foundation/pact-js/compare/v5.0.2...v5.0.3) (2017-12-06)



<a name="5.0.0"></a>
# [5.0.0](https://github.com/pact-foundation/pact-js/compare/v4.2.1...v5.0.0) (2017-12-06)


### Bug Fixes

* **amd:** do not name AMD module in UMD [#98](https://github.com/pact-foundation/pact-js/issues/98) ([fced1ab](https://github.com/pact-foundation/pact-js/commit/fced1ab))
* **build:** fix for bash script and output helpful information during projects tests ([192f9e4](https://github.com/pact-foundation/pact-js/commit/192f9e4))
* **examples:** update jasmine karma example with best practice [#122](https://github.com/pact-foundation/pact-js/issues/122) ([93cba30](https://github.com/pact-foundation/pact-js/commit/93cba30))
* **examples:** update mocha karma example with best practice [#122](https://github.com/pact-foundation/pact-js/issues/122) ([a62d00f](https://github.com/pact-foundation/pact-js/commit/a62d00f))
* **src:** fix typo in eachLike error message ([601d158](https://github.com/pact-foundation/pact-js/commit/601d158))
* **tests:** update e2e tests with latest API ([09a9f03](https://github.com/pact-foundation/pact-js/commit/09a9f03))
* **verification:** pass validation error message on [#114](https://github.com/pact-foundation/pact-js/issues/114) ([302357f](https://github.com/pact-foundation/pact-js/commit/302357f))


### Features

* **api:** cleanup public API ([39dfc45](https://github.com/pact-foundation/pact-js/commit/39dfc45))
* **finalise:** warn if finalise called more than once ([bc52810](https://github.com/pact-foundation/pact-js/commit/bc52810))
* **karma:** relax consumer/provider requirement in MockService [#96](https://github.com/pact-foundation/pact-js/issues/96) ([62a9c44](https://github.com/pact-foundation/pact-js/commit/62a9c44))
* **matching:** add a number of common matchers to DSL ([4259171](https://github.com/pact-foundation/pact-js/commit/4259171))
* **pact-node:** upgrade to latest pact-node 5.1.x ([fde380e](https://github.com/pact-foundation/pact-js/commit/fde380e))
* **pact-node:** upgrade to pact-node 5.2.1 ([f9bd4ae](https://github.com/pact-foundation/pact-js/commit/f9bd4ae))
* **pact-server:** allow running mock server on non-local host [#115](https://github.com/pact-foundation/pact-js/issues/115) ([b6866ef](https://github.com/pact-foundation/pact-js/commit/b6866ef))
* **pact-web:** refactor PactWeb module ([95b26c4](https://github.com/pact-foundation/pact-js/commit/95b26c4))
* **release:** update release process to use standard-version ([ae96806](https://github.com/pact-foundation/pact-js/commit/ae96806))
* **types:** reexport Interaction and MockService namespace [#117](https://github.com/pact-foundation/pact-js/issues/117) ([e1b658f](https://github.com/pact-foundation/pact-js/commit/e1b658f))
* **types:** reexport Interaction and MockService namespace into pact-web [#117](https://github.com/pact-foundation/pact-js/issues/117) ([c3cd435](https://github.com/pact-foundation/pact-js/commit/c3cd435))
* **typescript:** add integration pact tests ([3b2279a](https://github.com/pact-foundation/pact-js/commit/3b2279a))
* **typescript:** fix pact-web and karma tests ([91ef75c](https://github.com/pact-foundation/pact-js/commit/91ef75c))
* **typescript:** initial TypeScript setup ([c6e6c3a](https://github.com/pact-foundation/pact-js/commit/c6e6c3a))


### BREAKING CHANGES

* **api:** - Provider verification exposed via a Verifier class
- Matchers exposed through separate sub-module
* **pact-web:** Requires constructor to create now.



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
