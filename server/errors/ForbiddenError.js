const HTTP_STATUS = require('../utils/errorCodes');

class ForbiddenError extends Error {
  constructor(message = 'Forbidden operation.') {
    super(message);
    this.statusCode = HTTP_STATUS.FORBIDDEN;
  }
}

module.exports = ForbiddenError;
