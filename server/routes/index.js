const router = require('express').Router();
const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const usersRouter = require('./users');
const itemsRouter = require('./items');
const auth = require('../middlewares/auth');
const {
  createUserValidation,
  loginValidation,
} = require('../middlewares/validation');
const { createUser, login } = require('../controllers/users');
const { getProjects } = require('../controllers/gallery');

const IMAGES_DIR = path.resolve(__dirname, '..', '..', 'images');
const CONTACT_LOG = path.resolve(__dirname, '..', 'logs', 'contact.log');

const requireDatabase = (_req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next();
    return;
  }

  res.status(503).send({ message: 'Database-backed features are temporarily unavailable.' });
};

router.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('The server will crash now.');
  }, 0);
});

router.get('/api/health', (_req, res) => {
  res.send({ ok: true, service: 'desjardine-api', timestamp: new Date().toISOString() });
});

router.get('/api/ready', async (_req, res, next) => {
  try {
    await fs.access(IMAGES_DIR);
    res.send({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/api/projects', getProjects);

router.post('/api/contact', async (req, res, next) => {
  try {
    const {
      name = '',
      email = '',
      phone = '',
      message = '',
    } = req.body || {};

    if (name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(email.trim()) || message.trim().length < 10) {
      res.status(400).send({ error: 'Invalid contact submission.' });
      return;
    }

    const entry = {
      receivedAt: new Date().toISOString(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
    };

    await fs.appendFile(CONTACT_LOG, `${JSON.stringify(entry)}\n`, 'utf8');
    res.status(202).send({ message: 'Thanks. Your message has been received.' });
  } catch (err) {
    next(err);
  }
});

router.post('/signin', requireDatabase, loginValidation, login);
router.post('/signup', requireDatabase, createUserValidation, createUser);

router.use('/items', requireDatabase, itemsRouter);
router.use('/users', requireDatabase, auth, usersRouter);

module.exports = router;
