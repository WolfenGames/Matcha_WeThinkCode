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
    }).catch(err => {
        cb(null);
        console.log("Cant connect to database getTags("+cb+") => " + err);
    });
}

function setTags(query, fn1) {
    if (query)
    {
        conn.connect(db.url, {useNewUrlParser: true}).then(db => {
            var dbo = db.db("Matcha");
            dbo.collection("Tags").insertOne({Tag: query}).then(result => {
                fn1();
            }).catch(err => {
            })
        }).catch(err => {
            console.log("Cant connect to database setTags("+query+") =>" + err);
        })
    }
}

function updateTags(user, tag) {
	conn.connect(db.url, {useNewUrlParser: true}).then(db => {
		var dbo = db.db("Matcha");
		dbo.collection("Users").findOne({email: user}).then(res => {
			dbo.collection("Users").updateOne({email: user}, { $addToSet: {tags: tag}}).then(result => {

			}).catch(err => {
				console.log("Cant update the users tag due to => " + err);
			})
		}).catch(err => {
			console.log("Cant find tags due to " + err);
		})
	}).catch(err => {
		console.log("Cant connect to db called by updateTags("+user+","+tag+") due to => " + err);
	})
}

function getUpdatedTags(req, cb) {
    conn.connect(db.url, { useNewUrlParser: true }).then(db => {
        var dbo = db.db('Matcha');
        dbo.collection("Users").findOne({email: req.session.user.email}).then(result => {
            cb(result.tags);
        }).catch(err => {
            console.log("Cant connect to collection -> " + err);
        })
    }).catch(err => {
        console.log("Cant connect to databse => " + err);
    });
}

module.exports = {
    getTags: getTags,
	setTags: setTags,
    updateTags: updateTags,
    getUpdatedTags: getUpdatedTags
}