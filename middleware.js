const Listing = require('./models/listing');
const { listingSchema, reviewSchema } = require('./schema');
const ExpressError = require('./utils/ExpressError');

module.exports.isLoggedIn = (req, res, next) => {
  // console.log(req.originalUrl);
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash('error', 'You must be logged in to perform this Action!');
    return res.redirect('/login');
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currentUser._id)) {
    req.flash('error', 'You are not the Owner of this Listing');
    return res.redirect(`/listings/${id}`);
  }
  next(); // Call next() to proceed to the next middleware or route handler
};

// Validate listing Request body data middleware
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errorMsg = error.details.map((el) => el.message).join(',');
    return next(new ExpressError(400, errorMsg)); // Return the error to the error handling middleware
  }

  next(); // Call next to proceed to the next middleware or route handler
};

//Valaidate review Request body data
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errorMsg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(400, errorMsg);
  } else {
    next();
  }
};