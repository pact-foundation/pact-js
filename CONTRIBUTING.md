# Contributing

## Raising issues

Before raising an issue, make sure you have checked the open and closed issues to see if an answer is provided there.
There may also be an answer to your question on [stackoverflow].

Please provide the following information with your issue to enable us to respond as quickly as possible.

- The relevant versions of the packages you are using.
- The steps to recreate your issue.
- An executable code example where possible. You can fork this repository and use one of the [examples] to quickly recreate your issue.

## Contributing features

Hey, that's awesome you want to help! If you're not sure where to start, look for the [help wanted](https://github.com/pact-foundation/pact-js/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)
label in our issue tracker. If you have an idea that you think would be great, come and chat to us on [slack] in the `#pact-js` channel.

## Commit messages

Pact JS uses the [Conventional Changelog](https://github.com/bcoe/conventional-changelog-standard/blob/master/convention.md)
commit message conventions. Please ensure you follow the guidelines, we don't want to _be that person_, but the commit messages
are very important to the automation of our release process.

Take a look at the git history (`git log`) to get the gist of it.

If you'd like to get some CLI assistance, getting setup is easy:

```shell
npm install commitizen -g
npm i -g cz-conventional-changelog
```

`git cz` to commit and commitizen will guide you.

## Code style and formatting

We use [Prettier](https://prettier.io/) for formatting, and for linting we use [TSLint](https://palantir.github.io/tslint/) (for TypeScript).

Please update your editor to enable Prettier, and things should be easy 👌. If not, our lint step will catch it.

## Pull requests

- Write tests for any changes
- Follow existing code style and conventions
- Separate unrelated changes into multiple pull requests
- For bigger changes, make sure you start a discussion first by creating an issue and explaining the intended change

[stackoverflow]: https://stackoverflow.com/questions/tagged/pact
[examples]: https://github.com/pact-foundation/pact-js/tree/master/examples
[slack]: https://slack.pact.io
