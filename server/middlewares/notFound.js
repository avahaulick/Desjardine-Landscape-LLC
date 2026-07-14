const NotFoundError = require('../errors/NotFoundError');

module.exports = (_req, _res, next) => {
  next(new NotFoundError('Requested resource not found.'));
};
