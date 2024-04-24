var express = require("express");
var router = express.Router();
var passport = require("passport");
var user = require("../models/user");
var middleware = require("../middleware");

router.get("/register", function (req, res) {
  res.render("register");
});

router.post("/register", function (req, res) {
  var newuser = new user({
    username: req.body.username,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    contact: req.body.contact,
  });
  user.register(newuser, req.body.password, function (err, user) {
    if (err) {
      req.flash("error", err.message);
      return res.render("register");
    }

    passport.authenticate("local")(req, res, function () {
      req.flash("success", "Singed in as" + user.username);
      res.redirect("/foods");
    });
  });
});

router.get("/login", function (req, res) {
  res.render("login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/foods",
    failureRedirect: "/login",
  }),
  function (req, res) {}
);

router.get("/logout", function (req, res) {
  req.logout();
  req.flash("success", "logged out successfully");
  res.redirect("/foods");
});

router.get("/adminregister", middleware.isauthorised, function (req, res) {
  res.render("adminregister");
});

router.post("/adminregister", middleware.isauthorised, function (req, res) {
  var newuser = new user({
    username: req.body.username,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    contact: req.body.contact,
    isadmin: "true",
  });
  user.register(newuser, req.body.password, function (err, user) {
    if (err) {
      req.flash("error", err.message);
      return res.render("register");
    }
    req.flash("success", "admin created");
    res.redirect("/foods");
  });
});

router.get("/team", function (req, res) {
  res.render("teams");
});
router.get("/contact", function (req, res) {
  res.render("contact");
});

module.exports = router;
