var express = require("express");
var router = express.Router();
var food = require("../models/food");
var user = require("../models/user");
var cart = require("../models/cart");
var address = require("../models/address");
var order = require("../models/order");
var middleware = require("../middleware");
var MongoClient = require("mongodb").MongoClient;
const checksum_lib = require("../paytm/checksum/checksum");
const https = require("https");
var url =
  "mongodb+srv://osamaiqbal786:osama786@cluster0-2683c.mongodb.net/food_express?retryWrites=true&w=majority";

router.get("/:id/cart", middleware.isloggedin, function (req, res) {
  // res.send("get route")
  user
    .findById(req.user._id)
    .populate("cart")
    .exec(function (err, usercart) {
      if (err) {
        console.log(err);
      } else {
        res.render("cart/cart", { user: usercart });
      }
    });
});
router.post("/foods/:id/new/cart", middleware.isloggedin, function (req, res) {
  user.findById(req.user._id, function (err, user) {
    if (err) {
      console.log(err);
    } else {
      cart.create(req.body.peice, function (err, cart) {
        if (err) {
          console.log(err);
        } else {
          food.findById(req.params.id, function (err, food) {
            if (err) {
              console.log(err);
            } else {
              cart.obj.id = req.params.id;
              cart.obj.name = food.name;
              cart.obj.price = food.price;
              cart.obj.image = food.image;
              //  cart.author.username= req.user.username;
              cart.save();
              user.cart.push(cart);
              user.save();
              req.flash("success", "Added to cart successfully");
              res.redirect("/" + req.user._id + "/cart");
            }
          });
        }
      });
    }
  });
});

router.delete("/:id/cart/:cart_id", middleware.isloggedin, function (req, res) {
  cart.findByIdAndRemove(req.params.cart_id, function (err) {
    if (err) {
      res.redirect("/" + req.params.id + "/cart");
    } else {
      res.redirect("/" + req.params.id + "/cart");
    }
  });
});

router.get(
  "/:id/cart/checkout/address",
  middleware.isloggedin,
  function (req, res) {
    user
      .findById(req.user._id)
      .populate("order")
      .populate("address")
      .populate("cart")
      .exec(function (err, useraddress) {
        if (err) {
          console.log(err);
        } else {
          res.render("cart/address", { user: useraddress });
        }
      });
  }
);

router.get(
  "/:id/cart/checkout/newaddress",
  middleware.isloggedin,
  function (req, res) {
    res.render("cart/newaddress");
  }
);

router.post(
  "/:id/cart/checkout/newaddress",
  middleware.isloggedin,
  function (req, res) {
    user
      .findById(req.params.id)
      .populate("cart")
      .exec(function (err, user) {
        if (err) {
          console.log(err);
        } else {
          address.create(req.body.address, function (err, address) {
            if (err) {
              console.log(err);
            } else {
              user.address.push(address);
              user.save();
              res.redirect("/" + req.params.id + "/cart/checkout/address");
            }
          });
        }
      });
  }
);

router.get("/:id/order", middleware.isloggedin, function (req, res) {
  user
    .findById(req.user._id)
    .populate("order")
    .exec(function (err, userorder) {
      if (err) {
        console.log(err);
      } else {
        userorder.cart.forEach(function (cart1) {
          cart.findByIdAndRemove(cart1, function (err) {
            if (err) {
              console.log(err);
            }
          });
        });
        var j = userorder.cart.length;
        userorder.cart.splice(0, j);
        userorder.save();
        res.render("cart/order", { user: userorder });
      }
    });
});

router.get("/:id/confirm", middleware.isloggedin, function (req, res) {
  req.flash("success", "order placed successfully");
  res.redirect("/" + req.params.id + "/order");
});

