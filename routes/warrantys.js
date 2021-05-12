const express = require('express');
const moment = require('moment');
const multer = require('multer');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const { dateToISOLikeButLocal } = require('../utils/date');
const ExpressError = require('../utils/ExpressError');
const Warranty = require('../models/warranty');
const { warrantySchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
//for displaying all the card in the index.ejs file
router.get(
  '/',
  isLoggedIn,
  catchAsync(async (req, res) => {
    const userId = req.user._doc._id;
    //const emailID = req.user._doc.email;
    const warrantys = await Warranty.find({
      owner: userId,
    });
    res.render('warrantys/index', {
      warrantys,
    });
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
  upload.array('image'),
  validateWarranty,
  catchAsync(async (req, res) => {
    const warranty = new Warranty({
      ...req.body.warranty,
      owner: req.user._doc._id,
    });
    warranty.images = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));
    const date = moment(warranty.purchase);
    const eDate = date.add(warranty.period, 'month').toDate();
    const expDate = dateToISOLikeButLocal(eDate);
    warranty.expiry = expDate;

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
    });
  })
);

//updating the card
router.put(
  '/:id',
  isLoggedIn,
  upload.array('image'),
  validateWarranty,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const war = new Warranty({
      ...req.body.warranty,
      owner: req.user._doc._id,
    });
    const date = moment(war.purchase);
    const eDate = date.add(war.period, 'month').toDate();
    const expDate = dateToISOLikeButLocal(eDate);

    const warranty = await Warranty.findByIdAndUpdate(id, {
      ...req.body.warranty,
      expiry: expDate,
    });
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    warranty.images.push(...imgs);
    if (!warranty.owner.equals(req.user._doc._id)) {
      req.flash('error', 'Cannot find the warranty card');
      return res.redirect('/warrantys');
    }
    await warranty.save();
    req.flash('success', 'Successfully updated');
    res.redirect('/warrantys');
    // }
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
