const router = require('express').Router();
const {
  getItems,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
} = require('../controllers/items');
const {
  itemBodyValidation,
  itemIdValidation,
} = require('../middlewares/validation');
const auth = require('../middlewares/auth');

router.get('/', getItems);
router.post('/', auth, itemBodyValidation, createItem);
router.delete('/:id', auth, itemIdValidation, deleteItem);
router.put('/:id/likes', auth, itemIdValidation, likeItem);
router.delete('/:id/likes', auth, itemIdValidation, dislikeItem);

module.exports = router;
