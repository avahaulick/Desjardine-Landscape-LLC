const HTTP_STATUS = require('../utils/errorCodes');

module.exports = (err, _req, res, _next) => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR
    ? 'An error has occurred on the server.'
    : err.message;

  res.status(statusCode).send({ message });
};
