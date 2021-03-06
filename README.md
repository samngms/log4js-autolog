# log4js-autolog

A TypeScript method decorator for log4js, just decorate the method to generate a log before/after execution

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]

# How to use it

```typescript
import * as Log4js from "log4js";
import {autolog} from "log4js-autolog";

const logger = Log4js.getLogger("Foo");
logger.level = 'debug';

class Foo {
  private logger = logger;

  @autolog(logger)
  public greet(name: string) {
    return `Hello: ${name}`;
  }

  @autolog(logger, {timer: true})
  public async asyncGreet(name: string) {
    return Promise.resolve(`Hello: ${name}`);
  }

  // note "logger" is a string, it will get the logger by calling this["logger"]
  @autolog("logger", {errLevel: "error"})
  public getLength(name: string) {
    return name.length;
  }
}

async function main() {
  const f = new Foo();
  f.greet("Turing");
  await f.asyncGreet("Turing");
  try {
    // @ts-ignore
    f.getLength(null);
  } catch (err) {
    // console.log(err);
  }
}

main();
```

```shell
>>>> OUTPUT >>>>
[DEBUG] Foo - Foo.greet('Turing') => 'Hello: Turing'
[DEBUG] Foo - async Foo.asyncGreet('Turing') called
[DEBUG] Foo - async Foo.asyncGreet('Turing') (0ms) => 'Hello: Turing'
[ERROR] Foo - Foo.getLength(null) => TypeError: Cannot read property 'length' of null
```


# Usage

```typescript
@autolog(logger, opt)
```

- `logger` can be a `Log4js.Logger` or a string. If it is a string, it is assumed to be a property name of the object, i.e. we call `this[logger]` to get the real logger.
- `opt` is optional and contains the following optional fields
    - `enterOnly`: if true, log before calling the function, return value (and error) will be ignored
    - `ignorePromise`: if true, will NOT track promise resolve/reject (the default value is false and it will track both Promise.resolve and reject)
    - `level`: a string, the log level, default is "debug"
    - `errLevel`: a string, the log level when exception thrown, default is "warn"
    - `timer` if true, will include the total execution time in the log message, only valid for async or promise result
    

[npm-image]: https://img.shields.io/npm/v/log4js-autolog.svg?style=flat
[npm-url]: https://npmjs.org/package/log4js-autolog
[travis-image]: https://travis-ci.org/samngms/log4js-autolog.svg?branch=master
[travis-url]: https://travis-ci.org/samngms/log4js-autolog
[codecov-image]: https://codecov.io/gh/samngms/log4js-autolog/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/samngms/log4js-autolog
