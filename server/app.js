const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errors: celebrateErrors, isCelebrateError } = require('celebrate');
const routes = require('./routes');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const BadRequestError = require('./errors/BadRequestError');
const ConflictError = require('./errors/ConflictError');

const app = express();

const IMAGES_DIR = path.resolve(__dirname, '..', 'images');
const CLIENT_DIST_DIR = path.resolve(__dirname, '..', 'client', 'dist');

const allowedOrigins = String(
  process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN || 'http://localhost:5173,http://localhost:3000',
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY : 1);

app.use(requestLogger);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  }),
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed by CORS policy.'));
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  }),
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(routes);

app.use(
  '/media',
  express.static(IMAGES_DIR, {
    fallthrough: false,
    maxAge: '7d',
  }),
);

app.use(express.static(CLIENT_DIST_DIR, { index: false }));

app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/users') || req.path.startsWith('/items')) {
    next();
    return;
  }

  try {
    await fs.access(path.join(CLIENT_DIST_DIR, 'index.html'));
    res.sendFile(path.join(CLIENT_DIST_DIR, 'index.html'));
  } catch (err) {
    next(err);
  }
});

app.use(notFound);

app.use(errorLogger);
app.use(celebrateErrors());
app.use((err, req, res, next) => {
  if (isCelebrateError(err)) {
    next(new BadRequestError('Invalid request payload.'));
    return;
  }

  if (err.code === 11000) {
    next(new ConflictError('Email is already registered.'));
    return;
  }

  if (err.name === 'ValidationError' || err.name === 'CastError') {
    next(new BadRequestError('Invalid request data.'));
    return;
  }

  next(err);
});
app.use(errorHandler);

module.exports = app;
