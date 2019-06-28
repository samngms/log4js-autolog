import * as _ from "lodash";
import * as util from "util";
import { Logger } from "log4js";

function timeDiff(start: number, end: number) {
    const diff = end - start;
    if ( diff < 60000 ) {
        return diff + "ms";
    } else {
        return Math.floor(diff / 1000) +  "s";
    }
}

/** A decorator for logging method enter/exit
 *
 * @param logger if it is a string, it is considered as "this[logger]", otherwise, we expect it is the logger object
 * @param opt an object with the following keys
 * @param opt.enterOnly if true, log when calling the function, return value will be ignored
 * @param opt.ignorePromise if true, will NOT track promise resolve/reject
 * @param opt.level a string, the log level, default is "debug"
 * @param opt.errLevel a string, the log level used when logging errors, default is "warn"
 * @param opt.timer if true, will log the total execution time, only valid for promise result
 */
export function autolog(logger: Logger | string, opt?: any) {
    return (target: any, propertyName: string, propertyDescriptor: PropertyDescriptor): PropertyDescriptor => {
        const method = propertyDescriptor.value;

        propertyDescriptor.value = function(...args: any[]) {
            const inspectOpt = { maxArrayLength: 2, breakLength: 1024 };

            // convert list of greet arguments to string, use Node.util.inspect, not JSON.stringify
            const params = args.map((item) => util.inspect(item, inspectOpt)).join();
            const typeName = _.get(target, "constructor.name");
            const fullName = (typeName) ? `${typeName}.${propertyName}` : propertyName;

            let log: Logger;
            if (typeof logger === "string" || logger instanceof String) {
                // @ts-ignore
                log = this[logger as string];
            } else {
                log = logger as Logger;
            }

            // invoke the function() and get its return value
            // tslint:disable-next-line:try-catch-first
            const level = (opt && opt.level) || "debug";
            const errLevel = (opt && opt.errLevel) || "warn";
            if ( opt && opt.enterOnly ) {
                log.log(level, `${fullName}(${params}) called`);
                return method.apply(this, args);
            }

            // tslint:disable-next-line:try-catch-first
            try {
                const startTime = (opt && opt.timer) ? new Date().getTime() : 0;
                const result = method.apply(this, args);
                if ( result instanceof Promise ) {
                    log.log(level, `async ${fullName}(${params}) called`);
                    if (opt && opt.ignorePromise !== undefined && !opt.ignorePromises) { return result; }

                    const promise = result as Promise<any>;
                    return promise.then((promiseValue) => {
                        const resultStr = util.inspect(promiseValue, inspectOpt);
                        if ( startTime ) {
                            const diff = timeDiff(startTime, new Date().getTime());
                            log.log(level, `async ${fullName}(${params}) (${diff}) => ${resultStr}`);
                        } else {
                            log.log(level, `async ${fullName}(${params}) => ${resultStr}`);
                        }
                        return promiseValue;
                    }).catch((err) => {
                        if ( startTime ) {
                            const diff = timeDiff(startTime, new Date().getTime());
                            log.log(errLevel, `async ${fullName}(${params}) (${diff}) => ${err}`);
                        } else {
                            log.log(errLevel, `async ${fullName}(${params}) => ${err}`);
                        }
                        throw err;
                    });
                } else {
                    const resultStr = util.inspect(result, inspectOpt);
                    log.log(level, `${fullName}(${params}) => ${resultStr}`);
                    return result;
                }
            } catch (err) {
                log.log(errLevel, `${fullName}(${params}) => ${err}`);
                throw err;
            }
        };
        return propertyDescriptor;
    };
}
