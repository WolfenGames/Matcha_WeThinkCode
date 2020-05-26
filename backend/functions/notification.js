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

function clearNotification(user) {
    var oID =  new _mongo.ObjectID(user);
    db.mongo
    .connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(db => {
        var dbo = db.db("Matcha");
        dbo.collection("Users")
            .updateOne(
                { _id: oID },
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

function isNewNotifications(user, cb) {
    // var oID =  new _mongo.ObjectID(user);
    // db.mongo
    // .connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
    // .then(function(db) {
    //     var dbo = db.db("Matcha");
    //     var t = dbo.collection("Users")
    //         .findOne({ _id: oID },)
    //         .then( function(rep) {
    //             cb(rep.nNotification)
    //         })
    // })
    cb(null)
}

function getNotifications(user, cb) {
        var oID =  new _mongo.ObjectID(user);
        db.mongo
        .connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(db => { 
            var dbo = db.db("Matcha");
            dbo.collection("Users")
                .findOne({_id: oID}, {})
                .then(function(res) {
                    cb(res.notifications)
                })
        })
    }
    

module.exports = {
    addNotification: addNotification,
    clearNotification: clearNotification,
    isNewNotifications: isNewNotifications,
    getNotifications: getNotifications
};