require('dotenv').config();
const
    express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    methodOverride  = require("method-override"),
    Art             = require("./models/art"),
    Comment         = require("./models/comment"),
    User            = require("./models/user")

//requiring routes
const commentRoutes    = require("./routes/comments"),
      artRoutes = require("./routes/art"),
      indexRoutes      = require("./routes/index")

// mongoose.connect("mongodb://localhost/oakart", { useNewUrlParser: true });
mongoose.connect("mongodb+srv://mwild:cuBN5PLBHD6qfPLi@cluster0-dc56b.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//moment req
app.locals.moment = require('moment');


// PASSPORT CONFIGURATION
app.use(require("express-session")({
    // secret: "",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) =>{
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/", indexRoutes);
app.use("/art", artRoutes);
app.use("/art/:id/comments", commentRoutes);


app.listen(process.env.PORT || 3000, () =>{
   console.log("Server has started");
});
