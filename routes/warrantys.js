const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Warranty = require('../models/warranty');
const { warrantySchema } = require('../schemas.js');

//for displaying all the card in the index.ejs file
router.get(
  '/',
  catchAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
      req.flash('error', 'You must be logged in');
      return res.redirect('/users/login');
    }
    const warrantys = await Warranty.find({});
    res.render('warrantys/index', { warrantys });
  })
);

//for showing the page which contains card
router.get('/', (req, res) => {
  res.render('warrantys');
});

const validateWarranty = (req, res, next) => {
  const { error } = warrantySchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

//adding a card and then takes you back
router.post(
  '/',
  validateWarranty,
  catchAsync(async (req, res) => {
    const warranty = new Warranty(req.body.warranty);
    await warranty.save();
    req.flash('success', 'Successfully maded a warranty card');
    res.redirect('/warrantys');
  })
);

//to show a card when you click on it
router.get(
  '/:id',
  catchAsync(async (req, res) => {
    const warranty = await Warranty.findById(req.params.id);
    if (!warranty) {
      req.flash('error', 'Cannot find the warranty card');
      return res.redirect('/warrantys');
    }
    res.render('warrantys/show', { warranty });
  })
);

//opening update file
router.get(
  '/:id/edit',
  catchAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
      req.flash('error', 'You must be logged in');
      return res.redirect('/users/login');
    }
    const warranty = await Warranty.findById(req.params.id);

    res.render('warrantys/edit', { warranty });
  })
);

//updating the card
router.put(
  '/:id',
  validateWarranty,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const warranty = await Warranty.findByIdAndUpdate(id, {
      ...req.body.warranty,
    });
    req.flash('success', 'Successfully updated');
    res.redirect('/warrantys');
  })
);

//to delete a card
router.delete(
  '/:id/',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Warranty.findByIdAndDelete(id);
    res.redirect('/warrantys');
  })
);

module.exports = router;
