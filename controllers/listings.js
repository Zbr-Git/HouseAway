const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const Listing = require('../models/listing');

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render('listings/index.ejs', { allListings, categorySelected: false });
};

module.exports.renderNewForm = (req, res) => {
  res.render('listings/new.ejs');
};

module.exports.showListing = async (req, res, next) => {
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
};

module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  // if (!req.body.listing) {
  //   throw new ExpressError(400, 'send valid data for listing');
  // }
  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);

  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = response.body.features[0].geometry;
  let savedListing = await newListing.save();
  console.log(savedListing);
  req.flash('success', 'New Listing Created!');
  res.redirect('/listings');
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash('error', 'Requested Listing Does not exist');
    res.redirect('/listings');
  }
  let orignialImageUrl = listing.image.url;
  orignialImageUrl = orignialImageUrl.replace('/upload', '/upload/w_250');

  res.render('listings/edit.ejs', { listing, orignialImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file != 'undefined') {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash('success', 'Listing Updated!');
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  try {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing Deleted!');
    res.redirect('/listings');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting listing');
  }
};
