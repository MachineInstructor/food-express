var middlewareobj = {};

middlewareobj.isloggedin = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/login");
};

middlewareobj.isauthorised = function (req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.isadmin.toString() === "true") {
      return next();
    } else {
      res.redirect("/foods");
    }
  } else {
    res.redirect("/login");
  }
};

module.exports = middlewareobj;
