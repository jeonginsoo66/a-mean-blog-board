import express from "express";
import User from "../models/User";
import util from "../util";

const router = express.Router();

// Index
router.get("/", (req, res) => {
  User.find({})
    .sort({ username: 1 })
    .exec((err, users) => {
      if (err) {
        return res.json(err);
      }
      res.render("users/", { users });
    });
});

// New
router.get("/new", (req, res) => {
  const user = req.flash("user")[0] || {};
  const errors = req.flash("errors")[0] || {};
  res.render("users/new", { user, errors });
});

// create
router.post("/", (req, res) => {
  User.create(req.body, (err) => {
    if (err) {
      req.flash("user", req.body);
      req.flash("errors", util.parseError(err));
      return res.redirect("/users/new");
    }
    res.redirect("/users");
  });
});

// show
router.get("/:username", (req, res) => {
  const { username } = req.params;

  User.findOne({ username }, (err, user) => {
    if (err) {
      return res.json(err);
    }

    res.render("users/show", { user });
  });
});

// edit
router.get("/:username/edit", (req, res) => {
  const { username } = req.params;
  const user = req.flash("user")[0];
  const errors = req.flash("errors")[0] || {};

  if (!user) {
    User.findOne({ username }, (err, user) => {
      if (err) {
        return res.json(err);
      }
      res.render("users/edit", { username, user, errors });
    });
  } else {
    res.render("users/edit", { username, user, errors });
  }
});

// update
router.put("/:username", (req, res, next) => {
  const { username } = req.params;
  const { newPassword } = req.body;

  User.findOne({ username })
    .select("password")
    .exec((err, user) => {
      if (err) {
        return res.json(err);
      }

      // update user object
      user.originalPassword = user.password;
      user.password = newPassword ? newPassword : user.password;
      for (const p in req.body) {
        user[p] = req.body[p];
      }

      // save updated user
      user.save((err, user) => {
        if (err) {
          req.flash("user", req.body);
          req.flash("errors", util.parseError(err));
          return res.redirect("/users/" + username + "/edit");
        }
        res.redirect("/users/" + user.username);
      });
    });
});

// delete
router.delete("/:username", (req, res) => {
  const { username } = req.params;

  User.deleteOne({ username }, (err) => {
    if (err) {
      return res.json(err);
    }

    res.redirect("/users");
  });
});

module.exports = router;