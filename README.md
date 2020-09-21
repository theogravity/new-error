# new-error

[![NPM version](https://img.shields.io/npm/v/new-error.svg?style=flat-square)](https://www.npmjs.com/package/new-error)
[![CircleCI](https://circleci.com/gh/theogravity/new-error.svg?style=svg)](https://circleci.com/gh/theogravity/new-error) 
![built with typescript](https://camo.githubusercontent.com/92e9f7b1209bab9e3e9cd8cdf62f072a624da461/68747470733a2f2f666c61742e62616467656e2e6e65742f62616467652f4275696c74253230576974682f547970655363726970742f626c7565) 
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

A production-grade error creation library designed for Typescript. Useful for direct printing
of errors to a client or for internal development / logs.

- All created errors extend `Error` with additional methods added on.
- Show errors that are safe for client / user-consumption vs internal only.
- Create your own custom error types with custom messaging, status codes and metadata.
  * Errors can be created via a registry (recommended), or you can create your own error classes.
- Attach an error to your error object to get the full error chain.
- Selectively expose error metadata based on internal or external use.
- Built-in auto-completion for Typescript when searching for registered error types.
- 100% test coverage

![Generating an error with autocompletion](/autocomplete.jpg?raw=true "Title")

# Table of Contents 

<!-- TOC -->

- [Motivation / Error handling use-cases](#motivation--error-handling-use-cases)
- [Installation](#installation)
- [Examples](#examples)
  - [With the error registry](#with-the-error-registry)
  - [Class-based with low level errors without a registry](#class-based-with-low-level-errors-without-a-registry)
  - [Bare-bones class-based error](#bare-bones-class-based-error)
- [Example Express Integration](#example-express-integration)
- [Working with log levels](#working-with-log-levels)
- [Error Registry API](#error-registry-api)
  - [Creating errors](#creating-errors)
    - [Create a well-defined error](#create-a-well-defined-error)
    - [Create an error without a low-level error](#create-an-error-without-a-low-level-error)
  - [`instanceOf` / comparisons](#instanceof--comparisons)
    - [Comparing a custom error](#comparing-a-custom-error)
    - [Native `instanceof`](#native-instanceof)
- [Error API](#error-api)
  - [Getters](#getters)
  - [Basic setters](#basic-setters)
  - [Static methods](#static-methods)
  - [Set an error id](#set-an-error-id)
  - [Attaching errors](#attaching-errors)
  - [Format messages](#format-messages)
  - [Adding metadata](#adding-metadata)
    - [Safe metadata](#safe-metadata)
    - [Internal metadata](#internal-metadata)
  - [Serializing errors](#serializing-errors)
    - [Safe serialization](#safe-serialization)
    - [Internal serialization](#internal-serialization)
- [Deserialization](#deserialization)
  - [Issues with deserialization](#issues-with-deserialization)
    - [Deserialization is not perfect](#deserialization-is-not-perfect)
    - [potential security issues with deserialization:](#potential-security-issues-with-deserialization)
  - [`ErrorRegistry#fromJSON()` method](#errorregistryfromjson-method)
  - [`static BaseError#fromJSON()` method](#static-baseerrorfromjson-method)
  - [Stand-alone instance-based deserialization](#stand-alone-instance-based-deserialization)

<!-- TOC END -->

# Motivation / Error handling use-cases

The basic Javascript `Error` type is extremely bare bones - you can only specify a message.

In a production-level application, I've experienced the following use-cases:

- A developer should be able to add metadata to the error that may assist with troubleshooting.
- A developer should be able to reference the original error.
- Errors should be able to work with a logging framework.
- Errors should be well-formed / have a defined structure that can be consumed / emitted for analytics and services.
- Errors should be able to be cross-referenced in various systems via an identifier / error id.
- Errors should not expose sensitive data to the end-user / client.
- Errors that are exposed to the end-user / client should not reveal data that would expose system internals.
- Error responses from an API service should follow a common format.
- End-users / clients should be able to relay the error back to support; the relayed data should be enough for a developer to troubleshoot.
- Client developers prefer a list of error codes to expect from an API service so they can properly handle errors.

`new-error` was built with these use-cases in mind.

# Installation

`$ npm i new-error --save`

# Examples

- Define a set of high level errors
  * Common high level error types could be 4xx/5xx HTTP codes
- Define a set of low level errors
  * Think of low level errors as a fine-grained sub-code/category to a high level error
- Initialize the error registry with the errors

## With the error registry

The error registry is the fastest way to define and create errors.

```typescript
// This is a working example
import { ErrorRegistry } from 'new-error'

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
     * A user-friendly code to show to a client.
     */
    code: 'ERR_INT_500',
   /**
    * (optional) Protocol-specific status code, such as an HTTP status code. Used as the
    * default if a Low Level Error status code is not defined.
    */
    statusCode: 500,
    /**
     * (optional) Log level string / number to associate with this error.
     * Useful if you want to use your logging system to log the error but
     * assign a different log level for it. Used as the default if a
     * Low Level log level is not defined.
     */
    logLevel: 'error'
  }
}

// Define low-level errors
// Do *not* assign a Typescript type to the object
// or IDE autocompletion will not work!
const errorCodes = {
  // 'type' of error
  DATABASE_FAILURE: {
    /**
     * Full description of the error. sprintf() flags can be applied
     * to customize it.
     * @see https://www.npmjs.com/package/sprintf-js
     */
    message: 'There was a database failure, SQL err code %s',
    /**
     * (optional) A user-friendly code to show to a client.
     */
    subCode: 'DB_0001',
    /**
     * (optional) Protocol-specific status code, such as an HTTP status code.
     */
    statusCode: 500,
    /**
     * (optional) Log level string / number to associate with this error.
     * Useful if you want to use your logging system to log the error but
     * assign a different log level for it.
     */
    logLevel: 'error'
  }
}

// Create the error registry by registering your errors and codes
// you will want to memoize this as you will be using the
// reference throughout your application
const errRegistry = new ErrorRegistry(errors, errorCodes)

// Create an instance of InternalServerError
// Typescript autocomplete should show the available definitions as you type the error names
// and type check will ensure that the values are valid
const err = errRegistry.newError('INTERNAL_SERVER_ERROR', 'DATABASE_FAILURE')
  .setErrorId('err-1234')
  .formatMessage('SQL_1234')

console.log(err.toJSON())
```

Produces:

(You can omit fields you do not need - see usage section below.)

```
{
  errId: 'err-1234',
  name: 'InternalServerError',
  code: 'ERR_INT_500',
  message: 'There was a database failure, SQL err code SQL_1234',
  type: 'DATABASE_FAILURE',
  subCode: 'DB_0001',
  statusCode: 500,
  meta: {},
  stack: 'InternalServerError: There was a database failure, SQL err code %s\n' +
    '    at ErrorRegistry.newError (new-error/src/ErrorRegistry.ts:128:12)\n' +
    '    at Object.<anonymous> (new-error/src/test.ts:55:25)\n' +
    '    at Module._compile (internal/modules/cjs/loader.js:1158:30)\n' +
    '    at Module._compile (new-error/node_modules/source-map-support/source-map-support.js:541:25)\n' +
    '    at Module.m._compile (/private/var/folders/mx/b54hc2lj3fbfsndkv4xmz8d80000gn/T/ts-node-dev-hook-20649714243977457.js:57:25)\n' +
    '    at Module._extensions..js (internal/modules/cjs/loader.js:1178:10)\n' +
    '    at require.extensions.<computed> (/private/var/folders/mx/b54hc2lj3fbfsndkv4xmz8d80000gn/T/ts-node-dev-hook-20649714243977457.js:59:14)\n' +
    '    at Object.nodeDevHook [as .ts] (new-error/node_modules/ts-node-dev/lib/hook.js:61:7)\n' +
    '    at Module.load (internal/modules/cjs/loader.js:1002:32)\n' +
    '    at Function.Module._load (internal/modules/cjs/loader.js:901:14)'
}
```

## Class-based with low level errors without a registry

You can create concrete error classes by extending the `BaseRegistryError` class, which
extends the `BaseError` class.

The registry example can be also written as:

```typescript
import { BaseRegistryError, LowLevelError } from 'new-error'

class InternalServerError extends BaseRegistryError {
  constructor (errDef: LowLevelError) {
    super({
      code: 'ERR_INT_500',
      statusCode: 500
    }, errDef)
  }
}

const err = new InternalServerError({
  type: 'DATABASE_FAILURE',
  message: 'There was a database failure, SQL err code %s',
  subCode: 'DB_0001',
  statusCode: 500,
  logLevel: 'error'
})

console.log(err.formatMessage('SQL_1234').toJSON())
```

## Bare-bones class-based error

If you want a native-style `Error`, you can use `BaseError`.

The registry example can be written as:

```typescript
import { BaseError } from 'new-error'

class InternalServerError extends BaseError {}

const err = new InternalServerError('There was a database failure, SQL err code %s')
  // calling these methods are optional
  .withErrorType('DATABASE_FAILURE')
  .withErrorCode('ERR_INT_500')
  .withErrorSubCode('DB_0001')
  .withStatusCode(500)
  .withLogLevel('error')

console.log(err.formatMessage('SQL_1234').toJSON())
```

# Example Express Integration

```typescript
import express from 'express'
import { ErrorRegistry, BaseError } from 'new-error'
const app = express()
const port = 3000

const errors = {
  INTERNAL_SERVER_ERROR: {
    className: 'InternalServerError',
    code: 'ERR_INT_500',
    statusCode: 500
  }
}

const errorCodes = {
  DATABASE_FAILURE: {
    message: 'There was a database failure.',
    subCode: 'DB_0001',
    statusCode: 500
  }
}

const errRegistry = new ErrorRegistry(errors, errorCodes)

// middleware definition
app.get('/', async (req, res, next) => {
  try {
    // simulate a failure
    throw new Error('SQL issue')
  } catch (e) {
    const err = errRegistry.newError('INTERNAL_SERVER_ERROR', 'DATABASE_FAILURE')
    err.causedBy(err)
    // errors must be passed to next()
    // to be caught when using an async middleware
    return next(err)
  }
})

// catch errors
app.use((err, req, res, next) => {
  // error was sent from middleware
  if (err) {
    // check if the error is a generated one
    if (err instanceof BaseError) {
      // generate an error id
      // you'll want to use a library like 'nanoid' instead
      // this is just an example
      err.withErrorId(Math.random().toString(36).slice(2))

      // log the error
      // the "null, 2" options formats the error into a readable structure
      console.error(JSON.stringify(err.toJSON(), null, 2))

      // get the status code, if the status code is not defined, default to 500
      res.status(err.getStatusCode() ?? 500)
      // spit out the error to the client
      return res.json({
        err: err.toJSONSafe()
      })
    }
 
    // You'll need to modify code below to best fit your use-case
    // err.message could potentially expose system internals
    return res.json({
      err: {
        message: err.message
      }
    })
  }

  // no error, proceed
  next()
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
```

If you visit `http://localhost:3000`, you'll get a 500 status code, and the following response:

```
{"err": {"errId": "xd0v1szkziq", code":"ERR_INT_500","subCode":"DB_0001","statusCode":500,"meta":{}}}
```

# Working with log levels

You might want to use a different log level when logging common errors, such as validation errors.

```typescript
import { ErrorRegistry } from 'new-error'

const errors = {
  VALIDATION_ERROR: {
    className: 'ValidationError',
    code: 'VALIDATION_ERROR',
    statusCode: 400,
    // probably don't want to log every validation error
    // in production since these errors tend to happen frequently
    // and would pollute the logs
    logLevel: 'debug'
  }
}

const errorCodes = {
  MISSING_FORM_FIELDS: {
    message: 'Form submission data is missing fields',
    subCode: 'MISSING_FORM_FIELDS',
    statusCode: 400
  }
}

const errRegistry = new ErrorRegistry(errors, errorCodes)

// some part of the application throws the error
const err = errRegistry.newError('VALIDATION_ERROR', 'MISSING_FORM_FIELDS')

// another part of the application catches the error
if (err.getLogLevel() === 'debug') {
  console.debug(JSON.stringify(err.toJSON(), null, 2))
} else {
  console.error(JSON.stringify(err.toJSON(), null, 2))
}
```

# Error Registry API

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

## `instanceOf` / comparisons

### Comparing a custom error

Method: `ErrorRegistry#instanceOf(classInstance, highLevelErrorName)`

Performs an `instanceof` operation against a custom error.

```typescript
// creates an InternalServerError error instance
const err = errRegistry.newError('INTERNAL_SERVER_ERROR', 'DATABASE_FAILURE')

if (errRegistry.instanceOf(err, 'INTERNAL_SERVER_ERROR')) {
  // resolves to true since err is an InternalServerError instance
}
```

### Native `instanceof`

You can also check if the error is custom-built using this check:

```typescript
import { BaseError } from 'new-error'

function handleError(err) {
  if (err instanceof BaseError) {
    // err is a custom error
  }
}
```

# Error API

Except for the getter and serialization methods, all other methods are chainable.

Generated errors extend the `BaseError` class, which supplies the manipulation methods.

## Getters

- `BaseError#getErrorId()`
- `BaseError#getErrorName()`
- `BaseError#getCode()`
- `BaseError#getErrorType()`
- `BaseError#getSubCode()`
- `BaseError#getStatusCode()`
- `BaseError#getCausedBy()`
- `BaseError#getMetadata()`
- `BaseError#getSafeMetadata()`
- `BaseError#getLogLevel()`

## Basic setters

If you use the registry, you should not need to us these setters as the registry
sets the values already.

- `BaseError#withErrorType(type: string): this`
- `BaseError#withErrorCode(code: string | number): this`
- `BaseError#withErrorSubCode(code: string | number): this`
- `BaseError#withLogLevel(level: string | number): this`

## Static methods

- `static BaseError#fromJSON(data: object, options?: object): BaseError`

## Set an error id

Method: `BaseError#withErrorId(errId: string)`

Attaches an id to the error. Useful if you want to display an error id to a client / end-user
and want to cross-reference that id in an internal logging system for easier troubleshooting.

For example, you might want to use [`nanoid`](https://github.com/ai/nanoid) to generate ids for errors.

```typescript
import { nanoid } from 'nanoid'

err.withErrorId(nanoid())

// In your logging system, log the error, which will include the error id
logger.error(err.toJSON())

// expose the error to the client via err.toJSONSafe() or err.getErrorId(), which 
// will also include the error id - an end-user can reference this id to 
// support for troubleshooting
```

## Attaching errors

Method: `BaseError#causedBy(err: any)`

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
  errorId: 'err-12345',
  moreData: 1234
})
// can be chained to append more data
.withSafeMetadata({
  requestId: 'req-12345'
})
```

This can also be written as:

```typescript
err.withSafeMetadata({
  errorId: 'err-12345',
  moreData: 1234
})

// This will append requestId to the metadata
err.withSafeMetadata({
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

## Serializing errors

### Safe serialization

Method: `BaseError#toJSONSafe(fieldsToOmit = [])`

Generates output that would be safe for client consumption.

- Omits `name`
- Omits `message`
- Omits `causedBy`
- Omits `type`
- Omits `logLevel`
- Omits the stack trace
- Omits any data defined via `BaseError#withMetadata()`

```typescript
err.withSafeMetadata({
  requestId: 'req-12345'
})
// you can remove additional fields by specifying property names in an array
//.toJSONSafe(['code']) removes the code field from output
.toJSONSafe()
```

Produces:

```
{
  code: 'ERR_INT_500',
  subCode: 'DB_0001',
  statusCode: 500,
  meta: { requestId: 'req-12345' }
}
```

### Internal serialization

Method: `BaseError#toJSON(fieldsToOmit = [])`

Generates output that would be suitable for internal use.

- Includes `name`
- Includes `type`
- Includes `message`
- Includes `causedBy`
- Includes the stack trace
- All data from `BaseError#withMetadata()` and `BaseError#withSafeMetadata()` is included

```typescript
err.withSafeMetadata({
  reqId: 'req-12345',
}).withMetadata({
  email: 'test@test.com'
})
// you can remove additional fields by specifying property names in an array
//.toJSON(['code', 'statusCode']) removes the code and statusCode field from output
.toJSON()
```

Produces:

```
{
  name: 'InternalServerError',
  code: 'ERR_INT_500',
  message: 'There was a database failure, SQL err code %s',
  type: 'DATABASE_FAILURE',
  subCode: 'DB_0001',
  statusCode: 500,
  meta: { errorId: 'err-12345', requestId: 'req-12345' },
  stack: 'InternalServerError: There was a database failure, SQL err code %s\n' +
    '    at ErrorRegistry.newError (new-error/src/ErrorRegistry.ts:128:12)\n' +
    '    at Object.<anonymous> (new-error/src/test.ts:55:25)\n' +
    '    at Module._compile (internal/modules/cjs/loader.js:1158:30)\n' +
    '    at Module._compile (new-error/node_modules/source-map-support/source-map-support.js:541:25)\n' +
    '    at Module.m._compile (/private/var/folders/mx/b54hc2lj3fbfsndkv4xmz8d80000gn/T/ts-node-dev-hook-17091160954051898.js:57:25)\n' +
    '    at Module._extensions..js (internal/modules/cjs/loader.js:1178:10)\n' +
    '    at require.extensions.<computed> (/private/var/folders/mx/b54hc2lj3fbfsndkv4xmz8d80000gn/T/ts-node-dev-hook-17091160954051898.js:59:14)\n' +
    '    at Object.nodeDevHook [as .ts] (new-error/node_modules/ts-node-dev/lib/hook.js:61:7)\n' +
    '    at Module.load (internal/modules/cjs/loader.js:1002:32)\n' +
    '    at Function.Module._load (internal/modules/cjs/loader.js:901:14)'
}
```

# Deserialization

## Issues with deserialization

### Deserialization is not perfect

- The serialized output may or may not include the `name` property (if using `toJSONSafe()`) that would be able to 
hydrate it back into a specific error instance.
- The metadata is squashed in the serialized output that information is required to separate them.
- It is difficult to determine the original type / structure of the `causedBy` data. As a result, it will be copied as-is.

### potential security issues with deserialization:

- You need to be able to trust the data you're deserializing as the serialized data can be modified in various ways by
an untrusted party.
- The deserialization implementation does not perform `JSON.parse()` as `JSON.parse()` in its raw form is susceptible to
[prototype pollution](https://medium.com/intrinsic/javascript-prototype-poisoning-vulnerabilities-in-the-wild-7bc15347c96)
 if the parse function does not have a proper sanitization function. It is up to the developer to properly 
 trust / sanitize / parse the data.
 
## `ErrorRegistry#fromJSON()` method

This method will attempt to deserialize into a registered error type. If it is unable to, a `BaseError` instance is
returned instead.

`ErrorRegistry#fromJSON(data: object, [options]: DeserializeOpts): IBaseError`

- `data`: Data that is the output of `BaseError#toJSON()`. The data must be an object, not a string.
- `options`: Optional deserialization options.

```typescript
interface DeserializeOpts {
  /**
   * Fields from meta to pluck as a safe metadata field
   */
  safeMetadataFields?: {
    // the value must be set to true.
    [key: string]: true
  }
}
```

Returns a `BaseError` instance or an instance of a registered error type.

```typescript
import { ErrorRegistry } from 'new-error'

const errors = {
  INTERNAL_SERVER_ERROR: {
    className: 'InternalServerError',
    code: 'ERR_INT_500',
    statusCode: 500,
    logLevel: 'error'
  }
}

const errorCodes = {
  DATABASE_FAILURE: {
    message: 'There was a database failure, SQL err code %s',
    subCode: 'DB_0001',
    statusCode: 500,
    logLevel: 'error'
  }
}

const errRegistry = new ErrorRegistry(errors, errorCodes)

const data = {
    'errId': 'err-123',
    'code': 'ERR_INT_500',
    'subCode': 'DB_0001',
    'message': 'test message',
    'meta': { 'safeData': 'test454', 'test': 'test123' },
    'name': 'InternalServerError',
    'statusCode': 500,
    'causedBy': 'test',
    'stack': 'abcd'
}

// err should be an instance of InternalServerError
const err = errRegistry.toJSON(data, {
  safeMetadataFields: {
    safeData: true
  }
})
```

## `static BaseError#fromJSON()` method

If you are not using the registry, you can deserialize using this method. This also applies to any class that extends
`BaseError`.

`static BaseError#fromJSON(data: object, [options]: DeserializeOpts): IBaseError`

- `data`: Data that is the output of `BaseError#toJSON()`. The data must be an object, not a string.
- `options`: Optional deserialization options.

Returns a `BaseError` instance or an instance of the class that extends it.

```typescript
import { BaseError } from 'new-error'

// assume we have serialized error data
const data = {
  code: 'ERR_INT_500',
  subCode: 'DB_0001',
  statusCode: 500,
  errId: 'err-1234',
  meta: { requestId: 'req-12345', safeData: '123' }
}

// deserialize
// specify meta field assignment - fields that are not assigned will be assumed as withMetadata() type data
const err = BaseError.fromJSON(data, {
  // (optional) Fields to pluck from 'meta' to be sent to BaseError#safeMetadataFields()
  // value must be set to 'true'
  safeMetadataFields: {
    safeData: true
  }
})
```

## Stand-alone instance-based deserialization

If the `name` property is present in the serialized data if it was serialized with `toJson()`, you can use a switch 
to map to an instance:

```typescript
const data = {
  // be sure that you trust the source of the deserialized data!
  // anyone can modify the 'name' property to whatever
  name: 'InternalServerError',
  code: 'ERR_INT_500',
  subCode: 'DB_0001',
  statusCode: 500,
  errId: 'err-1234',
  meta: { requestId: 'req-12345', safeData: '123' }
}

let err = null

switch (data.name) {
  case 'InternalServerError':
    // assume InternalServerError extends BaseError
    return InternalServerError.fromJSON(data)
  default:
    return BaseError.fromJSON(data)
}
```
