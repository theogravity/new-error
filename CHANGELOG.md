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

