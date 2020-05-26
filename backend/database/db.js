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
		uType varchar(10) DEFAULT('user'),
		email_subscription boolean,
		banned boolean,
		date_of_birth TIMESTAMP
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
        picture_two varchar(120),
        picture_three varchar(120),
        picture_four varchar(120)
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
	
	create table if not exists Tags (
		_id SERIAL PRIMARY KEY,
		tag VARCHAR(50) UNIQUE NOT NULL
	);

	create table if not exists UserTags (
		_id SERiAL PRIMARY KEY,
		uid integer NOT NULL,
		tag_id integer NOT NULL
	);

	`)
}

async function createIndex() {

	await pool.query(`
		CREATE INDEX IF NOT EXISTS user_idx on Users(_id);
		CREATE INDEX IF NOT EXISTS user_search_idx on Users(email);
		CREATE INDEX IF NOT EXISTS tags_idx on Tags(_id);
		CREATE INDEX IF NOT EXISTS tags_search_idx on UserTags(tag_id);
		CREATE INDEX IF NOT EXISTS tags_user_search_ids on UserTags(uid);
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
		verify_key varchar,
		sex varchar,
		sexuality varchar,
		age int,
		fame int,
		utype varchar,
		biography varchar,
		firstname varchar,
		surname varchar,
		banned boolean,
		dob TIMESTAMP,
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
			v.verification_key as verify_key,
			ui.sex as sex,
			ui.sexuality as sexuality,
			ui.age as age,
			ui.fame as fame,
			ui.utype as utype,
			ui.biography as biography,
			ui.firstname as firstname,
			ui.surname as surname,
			ui.banned as banned,
			ui.date_of_birth as dob,
			pics.profile_picture as profile_picure,
			pics.picture_one as picture_one,
			pics.picture_two as picture_two,
			pics.picture_three as picture_three,
			pics.picture_four as picture_four
		FROM Users as u
		LEFT JOIN Verification as v on u._id = v.uid
		LEFT JOIN UserInfo as ui on u._id = ui.uid
		LEFT JOIN Pictures as pics on u._id = pics.uid
		where u._id = $1;
	END;
	$$ LANGUAGE plpgsql;

	CREATE OR REPLACE FUNCTION get_user(email_address varchar)
	RETURNS TABLE(
		_id integer,
		Username varchar,
		email varchar,
		password varchar,
		email_verified boolean,
		verify_key varchar,
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
			u.password as password,
			v.email_verified as email_verified,
			v.verification_key as verify_key,
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
		where u.email = $1;
	END;
	$$ LANGUAGE plpgsql;

    CREATE OR REPLACE PROCEDURE verify_user(verification_key VARCHAR, email VARCHAR)
    AS $$
    BEGIN
        UPDATE Verification
            SET email_verified = true
		FROM Verification as v
        INNER JOIN Users as u on v.uid = u._id
        WHERE
            u.email = $2 AND
            v.verification_key = $1;
    END;
    $$ LANGUAGE plpgsql;

	CREATE OR REPLACE PROCEDURE report_user (user_id integer, bad integer)
	AS $$
	DECLARE
		tot_reported int;
	BEGIN

		tot_reported = (
			SELECT 
				COUNT(*)
			FROM Reports as r
			WHERE
				r.reported = $2
		);

		IF (tot_reported > 5) THEN
			UPDATE UserInfo
				SET banned = true
			FROM UserInfo as ui
			INNER JOIN Users as u on u._id = ui.uid
			WHERE
				u._id = $2;
		END IF;
		INSERT INTO reports (uid, reported) VALUES ($1, $2);

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


    CREATE OR REPLACE PROCEDURE add_user(username varchar, email varchar, password varchar, firstname varchar, surname varchar, verification_key varchar, userType varchar, subscribe boolean)
    AS $$
    DECLARE
        uid int;
    BEGIN
        INSERT INTO Users (username, password, email) VALUES (username, password, email);
        
        uid = (SELECT _id FROM USERS as u 
            WHERE 
            u.email = $2 AND 
            u.password = $3 AND 
			u.username = $1
		);
        
        INSERT INTO UserInfo as ui (uid, firstname, surname, uType, email_subscription) VALUES (
            uid,
            $4,
			$5,
			$7,
			$8
		);
        
        INSERT INTO Verification as v (uid, verification_key, email_verified) VALUES (
            uid,
            $6,
            false
        );
		
		INSERT INTO Pictures as p (uid) VALUES(uid);

    END;
	$$ LANGUAGE plpgsql;
	
	CREATE OR REPLACE PROCEDURE add_tag_for_user(uid integer, username varchar, tag varchar)
	AS $$
	DECLARE
		fetched_user int;
		found_user_tag int;
		found_tag int;
		tag_id int;
	BEGIN
		fetched_user = (
			SELECT 
				_id
			FROM Users as u
			WHERE
			(
				u._id = $1 OR
				u.username = $2
			)
		);
		
		found_user_tag = (
			SELECT 
				COUNT(*) 
			FROM UserTags as ut
			INNER JOIN Tags as tags on tags._id = ut.tag_id
			WHERE 
				ut.uid = fetched_user AND
				tags.tag = $3
		);
		
		found_tag = (
			SELECT
				COUNT(*)
			FROM Tags as tags
			WHERE
				tags.tag = $3
		);
		
		IF (found_user_tag = 0) AND (fetched_user != 0) THEN
			IF (found_tag = 0) THEN
				INSERT  INTO Tags (tag) VALUES ($3);
			END IF;
			tag_id = (SELECT _id FROM Tags as tags WHERE tags.tag = $3);
			INSERT INTO UserTags (uid, tag_id) VALUES(fetched_user, tag_id);
		END IF;
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

	CREATE OR REPLACE FUNCTION get_tags_for_user (user_id integer)
	RETURNS TABLE (
		_id integer,
		tag varchar
	) AS $$
	BEGIN
		RETURN QUERY
		SELECT 
			tags._id, 
			tags.tag
		FROM tags as tags
		INNER JOIN UserTags as ut on ut.tag_id = tags._id 
		WHERE
			ut.uid = $1;

	END;
	$$ LANGUAGE plpgsql;

	CREATE OR REPLACE FUNCTION get_likes (user_id integer)
	RETURNS TABLE (
		_id integer
	) AS $$
	BEGIN
		RETURN QUERY
		SELECT 
			l._id
		FROM
			likes as l
		where 
			l.uid = $1;
	END;
	$$ LANGUAGE plpgsql;

	CREATE OR REPLACE FUNCTION get_views (user_id integer)
	RETURNS TABLE (
		_id integer
	) AS $$
	BEGIN
		RETURN QUERY
		SELECT 
			uv._id
		FROM
			userviews as uv
		where 
			uv.uid = $1;
	END;
	$$ LANGUAGE plpgsql;

	CREATE OR REPLACE FUNCTION get_blocks (user_id integer)
	RETURNS TABLE (
		_id integer
	) AS $$
	BEGIN
		RETURN QUERY
		SELECT 
			b._id
		FROM
			blocks as b
		where 
			b.uid = $1;
	END;
	$$ LANGUAGE plpgsql;

	CREATE OR REPLACE PROCEDURE delete_tag_for_user(uid integer, tag varchar, tag_id integer)
	AS $$
	DECLARE
		fetched_user int;
		found_user_tag int;
	BEGIN
		fetched_user = (
			SELECT 
				_id
			FROM Users as u
			WHERE
				u._id = $1
		);

		found_user_tag = (
			SELECT 
				tags._id 
			FROM UserTags as ut
			INNER JOIN Tags as tags on tags._id = ut.tag_id
			WHERE 
				ut.uid = fetched_user AND
				(tags.tag = $2 OR tags._id = $3)
		);

		DELETE FROM UserTags as ut WHERE ut.tag_id = found_user_tag AND ut.uid = fetched_user;
	END;
	$$ LANGUAGE plpgsql;

	CREATE OR REPLACE PROCEDURE delete_generated_users()
	AS $$
	DECLARE
		user_ids INT[];
		user_id INT;
	BEGIN

		user_ids =
		(SELECT ARRAY(	SELECT 
				u._id
			FROM Users as u
			INNER JOIN UserInfo as ui on ui.uid = u._id
			WHERE
				ui.uType = 'Generated'
		));
		
		FOREACH user_id IN ARRAY user_ids 
		LOOP
			DELETE FROM Users as u where u._id = user_id;
			DELETE FROM Pictures as p where p.uid = user_id;
			DELETE FROM blocks as b where b.uid = user_id;
			DELETE FROM likes as l where l.uid = user_id;
			DELETE FROM notifications as n where n.uid = user_id;
			DELETE FROM reports as r where r.uid = user_id;
			DELETE FROM userviews as v where v.uid = user_id;
			DELETE FROM verification as v where v.uid = user_id;
			DELETE FROM UserTags as ut where ut.uid = user_id;
			DELETE FROM UserInfo as ui where ui.uid = user_id;
		END LOOP;

	END;
	$$ LANGUAGE plpgsql;

	CREATE OR REPLACE PROCEDURE delete_user(uid integer)
	AS $$
	DECLARE
		user_ids INT[];
		user_id INT;
	BEGIN

		user_ids =
		(SELECT ARRAY(	SELECT 
				u._id
			FROM Users as u
			WHERE
				u._id = uid			
		));
		
		FOREACH user_id IN ARRAY user_ids 
		LOOP
			DELETE FROM Users as u where u._id = user_id;
			DELETE FROM Pictures as p where p.uid = user_id;
			DELETE FROM blocks as b where b.uid = user_id;
			DELETE FROM likes as l where l.uid = user_id;
			DELETE FROM notifications as n where n.uid = user_id;
			DELETE FROM reports as r where r.uid = user_id;
			DELETE FROM userviews as v where v.uid = user_id;
			DELETE FROM verification as v where v.uid = user_id;
			DELETE FROM UserTags as ut where ut.uid = user_id;
			DELETE FROM UserInfo as ui where ui.uid = user_id;
		END LOOP;

	END;
	$$ LANGUAGE plpgsql;


	`)
}

module.exports = {
	url,
	mongo,
	_mongo,
	pool,
	createTables,
	createProcs,
	createIndex
};
