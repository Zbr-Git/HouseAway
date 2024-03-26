const express = require('express');
const wrapAsync = require('../utils/wrapAsync');
const User = require('../models/user');
const passport = require('passport');
const router = express.Router();

// GET route to render the signup page
router.get('/signup', (req, res) => {
  res.render('users/signup.ejs');
});

router.post(
  '/signup',
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({
        username,
        email,
      });

      const registeredUser = await User.register(newUser, password);
      console.log(registeredUser);
      req.flash('success', 'welcome to HouseAway!');
      res.redirect('/listings');
    } catch (error) {
      req.flash('error', error.message);
      res.redirect('/signup');
    }
  })
);

router.get('/login', (req, res) => {
  res.render('users/login.ejs');
});

router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash('success', 'Loged In Successfully!');
    res.redirect('/listings');
  }
);

module.exports = router;
