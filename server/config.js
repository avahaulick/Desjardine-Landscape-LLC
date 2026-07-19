const { NODE_ENV, JWT_SECRET } = process.env;

if (NODE_ENV === 'production' && !JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production.');
}

module.exports = {
  JWT_SECRET: JWT_SECRET || 'dev-secret',
};
