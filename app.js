const express = require('express');
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const Review = require('./models/review.js');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema, reviewSchema } = require('./schema.js');

const app = express();
const path = require('path');

const MONGO_URL = 'mongodb://127.0.0.1:27017/listingdb';

main()
  .then((res) => console.log('Database Connection Successful'))
  .catch((err) => console.log(err));

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // so you can render('index')
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// use ejs-locals for all ejs templates:
app.engine('ejs', ejsMate);

app.get('/', (req, res) => {
  res.send('working');
});

//Valaidate listing Request body data
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errorMsg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(400, errorMsg);
  } else {
    next();
  }
};

//Valaidate review Request body data
const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errorMsg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(400, errorMsg);
  } else {
    next();
  }
};

//Index Route
app.get(
  '/listings',
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs', { allListings });
  })
);

// Display Add new Listing
app.get('/listings/new', (req, res) => {
  res.render('listings/new.ejs');
});

// Show route
app.get(
  '/listings/:id',
  wrapAsync(async (req, res, next) => {
    try {
      const { id } = req.params;
      const listing = await Listing.findById(id).populate('reviews');
      if (!listing) {
        throw new ExpressError(404, 'Listing not found');
      }
      res.render('listings/show.ejs', { listing });
    } catch (error) {
      next(error);
    }
  })
);

//Create Route
app.post(
  '/listings',
  validateListing,
  wrapAsync(async (req, res, next) => {
    // if (!req.body.listing) {
    //   throw new ExpressError(400, 'send valid data for listing');
    // }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect('/listings');
  })
);

// Display Edit Listing
app.get(
  '/listings/:id/edit',
  wrapAsync(async (req, res) => {
    try {
      const { id } = req.params;
      const listing = await Listing.findById(id);
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
app.put(
  '/listings/:id',
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  })
);

// Delete Route
app.delete(
  '/listings/:id',
  wrapAsync(async (req, res) => {
    try {
      const { id } = req.params;
      await Listing.findByIdAndDelete(id);
      res.redirect('/listings');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error deleting listing');
    }
  })
);

// Reviews
// Post Route
app.post(
  '/listings/:id/reviews',
  validateReview,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    const newReview = new Review(req.body.review);
    await newReview.save();

    listing.reviews.push(newReview);
    await listing.save();

    res.redirect(`/listings/${req.params.id}`); // Redirect to the listing page
  })
);

//Delete Review Route
app.delete(
  '/listings/:id/reviews/:reviewId',
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}#reviews`);
  })
);

// app.get('/test', async (req, res) => {
//   let sampleListng = new Listing({
//     title: 'villa',
//     description: '2x2 house',
//     // image: 'https://example.com/your-image-url.jpg', // Provide a string URL for the image
//     price: 345,
//     location: 'near the building',
//     country: 'US',
//   });

//   await sampleListng.save();
//   console.log('sample success');
//   res.send('success');
// });

app.all('*', (req, res, next) => {
  next(new ExpressError(404, 'Page Not Found!'));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = 'something went wrong' } = err;
  res.status(statusCode).render('error.ejs', { err });
  // res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log('Server running on 8080');
});
