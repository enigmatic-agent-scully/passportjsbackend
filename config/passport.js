var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./../models/user');


//serializeUser allows passport to save the users id (or other information if we define after done) into the session upon login
passport.serializeUser(function (user, done) {
    done(null, user.id)
});

//deserializeUser upon login go to the database and fetch the users info based upon the id
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        //Once the sign login is successful, the "user" object below will be available globally 
        done(err, user);
    });
});

//Sign up passport strategy
passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    User.findOne({ 'email': email }, function (err, user) {
        if (err) {
            return done(err);
        }
        //if the user exists already
        if (user) {
            return done(null, false)
            //after installing connect flash we'll send back error message
        }
        var newUser = new User();
        newUser.fullname = req.body.name;
        newUser.email = req.body.email;
        newUser.password = newUser.encryptPassword(req.body.password);

        newUser.save(function (err) {
            if (err) {
                return done(err);
            }
            //if user is successfully created/saved send back the data via the "done" call back carrying the "newUser" obj
            return done(null, newUser)
        })
    })
}))





//Login passport strategy
passport.use('local.login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    User.findOne({ 'email': email }, function (err, user) {
        if (err) {
            return done(err);
        }
        //in this strategy we're checking to see if the user does not exist
        if (!user) {
            return done(null, false)
            //after installing connect flash we'll send back error message
        }
        //if user does exist we'll check to ensure their password is correct
        if (!user.validPassword(req.body.password)) {
            //after installing connect flash we'll send back error message
            return done(null, false)
        }
        //if they do exist and their password is correct we'll return the "user" object via the "done" call back function
        return done(null, user)

    })
}))