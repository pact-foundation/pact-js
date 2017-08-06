# Changelog

Do this to generate your change history

    git log --pretty=format:'* [%h](https://github.com/pact-foundation/pact-js/commit/%h) - %s (%an, %ad)' vX.Y.Z..HEAD | egrep -v "wip(:|\()" | grep -v "docs(" | grep -v "chore(" | grep -v Merge | grep -v "test("

### v2.6.0

* [844bdfd](https://github.com/pact-foundation/pact-js/commit/844bdfd) - chore(build): allow all minor version upgrades to Pact Node (Matt Fellows, Thu Jun 1 14:10:35 2017 +1000)

### v2.5.0

* [f11f0eb](https://github.com/pact-foundation/pact-js/commit/f11f0eb) - Wait for removeInteractions() on verify() (Voon Siong Wong, Mon May 15 12:04:58 2017 +1000)

### 2.4.1

* [6b32990](https://github.com/pact-foundation/pact-js/commit/6b32990) - feat(writemode): update pactFileWriteMode flag and docs (Matt Fellows, Fri May 12 10:40:27 2017 +1000)
* [cc44554](https://github.com/pact-foundation/pact-js/commit/cc44554) - fix(providerstate): make providerState serialisation spec compliant #12 (Matt Fellows, Thu May 11 20:51:51 2017 +1000)
* [da92274](https://github.com/pact-foundation/pact-js/commit/da92274) - feat(mock service): add pactfile_write_mode option handling (Narazaka, Tue May 9 18:56:56 2017 +0900)
* [592b9db](https://github.com/pact-foundation/pact-js/commit/592b9db) - feat(verifications): update example to publish verification results (Matt Fellows, Tue May 9 17:06:30 2017 +1000)

### 2.3.3

* [8eeb561](https://github.com/pact-foundation/pact-js/commit/8eeb561) - feat(typescript): add TypeScript annotations (Narazaka, Wed Apr 19 20:37:01 2017 +0900)

### 2.3.2

* [c729d8e](https://github.com/pact-foundation/pact-js/commit/c729d8e) - feat(port-check): check if port is available during setup() #37 (Matt Fellows, Sun Apr 16 12:10:19 2017 +1000)

### 2.3.1

* [a617b03](https://github.com/pact-foundation/pact-js/commit/a617b03) - Pass cors option to pact-node (Jeff Chen, Mon Mar 27 18:58:41 2017 -0700)

### 2.2.0

* [c54d224](https://github.com/pact-foundation/pact-js/commit/c54d224) - feat(ssl): add ability to specify custom ssl key + cert #29 (Matt Fellows, Tue Feb 28 08:10:26 2017 +1100)

### 2.1.0

* [4d0901e](https://github.com/pact-foundation/pact-js/commit/4d0901e) - feat(verify): update to latest pact-node including ability to set verification timeout #28 (Matt Fellows, Mon Feb 27 18:33:00 2017 +1100)

### 2.0.0

* [ef27b7c](https://github.com/pact-foundation/pact-js/commit/ef27b7c) - feat(karma): update code formatting (Matt Fellows, Sun Feb 19 21:27:42 2017 +1100)
* [7182c7b](https://github.com/pact-foundation/pact-js/commit/7182c7b) - feat(karma): update tests for karma suite and adapted Pact API for Karma (Matt Fellows, Sun Feb 19 21:10:33 2017 +1100)
* [a06a14d](https://github.com/pact-foundation/pact-js/commit/a06a14d) - fix(api): remove redundant responseParser and tests (Matt Fellows, Sun Feb 19 12:45:48 2017 +1100)
* [67482d1](https://github.com/pact-foundation/pact-js/commit/67482d1) - feat(api): redesign API to make it simpler to interact with (Matt Fellows, Tue Jan 24 08:57:17 2017 +1100)
* [898203a](https://github.com/pact-foundation/pact-js/commit/898203a) - feat(examples): update e2e provider test to use mocha interface (Matt Fellows, Thu Jan 19 14:22:12 2017 +1100)

### v1.0.0 and earlier

Initial implementation!
