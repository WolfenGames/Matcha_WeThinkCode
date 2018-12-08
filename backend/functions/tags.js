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
    console.log(query);
    console.log(user);
    if (query && user)
    {
        console.log("Trying to connect");
        conn.connect(db.url, {useNewUrlParser: true}).then(db => {
            var dbo = db.db("Matcha");
            console.log("connected");
            dbo.collection("Tags").insertOne({Tag: query}).then(result => {
                console.log("Inserted one");
                dbo.collection("Users").findOne({email: user}).then(res => {
                    console.log("Found one");
                    dbo.collection("Users").updateOne({email: user}, { $addToSet: {tags: query}}).then(result => {
                        console.log("Updated all tags");
                        dbo.collection("Users").findOne({email: user}).then(result => {
                            db.close();
                            console.log("Found all tags");
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
                dbo.collection("Users").findOne({email: user}).then(res => {
                    console.log("Found one");
                    dbo.collection("Users").updateOne({email: user}, { $addToSet: {tags: query}}).then(result => {
                        console.log("Updated all tags");
                        dbo.collection("Users").findOne({email: user}).then(result => {
                            db.close();
                            console.log("Found all tags");
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

function removeTag(email, tag)
{
    conn.connect(db.url, { useNewUrlParser: true }).then(db => {
        var dbo = db.db("Matcha");
        dbo.collection('Users').updateOne({email: email}, { $pull: {tags: tag}}).then(result => {
            db.close();
        }).catch(err => {
            console.log("Cannot remove due to reason " + err);
        })
    }).catch(err => {
        console.log("Cannot connect to database due to reason => " + err);
    })
}

module.exports = {
    getTags: getTags,
    setTags: setTags,
    getUpdatedTags: getUpdatedTags,
    removeTag: removeTag
}