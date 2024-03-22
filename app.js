const express = require('express');
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

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

//Index Route
app.get('/listings', async (req, res) => {
  const allListings = await Listing.find({});
  res.render('listings/index.ejs', { allListings });
});

// Display Add new Listing
app.get('/listings/new', (req, res) => {
  res.render('listings/new.ejs');
});

// Show route
app.get('/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/show.ejs', { listing });
  } catch (error) {
    console.error(error);
    res.status(404).send('Listing not found');
  }
});

//Create Route
app.post('/listings', async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect('/listings');
});

// Display Edit Listing
app.get('/listings/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/edit.ejs', { listing });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occured while Displaying edit.js listing page');
  }
});

// Edit Listing
app.put('/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating listing');
  }
});

// Delete Route
app.delete('/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting listing');
  }
});

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

app.listen(8080, () => {
  console.log('Server running on 8080');
});
