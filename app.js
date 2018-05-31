const express = require('express'),
    bodyParser = require("body-parser"),
    mongoose = require('mongoose'),
    User = require('./models/user'),
    passport = require('passport'),
    LocalStartegy = require("passport-local"), //local strategy for passport user auth
    passportLocalMongoose = require("passport-local-mongoose"); //helps in hashing password and storing in DB
    
mongoose.connect("mongoDB://localhost/auth_demo_app");    

var app = express(); //initialize your express app
app.use(bodyParser.urlencoded({extended:true})); //use body-parser middleware 
app.use(require('express-session')({
    secret: "I am a glutton",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStartegy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('view engine', 'ejs');

//--------ROUTES---------------

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/secret', isLoggedIn,(req, res) => {
    res.render('secret');
})

//----SIGN UP routes-------------
//show sign up form
app.get('/register', (req, res) => {
    res.render('register');
})
//handle user sign up
app.post('/register', (req, res) => { //store the user in database and hashes the password
    User.register(new User({username: req.body.username}), req.body.password, (err, user) => { 
        if(err) {
            console.log(err);
            return res.render('register');
        } 
        passport.authenticate("local")(req, res, function() { 
            res.redirect('/secret');
        })
        //NOTES on passport.authenticate() in the bottom
    });
})

//------LOGIN routes------------------
//render login form
app.get('/login', (req, res) => {
    res.render('login');
})
//handle user login
//middleware
app.post('/login', passport.authenticate('local', {
    successRedirect: "/secret",
    failureRedirect: "/login"
}),(req, res) => {});

//-------LOGOUT route----------------
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})

//creating our own middleware to check if a user is logged in or not
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated())
        return next();
    res.redirect('/login');
}

app.listen(process.env.PORT, process.env.IP, () => {
    console.log("server started......");
});

/*
NOTES on passport.authenticate :
logs the user in,
runs the serializeUser() method
redirects to secret page if needed, can also redirect to homepage
can also specify strategy - local,google,facebook,github,... Eg: passport.authenticate('github')(...)
*/