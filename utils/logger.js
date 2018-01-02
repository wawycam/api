const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const wawyLogFormat = printf(info => {
  return `${info.timestamp} ${info.message}`;
});

const logger = module.exports = createLogger({
  transports: [new transports.Console({
    level: (process.env.NODE_ENV === 'development') ? 'silly': 'error'
  })],
  format: combine(
    format.splat(),
    format.colorize({ all: true }),
    timestamp(),
    wawyLogFormat
  ),
});