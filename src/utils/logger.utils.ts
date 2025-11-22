import p from "pino";
export const pino = p(
    {
        formatters: {
            level(label: string) {
                return {
                    level: label,
                };
            },
            bindings() {
                return {};
            },
        },
        timestamp: p.stdTimeFunctions.isoTime,
    },
    p.destination(1),
);

export const log = {
    info: (message: string, obj: any) => pino.info(obj, message),
    error: (message: string, obj: any) => pino.error(obj, message),
    warn: (message: string, obj: any) => pino.warn(obj, message),
    debug: (message: string, obj: any) => pino.debug(obj, message),
    trace: (message: string, obj: any) => pino.trace(obj, message),
    fatal: (message: string, obj: any) => pino.fatal(obj, message),
};
