if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const engine  = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const MongoStore = require('connect-mongo');

const User = require('./models/user');

// Routes
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');


// Database Connection
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'

mongoose.connect(dbUrl)
    .then(() => {
        console.log("Connection Successful")
    })
    .catch(err => {
        console.log("An error occured.");
        console.log(err)
    })

// Express App
app = express();

// EJS engine and views directory
app.engine('ejs', engine);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// POST request parse middleware
app.use(express.urlencoded({extended:true}))

// Method override to use DELETE, PUT, PATCH
app.use(methodOverride('_method'))

// Serving static content
app.use(express.static(path.join(__dirname, 'public')))

// Session + Setting Session Store
const secret = process.env.SECRET || "secretkey"

const store = new MongoStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 3600
})

store.on('error', function(e) {
    console.log("STORE ERROR");
    console.log(e);
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

// Flash + flash middleware
app.use(flash());

// passport config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Locals
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// Mongoose Sanitize
app.use(mongoSanitize());

// Helmet: security
app.use(helmet({ contentSecurityPolicy: false }))

// HOME
app.get('/', (req, res) => {
    res.render('home')
});

// Using routes
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes)

// No Route Matched Handler
app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found", 404))
})


// Generic Error Handler
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;

    if (!err.message) err.message = "Something went wrong";
    res.status(statusCode).render('error', {err})
})


// Starting our server
const PORT = 8080;
app.listen(PORT, (req, res) => {
    console.log(`LISTENING ON ${PORT}`);
})