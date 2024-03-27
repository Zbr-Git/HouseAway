const express = require('express');
const router = express.Router();
const Listing = require('../models/listing.js');
const wrapAsync = require('../utils/wrapAsync.js');
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js');

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
        .populate({
          path: 'reviews',
          populate: {
            path: 'author',
          },
        })
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
  isOwner,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash('error', 'Requested Listing Does not exist');
      res.redirect('/listings');
    }
    res.render('listings/edit.ejs', { listing });
  })
);

// Edit Listing
router.put(
  '/:id',
  isLoggedIn,
  isOwner,
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
  isOwner,
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
