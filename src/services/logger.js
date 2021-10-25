const SPLAT = Symbol.for('splat');
const { format } = require('util');

const winston = require('winston');
require('winston-daily-rotate-file');
const { combine, timestamp, label, printf } = winston.format;


const myFormat = printf(({ level, message, label, timestamp, [SPLAT]: args = [] }) => {
    return `${timestamp} [${label}] ${level}: ${message} ${(args.length ? '\n' : '') + format(...args)}`;
});

// locale timestamp in format DD/MM/YYYY, hh:mm:ss
const timezoned = () => {
    return new Date().toLocaleString('en-GB', {
        timeZone: 'Europe/Prague'
    });
}

let history = [];

const winst = winston.createLogger({
    transports: [
        // ERROR file
        new winston.transports.DailyRotateFile({
            filename: '../.log/errors/bd-1_ERRORS_%DATE%.log',
            datePattern: 'YYYY-MM',
            maxFiles: 6,
            level: 'error',
            maxSize: '10m',
            auditFile: '../.log/audits/errors_audit.json'
        }),
        // DEBUG log
        new winston.transports.DailyRotateFile({
            filename: '../.log/bd-1_%DATE%.log',
            datePattern: 'YYYY-MM',
            maxFiles: 6,
            level: 'debug',
            maxSize: '10m',
            auditFile: '../.log/audits/general_audit.json'
        }),
        // CONSOLE log
        new winston.transports.Console({
            level: 'debug',
        })
    ],
    format: combine(
        label({ label: "BD-1" }),
        timestamp({ format: timezoned }),
        myFormat
    ),
    exceptionHandlers: [
        // UNHANDLED EXCEPTION log
        new winston.transports.DailyRotateFile({
            filename: '../.log/exceptions/bd-1_EXCEPTIONS_%DATE%.log',
            datePattern: 'YYYY-MM',
            maxFiles: 6,
            level: 'debug',
            maxSize: '10m',
            auditFile: '../.log/audits/exceptions_audit.json'
        })
    ]
});

const logger = {
    debug: function (msg) {
        winst.debug(msg);
        addHistory('debug', msg)
    },
    info: function (msg) {
        winst.info(msg);
        addHistory('info', msg)
    },
    error: function (msg) {
        winst.error(msg);
        addHistory('error', msg)
    }
}

function addHistory(level, msg) {
    if (history.length >= 30) history.shift();
    history.push(`${new Date().toISOString()} - ${level} - ${msg}`);
}

module.exports = { logger, history }
