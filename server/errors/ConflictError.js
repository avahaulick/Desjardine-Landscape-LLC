const HTTP_STATUS = require('../utils/errorCodes');

class ConflictError extends Error {
  constructor(message = 'A resource conflict occurred.') {
    super(message);
    this.statusCode = HTTP_STATUS.CONFLICT;
  }
}

module.exports = ConflictError;
