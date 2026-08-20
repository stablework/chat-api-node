const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportJWT = require("passport-jwt");
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const session = require("express-session");
const bcrypt = require("bcryptjs");

const User = require("../models/user");
const { toAuthUser } = require("./authToken");
const { normalizeEmail } = require("./contact");

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const localPassport = (app) => {
  app.use(
    session({
      secret: process.env.JWT_SECRET || "secret",
      resave: false,
      saveUninitialized: true,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      (identifier, password, done) => {
        const value = String(identifier || "").trim();
        const lookupEmail = normalizeEmail(value);
        const query = {
          $or: [{ name: new RegExp(`^${escapeRegex(value)}$`, "i") }],
        };
        if (lookupEmail) {
          query.$or.push({ email: lookupEmail });
        }

        User.findOne(query)
          .then((user) => {
            if (!user || !user.password) {
              return done(null, false);
            }

            bcrypt.compare(password, user.password, (error, matched) => {
              if (error) {
                return done(error);
              }

              if (!matched) {
                return done(null, false);
              }

              return done(null, toAuthUser(user));
            });
          })
          .catch((err) => {
            return done(err);
          });
      }
    )
  );

  passport.use(
    new JwtStrategy(
      {
        secretOrKey: process.env.JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
      (jwt_payload, done) => {
        User.findOne({ _id: jwt_payload.id, status: "active" })
          .then((user) => {
            if (user) {
              return done(null, user);
            }
            return done(null, false);
          })
          .catch((err) => {
            return done(err);
          });
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};

module.exports = localPassport;