router.post(
  "/:id/cart/checkout/order/:address/:type/:oid",
  middleware.isloggedin,
  function (req, res) {
    if (req.params.type === "debit-credit") {
      var paytmParams = {};
      var status;

      paytmParams["MID"] = "jcvTmU84910526732570";

      paytmParams["ORDERID"] =
        req.user.username.toUpperCase() + "ORD" + req.params.oid;

      checksum_lib.genchecksum(
        paytmParams,
        "0HVvh!GMGRXEJARa",
        function (err, checksum) {
          if (err) {
            console.log(err);
          } else {
            paytmParams["CHECKSUMHASH"] = checksum;

            var post_data = JSON.stringify(paytmParams);

            var options = {
              hostname: "securegw-stage.paytm.in",
              port: 443,
              path: "/order/status",
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Content-Length": post_data.length,
              },
            };

            var response = "";
            var post_req = https.request(options, function (post_res) {
              post_res.on("data", function (chunk) {
                response += chunk;
              });

              post_res.on("end", function () {
                var obj = JSON.parse(response);
                status = obj.STATUS;

                if (status === "TXN_FAILURE") {
                  user
                    .findById(req.params.id)
                    .populate("address")
                    .populate("cart")
                    .exec(function (err, user) {
                      if (err) {
                        console.log(err);
                      } else {
                        var x = 0;
                        var y = "";
                        var add;
                        var typ = "Debit/Credit Card Payment";
                        var pstatus = "failed";
                        user.address.forEach(function (addres) {
                          x = x + 1;

                          if (req.params.address === x.toString()) {
                            add = y.concat(
                              addres.address,
                              addres.address2,
                              addres.city,
                              addres.state,
                              addres.zip
                            );
                          }
                        });

                        address = {
                          address: add,
                          payment: typ,
                          oid: req.params.oid,
                          pstatus: pstatus,
                        };
                        order.create(address, function (err, order) {
                          if (err) {
                            console.log(err);
                          } else {
                            order.firstname.push(user.firstname);
                            order.lastname.push(user.lastname);
                            order.contact.push(user.contact);
                            user.cart.forEach(function (cart) {
                              //  order.obj.id=cart.obj.id;
                              order.name.push(cart.obj.name);
                              order.price.push(cart.obj.price);
                              order.peice.push(cart.peice);
                              order.image.push(cart.obj.image);
                            });
                            order.save();
                            user.order.push(order);
                            user.save(function (err) {
                              if (err) {
                                console.log(err);
                              }
                            });
                          }
                        });
                      }
                    });
                  req.flash("error", "Transaction Failed");
                  res.redirect("/" + req.user._id + "/cart");
                } else {
                  user
                    .findById(req.params.id)
                    .populate("address")
                    .populate("cart")
                    .exec(function (err, user) {
                      if (err) {
                        console.log(err);
                      } else {
                        var x = 0;
                        var y = "";
                        var add;
                        var typ = "Debit/Credit Card Payment";
                        var pstatus = "success";
                        user.address.forEach(function (addres) {
                          x = x + 1;

                          if (req.params.address === x.toString()) {
                            add = y.concat(
                              addres.address,
                              addres.address2,
                              addres.city,
                              addres.state,
                              addres.zip
                            );
                          }
                        });

                        address = {
                          address: add,
                          payment: typ,
                          oid: req.params.oid,
                          pstatus: pstatus,
                        };
                        order.create(address, function (err, order) {
                          if (err) {
                            console.log(err);
                          } else {
                            order.firstname.push(user.firstname);
                            order.lastname.push(user.lastname);
                            order.contact.push(user.contact);
                            user.cart.forEach(function (cart) {
                              //  order.obj.id=cart.obj.id;
                              order.name.push(cart.obj.name);
                              order.price.push(cart.obj.price);
                              order.peice.push(cart.peice);
                              order.image.push(cart.obj.image);
                            });
                            order.save();
                            user.order.push(order);
                            user.save(function (err) {
                              if (err) {
                                console.log(err);
                              }
                            });
                          }
                        });
                      }
                    });

                  res.redirect("/" + req.params.id + "/confirm");
                }
              });
            });
            post_req.write(post_data);
            post_req.end();
          }
        }
      );
    } else {
      user
        .findById(req.params.id)
        .populate("address")
        .populate("cart")
        .exec(function (err, user) {
          if (err) {
            console.log(err);
          } else {
            var x = 0;
            var y = "";
            var add;
            var typ = "Cash On Delivery";
            var pstatus = "success";
            user.address.forEach(function (addres) {
              x = x + 1;

              if (req.params.address === x.toString()) {
                add = y.concat(
                  addres.address,
                  addres.address2,
                  addres.city,
                  addres.state,
                  addres.zip
                );
              }
            });

            address = {
              address: add,
              payment: typ,
              oid: req.params.oid,
              pstatus: pstatus,
            };
            order.create(address, function (err, order) {
              if (err) {
                console.log(err);
              } else {
                order.firstname.push(user.firstname);
                order.lastname.push(user.lastname);
                order.contact.push(user.contact);
                user.cart.forEach(function (cart) {
                  //  order.obj.id=cart.obj.id;
                  order.name.push(cart.obj.name);
                  order.price.push(cart.obj.price);
                  order.peice.push(cart.peice);
                  order.image.push(cart.obj.image);
                });
                order.save();
                user.order.push(order);
                user.save(function (err) {
                  if (err) {
                    console.log(err);
                  }
                });
              }
            });
          }
        });

      res.redirect("/" + req.params.id + "/confirm");
    }
  }
);

