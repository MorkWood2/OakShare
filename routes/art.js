// const dotenv  = require('dotenv').config();
const express = require("express");
const router  = express.Router();
const Art = require("../models/art");
const middleware = require("../middleware");
const multer = require('multer');
const storage = multer.diskStorage({
  filename: (req, file, callback) => {
    callback(null, Date.now() + file.originalname);
  }
});
let imageFilter =  (req, file, cb) => {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
let upload = multer({ storage: storage, fileFilter: imageFilter})

let cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'dkqzolucp',
  api_key:  process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


//INDEX - show all art
router.get("/", (req, res) => {
    // Get all art pieces from DB
    Art.find({}, (err, allArt) => {
       if(err){
           console.log(err);
       } else {
          res.render("art/index",{art:allArt});
       }
    });
});

//CREATE - add new art to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), (req, res) => {
    cloudinary.v2.uploader.upload(req.file.path, (err, result) => {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      // add cloudinary url for the image to the art object under image property
      req.body.art.image = result.secure_url;
      // add image's public_id to art object
      req.body.art.imageId = result.public_id;
      // add author to art
      req.body.art.author = {
        id: req.user._id,
        username: req.user.username
      }
      Art.create(req.body.art, (err, art) => {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/art/' + art.id);
      });
    });
});

//NEW - show form to create new art piece
router.get("/new", middleware.isLoggedIn, (req, res) => {
   res.render("art/new");
});

// SHOW - shows more info about one art id
router.get("/:id", (req, res) => {
    //find the art with provided ID

    Art.findById(req.params.id).populate("comments").exec( (err, foundArt) => {
        if(err){
            console.log(err);
        } else {
            console.log(foundArt)
            //render show template with that art piece
            res.render("art/show", {art: foundArt});
        }
    });
});

// EDIT Art ROUTE
router.get("/:id/edit", middleware.checkArtOwnership, (req, res) => {
    Art.findById(req.params.id, (err, foundArt) => {
        res.render("art/edit", {art: foundArt});
    });
});

router.put("/:id", upload.single('image'), (req, res) => {
    Art.findById(req.params.id, async (err, art) => {
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(art.imageId);
                  let result = await cloudinary.v2.uploader.upload(req.file.path);
                  art.imageId = result.public_id;
                  art.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            art.name = req.body.art.name;
            art.description = req.body.art.description;
            art.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/art/" + art._id);
        }
    });
});

router.delete('/:id', (req, res) => {
  Art.findById(req.params.id, async (err, art) => {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(art.imageId);
        art.remove();
        req.flash('success', 'Art deleted successfully!');
        res.redirect('/art');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});

module.exports = router;
