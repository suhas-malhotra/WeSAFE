const express = require('express');
const moment = require('moment');
const nodemailer = require('nodemailer');
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
    //const emailID = req.user._doc.email;
    const warrantys = await Warranty.find({
      owner: userId,
    });

    // cron.schedule('* * * * * *', () => {
    //   let d = new Date().toISOString();
    //   for (var i = 0; i < warrantys.length; i++) {
    //     if (warrantys[i].ISOMailDate === d) {
    //       const mailOptions = {
    //         from: 'wesafe.2021@gmail.com',
    //         to: `${emailID}`,
    //         subject: 'Important message from WeSAFE',
    //         text: `your product ${warrantys[i].product} of the company
    //         ${warrantys[i].company}is about to expire in 7 days`,
    //       };
    //       const transporter = nodemailer.createTransport({
    //         service: 'gmail',
    //         auth: {
    //           user: 'wesafe.2021@gmail.com',
    //           pass: 'pooja0474@',
    //         },
    //       });
    //       transporter.sendMail(mailOptions, (error, info) => {
    //         if (error) {
    //           console.log(error);
    //         } else {
    //           console.log('email send');
    //         }
    //       });
    //     }
    //   }
    // });

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
  validateWarranty,
  catchAsync(async (req, res) => {
    const warranty = new Warranty({
      ...req.body.warranty,
      owner: req.user._doc._id,
    });
    const emailID = req.user._doc.email;
    const date = moment(warranty.purchase);
    const eDate = date.add(warranty.period, 'month').toDate();
    const expDate = dateToISOLikeButLocal(eDate);
    warranty.expiry = expDate;

    const mailOptions = {
      from: 'wesafe.2021@gmail.com',
      to: `${emailID}`,
      subject: 'Important message from WeSAFE',
      text: `You have just added the product ${warranty.product} of ${warranty.company} to the WeSAFE.com`,
    };

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'wesafe.2021@gmail.com',
        pass: 'pooja0474@',
      },
    });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('email send');
      }
    });

    // const mDate = moment(warranty.expiry);
    // const fDate = mDate.subtract(7, 'd').toDate();
    // warranty.ISOMailDate = fDate;
    // const finalDate = dateToISOLikeButLocal(fDate);
    // warranty.mailDate = finalDate;

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
