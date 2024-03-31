const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });
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

// Using router.route

router
  .route('/')
  .get(wrapAsync(index))
  .post(
    isLoggedIn,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(createListing)
  );
// .post(upload.single('listing[image]'), (req, res) => {
//   res.send(req.file);
// });

router.get('/new', isLoggedIn, renderNewForm);

router
  .route('/:id')
  .get(wrapAsync(showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(destroyListing));

// Either use the router.route to make the code more simpler or use the one below to keep it simple

//Index Route
// router.get('/', wrapAsync(index));

// Display Add new Listing
// router.get('/new', isLoggedIn, renderNewForm);

// Show route
// router.get('/:id', wrapAsync(showListing));

//Create Route
// router.post('/', isLoggedIn, validateListing, wrapAsync(createListing));

// Display Edit Listing
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(renderEditForm));

// Edit Listing
// router.put(
//   '/:id',
//   isLoggedIn,
//   isOwner,
//   validateListing,
//   wrapAsync(updateListing)
// );

// Delete Route
// router.delete('/:id', isLoggedIn, isOwner, wrapAsync(destroyListing));

module.exports = router;
