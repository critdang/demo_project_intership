// import default module
const express = require("express");
const bodyparser = require("body-parser");
const viewEngine = require("./config/viewEngine");
const {sequelize} = require("./models");
const cors = require("cors");
const cron = require("node-cron");
// const reminder = require("./utils/reminder");
const session = require("express-session");
const User = require('./models').User;
const passport = require("passport");
const axios = require('axios');
const morgan = require('morgan');

require('dotenv').config();
//reminder
// cron.schedule('*/1 * * * * *',reminder) // run every minutes
// route
// const userRouters = require('./routes/route') khi không có initWebRoutes
const initClientRoutes = require('./routes/clientRouter');
const initClassRoutes = require('./routes/classRouter');
const initAdminRoutes = require('./routes/adminRouter');
const app = express();
app.use(cors());
app.use(morgan('dev'));

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));
app.use(session({secret: 'key'}));

// passport
app.use(passport.initialize());
app.use(passport.session());




// import viewEngine for ejs
viewEngine(app);

// import route
// require("./routes/userRoutes")(app); what is difference?
// app.use('/api/users', userRouters); //gói vào initWebRoutes
// app.use('/crud',userRouters)//gói vào initWebRoutes
// app.use('/clientCrud',clientRouters)//gói vào initWebRoutes

//import route
// app.use('/',auth.accessToken,initClientRoutes)
initClientRoutes(app);
initClassRoutes(app);
initAdminRoutes(app);

// listen port
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, async () => {
    console.log(`server running on port ${PORT}`);
    await sequelize.authenticate();
    console.log('Database Connected!');
});
  
module.exports = server;