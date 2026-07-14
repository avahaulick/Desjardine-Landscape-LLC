const HTTP_STATUS = require('../utils/errorCodes');

class NotFoundError extends Error {
  constructor(message = 'Requested resource not found.') {
    super(message);
    this.statusCode = HTTP_STATUS.NOT_FOUND;
  }
}

module.exports = NotFoundError;
