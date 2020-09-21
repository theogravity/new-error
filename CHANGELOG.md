## 1.1.1 - Mon Sep 21 2020 03:57:31

**Contributor:** Theo Gravity

- Add deserialization support (#7)

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

