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
    - [Helper utilities](#helper-utilities)
      - [Auto-generate high level error properties](#auto-generate-high-level-error-properties)
        - [Configuration options](#configuration-options)
      - [Auto-generate low level error properties](#auto-generate-low-level-error-properties)
        - [Configuration options](#configuration-options-1)
  - [Class-based with low level errors without a registry](#class-based-with-low-level-errors-without-a-registry)
  - [Bare-bones class-based error](#bare-bones-class-based-error)
- [Example Express Integration](#example-express-integration)
- [Working with log levels](#working-with-log-levels)
- [Error Registry API](#error-registry-api)
  - [Constructor](#constructor)
    - [Configuration options](#configuration-options-2)
    - [Example](#example)
  - [Child registry with context](#child-registry-with-context)
    - [Configuration options](#configuration-options-3)
    - [Example](#example-1)
  - [Creating errors](#creating-errors)
    - [Create a well-defined error](#create-a-well-defined-error)
    - [Create an error without a low-level error](#create-an-error-without-a-low-level-error)
      - [Specify a custom message](#specify-a-custom-message)
      - [Use the message property from the high level error if defined](#use-the-message-property-from-the-high-level-error-if-defined)
      - [Custom message not defined and high level error has no message property defined](#custom-message-not-defined-and-high-level-error-has-no-message-property-defined)
    - [Error creation handler](#error-creation-handler)
  - [`instanceOf` / comparisons](#instanceof--comparisons)
    - [Comparing a custom error](#comparing-a-custom-error)
    - [Native `instanceof`](#native-instanceof)
- [Error API](#error-api)
  - [Constructor](#constructor-1)
    - [Configuration options](#configuration-options-4)
  - [Getters](#getters)
  - [Basic setters](#basic-setters)
  - [Static methods](#static-methods)
  - [Utility methods](#utility-methods)
  - [Set an error id](#set-an-error-id)
  - [Attaching errors](#attaching-errors)
    - [Append the attached error message to the main error message](#append-the-attached-error-message-to-the-main-error-message)
  - [Format messages](#format-messages)
  - [Converting the error into another type](#converting-the-error-into-another-type)
    - [Apollo GraphQL example](#apollo-graphql-example)
  - [Adding metadata](#adding-metadata)
    - [Safe metadata](#safe-metadata)
    - [Internal metadata](#internal-metadata)
  - [Serializing errors](#serializing-errors)
    - [Safe serialization](#safe-serialization)
    - [Internal serialization](#internal-serialization)
    - [Post-processing handlers](#post-processing-handlers)
- [Deserialization](#deserialization)
  - [Issues with deserialization](#issues-with-deserialization)
    - [Deserialization is not perfect](#deserialization-is-not-perfect)
    - [Potential security issues with deserialization](#potential-security-issues-with-deserialization)
  - [`ErrorRegistry#fromJSON()` method](#errorregistryfromjson-method)
  - [`static BaseError#fromJSON()` method](#static-baseerrorfromjson-method)
  - [Stand-alone instance-based deserialization](#stand-alone-instance-based-deserialization)
- [Looking for production-grade env variable / configuration management?](#looking-for-production-grade-env-variable--configuration-management)

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
- You want to classify the types of errors that your application is emitting in your metrics / analytics tool.

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
    logLevel: 'error',
    /**
     * (optional) Callback function to call when calling BaseError#convert().
     *
     * (baseError) => any type
     *
     * - If not defined, will return itself when convert() is called
     * - If defined in HighLevelError, the HighLevelError definition takes priority
     */
    onConvert: (err) => { return err },
    /**
     * (optional) Full description of the error. Used only when BaseError#newBareError() is called 
     * without the message parameter.
     *
     * sprintf() flags can be applied to customize it.
     * @see https://www.npmjs.com/package/sprintf-js
     */
    message: 'Internal server error'
  }
}

// Define low-level errors
// Do *not* assign a Typescript type to the object
// or IDE autocompletion will not work!
const errorSubCodes = {
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
    logLevel: 'error',
    /**
     * (optional) Callback function to call when calling BaseError#convert().
     *
     * (baseError) => any type
     *
     * - If not defined, will return itself when convert() is called
     * - This definition takes priority if HighLevelError#onConvert is defined
     */
    onConvert: (err) => { return err }
  }
}

// Create the error registry by registering your errors and codes
// you will want to memoize this as you will be using the
// reference throughout your application
const errRegistry = new ErrorRegistry(errors, errorSubCodes)

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

### Helper utilities

#### Auto-generate high level error properties

`generateHighLevelErrors(errorDefs, options: GenerateHighLevelErrorOpts)`

If you find yourself doing the following pattern:

```ts
const errors = {
  INTERNAL_SERVER_ERROR: {
    className: 'InternalServerError', // pascal case'd property name
    code: 'INTERNAL_SERVER_ERROR', // same as the property name
    statusCode: 500
  }
}
```

You can use the utility method to do it instead:

```ts
import { generateHighLevelErrors } from 'new-error'

const errors = generateHighLevelErrors({
  INTERNAL_SERVER_ERROR: {
    statusCode: 500
  }
})
```

- If a `className` or `code` is already defined, it will not overwrite it

##### Configuration options

```ts
interface GenerateHighLevelErrorOpts {
  /**
   * Disable to not generate the class name based on the property name if the className is not defined.
   */
  disableGenerateClassName?: boolean
  /**
   * Disable to not generate the error code based on the property name if the code is not defined.
   */
  disableGenerateCode?: boolean
}
```

#### Auto-generate low level error properties

`generateLowLevelErrors(errorDefs, options: GenerateLowLevelErrorOpts)`

If you find yourself doing the following pattern:

```ts
const errors = {
  DATABASE_FAILURE: {
    subCode: 'DATABASE_FAILURE', // same as the property name
    message: 'Database failure'
  }
}
```

You can use the utility method to do it instead:

```ts
import { generateLowLevelErrors } from 'new-error'

const errors = generateLowLevelErrors({
  DATABASE_FAILURE: {
    message: 'Database failure'
  }
})
```

- If a `subCode` is already defined, it will not overwrite it

##### Configuration options

```ts
interface GenerateLowLevelErrorOpts {
  /**
   * Disable to not generate the error code based on the property name if the subCode is not defined.
   */
  disableGenerateSubCode?: boolean
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

const errorSubCodes = {
  DATABASE_FAILURE: {
    message: 'There was a database failure.',
    subCode: 'DB_0001',
    statusCode: 500
  }
}

const errRegistry = new ErrorRegistry(errors, errorSubCodes)

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

const errorSubCodes = {
  MISSING_FORM_FIELDS: {
    message: 'Form submission data is missing fields',
    subCode: 'MISSING_FORM_FIELDS',
    statusCode: 400
  }
}

const errRegistry = new ErrorRegistry(errors, errorSubCodes)

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

## Constructor

`new ErrorRegistry(highLvErrors, lowLvErrors, config = {})`

### Configuration options

```ts
interface IErrorRegistryConfig {
  /**
   * Options when creating a new BaseError
   */
  baseErrorConfig?: IBaseErrorConfig
  /**
   * Handler to modify the created error when newError / newBareError is called
   */
  onCreateError?: (err: BaseRegistryError) => void
}
```

### Example

```ts
const errRegistry = new ErrorRegistry(errors, errorSubCodes, {
  // Config for all BaseErrors created from the registry
  baseErrorConfig: {
    // Remove the `meta` field if there is no data present for `toJSON` / `toJSONSafe`
    omitEmptyMetadata: true
  }
})
```

## Child registry with context

`ErrorRegistry#withContext(context: IErrorRegistryContextConfig)`

You can create a child registry that adds context for all new errors created. This is useful if
your body of code throws multiple errors and you want to include the same metadata for each one
without repeating yourself.

- All property **references** are copied to the child registry from the parent. This keeps memory usage
low as the references are re-used vs a complete clone of the data.
- Because all properties are copied over, the child registry will execute any handlers / config options
the parent has when creating new errors.

### Configuration options

```typescript
export interface IErrorRegistryContextConfig {
  /**
   * Metadata to include for each new error created by the registry
   */
  metadata?: Record<any, string>
  /**
   * Safe metadata to include for each new error created by the registry
   */
  safeMetadata?: Record<any, string>
}
```

### Example

```typescript
const childRegistry = errRegistry.withContext({
  metadata: {
    contextA: 'context-a'
  },
  safeMetadata: {
    contextB: 'context-b'
  }
})

const err = childRegistry.newError('INTERNAL_SERVER_ERROR', 'DATABASE_FAILURE')
```

If we do `err.toJSON()`, we should get the following output:

```json5
{
  name: 'InternalServerError',
  code: 'INT_ERR',
  message: 'There is an issue with the database',
  type: 'DATABASE_FAILURE',
  subCode: 'DB_ERR',
  statusCode: 500,
  // err.toJSONSafe() would exclude contextA
  meta: { contextA: 'context-a', contextB: 'context-b' },
  stack: '...'
}
```

We can also append data:

```typescript
const err = childRegistry.newError('INTERNAL_SERVER_ERROR', 'DATABASE_FAILURE')
  .withMetadata({
    moreMeta: 'data'
  })
```

If we do `err.toJSON()`, we should get the following output:

```json5
{
  name: 'InternalServerError',
  code: 'INT_ERR',
  message: 'There is an issue with the database',
  type: 'DATABASE_FAILURE',
  subCode: 'DB_ERR',
  statusCode: 500,
  // err.toJSONSafe() would exclude contextA and moreMeta
  meta: { contextA: 'context-a', contextB: 'context-b', moreMeta: 'data' },
  stack: '...'
}
```

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

Method: `ErrorRegistry#newBareError(highLevelErrorName, [message])`

This method does not include a low level error code, and allows direct specification of an
error message.

#### Specify a custom message

```typescript
// Creates an InternalServerError error with a custom message
const err = errRegistry.newBareError('INTERNAL_SERVER_ERROR', 'An internal server error has occured.')
```

#### Use the message property from the high level error if defined

```typescript
const errors = {
  AUTH_REQUIRED: {
    className: 'AuthRequired',
    code: 'AUTH_REQ',
    message: 'Auth required'
  }
}

// Creates an AuthRequired error with a the 'Auth Required' message
const err = errRegistry.newBareError('AUTH_REQUIRED')
```

#### Custom message not defined and high level error has no message property defined

The error will use the code as the default.

```typescript
const errors = {
  DB_ERROR: {
    className: 'DatabaseError',
    code: 'DB_ERR'
  }
}

// Creates an AuthRequired error with 'DB_ERR' as the message
const err = errRegistry.newBareError('DB_ERROR')
```

### Error creation handler

If you want all errors created from the registry to have defined properties, you can use the `onCreateError` config option to modify the created error.

For example, if you want to create an error id for each new error:

```ts
const errRegistry = new ErrorRegistry(errors, errorSubCodes, {
  onCreateError: (err) => {
    err.withErrorId('test-id')
  }
})

// the err should have 'test-id' set for the error id
const err = errRegistry.newError('INTERNAL_SERVER_ERROR', 'DATABASE_FAILURE')
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

Generated errors extend the `BaseError` class, which extends `Error`.

## Constructor

`new BaseError(message: string, config: IBaseErrorConfig: IBaseErrorConfig = {})`

- `message`: The error message you would use in `new Error(message)`

### Configuration options

```ts
interface IBaseErrorConfig {
  /**
   * A list of fields to always omit when calling toJSON
   */
  toJSONFieldsToOmit?: string[]
  /**
   * A list of fields to always omit when calling toJSONSafe
   */
  toJSONSafeFieldsToOmit?: string[]
  /**
   * If the metadata has no data defined, remove the `meta` property on `toJSON` / `toJSONSafe`.
   */
  omitEmptyMetadata?: boolean
  /**
   * A function to run against the computed data when calling `toJSON`. This is called prior
   * to field omission. If defined, must return the data back.
   */
  onPreToJSONData?: (data: Partial<SerializedError>) => Partial<SerializedError>
  /**
   * A function to run against the computed safe data when calling `toJSONSafe`. This is called
   * prior to field omission. If defined, must return the data back.
   */
  onPreToJSONSafeData?: (data: Partial<SerializedErrorSafe>) => Partial<SerializedErrorSafe>
  /**
   * A callback function to call when calling BaseError#convert(). This allows for user-defined conversion
   * of the BaseError into some other type (such as a Apollo GraphQL error type).
   *
   * (baseError) => any type
   */
  onConvert?: <E extends BaseError = BaseError>(err: E) => any
  /**
   * If defined, will append the `.message` value when calling causedBy() after the main error message.
   * Useful for frameworks like Jest where it will not print the caused by data.
   * To define the format of the appended message, use '%s' for the message value.
   *
   * Ex: ", caused by: %s"
   */
  appendWithErrorMessageFormat?: string
}
```

## Getters

The following getters are included with the standard `Error` properties and methods:

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
- `BaseError#getConfig()`

## Basic setters

If you use the registry, you should not need to us these setters as the registry
sets the values already.

- `BaseError#withErrorType(type: string): this`
- `BaseError#withErrorCode(code: string | number): this`
- `BaseError#withErrorSubCode(code: string | number): this`
- `BaseError#withLogLevel(level: string | number): this`
- `BaseError#setConfig(config: IBaseErrorConfig): void`
- `BaseError#setOnConvert(<E extends BaseError = BaseError>(err: E) => any): void`

## Static methods

- `static BaseError#fromJSON(data: object, options?: object): BaseError`

## Utility methods

- `BaseError#convert<E = BaseError | any>() : E`
- `BaseError#hasOnConvertDefined(): boolean`

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

### Append the attached error message to the main error message

If the config option `appendWithErrorMessageFormat` is defined, and the error sent into `causedBy`
contains a `message` property, then the caused by error message will be appended to the main error message.

Useful if you find yourself applying this pattern to expose the attached error message:

```typescript
const thrownErrorFromApp = new Error('Duplicate key error')
const err = new BaseError('Internal server error: %s');
err.causedBy(thrownErrorFromApp)
err.formatMessage(thrownErrorFromApp.message);
```
  
This is also useful for test frameworks like `jest` where it will only print out the main error message
and not any properties attached to the error.

```typescript
// only enable for testing envs
const IS_TEST_ENV = process.env.NODE_ENV === 'test';
const err = new BaseError('Internal server error', {
  // %s is the attached error message
  appendWithErrorMessageFormat: IS_TEST_ENV ? ': %s' : null
})

err.causedBy(new Error('Duplicate key'))

// prints out "Internal server error: Duplicate key"
console.log(err.message)
```

```typescript
// formatted messages also work with this
const IS_TEST_ENV = process.env.NODE_ENV === 'test';
const err = new BaseError('Internal server error: %s', {
  appendWithErrorMessageFormat: IS_TEST_ENV ? '===> %s' : null
})

// formatMessage / causedBy can be called in any order
err.formatMessage('Hello')
err.causedBy(new Error('Duplicate key'))

// prints out "Internal server error: Hello ===> Duplicate key"
console.log(err.message)
```

**It is not recommended that `appendWithErrorMessageFormat` is defined in a production environment
as the `causedBy` error messages tend to be system-level messages that could be exposed to clients
if the error is being thrown back to the client**.


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

The message can be accessed via the `.message` property.

## Converting the error into another type

Method: `BaseError#convert<T = any>() : T`

This is useful if you need to convert the error into another type. This type can be another error or some other data type.

### Apollo GraphQL example

For example, Apollo GraphQL prefers that any errors thrown from a GQL endpoint is an error that extends [`ApolloError`](https://www.apollographql.com/docs/apollo-server/data/errors/).

You might find yourself doing the following pattern if your resolver happens to throw a `BaseError`:

```ts
import { GraphQLError } from 'graphql';
import { BaseError } from 'new-error';
import { ApolloError, ForbiddenError } from 'apollo-server';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err: GraphQLError) => {
    const origError = error.originalError;

    if (origError instanceof BaseError) {
      // re-map the BaseError into an Apollo error type
      switch(origError.getCode()) {
        case 'PERMISSION_REQUIRED':
          return new ForbiddenError(err.message)
        default:
          return new ApolloError(err.message)
      }
    }

    return err;
  },
});
```

Trying to switch for every single code / subcode can be cumbersome.

Instead of using this pattern, do the following so that your conversions can remain in one place:

```ts
import { GraphQLError } from 'graphql';
import { BaseError, ErrorRegistry } from 'new-error';
import { ApolloError, ForbiddenError } from 'apollo-server';

const errors = {
  PERMISSION_REQUIRED: {
    className: 'PermissionRequiredError',
    code: 'PERMISSION_REQUIRED',
    // Define a conversion function that is called when BaseError#convert() is called
    // error is the BaseError
    onConvert: (error) => {
      return new ForbiddenError(error.message)
    }
  },
  AUTH_REQUIRED: {
    className: 'AuthRequiredError',
    code: 'AUTH_REQUIRED'
  }
}

const errorSubCodes = {
  ADMIN_PANEL_RESTRICTED: {
    message: 'Access scope required: admin',
    onConvert: (error) => {
      return new ForbiddenError('Admin required')
    }
  },
  EDITOR_SECTION_RESTRICTED: {
    message: 'Access scope required: editor',
  }
}

const errRegistry = new ErrorRegistry(errors, errorSubCodes, {
  onCreateError: (err) => {
    // if an onConvert handler has not been defined, default to ApolloError
    if (!err.hasOnConvertDefined()) {
      err.setOnConvert((err) => {
        if (process.env.NODE_ENV !== 'production') {
          // return full error details
          return new ApolloError(err.message, err.getCode(), err.toJSON());
        }

        // in production, we don't want to expose codes that are internal
        return new ApolloError('Internal server error', 'INTERNAL_SERVER_ERROR', {
          errId: err.getErrorId(),
        });
      });
    }
  }
})

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // errors thrown from the resolvers come here
  formatError: (err: GraphQLError) => {
    const origError = error.originalError;

    if (origError instanceof BaseError) {
      // log out the original error
      console.log(origError.toJSON())

      // Convert out to an Apollo error type
      return origError.convert()
    }
    
    // log out the apollo error
    // you would probably want to see if you can convert this
    // to a BaseError type in your code where this may be thrown from
    console.log(err)
    
    return err;
  },
});

const resolvers = {
  Query: {
    adminSettings(parent, args, context, info) {
      // err.convert() will call onConvert() of ADMIN_PANEL_RESTRICTED (low level defs have higher priority)
      throw errRegistry.newError('PERMISSION_REQUIRED', 'ADMIN_PANEL_RESTRICTED')
    },
    editorSettings(parent, args, context, info) {
      // err.convert() will call onConvert() of PERMISSION_REQUIRED since EDITOR_SECTION_RESTRICTED does not
      // have the onConvert defined
      throw errRegistry.newError('PERMISSION_REQUIRED', 'EDITOR_SECTION_RESTRICTED')
    },
    checkAuth(parent, args, context, info) {
      // err.convert() will return ApolloError from onCreateError() since onConvert() is not defined for either AUTH_REQUIRED or EDITOR_SECTION_RESTRICTED
      throw errRegistry.newError('AUTH_REQUIRED', 'EDITOR_SECTION_RESTRICTED')
    },
    checkAuth2(parent, args, context, info) {
      // err.convert() will return ApolloError from onCreateError() since onConvert() is not defined for either AUTH_REQUIRED
      throw errRegistry.newBareError('AUTH_REQUIRED', 'Some error message')
    },
    permRequired(parent, args, context, info) {
      // err.convert() will call onConvert() of PERMISSION_REQUIRED
      throw errRegistry.newBareError('PERMISSION_REQUIRED', 'Some error message')
    }
  }
}
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

### Post-processing handlers

The `BaseError` config `onPreToJSONData` / `onPreToJSONSafeData` options allow post-processing of the data. This is useful if you want to decorate your data for all new
errors created.

```ts
const errRegistry = new ErrorRegistry(errors, errorSubCodes, {
  baseErrorConfig: {
    // called when toJSON is called
    onPreToJSONData: (data) => {
      // we want all new errors to contain a date field
      data.date = new Date().tostring()

      // add some additional metadata
      // data.meta might be empty if omitEmptyMetadata is enabled
      if (data.meta) {
        data.meta.moreData = 'test'
      }

      return data
    }    
  }
})

const err = errRegistry.newError('INTERNAL_SERVER_ERROR', 'DATABASE_FAILURE')
  .setErrorId('err-1234')
  .formatMessage('SQL_1234')

// should produce the standard error structure, but with the new fields added
console.log(err.toJSON())
```

# Deserialization

## Issues with deserialization

### Deserialization is not perfect

- If the serialized output lacks the `name` property (not present when using `toJSONSafe()`), then only a `BaseError` instance can be returned.
- The metadata is squashed in the serialized output that information is required to separate them.
- It is difficult to determine the original type / structure of the `causedBy` data. As a result, it will be copied as-is.

### Potential security issues with deserialization

- You need to be able to trust the data you're deserializing as the serialized data can be modified in various ways by
an untrusted party.
- The deserialization implementation does not perform `JSON.parse()` as `JSON.parse()` in its raw form is susceptible to
[prototype pollution](https://medium.com/intrinsic/javascript-prototype-poisoning-vulnerabilities-in-the-wild-7bc15347c96)
 if the parse function does not have a proper sanitization function. It is up to the developer to properly 
 trust / sanitize / parse the data.
 
## `ErrorRegistry#fromJSON()` method

This method will attempt to deserialize into a registered error type via the `name` property. If it is unable to, a `BaseError` instance is
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

const errorSubCodes = {
  DATABASE_FAILURE: {
    message: 'There was a database failure, SQL err code %s',
    subCode: 'DB_0001',
    statusCode: 500,
    logLevel: 'error'
  }
}

const errRegistry = new ErrorRegistry(errors, errorSubCodes)

const data = {
    'errId': 'err-123',
    'code': 'ERR_INT_500',
    'subCode': 'DB_0001',
    'message': 'test message',
    'meta': { 'safeData': 'test454', 'test': 'test123' },
    // maps to className in the high level error def
    'name': 'InternalServerError',
    'statusCode': 500,
    'causedBy': 'test',
    'stack': 'abcd'
}

// err should be an instance of InternalServerError
const err = errRegistry.fromJSON(data, {
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

# Looking for production-grade env variable / configuration management?

Check out https://github.com/theogravity/configurity
