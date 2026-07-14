const ClothingItem = require('../models/clothingItem');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');
const NotFoundError = require('../errors/NotFoundError');

const getItems = (_req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.send(items))
    .catch(next);
};

const createItem = (req, res, next) => {
  const {
    name,
    imageUrl,
    weather,
  } = req.body;

  ClothingItem.create({
    name,
    imageUrl,
    weather,
    owner: req.user._id,
  })
    .then((item) => res.status(201).send(item))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Invalid clothing item data.'));
        return;
      }
      next(err);
    });
};

const deleteItem = (req, res, next) => {
  ClothingItem.findById(req.params.id)
    .orFail(() => new NotFoundError('Clothing item not found.'))
    .then((item) => {
      if (String(item.owner) !== req.user._id) {
        throw new ForbiddenError('You cannot delete another user\'s item.');
      }

      return item.deleteOne().then(() => res.send(item));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Invalid clothing item id.'));
        return;
      }
      next(err);
    });
};

const likeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => new NotFoundError('Clothing item not found.'))
    .then((item) => res.send(item))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Invalid clothing item id.'));
        return;
      }
      next(err);
    });
};

const dislikeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => new NotFoundError('Clothing item not found.'))
    .then((item) => res.send(item))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Invalid clothing item id.'));
        return;
      }
      next(err);
    });
};

module.exports = {
  getItems,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
};
