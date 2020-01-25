const db = require("../database/db");
const _mongo          = require('mongodb');
("use strict");

function addNotification(user, message) {
    var oID =  new _mongo.ObjectID(user);
    db.mongo
    .connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(db => {
        var dbo = db.db("Matcha");
        dbo.collection("Users")
            .updateOne(
                { _id: oID },
                {
                    $push: {
                        notifications: {
                            $each: [message],
                            $position: 0
                        }
                    },
                    $set: {
                        nNotification: true
                    }
                }
            )
            .catch(err => {});
    })
    .catch(err => {
        console.log("Cant connect to database " + err);
    });
}

function clearNotification(user, message) {
    db.mongo
    .connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(db => {
        var dbo = db.db("Matcha");
        dbo.collection("Users")
            .updateOne(
                { email: user.email },
                {
                    $set: {
                        nNotification: false
                    }
                }
            )
            .catch(err => {});
    })
    .catch(err => {
        console.log("Cant connect to database " + err);
    });
}

function isNewNotifications(user) {
    var oID =  new _mongo.ObjectID(user);
    db.mongo
    .connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(db => {
        var dbo = db.db("Matcha");
        dbo.collection("Users")
            .findOne({_id: oID}, {})
    }).then(function(res) {
        return res.nNotification
    })
}

function getNotifications() {
        var oID =  new _mongo.ObjectID(user);
        db.mongo
        .connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(db => {
            var dbo = db.db("Matcha");
            dbo.collection("Users")
                .findOne({_id: oID}, {})
        }).then(function(res) {
            return res.notifications
        })
    }
    

module.exports = {
    addNotification: addNotification,
    clearNotification: clearNotification,
    isNewNotifications: isNewNotifications,
    getNotifications: getNotifications
};