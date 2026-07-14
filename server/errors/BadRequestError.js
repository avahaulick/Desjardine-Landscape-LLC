const HTTP_STATUS = require('../utils/errorCodes');

class BadRequestError extends Error {
  constructor(message = 'Invalid request data.') {
    super(message);
    this.statusCode = HTTP_STATUS.BAD_REQUEST;
  }
}

module.exports = BadRequestError;
