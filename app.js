const express = require('express');
const connectMongo = require('connect-mongo');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');

const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const ExpressError = require('./utils/ExpressError');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const warrantysRoutes = require('./routes/warrantys');
const app = express();

//for running update and delete command using Method Override
app.use(methodOverride('_method'));

//for reading public folder for html css and js
app.use(express.static('public'));

//for running ejs files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//to start ejs mate
app.engine('ejs', ejsMate);

//for parsing the body
app.use(express.urlencoded({ extended: true }));

//creating a mongoose database
const dbUrl =
  'mongodb+srv://suhasMalhotra:Q96Uje3m2MS6qQL@wesafe.rhdsf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
mongoose
  .connect(dbUrl, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database connected');
  });

//making a session
app.use(
  session({
    secret: 'i am suhas',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
    store: connectMongo.create({
      mongoUrl: dbUrl,
    }),
  })
);

//using flash for making successful message
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', userRoutes);

app.use('/warrantys', warrantysRoutes);

//for home page
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/pricing', (req, res) => {
  res.render('warrantys/pricing');
});

app.get('/about-us', (req, res) => {
  res.render('warrantys/aboutUs');
});

app.get('/contact-us', (req, res) => {
  res.render('warrantys/contactUs');
});
app.get('/team', (req, res) => {
  res.render('warrantys/team');
});

//(position matters)
//if nothing from the top matches then this is runned
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

//for handling errors
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message)
    err.message = 'Something Went Wrong , which even i dont know😂😂😢';
  res.status(statusCode).render('error', { err });
});

//starting the Server
app.listen(8000, () => {
  console.log('Server started at 8000');
});
