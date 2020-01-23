const db = require("../database/db");
("use strict");

function addNotification(user, message) {
    db.mongo
    .connect(db.url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(db => {
        var dbo = db.db("Matcha");
        dbo.collection("Users")
            .updateOne(
                { _id: oID },
                {
                    $push: {
                        notification: message
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

module.exports = {
    addNotification: addNotification,
    clearNotification: clearNotification
};