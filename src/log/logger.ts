import winston from "winston";
const { combine, timestamp, errors, printf, colorize, cli } = winston.format;

const logger = winston.createLogger({
    level: "http",
    format: combine(
        cli(),
        errors({stack: true}),
        timestamp({
          format: 'hh:mm:ss A',
        }),
        // fix: undefinedIncoming request at /login
        printf((info) => `[${info.timestamp}] ${info.level}:${info.message}`)
    ),
    transports: [new winston.transports.Console()],
})

export default logger;