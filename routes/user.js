const express = require('express');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware');
const {
  renderSignUpForm,
  signup,
  renderLoginForm,
  login,
  logout,
} = require('../controllers/users');

const router = express.Router();

// Refactoring routes further with router.route
router.route('/signup').get(renderSignUpForm).post(wrapAsync(signup));

router
  .route('/login')
  .get(renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate('local', {
      failureRedirect: '/login',
      failureFlash: true,
    }),
    login
  );
  
// use the above router.route code or the one below.

// GET route to render the signup page
// router.get('/signup', renderSignUpForm);

// router.post('/signup', wrapAsync(signup));

// router.get('/login', renderLoginForm);

// router.post(
//   '/login',
//   saveRedirectUrl,
//   passport.authenticate('local', {
//     failureRedirect: '/login',
//     failureFlash: true,
//   }),
//   login
// );

router.get('/logout', logout);

module.exports = router;