router.get(
  "/:id/cart/payment/paytm/:total/:address/:oid",
  middleware.isloggedin,
  (req, res) => {
    user.findById(req.params.id, function (err, user) {
      if (err) {
        console.log(err);
      } else {
        var type = "debit-credit";
        let params = {};
        (params["MID"] = "jcvTmU84910526732570"),
          (params["WEBSITE"] = "WEBSTAGING"),
          (params["CHANNEL_ID"] = "WEB"),
          (params["INDUSTRY_TYPE_ID"] = "Retail"),
          (params["ORDER_ID"] =
            "" + user.username.toUpperCase() + "ORD" + req.params.oid + ""),
          (params["CUST_ID"] = req.params.id),
          (params["TXN_AMOUNT"] = req.params.total),
          (params["CALLBACK_URL"] =
            "https://powerful-cliffs-44698.herokuapp.com/" +
            req.user._id +
            "/cart/checkout/order/" +
            req.params.address +
            "/" +
            type +
            "/" +
            req.params.oid),
          (params["EMAIL"] = "xyz@gmail.com"),
          (params["MOBILE_NO"] = user.contact),
          checksum_lib.genchecksum(
            params,
            "0HVvh!GMGRXEJARa",
            function (err, checksum) {
              if (err) {
                console.log(err);
              } else {
                let txn_url = "https://securegw-stage.paytm.in/order/process";

                let form_fields = "";
                for (var x in params) {
                  form_fields +=
                    "<input type='hidden' name='" +
                    x +
                    "' value='" +
                    params[x] +
                    "'/>";
                }

                form_fields +=
                  "<input type='hidden' name='CHECKSUMHASH' value='" +
                  checksum +
                  "' />";

                var html =
                  '<html><body><center><h1>Please wait! Do not refresh the page</h1></center><form method="post" action="' +
                  txn_url +
                  '" name="f1">' +
                  form_fields +
                  '</form><script type="text/javascript">document.f1.submit()</script></body></html>';
                res.writeHead(200, { "Content-Type": "text/html" });
                res.write(html);
                res.end();
              }
            }
          );
      }
    });
  }
);

router.post(
  "/:id/cart/validate/order/:total/:oid",
  middleware.isloggedin,
  function (req, res) {
    if (req.body.address.payment === "cash on delivery") {
      res.redirect(
        307,
        "/" +
          req.params.id +
          "/cart/checkout/order/" +
          req.body.address.address +
          "/" +
          req.body.address.payment +
          "/" +
          req.params.oid
      );
    } else {
      res.redirect(
        "/" +
          req.params.id +
          "/cart/payment/paytm/" +
          req.params.total +
          "/" +
          req.body.address.address +
          "/" +
          req.params.oid
      );
    }
  }
);

router.get("/:id/adminorder", middleware.isauthorised, function (req, res) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("food_express");
    dbo
      .collection("orders")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        res.render("cart/adminorder", { result: result });
        db.close();
      });
  });
});

module.exports = router;
