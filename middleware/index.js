const Art = require("../models/art");
const Comment = require("../models/comment");

// all the middleare goes here
const middlewareObj = {};

middlewareObj.checkArtOwnership = (req, res, next) => {
 if(req.isAuthenticated()){
        Art.findById(req.params.id, (err, foundArt) =>{
           if(err){
               req.flash("error", "Art not found");
               res.redirect("back");
           }  else {
               // does user own the art piece?
            if(foundArt.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = (req, res, next) => {
 if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, (err, foundComment) => {
           if(err){
               res.redirect("back");
           }  else {
               // does user own the comment?
            if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
           }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

module.exports = middlewareObj;
