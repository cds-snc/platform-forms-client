# Summary | Résumé

1-3 sentence description of the changed you're proposing.
Please include the GitHub issue number or relevant acceptance criteria.

To specify that this PR closes a particular issue you can use the following format
to reference and issue `closes #[issue number]`. You can use any number of keywords to link
an issue to a PR. Please see the [following section](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)
of GitHub's documentation.

For any UI changes please include screenshots at different breakpoints. It would also be helpful to include a
before and after comparison for each change i.e.

| Before                                          | After                                        |
| ----------------------------------------------- | -------------------------------------------- |
| Insert Image showing before the change was made | Insert Image showing after a change was made |

# Test instructions | Instructions pour tester la modification

Sequential steps (1., 2., 3., ...) that describe how to test this change. You should include
anything outside the README that will help the developer access your changes and be able to test
them such as any environmental setup steps and/or any time-based elements that this requires.
This will help a developer test things out without too much detective work.

# Unresolved questions / Out of scope | Questions non résolues ou hors sujet

Are there any related issues or tangent features you consider out of scope for
this issue that could be addressed in the future? If so please create issues and provide
links in this section

# Pull Request Checklist

Please complete the following items in the checklist before you request a review:

- [ ] Have you completely tested the functionality of change introduced in this PR? Is the PR solving the problem it's meant to solve within the scope of the related issue?
- [ ] The PR does not introduce any new issues such as failed tests, console warnings or new bugs.
- [ ] If this PR adds a package have you ensured its licensed correctly and does not add additional security issues?
- [ ] Is the code clean, readable and maintainable? Is it easy to understand and comprehend.
- [ ] Have you removed unnecessary lines such as `console.log` statements?
- [ ] Does your code have adequate comprehensible comments? Do new functions have [docstrings](https://tsdoc.org/)?
- [ ] Have you modified the change log and updated any relevant documentation?
- [ ] Is there adequate test coverage? Both unit tests and end-to-end tests where applicable?
- [ ] If your PR is touching any UI is it accessible? Have you tested it with a screen reader? Have you tested it with automated testing tools such as axe?
