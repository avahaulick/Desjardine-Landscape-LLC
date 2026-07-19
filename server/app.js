require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const fsAsync = require('fs/promises');
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
  process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN || 'http://localhost:5180,http://localhost:5173,http://localhost:3000',
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

// Custom video streaming handler for MP4 files
app.get('/media/:filename', async (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename);
    const filepath = path.join(IMAGES_DIR, filename);

    // Security: prevent directory traversal
    if (!filepath.startsWith(IMAGES_DIR)) {
      return res.status(403).send('Forbidden');
    }

    // Check if file exists
    const stat = await fsAsync.stat(filepath);

    if (!stat.isFile()) {
      return res.status(404).send('Not Found');
    }

    const filesize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : filesize - 1;
      const chunksize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${filesize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      });

      fs.createReadStream(filepath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': filesize,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=2592000',
      });

      fs.createReadStream(filepath).pipe(res);
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).send('Not Found');
    }
    next(err);
  }
});

// Static middleware for images and other files
app.use(
  '/media',
  express.static(IMAGES_DIR, {
    fallthrough: true,
  }),
);

app.use(express.static(CLIENT_DIST_DIR, { index: false }));

app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/users') || req.path.startsWith('/items')) {
    next();
    return;
  }

  try {
    await fsAsync.access(path.join(CLIENT_DIST_DIR, 'index.html'));
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
