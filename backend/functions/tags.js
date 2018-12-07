const db = require('../database/db');
const conn = db.mongo;

function getTags(cb){
    conn.connect(db.url, {useNewUrlParser: true}).then(db => {
        var dbo = db.db("Matcha");
        dbo.collection("Tags").find({}).toArray().then(res => {
            cb(res);
        }).catch(err => {
            cb(null);
            console.log("Cant fetch tags =>" + err)
        });
        db.close();
    }).catch(err => {
        cb(null);
        console.log("Cant connect to database getTags("+cb+") => " + err);
    });
}

function setTags(query, user, cb) {
    if (query && user)
    {
        conn.connect(db.url, {useNewUrlParser: true}).then(db => {
            var dbo = db.db("Matcha");
            dbo.collection("Tags").insertOne({Tag: query}).then(result => {
                dbo.collection("Users").findOne({email: user}).then(res => {
                    dbo.collection("Users").updateOne({email: user}, { $addToSet: {tags: query}}).then(result => {
                        dbo.collection("Users").findOne({email: user}).then(result => {
                            db.close();
                            cb(result.tags);
                        }).catch(err => {
                            console.log("Cant connect to collection -> " + err);
                        })
                    }).catch(err => {
                        console.log("Cant update the users tag due to => " + err);
                    })
                }).catch(err => {
                    console.log("Cant find tags due to " + err);
                })
            }).catch(err => {
            });
        }).catch(err => {
            console.log("Cant connect to database setTags("+query+") =>" + err);
        })
    }
}

function getUpdatedTags(email, cb) {
    conn.connect(db.url, { useNewUrlParser: true}).then(db => {
        var dbo = db.db('Matcha');
        dbo.collection("Users").findOne({email: email}).then(result => {
            db.close();
            cb(result.tags);
        }).catch(err => {
            console.log("Cant connect to collection -> " + err);
        })
    }).catch(err => {
        console.log("Cant connect to database due to => " + err);
    })
}

module.exports = {
    getTags: getTags,
    setTags: setTags,
    getUpdatedTags: getUpdatedTags
}