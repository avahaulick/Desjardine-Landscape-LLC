const expressWinston = require('express-winston');
const winston = require('winston');
const path = require('path');

const logsDirectory = path.resolve(__dirname, '..', 'logs');

const requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.File({
      filename: path.join(logsDirectory, 'request.log'),
    }),
  ],
  format: winston.format.json(),
  meta: true,
});

const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File({
      filename: path.join(logsDirectory, 'error.log'),
    }),
  ],
  format: winston.format.json(),
});

module.exports = {
  requestLogger,
  errorLogger,
};
