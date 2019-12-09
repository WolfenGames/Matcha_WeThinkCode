const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const pageRoutes = require("./routes/pages");
const chatRoutes = require("./routes/chats");
const userRoutes = require("./routes/users");
const headerRoute = require("./routes/header");
const tagsRoute = require("./routes/tags");
const updateUserRoute = require("./routes/updateUsers");
const generatedUser = require("./routes/generator");
const session = require("express-session");
const DB = require("./database/db");
const fs = require("fs");
const {
	CreateChatCollection,
	CreateRoomCollection
} = require("./functions/chat");
var dir = "./public/images";

const { Room } = require("./classes/Room");
const { Message } = require("./classes/Message");

if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir);
}

CreateChatCollection();
CreateRoomCollection();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + "/../public"));
app.set("view engine", "ejs");

app.use(
	session({
		secret: "American Pie: Beta House",
		saveUninitialized: false,
		resave: false
	})
);

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
app.use("/", userRoutes);
app.use("/", headerRoute);
app.use("/", updateUserRoute);
app.use("/", tagsRoute);
app.use("/", generatedUser);
app.use("/chat", chatRoutes);

app.post("*", function(req, res) {
	res.end('{"msg":"404"}');
});

app.get("*", function(req, res) {
	res.render("pages/404");
});

DB.createCollection("Users");
DB.createTagsCollection();

module.exports = app;
