const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const {basicAuthUsers} = require('../config/site.config');


const verifyUser = (username, password, done) => {

  // Implement your own logic to verify the username and password
  const user = basicAuthUsers.find((u) => u.user === username && u.pass === password);
  if (user) {
      return done(null, true);
    }
    return done(null, false);
  };

const basicAuthenticateUser = (req, res, next) => {

    const customParamValue = req.customParam; // Access the custom parameter

    // Add the line below to configure the BasicStrategy
  passport.use(new BasicStrategy(verifyUser));

    passport.authenticate('basic', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: 'Internal Server Error', success: false }).end();
        }
        if (!user) {
            if (info && info.message === 'No auth token') {
                return res.status(400).json({ message: 'Bad Request', success: false }).end();
            }
            return res.status(401).json({custome_param:customParamValue, message: 'Unauthorized', success: false }).end();
        }
        // Call next() to pass control to the next middleware or route handler
        next();
        /*req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Internal Server Error 11', success: false }).end();
            }
            next();
        });*/
  })(req, res, next);

}

  module.exports = {
    verifyUser,
    basicAuthenticateUser,

  }