const express = require('express');
const wrapAsync = require('../utils/wrapAsync');
const User = require('../models/user');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware');
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
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash(
          'success',
          `Welcome! ${registeredUser.username}, to House Away`
        );

        res.redirect('/listings');
      });
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
  saveRedirectUrl,
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash('success', 'Loged In Successfully!');
    let redirectUrl = res.locals.redirectUrl || '/listings';
    res.redirect(redirectUrl);
  }
);

router.get('/logout', async (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash('success', 'Logged Out Successfully!');
    res.redirect('/listings');
  });
});

module.exports = router;
