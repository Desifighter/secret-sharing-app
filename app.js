const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const uuid = require("uuid");
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;


const app = express();
const session = require("express-session");
const passport = require("passport");
const findOrCreate = require("mongoose-findorcreate");
const passportLocalMongoose = require("passport-local-mongoose");
var GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

require("dotenv").config();
app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// app.use(
//   session({
//     secret: "Our little secret.",
//     resave: false,
//     saveUninitialized: true,
//   })
// );

const sessionSecret = uuid.v4();
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 3000;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
//Connect to the database before listening
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("listening for requests");
  });
});
// mongoose.set("useCreateIndex",true);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  googleId: String,
  facebookId: String,
  secret:String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
// let secret = process.env.TOP_SECRET;
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });
const User = mongoose.model("users", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture,
    });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.callbackURL,
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.facebookcallbackURL,
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      User.findOrCreate({ facebookId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
  "/auth/facebook/secret",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  }
);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  }
);

app.route("/").get(function (req, res) {
  res.render("home");
});

app.get("/logout", (req, res) => {
  // req.logout();
  res.render("home");
});

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post(async (req, res) => {

    try {
      const user = new User({
        username: req.body.username,
        password: req.body.password,
      });

      req.login(user, function (err) {
        if (err) {
          console.log(err);
        } else {
          passport.authenticate("local")(req, res, function () {
            res.redirect("secrets");
          });
        }
      });
      
    } catch (error) {
      res.status(400).send("Error in login " + error);
    }
    

    // try {
    //     let username = req.body.username;
    //     let password = req.body.password;

    //     const result = await User.findOne({
    //       username: username,
    //     });

    //     const match = await bcrypt.compare(password, result.password);

    //     if (match) {
    //       res.render("secrets");
    //       console.log(match);

    //       //   if (result.password === password) {
    //       //     console.log("User found");
    //       //     res.render("secrets");
    //       //   } else {
    //       //     res.send("user not find");
    //       //   }
    //     } else {
    //         console.log("User Not found first else");
    //         res.send("user not find");
    //     }
    // } catch (error) {
    //   console.log("Intenal error "+ error);
    //     res.send("Intenal error");
    // }
  });

app.get("/secrets", async (req, res)=> {
    try {
      const secrets = await User.find({});

      console.log(secrets);

      if (secrets) {
        res.render("secrets", { secrets });
      } else {
        res.send("Internal error");
      }
      
    } catch (error) {
      res.status(400).send("Error in Mongo "+error);
    }
  // if (req.isAuthenticated()) {
  //   res.render("secrets");
  // } else {
  //   res.redirect("/login");
  // }
});

app.get("/submit", function (req, res) {
  try {
    if (req.isAuthenticated()) {
      res.render("submit");
    } else {
      res.redirect("/login");
    }
    
  } catch (error) {
    res.status(400).send("Error in authentication" + error);
  }
  
});

app.post("/submit",  async (req, res)=> {

  try {
    const submittedSecret = req.body.secret;

    console.log(req.user.id);

    const foundUser = await User.findById(req.user.id).exec();
    console.log(foundUser);

    if (foundUser) {
      foundUser.secret = submittedSecret;
      const result = await foundUser.save();
      console.log(result);

      if (result) {
        res.redirect("/secrets");
      }
    }
    
  } catch (error) {
    res.status(400).send("Error in submitting secret" + error);
  }

  // User.findById(req.user.id,function(err, foundUser){
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     if (foundUser) {
  //       foundUser.secret = submittedSecret;
  //       foundUser.save(function () {
  //         res.redirect("/secrets");
  //       });
  //     }
      
  //   }
  // });

  // if (req.isAuthenticated()) {
  //   res.render("submit");
  // } else {
  //   res.redirect("/login");
  // }
});

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post(async (req, res) => {
    try {
      User.register(
        { username: req.body.username },
        req.body.password,
        function (err, user) {
          if (err) {
            console.log(err);
            res.redirect("/register");
          } else {
            passport.authenticate("local")(req, res, function () {
              res.redirect("/secrets");
            });
          }
        }
      );
    } catch (error) {
      res.status(400).send("Error in registration " + error);
    }
    // try {
    //   const Newuser = new User({ username: req.body.username });
    //   await Newuser.setPassword(req.body.password);
    //   const result = await Newuser.save();

    //   if (result) {
    //     const { Newuser } = await User.authenticate()(
    //       req.body.username,
    //       req.body.password
    //     );

    //   }

    //   console.log(result);
    //   res.render("secrets");
    // } catch (error) {
    //   res.send("Internal Error");
    // }
    // try {
    //     let username = req.body.username;
    //     let password = req.body.password;

    //     console.log(username + " " + password);

    //     const hash = await bcrypt.hash(password, saltRounds);

    //     const newUser = new User({
    //       username: username,
    //       password: hash,
    //     });
    //     const result = await newUser.save();
    //     console.log(result);
    //     res.render("secrets");
    // } catch (error) {
    //     res.send("Internal server error");
    // }
  });

app
  .route("/submit")
  .get((req, res) => {
    res.render("submit");
  })
  .post(() => {});

app.route("/").get(function (req, res) {
  res.render("home");
});


