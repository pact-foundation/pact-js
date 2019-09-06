# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
