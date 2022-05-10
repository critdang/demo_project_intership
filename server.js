// import default module
const express = require("express");
const bodyparser = require("body-parser");
const viewEngine = require("./config/viewEngine");
const {sequelize} = require("./models");
const cors = require("cors");
const cron = require("node-cron");
const reminder = require("./utils/reminder")
require('dotenv').config();
//reminder
// cron.schedule('*/1 * * * * *',reminder) // run every minutes
// route
// const userRouters = require('./routes/route') khi không có initWebRoutes
const initWebRoutes = require('./routes/web');
const initClassRoutes = require('./routes/classRouter')
const initAdminRouter = require('./routes/adminRouter')
const app = express();
app.use(cors())

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));


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