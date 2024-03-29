const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js');
const {
  index,
  showListing,
  renderNewForm,
  createListing,
  renderEditForm,
  updateListing,
  destroyListing,
} = require('../controllers/listings.js');

//Index Route
router.get('/', wrapAsync(index));

// Display Add new Listing
router.get('/new', isLoggedIn, renderNewForm);

// Show route
router.get('/:id', wrapAsync(showListing));

//Create Route
router.post('/', isLoggedIn, validateListing, wrapAsync(createListing));

// Display Edit Listing
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(renderEditForm));

// Edit Listing
router.put(
  '/:id',
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(updateListing)
);

// Delete Route
router.delete('/:id', isLoggedIn, isOwner, wrapAsync(destroyListing));

module.exports = router;
