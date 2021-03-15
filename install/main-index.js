const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require("body-parser");
require('dotenv/config');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./api-doc');


const port = process.env.PORT || 5000;
const environment = process.env.NODE_ENV || 'development';
mongoose.set('debug', false);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
swaggerDoc.apiDocTemplate().then((result) => {
    app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(result));
}).catch(error => console.log(error))


//Connection variables
let CONNECTION_STRING = process.env.LOCAL_DB;
let DB_CONFIG = { useNewUrlParser: true, useUnifiedTopology: true }; 
if (environment !== "development") {
    //CONNECTION_STRING = process.env.DB_CONNECTION;
    //DB_CONFIG = { ...DB_CONFIG, user: process.env.MONGO_USER, pass: process.env.MONGO_PASS }
}


//Connection
mongoose.connect(CONNECTION_STRING, DB_CONFIG).then(() => {
    console.log("Database Connected")
}).catch((error) => console.log(error));


//Route Import
require('./routes')(app, cors);

let server = app.listen(port, () => console.log(`App Running on port ${port}`));
module.exports = server;