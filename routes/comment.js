var express = require("express");
var router = express.Router();
var food = require("../models/food");
var comment = require("../models/comment");
var middleware = require("../middleware");

router.post("/foods/:id/comment", middleware.isloggedin, function (req, res) {
  food.findById(req.params.id, function (err, food) {
    if (err) {
      console.log(err);
    } else {
      comment.create(req.body.comment, function (err, comment) {
        if (err) {
          console.log(err);
        } else {
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          food.comment.push(comment);
          food.save();
          req.flash("success", "comment created successfully");
          res.redirect("/foods/" + food._id);
        }
      });
    }
  });
});

module.exports = router;
