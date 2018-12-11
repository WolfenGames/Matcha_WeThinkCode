const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const pageRoutes = require('./routes/pages');
const session = require('express-session');
const DB = require('./database/db');
const match = require("./functions/match");

var p1 = {
	MatchingTags: 12,
	total: 12,
	Dist: 0,
	Max: 5
};
var p2 = {
	MatchingTags: 4,
	total: 10,
	Dist: 0,
	Max: 5
};

match.matchTags(p1, p2, function(r1) {
	match.matchDist(p1, p2, function(r2) {
		console.log("p1 -> p2 " + (r1 + r2));
	})
})

match.matchTags(p2, p1, function(r1) {
	match.matchDist(p2, p1, function(r2) {
		console.log("p2 -> p1 " + (r1 + r2));
	})
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/../public'));
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