const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator/check');
const {matchedData, sanitize} = require('express-validator/filter');
const multer = require('multer');
const UPLOAD_PATH = 'uploads';
const imageFilter = require('./../utils');
const upload = multer({dest: `${UPLOAD_PATH}/`, fileFilter: imageFilter});
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./../models/user');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function (req, res, next) {
  res.render('register', {title: 'Register'});
});
router.post('/register', [
    upload.single('profileimage'),
    check('name', 'Name fileld is required')
      .trim()
      .exists(),
    check('username', 'Username fileld is required')
      .trim()
      .exists(),
    check('email', 'Email fileld is required')
      .exists()
      .isEmail()
      .withMessage('Must be an email')
      .normalizeEmail(),
    check('password', 'Password must be at least 5 chars long')
      .exists('Password fileld is required')
      .isLength({min: 5}),
    check('password2', 'Passwords not equals')
      .custom((value, {req}) => value === req.body.password),

    //upload.single('profileimage'),
  ],

  function (req, res, next) {

    const {body: {name, email, username, password}, file} = req;
    console.log('file', file);

    const profileimage = file ? file.filename : 'noimage.jpg';

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('register', {errors: errors.mapped()});

    } else {
      const newUser = new User({name, email, username, password, profileimage});
      User.createUser(newUser, (err, user) => {
        if (err) throw err;
      });

      req.flash('success', 'You are now registered and can login');

      res.location('/');
      res.redirect('/');
    }

  }
);

router.get('/login', function (req, res, next) {
  res.render('login', {title: 'Login'});
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});


router.post('/login',
  passport.authenticate('local',
    {failureRedirect: '/users/login', failureFlash: 'Invalid username or password'}),
  function (req, res) {
    req.flash('success', 'You are now logged in');
    res.redirect('/');
  }
);

passport.use(new LocalStrategy(
  function (username, password, done) {
    User.getUserByUsername(username, (err, user) => {
      if (err) throw err;
      if (!user) {
        return done(null, false, {message: 'Unknown user'});
      }
      User.comparePassword(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, {message: 'Invalid password'});
        }
      })

    })
  }
));

router.get('/logout', function (req, res, next) {
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/users/login');
});

module.exports = router;
