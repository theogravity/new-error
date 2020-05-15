# error-bearer

[![NPM version](http://img.shields.io/npm/v/objection-generator.svg?style=flat-square)](https://www.npmjs.com/package/objection-generator)
[![CircleCI](https://circleci.com/gh/theogravity/objection-generator.svg?style=svg)](https://circleci.com/gh/theogravity/objection-generator) 
![built with typescript](https://camo.githubusercontent.com/92e9f7b1209bab9e3e9cd8cdf62f072a624da461/68747470733a2f2f666c61742e62616467656e2e6e65742f62616467652f4275696c74253230576974682f547970655363726970742f626c7565) 
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

A production-grade error creation library designed for Typescript. Useful for direct printing
of errors to a client or for internal development / logs.

- All created errors extend `Error` with additional methods added on.
- Create your own custom error types with custom messaging, status codes and metadata.
- Attach an error to your error object to get the full error chain.
- Selectively expose error metadata based on internal or external use.
- Built-in auto-completion for Typescript when searching for registered error types.
- 100% test coverage

![Generating an error with autocompletion](/autocomplete.jpg?raw=true "Title")

# Table of Contents 

<!-- TOC -->
- [Sample output](#sample-output)
- [Installation](#installation)
- [Initialization](#initialization)
- [Error Registry](#error-registry)
  - [Creating errors](#creating-errors)
    - [Create a well-defined error](#create-a-well-defined-error)
    - [Create an error without a low-level error](#create-an-error-without-a-low-level-error)
  - [Instance comparison / `instanceOf` usage](#instance-comparison--instanceof-usage)
- [Error manipulation](#error-manipulation)
  - [Attaching errors](#attaching-errors)
  - [Format messages](#format-messages)
  - [Adding metadata](#adding-metadata)
    - [Safe metadata](#safe-metadata)
    - [Internal metadata](#internal-metadata)
- [Serializing errors](#serializing-errors)
  - [Safe serialization](#safe-serialization)
  - [Internal serialization](#internal-serialization)

<!-- TOC END -->

# Sample output

Certain fields will be omitted depending on the serialization method used. This is the output of the
`toJSON()` method of a custom error.

```
{
  name: 'InternalServerError',
  message: 'There was a database failure, SQL err code %s',
  code: 'DATABASE_FAILURE',
  statusCode: 500,
  meta: {},
  causedBy: undefined,
  stack: 'InternalServerError: There was a database failure, SQL err code %s\n' +
    '    at ErrorRegistry.newError (src/ErrorRegistry.ts:128:12)\n' +
    '    at Object.<anonymous> (src/test.ts:44:25)\n' +
    '    at Module._compile (internal/modules/cjs/loader.js:1158:30)\n' +
    '    at Module._compile (node_modules/source-map-support/source-map-support.js:541:25)\n' +
    '    at Module.m._compile (/private/var/folders/mx/b54hc2lj3fbfsndkv4xmz8d80000gn/T/ts-node-dev-hook-4199054745399178.js:57:25)\n' +
    '    at Module._extensions..js (internal/modules/cjs/loader.js:1178:10)\n' +
    '    at require.extensions.<computed> (/private/var/folders/mx/b54hc2lj3fbfsndkv4xmz8d80000gn/T/ts-node-dev-hook-4199054745399178.js:59:14)\n' +
    '    at Object.nodeDevHook [as .ts] (node_modules/ts-node-dev/lib/hook.js:61:7)\n' +
    '    at Module.load (internal/modules/cjs/loader.js:1002:32)\n' +
    '    at Function.Module._load (internal/modules/cjs/loader.js:901:14)'
}
```

# Installation

`$ npm i error-bearer --save`

# Initialization

- Define a set of high level errors
  * Common high level error types could be 4xx/5xx HTTP codes
- Define a set of low level errors
  * Think of low level errors as a fine-grained sub-code/category to a high level error
- Initialize the error registry with the errors

```typescript
import { ErrorRegistry } from './ErrorRegistry'

// Define high level errors
// Do *not* assign a Typescript type to the object
// or IDE autocompletion will not work!
const errors = {
  INTERNAL_SERVER_ERROR: {
   /**
    * The class name of the generated error
    */
    className: 'InternalServerError',
   /**
    * (optional) Protocol-specific status code, such as an HTTP status code. Used as the
    * default if a Low Level Error status code is not specified or defined.
    */
    statusCode: 500
  }
}

// Define low-level errors
// Do *not* assign a Typescript type to the object
// or IDE autocompletion will not work!
const errorCodes = {
  DATABASE_FAILURE: {
    /**
     * Full description of the error. sprintf() flags can be applied
     * to customize it.
     * @see https://www.npmjs.com/package/sprintf-js
     */
    message: 'There was a database failure, SQL err code %s',
  
    /**
     * (optional) Protocol-specific status code, such as an HTTP status code.
     */
    statusCode: 500
  }
}

// Create the error registry by registering your errors and codes
// you will generally want to memoize this as you will be using the
// reference throughout your application
const errRegistry = new ErrorRegistry(errors, errorCodes)

// Create an instance of InternalServerError
// No need to do errRegistry.newError(errorCodes.DATABASE_FAILURE, ..)
// as Typescript autocomplete should show the available definitions
const err = errRegistry.newError('INTERNAL_SERVER_ERROR', 'DATABASE_FAILURE')
```

# Error Registry

The `ErrorRegistry` is responsible for the registration and creation of errors.

## Creating errors

Errors generated by the registry extends `BaseError`.

### Create a well-defined error

Method: `ErrorRegistry#newError(highLevelErrorName, LowLevelErrorName)`

This is the method you should generally use as you are forced to use your
well-defined high and low level error definitions. This allows for consistency
in how errors are defined and thrown.

```typescript
// Creates an InternalServerError error with a DATABASE_FAILURE code and corresponding
// message and status code
const err = errRegistry.newError('INTERNAL_SERVER_ERROR', 'DATABASE_FAILURE')
```

### Create an error without a low-level error

Method: `ErrorRegistry#newBareError(highLevelErrorName, message)`

This method does not include a low level error code, and allows direct specification of an
error message.

```typescript
// Creates an InternalServerError error with a custom message
const err = errRegistry.newBareError('INTERNAL_SERVER_ERROR', 'An internal server error has occured.')
```

## Instance comparison / `instanceOf` usage

Method: `ErrorRegistry#instanceOf(classInstance, highLevelErrorName)`

Performs an `instanceof` operation against a custom error.

```typescript
// creates an InternalServerError error instance
const err = errRegistry.newError('INTERNAL_SERVER_ERROR', 'DATABASE_FAILURE')

if (errRegistry.instanceOf(err, 'INTERNAL_SERVER_ERROR')) {
  // resolves to true since err is an InternalServerError instance
}
```

# Error manipulation

Except for the serialization methods, all methods are chainable.

## Attaching errors

Method: `BaseError#causedBy(err)`

You can attach another error to the error.

```typescript
const externalError = new Error('Some thrown error')
err.causedBy(externalError)
```

## Format messages

Method: `BaseError#formatMessage(...formatParams)`

See the [`sprintf-js`](https://www.npmjs.com/package/sprintf-js) package for usage.

```typescript
// specify the database specific error code
// Transforms the message to:
// 'There was a database failure, SQL err code %s' ->
// 'There was a database failure, SQL err code SQL_ERR_1234',
err.formatMessage('SQL_ERR_1234')
```

## Adding metadata

### Safe metadata

Method: `BaseError#withSafeMetadata(data = {})`

Safe metadata would be any kind of data that you would be ok with exposing to a client, like an
HTTP response.

```typescript
err.withSafeMetadata({
  errorId: 'err-12345'
})
// can be chained to append more data
.withSafeMetadata({
  requestId: 'req-12345'
})
```

### Internal metadata

Method: `BaseError#withMetadata(data = {})`

Internal metadata would be any kind of data that you would *not be* ok with exposing to a client,
but would be useful for internal development / logging purposes.

```typescript
err.withMetadata({
  email: 'test@test.com'
})
// can be chained to append more data
.withMetadata({
  userId: 'user-abcd'
})
```

# Serializing errors

## Safe serialization

Method: `BaseError#toJSONSafe(fieldsToOmit = [])`

Generates output that would be safe for client consumption.

- Omits the message
- Omits the stack trace
- Omits `causedBy`
- Omits any data defined via `BaseError#withMetadata()`

```typescript
err.withSafeMetadata({
  errorId: 'err-12345',
  requestId: 'req-12345'
})
//.toJSONSafe(['code']) removes the code field from output
.toJSONSafe()
```

Produces:

```
{
  name: 'InternalServerError',
  code: 'DATABASE_FAILURE',
  statusCode: 500,
  meta: { errorId: 'err-12345', requestId: 'req-12345' }
}
```

## Internal serialization

Method: `BaseError#toJSON(fieldsToOmit = [])`

Generates output that would be suitable for internal use.

- Includes the message
- Includes the stack trace
- Includes `causedBy`
- All data from `BaseError#withMetadata()` and `BaseError#withJSONMetadata()` is included

```typescript
err.withSafeMetadata({
  errorId: 'err-12345',
}).withMetadata({
  email: 'test@test.com'
})
//.toJSON(['code', 'statusCode']) removes the code and statusCode field from output
.toJSON()
```

Produces:

```
{
  name: 'InternalServerError',
  message: 'There was a database failure, SQL err code %s',
  code: 'DATABASE_FAILURE',
  statusCode: 500,
  meta: { email: 'test@test.com', errorId: 'err-12345' },
  causedBy: undefined,
  stack: 'InternalServerError: There was a database failure, SQL err code %s\n' +
    '    at ErrorRegistry.newError (src/ErrorRegistry.ts:128:12)\n' +
    '    at Object.<anonymous> (src/test.ts:44:25)\n' +
    '    at Module._compile (internal/modules/cjs/loader.js:1158:30)\n' +
    '    at Module._compile (node_modules/source-map-support/source-map-support.js:541:25)\n' +
    '    at Module.m._compile (/private/var/folders/mx/b54hc2lj3fbfsndkv4xmz8d80000gn/T/ts-node-dev-hook-6915061366025617.js:57:25)\n' +
    '    at Module._extensions..js (internal/modules/cjs/loader.js:1178:10)\n' +
    '    at require.extensions.<computed> (/private/var/folders/mx/b54hc2lj3fbfsndkv4xmz8d80000gn/T/ts-node-dev-hook-6915061366025617.js:59:14)\n' +
    '    at Object.nodeDevHook [as .ts] (node_modules/ts-node-dev/lib/hook.js:61:7)\n' +
    '    at Module.load (internal/modules/cjs/loader.js:1002:32)\n' +
    '    at Function.Module._load (internal/modules/cjs/loader.js:901:14)'
}
```
