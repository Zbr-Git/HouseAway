const express = require('express');
const router = express.Router();
const Listing = require('../models/listing.js');
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema } = require('../schema.js');
const { isLoggedIn } = require('../middleware.js');

// Validate listing Request body data middleware
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errorMsg = error.details.map((el) => el.message).join(',');
    return next(new ExpressError(400, errorMsg)); // Return the error to the error handling middleware
  }

  next(); // Call next to proceed to the next middleware or route handler
};

//Index Route
router.get(
  '/',
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs', { allListings });
  })
);

// Display Add new Listing
router.get('/new', isLoggedIn, (req, res) => {
  res.render('listings/new.ejs');
});

// Show route
router.get(
  '/:id',
  wrapAsync(async (req, res, next) => {
    try {
      const { id } = req.params;
      const listing = await Listing.findById(id)
        .populate('reviews')
        .populate('owner');
      if (!listing) {
        req.flash('error', 'Requested Listing Does not exist');
        res.redirect('/listings');
      }
      res.render('listings/show.ejs', { listing });
    } catch (error) {
      next(error);
    }
  })
);

//Create Route
router.post(
  '/',
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res, next) => {
    // if (!req.body.listing) {
    //   throw new ExpressError(400, 'send valid data for listing');
    // }
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash('success', 'New Listing Created!');
    res.redirect('/listings');
  })
);

// Display Edit Listing
router.get(
  '/:id/edit',
  isLoggedIn,
  wrapAsync(async (req, res) => {
    try {
      const { id } = req.params;
      const listing = await Listing.findById(id);
      if (!listing) {
        req.flash('error', 'Requested Listing Does not exist');
        res.redirect('/listings');
      }
      res.render('listings/edit.ejs', { listing });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send('Error occured while Displaying edit.js listing page');
    }
  })
);

// Edit Listing
router.put(
  '/:id',
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash('success', 'Listing Updated!');
    res.redirect(`/listings/${id}`);
  })
);

// Delete Route
router.delete(
  '/:id',
  isLoggedIn,
  wrapAsync(async (req, res) => {
    try {
      const { id } = req.params;
      await Listing.findByIdAndDelete(id);
      req.flash('success', 'Listing Deleted!');
      res.redirect('/listings');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error deleting listing');
    }
  })
);

module.exports = router;
