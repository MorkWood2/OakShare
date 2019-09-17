const express = require("express");
const router  = express.Router();
const passport = require("passport");
const User = require("../models/user");
const Art = require("../models/art");

//root route
router.get("/", (req, res) => {
    res.redirect("/art");
});

// show register form
router.get("/register", (req, res) => {
   res.render("register");
});

//handle sign up logic
router.post("/register", (req, res) => {
    let newUser = new User({
      username:req.body.username,
      firstName: req.body.firstName,
      lastName : req.body.lastName

    });
    // if(req.body.adminCode === ''){
    //   newUser.isAdmin = true;
    // }

    User.register(newUser, req.body.password, (err, user) => {
        if(err){
            req.flash("error", err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, () => {
           req.flash("success", "Welcome to Oakshare " + user.username);
           res.redirect("/art");
        });
    });
});

//show login form
router.get("/login", (req, res) => {
   res.render("login");
});

//handling login logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/art",
        failureRedirect: "/login"
    }), (req, res) => {
});

// logout route
router.get("/logout", (req, res) => {
   req.logout();
   req.flash("success", "Logged you out!");
   res.redirect("/art");
});

//user profile
router.get('/users/:id',  (req, res) => {
User.findById(req.params.id,  (err, foundUser) => {
if (err) {
  req.flash('error','Something went wrong' );
  res.redirect('/');
}
  Art.find().where('author.id').equals(foundUser._id).exec((err, arts) => {
    if (err) {
      req.flash('error','Something went wrong' );
      res.redirect('/');
    }
    res.render('users/show', {user: foundUser, arts:arts});
  })
  });
});


module.exports = router;
