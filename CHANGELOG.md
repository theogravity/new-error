## 2.2.0 - Wed Jun 14 2023 12:01:40

**Contributor:** Theo Gravity

- Add `withRequestId()` / `getRequestId()` to `BaseError`

## 2.1.15 - Thu Nov 10 2022 23:14:01

**Contributor:** dependabot[bot]

- Bump minimatch from 3.0.4 to 3.1.2 (#25)

## 2.1.14 - Tue Aug 09 2022 19:41:09

**Contributor:** Theo Gravity

- Update dev deps, export IBaseErrorConfig interface (#24)

This includes the IBaseErrorConfig interface as a mainline export

## 2.1.13 - Fri Jan 28 2022 22:41:55

**Contributor:** Theo Gravity

- Fix onConvert() failing in certain situations (#23)

## 2.1.12 - Fri Oct 29 2021 19:39:32

**Contributor:** dependabot[bot]

- Bump tmpl from 1.0.4 to 1.0.5 (#22)

Bumps [tmpl](https://github.com/daaku/nodejs-tmpl) from 1.0.4 to 1.0.5.
- [Release notes](https://github.com/daaku/nodejs-tmpl/releases)
- [Commits](https://github.com/daaku/nodejs-tmpl/commits/v1.0.5)

---
updated-dependencies:
- dependency-name: tmpl
  dependency-type: indirect
...

Signed-off-by: dependabot[bot] <support@github.com>

Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

## 2.1.11 - Fri Aug 13 2021 03:59:06

**Contributor:** Theo Gravity

- [minor] Add config option to append attached error message to main error message (#21)

Added a `BaseError` config option, `appendWithErrorMessageFormat`, which
will append the attached error message to the main error message. Useful
for testing frameworks like Jest, which will not print the attached message.

## 2.1.10 - Fri May 28 2021 00:34:25

**Contributor:** dependabot[bot]

- Bump browserslist from 4.16.3 to 4.16.6 (#17)

Bumps [browserslist](https://github.com/browserslist/browserslist) from 4.16.3 to 4.16.6.
- [Release notes](https://github.com/browserslist/browserslist/releases)
- [Changelog](https://github.com/browserslist/browserslist/blob/main/CHANGELOG.md)
- [Commits](https://github.com/browserslist/browserslist/compare/4.16.3...4.16.6)

Signed-off-by: dependabot[bot] <support@github.com>

Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

## 2.1.9 - Thu May 13 2021 03:11:48

**Contributor:** dependabot[bot]

- Bump hosted-git-info from 2.8.8 to 2.8.9 (#16)

## 2.1.8 - Sun May 09 2021 20:32:52

**Contributor:** dependabot[bot]

- Bump lodash from 4.17.20 to 4.17.21 (#15)

Bumps [lodash](https://github.com/lodash/lodash) from 4.17.20 to 4.17.21.
- [Release notes](https://github.com/lodash/lodash/releases)
- [Commits](https://github.com/lodash/lodash/compare/4.17.20...4.17.21)

Signed-off-by: dependabot[bot] <support@github.com>

Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Co-authored-by: Theo Gravity <theo@suteki.nu>

## 2.1.7 - Sun May 09 2021 20:30:20

**Contributor:** dependabot[bot]

- Bump handlebars from 4.7.6 to 4.7.7 (#14)

Bumps [handlebars](https://github.com/wycats/handlebars.js) from 4.7.6 to 4.7.7.
- [Release notes](https://github.com/wycats/handlebars.js/releases)
- [Changelog](https://github.com/handlebars-lang/handlebars.js/blob/master/release-notes.md)
- [Commits](https://github.com/wycats/handlebars.js/compare/v4.7.6...v4.7.7)

Signed-off-by: dependabot[bot] <support@github.com>

Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>

## 2.1.6 - Fri Apr 02 2021 20:34:42

**Contributor:** dependabot[bot]

- Bump y18n from 4.0.0 to 4.0.1 (#13)

## 2.1.5 - Sat Mar 20 2021 05:11:00

**Contributor:** Theo Gravity

- Fix `BaseError#setConfig()` not being chainable

It was returning void rather than the instance back. This fixes that.

## 2.1.4 - Fri Mar 19 2021 04:22:07

**Contributor:** Theo Gravity

- Fix typescript intelligence on `ErrorRegistry#withContext()`

The return type of `withContext()` was being inferred as `any` by Typescript. This now appropriately set to return `ErrorRegistry<HLErrors, LLErrors>`.

## 2.1.3 - Fri Mar 19 2021 02:55:37

**Contributor:** Theo Gravity

- Update readme

## 2.1.2 - Fri Mar 19 2021 02:53:03

**Contributor:** Theo Gravity

- Update readme

## 2.1.1 - Fri Mar 19 2021 02:47:52

**Contributor:** Theo Gravity

- Add the ability to create child error registries

You can now create child registries with context via `ErrorRegistry#withContext()` that will create
errors with the predefined context.

The use-case is if your code block throws many errors, and you want to use the same metadata without
setting it each time, so code is not duplicated.

See readme for more information.

## 2.0.2 - Sun Mar 14 2021 22:12:56

**Contributor:** Theo Gravity

- Improve readme for Apollo GraphQL

The instructions for Apollo GraphQL was not correct and has been updated with an internally tested example.

## 2.0.1 - Sun Mar 14 2021 05:42:56

**Contributor:** Theo Gravity

- New major version: v2 (#12)

For most users, this new major version should not break your existing code.

You may have to make adjustments if you happen to use generics in `ErrorRegistry`.

- Potentially breaking: Refactor `ErrorRegistry` generics by removing unused generics and moving the definitions to an interface
- Added the ability to define a `message` in a high level definition. This is used with `ErrorRegistry#newBareError` if no message is defined.
- Made the `message` parameter of `ErrorRegistry#newBareError` optional. See readme for behavior when the parameter is omitted.

## 1.3.1 - Sun Mar 14 2021 03:09:54

**Contributor:** Theo Gravity

- Add the ability to convert an error to another type (#11)

This is useful if you need to convert the errors created by this library into another type, such as a `GraphQLError` when going outbound to the client.

See the README for more details.

## 1.2.10 - Fri Mar 12 2021 02:21:26

**Contributor:** Theo Gravity

- Fix typescript error when using utility helpers with registry and calling newError

## 1.2.9 - Tue Mar 09 2021 22:34:18

**Contributor:** Theo Gravity

- Add helper utilities for registry definitions

Two utility methods have been defined:

- `generateHighLevelErrors()`
- `generateLowLevelErrors()`

See readme for more details.

## 1.2.8 - Tue Mar 09 2021 03:52:59

**Contributor:** Theo Gravity

- Update readme

## 1.2.7 - Tue Mar 09 2021 01:55:52

**Contributor:** Theo Gravity

- Add `ErrorRegistry` config option `onCreateError`

You can now globally modify new errors created from the error registry via the `onCreateError` handler.

## 1.2.6 - Tue Mar 09 2021 00:23:04

**Contributor:** Theo Gravity

- Clean up stack traces

If you are calling `ErrorRegistry#newError` or related functions to create errors, the stack trace includes an `ErrorRegistry` entry. This change removes that entry for easier readability.

## 1.2.5 - Mon Mar 08 2021 22:54:45

**Contributor:** Theo Gravity

- Fix bug where specifying something other than an array for toJSON/toJSONSafe throws

## 1.2.4 - Mon Mar 08 2021 22:05:16

**Contributor:** Theo Gravity

- Update readme

Fix handler example, add config usage

## 1.2.3 - Mon Mar 08 2021 21:59:38

**Contributor:** Theo Gravity

- Add toJSON / toJSONSafe post-processing handler options (#10)

You can now perform post-processing on serialized data via `onPreToJSONData` / `onPreToJSONDataSafe` options. See readme for more details.

## 1.2.2 - Mon Mar 08 2021 21:06:07

**Contributor:** Theo Gravity

- Add option to not include empty metadata on serialization (#9)

This adds `omitEmptyMetadata` to the `BaseError` configuration.

## 1.2.1 - Mon Mar 08 2021 20:33:41

**Contributor:** Theo Gravity

- Add configuration options for ErrorRegistry / BaseError (#8)

New configuration options have been added to the ErrorRegistry and BaseError. See readme for more details.

## 1.1.2 - Mon Sep 21 2020 04:13:44

**Contributor:** Theo Gravity

- Fix README.md

## 1.1.1 - Mon Sep 21 2020 03:57:31

**Contributor:** Theo Gravity

- Add deserialization support (#7)
- Include `logLevel` as part of `toJSON()`
- Fix interface definitions and examples

Please read the README section on the limitations and security issues relating to deserialization.

## 1.0.13 - Sat Jun 20 2020 03:22:14

**Contributor:** Theo Gravity

- Add support for defining log levels
    
This adds the `logLevel` property to the error definitions along with
corresponding `getLogLevel()` and `withLogLevel()` methods.

There are cases where certain errors do not warrant being logged
under an `error` log level when combined with a logging system.

## 1.0.12 - Wed Jun 03 2020 03:54:55

**Contributor:** Theo Gravity

- Update README.md

Fix npm badge from http->https to fix render issues on the npm page

## 1.0.11 - Sun May 17 2020 22:42:30

**Contributor:** Theo Gravity

- Add `withErrorId()`, `getErrorId()` methods

These methods were added to help cross-refeference an error between systems. The readme has been updated with usage and an example on a best-practice situation.

## 1.0.10 - Sun May 17 2020 21:02:32

**Contributor:** Theo Gravity

- Add new methods and documentation (#4)

Added:

- `BaseError#getErrorType()`
- `BaseError#getErrorName()`

## 1.0.9 - Sat May 16 2020 00:39:12

**Contributor:** Theo Gravity

- Add missing methods to `IBaseError` (#3)

## 1.0.8 - Sat May 16 2020 00:20:35

**Contributor:** Theo Gravity

- Update readme with more examples

## 1.0.7 - Sat May 16 2020 00:05:10

**Contributor:** Theo Gravity

- Update readme with use-cases

## 1.0.6 - Fri May 15 2020 23:34:12

**Contributor:** Theo Gravity

- [minor] Concrete class-based support (#1)

- Added examples on how to work with the library without the registry
- Updated and exported some interfaces to assist with class-based creation

## 1.0.5 - Fri May 15 2020 20:57:38

**Contributor:** Theo Gravity

- Add getters / more examples / improved docs

## 1.0.4 - Fri May 15 2020 19:37:42

**Contributor:** Theo Gravity

- CI fixes.

## 1.0.3 - Fri May 15 2020 19:28:29

**Contributor:** Theo Gravity

- First version

