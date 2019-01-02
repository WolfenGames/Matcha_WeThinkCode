const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const pageRoutes = require('./routes/pages');
const session = require('express-session');
const DB = require('./database/db');
const fs = require('fs');
var dir = './public/images';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/../public'));
app.use('/static', express.static('node_modules'));
app.set('view engine', 'ejs');

app.use(session({secret: "American Pie: Beta House", saveUninitialized: false, resave: false}));

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
	  "Access-Control-Allow-Headers",
	  "Origin, X-Requested-With, Content-Type, Accept"
	);
	res.setHeader(
	  "Access-Control-Allow-Methods",
	  "GET, POST, PATCH, PUT, DELETE, OPTIONS"
	);
	next();
});

app.use("/", pageRoutes);
DB.createCollection('Users');
DB.createTagsCollection();

module.exports = app;