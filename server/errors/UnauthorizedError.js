const HTTP_STATUS = require('../utils/errorCodes');

class UnauthorizedError extends Error {
  constructor(message = 'Authorization required.') {
    super(message);
    this.statusCode = HTTP_STATUS.UNAUTHORIZED;
  }
}

module.exports = UnauthorizedError;
