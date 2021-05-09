const express = require('express');
const { ObjectID } = require('mongodb');
const moment = require('moment');
const cron = require('node-cron');

const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const { dateToISOLikeButLocal } = require('../utils/date');
const ExpressError = require('../utils/ExpressError');
const Warranty = require('../models/warranty');
const { warrantySchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');

//for displaying all the card in the index.ejs file
router.get(
  '/',
  isLoggedIn,
  catchAsync(async (req, res) => {
    const userId = req.user._doc._id;
    // let d = new Date().toISOString();

    const warrantys = await Warranty.find({
      owner: userId,
    });

    if (warrantys.length == 0) {
      res.render('warrantys/index', {
        warrantys,
      });
    } else {
      res.render('warrantys/index', {
        warrantys,
        purchase: dateToISOLikeButLocal(warrantys[0].purchase),
        expiry: dateToISOLikeButLocal(warrantys[0].expiry),
      });
    }
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
  isLoggedIn,
  validateWarranty,
  catchAsync(async (req, res) => {
    const warranty = new Warranty({
      ...req.body.warranty,
      owner: req.user._doc._id,
    });
    const date = moment(warranty.purchase);
    const expDate = date.add(warranty.period, 'month').toDate();
    warranty.expiry = expDate;
    const mDate = moment(expDate);
    const finalDate = mDate.subtract(7, 'date').toDate();
    warranty.mailDate = finalDate;
    await warranty.save();
    req.flash('success', 'Successfully maded a warranty card');
    res.redirect('/warrantys');
  })
);

//to show a card when you click on it
router.get(
  '/:id',
  isLoggedIn,
  catchAsync(async (req, res) => {
    const warranty = await Warranty.findById(req.params.id);

    if (!warranty || !warranty.owner.equals(req.user._doc._id)) {
      req.flash('error', 'Cannot find the warranty card');
      return res.redirect('/warrantys');
    }
    res.render('warrantys/show', {
      warranty,
      purchase: dateToISOLikeButLocal(warranty.purchase),
      expiry: dateToISOLikeButLocal(warranty.expiry),
    });
  })
);

//opening update file
router.get(
  '/:id/edit',
  isLoggedIn,
  catchAsync(async (req, res) => {
    const warranty = await Warranty.findById(req.params.id);
    if (!warranty.owner.equals(req.user._doc._id)) {
      req.flash('error', 'Cannot find the warranty card');
      return res.redirect('/warrantys');
    }

    res.render('warrantys/edit', {
      warranty,
      purchase: dateToISOLikeButLocal(warranty.purchase),
    });
  })
);

//updating the card
router.put(
  '/:id',
  isLoggedIn,
  validateWarranty,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const warranty = await Warranty.findByIdAndUpdate(id, {
      ...req.body.warranty,
    });
    if (!warranty.owner.equals(req.user._doc._id)) {
      req.flash('error', 'Cannot find the warranty card');
      return res.redirect('/warrantys');
    }
    req.flash('success', 'Successfully updated');
    res.redirect('/warrantys');
  })
);

//to delete a card
router.delete(
  '/:id/',
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const warranty = await Warranty.findById(req.params.id);
    if (!warranty.owner.equals(req.user._doc._id)) {
      req.flash('error', 'Cannot find the warranty card');
      return res.redirect('/warrantys');
    }

    await Warranty.findByIdAndDelete(id);
    res.redirect('/warrantys');
  })
);

module.exports = router;
