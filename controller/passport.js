// const passport = require('../controller/passport')

// const BearerStrategy = require('passport-http-bearer').Strategy;
// const buildPassport = passport.use(new BearerStrategy(
//     function(token, done) {
//       User.findOne({ token: token }, function (err, user) {
//         if (err) { return done(err); }
//         if (!user) { return done(null, false); }
//         return done(null, user, { scope: 'all' });
//       });
//     }
//   ));
// const initPassport = passport.authenticate('bearer', { session: false })
// module.exports = buildPassport,initPassport