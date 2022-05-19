// import default module
const express = require("express");
const bodyparser = require("body-parser");
const viewEngine = require("./config/viewEngine");
const {sequelize} = require("./models");
const cors = require("cors");
const cron = require("node-cron");
const reminder = require("./utils/reminder");
const session = require("express-session");
var localStrategy = require('passport-local').Strategy;
const User = require('./models').User;
const passport = require("passport");
const bcrypt = require('bcryptjs');
const axios = require('axios');

require('dotenv').config();
//reminder
// cron.schedule('*/1 * * * * *',reminder) // run every minutes
// route
// const userRouters = require('./routes/route') khi không có initWebRoutes
const initWebRoutes = require('./routes/web');
const initClassRoutes = require('./routes/classRouter');
const initAdminRouter = require('./routes/adminRouter');
const app = express();
app.use(cors());

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));
app.use(session({secret: 'key'}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
})

passport.deserializeUser(function(user, done) {
    done(null, user);
});
passport.use(new localStrategy({usernameField:'user_email'},
     function(username,password, done) {
        User.findOne({
            where:{user_email: username},
        })
        .then(async(user) => {
            if(!user) return done(null,false);
            
            let passport = await bcrypt.compare(password,user.password);

            if(!passport) return done(null, false)
            return done(null,user)
        })
    }
))


// import viewEngine for ejs
viewEngine(app);

// import route
// require("./routes/userRoutes")(app); what is difference?
// app.use('/api/users', userRouters); //gói vào initWebRoutes
// app.use('/crud',userRouters)//gói vào initWebRoutes
// app.use('/clientCrud',clientRouters)//gói vào initWebRoutes

//import route
initWebRoutes(app);
initClassRoutes(app);
initAdminRouter(app);

// listen port
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, async () => {
    console.log(`server running on port ${PORT}`);
    await sequelize.authenticate();
    console.log('Database Connected!');
});
  
module.exports = server;