const db = require('../database/db');

function getTags(cb){
    db.mongo.connect(db.url, {useNewUrlParser: true}).then(db => {
        var dbo = db.db("Matcha");
        dbo.collection("Tags").find({}).toArray().then(res => {
            cb(res);
        }).catch(err => {
            cb(null);
            console.log("Cant fetch tags =>" + err)
        });
    }).catch(err => {
        cb(null);
        console.log("Cant connect to database getTags("+cb+") => " + err);
    });
}

function setTags(query) {
    if (query)
    {
        db.mongo.connect(db.url, {useNewUrlParser: true}).then(db => {
            var dbo = db.db("Matcha");
            dbo.collection("Tags").insertOne({Tag: query}).then(result => {

            }).catch(err => {
                console.log("cant update list => " + err);
            })
        }).catch(err => {
            console.log("Cant connect to database setTags("+query+") =>" + err);
        })
    }
}

module.exports = {
    getTags: getTags,
    setTags: setTags
}