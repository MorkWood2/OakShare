const express = require("express");
const router  = express.Router({mergeParams: true});
const Art = require("../models/art");
const Comment = require("../models/comment");
const middleware = require("../middleware");

//Comments New
router.get("/new",middleware.isLoggedIn, (req, res) => {
    // find art by id
    console.log(req.params.id);
    Art.findById(req.params.id, (err, art) => {
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {art: art});
        }
    })
});

//Comments Create
router.post("/",middleware.isLoggedIn, (req, res) =>{
   //lookup art using ID
   Art.findById(req.params.id, (err, art) => {
       if(err){
           console.log(err);
           res.redirect("/art");
       } else {
        Comment.create(req.body.comment, (err, comment) => {
           if(err){
               req.flash("error", "Something went wrong");
               console.log(err);
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               art.comments.push(comment);
               art.save();
               console.log(comment);
               req.flash("success", "Successfully added comment");
               res.redirect('/art/' + art._id);
           }
        });
       }
   });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
   Comment.findById(req.params.comment_id, (err, foundComment) => {
      if(err){
          res.redirect("back");
      } else {
        res.render("comments/edit", {art_id: req.params.id, comment: foundComment});
      }
   });
});

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
      if(err){
          res.redirect("back");
      } else {
          res.redirect("/art/" + req.params.id );
      }
   });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
       if(err){
           res.redirect("back");
       } else {
           req.flash("success", "Comment deleted");
           res.redirect("/art/" + req.params.id);
       }
    });
});

module.exports = router;
