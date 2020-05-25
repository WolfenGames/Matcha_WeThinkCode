const mongo = require("mongodb").MongoClient;
const _mongo = require("mongodb");
("use strict");

const Pool = require('pg').Pool
const pool = new Pool({
	user: 'matcha',
	password: 'secret',
	database: 'matcha',
	host: 'localhost',
	port: 5432
});

const url = "mongodb://localhost:27017/Matcha";

async function createTables() {
	
	await pool.query(`
	create table if not exists Users (
        _id SERIAL PRIMARY KEY,
        username VARCHAR(120) UNIQUE NOT NULL,
        password VARCHAR(120) NOT NULL,
        email VARCHAR(120) NOT NULL,
        created_on TIMESTAMP,
        last_login TIMESTAMP
    );

    create table if not exists Verification (
        _id SERIAL PRIMARY KEY,
        uid integer NOT NULL,
        verification_key VARCHAR(128),
        email_verified boolean DEFAULT (false)
    );

    create table if not exists UserInfo (
        _id SERIAl PRIMARY KEY,
        firstname varchar(120),
        surname varchar(120),
        uid integer NOT NULL,
        sex varchar(10),
        biography varchar(250),
        sexuality varchar(10),
        age integer DEFAULT(99),
        fame integer DEFAULT(0),
        uType varchar(10) DEFAULT('user')
    );

    create table if not exists Notifications (
        _id SERIAL PRIMARY KEY,
        uid integer NOT NULL,
        notification varchar(500)
    );

    create table if not exists Pictures (
        _id SERIAL PRIMARY KEY,
        uid integer NOT NULL,
        profile_picture varchar(120),
        picture_one varchar(120),
        picture_two varchar(50),
        picture_three varchar(50),
        picture_four varchar(50)
    );

    create table if not exists Reports (
        _id SERIAL PRIMARY KEY,
        uid integer NOT NULL,
        reported integer NOT NULL
    );

    create table if not exists Blocks (
        _id SERIAl PRIMARY KEY,
        uid integer NOT NULL,
        blocks integer NOT NULL
    );

    create table if not exists Likes (
        _id SERIAL PRIMARY KEY,
        uid integer NOT NULL,
        likes integer NOT NULL
    );

    create table if not exists UserViews (
        _id SERIAL PRIMARY KEY,
        uid integer NOT NULL,
        viewed integer NOT NULL
    );
	`)
}

async function createProcs() {
	await pool.query(`
	CREATE OR REPLACE FUNCTION get_user(user_id integer)
	RETURNS TABLE(
		_id integer,
		Username varchar,
		email varchar,
		email_verified boolean,
		sex varchar,
		sexuality varchar,
		age int,
		fame int,
		utype varchar,
		biography varchar,
		profile_picture varchar,
		picture_one varchar,
		picture_two varchar,
		picture_three varchar,
		picture_four varchar
	) AS $$
	BEGIN
		RETURN QUERY
		SELECT 
			u._id as _id,
			u.username as username,
			u.email as email,
			v.email_verified as email_verified,
			ui.sex as sex,
			ui.sexuality as sexuality,
			ui.age as age,
			ui.fame as fame,
			ui.utype as utype,
			ui.biography as biography,
			pics.profile_picture as profile_picure,
			pics.picture_one as picture_one,
			pics.picture_two as picture_two,
			pics.picture_three as picture_three,
			pics.picture_four as picture_four
		FROM Users as u
		LEFT JOIN Verification as v on u._id = v.uid
		LEFT JOIN UserInfo as ui on u._id = ui.uid
		LEFT JOIN Pictures as pics on u._id = pics.uid
		where u._id = user_id;
	END;
	$$ LANGUAGE plpgsql;

    CREATE OR REPLACE PROCEDURE verify_user(verification_key VARCHAR, email VARCHAR)
    AS $$
    BEGIN
        UPDATE v
            SET v.email_verified = true
        FROM Verification as v
        INNER JOIN Users as u on v.uid = u._id
        WHERE
            u.email = email AND
            v.verification_key = verification_key;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE PROCEDURE like_user(uid integer, likes integer)
	AS $$
	BEGIN
		IF (SELECT COUNT(*) FROM Likes as l WHERE (l.uid = $1 AND l.likes = $2)) = 1 THEN
			DELETE FROM Likes as l where l.uid = $1 and l.likes = $2;
		ELSE
			INSERT INTO Likes (uid, likes) VALUES ($1, $2);
		END IF;
	END;
	$$ LANGUAGE plpgsql;


    CREATE OR REPLACE PROCEDURE add_user(username varchar, email varchar, password varchar, firstname varchar, surname varchar, verification_key varchar)
    AS $$
    DECLARE
        uid int;
    BEGIN
        INSERT INTO Users (username, password, email) VALUES (username, password, email);
        
        uid = (SELECT _id FROM USERS as u 
            WHERE 
            u.email = $2 AND 
            u.password = $3 AND 
            u.username = $1);
        
        INSERT INTO UserInfo as ui (uid, firstname, surname) VALUES (
            uid,
            $4,
            $5);
        
        INSERT INTO Verification as v (uid, verification_key, email_verified) VALUES (
            uid,
            $6,
            false
        );

    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION matches (user_id integer)
    RETURNS TABLE (
        uid int
    ) AS $$
    BEGIN
        RETURN QUERY
        SELECT l.uid FROM LIKES as l
        WHERE
        l.likes = $1 AND
        l.uid NOT IN (
            SELECT l2.uid FROM Likes as l2 where l2.likes != $1
        );

    END;
    $$ LANGUAGE plpgsql;
	`)
}


function createCollection(collectionName) {
	mongo
		.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.createCollection(collectionName)
				.then(res => {
					res.createIndex({ email: 1 }, { unique: true });
					res.createIndex({ location: "2dsphere" });
					res.createIndex({ locationIp: "2dsphere" });
					res.createIndex({ locationCustom: "2dsphere" });
					res.createIndex({ locationBrowser: "2dsphere" });
					db.close();
				})
				.catch(err => {
					console.log(
						"Cant create collection {" +
							collectionName +
							"} due to -> " +
							err
					);
				});
		})
		.catch(err => {
			console.log(
				"Cant connect to database called by createCollection(" +
					collectionName +
					") due to -> " +
					err
			);
		});
}

function createTagsCollection() {
	mongo
		.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(db => {
			var dbo = db.db("Matcha");
			dbo.createCollection("Tags")
				.then(res => {
					res.createIndex({ Tag: 1 }, { unique: true});
					db.close();
				})
				.catch(err => {
					// console.log("Cant create collection {Tags} due to " + err);
				});
		})
		.catch(err => {
			console.log(
				"Cant connect to database called by createTagsCollection due to " +
					err
			);
		});
}
module.exports = {
	url,
	mongo,
	_mongo,
	pool,
	createTables,
	createProcs,
	createCollection: createCollection,
	createTagsCollection: createTagsCollection,
};
