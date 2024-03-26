const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const session = require('express-session');
const flash = require('connect-flash');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const listings = require('./routes/listing.js');
const reviews = require('./routes/review.js');

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

const sessionOptions = {
  secret: 'bingchilling',
  resave: true,
  saveUninitialized: true,
};

app.get('/', (req, res) => {
  res.send('working');
});

app.use(session(sessionOptions)); // Middleware for setting up session management
app.use(flash()); // Middleware for handling flash messages using the connect-flash npm package

app.use(passport.initialize()); // Middleware that initialise passport
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // Use Static authenticate method of model in LocalStrategy
passport.serializeUser(User.serializeUser()); // Serialise User into session
passport.deserializeUser(User.deserializeUser()); //deSerialisiation User into session

// Middleware for making flash messages available in templates
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.get('/demouser', async (req, res) => {
  const fakeUser = new User({
    email: 'student@gmail.com',
    username: 'student',
  });
  const registerdUser = await User.register(fakeUser, 'hello');
  res.send(registerdUser);
});

app.use('/listings', listings);
app.use('/listings/:id/reviews', reviews);

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
