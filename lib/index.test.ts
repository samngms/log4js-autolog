import "mocha";
import { expect } from "chai";
import { fail } from "assert";
import * as Log4js from "log4js";
import {autolog} from "./index";

const logger = Log4js.getLogger("Foo");
logger.level = 'debug';

const sleep = (milliseconds: number) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

// @ts-ignore
class Foo {
    @autolog(logger)
    public greet(name: string) {
        return `Hello: ${name.length}`;
    }

    @autolog(logger, {level: "info", errLevel: "error"})
    public greet2(name: string): void {
        console.log(`Hello: ${name.length}`);
    }

    @autolog(logger, {timer: true})
    // tslint:disable-next-line:no-flag-args
    public async promiseX(shouldResolve: boolean) {
        if ( shouldResolve ) {
            return Promise.resolve("good");
        } else {
            return Promise.reject("bad");
        }
    }

    @autolog(logger)
    // tslint:disable-next-line:no-flag-args
    public async promiseY(shouldResolve: boolean) {
        if ( shouldResolve ) {
            return Promise.resolve();
        } else {
            return Promise.reject();
        }
    }
}

class Bar {
    protected readonly logger = Log4js.getLogger("bar");

    public constructor() {
        this.logger.level = 'debug';
    }

    @autolog("logger")
    public greet(name: string) {
        return `Hello: ${name.length}`;
    }

    @autolog("logger")
    public greet2(name: string): void {
        console.log(`Hello: ${name.length}`);
    }

    @autolog("logger", {enterOnly: true, timer: true})
    // tslint:disable-next-line:no-flag-args
    public async promiseX(shouldResolve: boolean) {
        if ( shouldResolve ) {
            return Promise.resolve("good");
        } else {
            return Promise.reject("bad");
        }
    }

    @autolog("logger", {ignorePromise: true, timer: true})
    // tslint:disable-next-line:no-flag-args
    public async promiseY(shouldResolve: boolean) {
        if ( shouldResolve ) {
            return Promise.resolve();
        } else {
            return Promise.reject();
        }
    }
}

describe("Testing autolog", () => {
    const foo = new Foo();
    const bar = new Bar();

    it(`success sync call`, () => {
        const str1 = foo.greet("Sam");
        expect(str1).to.eq("Hello: 3");
    });

    it(`error sync call`, () => {
        // @ts-ignore
        expect(() => foo.greet(null)).to.throw();
    });

    it(`success sync call with no return value`, () => {
        expect(() => foo.greet2("Sam")).to.not.throw();
    });

    it(`error sync call with no return value`, () => {
        // @ts-ignore
        expect(() => foo.greet2(null)).to.throw();
    });

    it(`success async call`, async () => {
        const str1 = await foo.promiseX(true);
        expect(str1).to.be.eq("good");
    });

    it(`error async call`, async () => {
        try {
            await foo.promiseX(false);
            fail();
        } catch (err) {
            expect(err).to.eq("bad");
        }
    });

    it(`success async call with no return value`, async () => {
        try {
            await foo.promiseY(true);
        } catch (err) {
            fail();
        }
    });

    it(`error async call with no return value`, async () => {
        try {
            await foo.promiseY(false);
            fail();
        } catch (err) {
            // do nothing
        }
    });

    it(`string logger: success sync call`, () => {
        const str1 = bar.greet("Sam");
        expect(str1).to.eq("Hello: 3");
    });

    it(`string logger: error sync call`, () => {
        // @ts-ignore
        expect(() => bar.greet(null)).to.throw();
    });

    it(`string logger: success async call`, async () => {
        const str1 = await bar.promiseX(true);
        expect(str1).to.eq("good");
    });

    it(`string logger: error async call`, async () => {
        try {
            await bar.promiseX(false);
            fail();
        } catch (err) {
            expect(err).to.eq("bad");
        }
    });

    it(`string logger: success async call with no return value`, async () => {
        try {
            await bar.promiseY(true);
        } catch (err) {
            fail();
        }
    });

    it(`string logger: error async call with no return value`, async () => {
        try {
            await bar.promiseY(true);
            fail();
        } catch (err) {
            // do nothing
        }
    });

    after(async function() {
        await sleep(1000);
    })
});
