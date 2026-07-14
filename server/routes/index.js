const router = require('express').Router();
const fs = require('fs/promises');
const path = require('path');
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

router.post('/signin', loginValidation, login);
router.post('/signup', createUserValidation, createUser);

router.use('/items', itemsRouter);

router.use(auth);
router.use('/users', usersRouter);

module.exports = router;
