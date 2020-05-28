("use strict");

const Pool = require('pg').Pool
const pool = new Pool({
	user: 'matcha',
	password: 'secret',
	database: 'matcha',
	host: 'localhost',
	port: 5432
});

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
		locType varchar,
		date_of_birth TIMESTAMP
	);

	create table if not exists Notifications (
		_id SERIAL PRIMARY KEY,
		uid integer NOT NULL,
		notification varchar(500),
		viewed boolean
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

	CREATE TABLE IF NOT EXISTS location (
		_id SERIAL PRIMARY KEY,
		uid int,
		type varchar(10) NOT NULL,
		longitude float,
		latitude float
	);

	create table if not exists chatroom(
		_id serial primary key,
		room_name varchar(120),
		id1 integer,
		id2 integer
	);

	create table if not exists chats(
		_id serial primary key,
		room_name varchar(120),
		sender integer,
		date TIMESTAMP,
		mtext varchar(4096)
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
		last_login TIMESTAMP,
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
		locType varchar,
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
			u.last_login as last_login,
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
			ui.locType,
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

	CREATE OR REPLACE FUNCTION get_user_by_email(email_address varchar)
	RETURNS TABLE(
		_id integer,
		Username varchar,
		email varchar,
		password varchar,
		last_login TIMESTAMP,
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
			u.last_login as last_login,
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
		have_reported int;
	BEGIN

		tot_reported = (
			SELECT 
				COUNT(*)
			FROM Reports as r
			WHERE
				r.reported = $2
		);

		have_reported = (
			SELECT
				COUNT(*)
			FROM Reports as r
			WHERE
				r.reported = $2 AND
				r.uid = $1
		);

		IF (tot_reported > 5) THEN
			UPDATE UserInfo
				SET banned = true
			FROM UserInfo as ui
			INNER JOIN Users as u on u._id = ui.uid
			WHERE
				u._id = $2;
		END IF;
		
		IF (have_reported = 0) THEN
			INSERT INTO reports (uid, reported) VALUES ($1, $2);
		END IF;

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

	CREATE OR REPLACE PROCEDURE block_user(blocker integer, blockee integer)
	AS $$
	BEGIN
		IF (SELECT COUNT(*) FROM blocks as b WHERE (b.uid = $1 AND b.blocks = $2)) = 1 THEN
			DELETE FROM blocks as b where b.uid = $1 and b.blocks = $2;
		ELSE
			INSERT INTO blocks (uid, blocks) VALUES ($1, $2);
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
		_id int,
		username varchar,
		biography varchar,
		profile_picture varchar
	) AS $$
	BEGIN
		RETURN QUERY
		SELECT 
		u._id,
		u.username,
		ui.biography,
		p.profile_picture
	FROM LIKES as l
	INNER JOIN Users as u on u._id = l.uid
	INNER JOIN UserInfo as ui on ui.uid = u._id
	INNER JOIN Pictures as p on p.uid = u._id
	WHERE
		l.likes = $1 AND
		(SELECT COUNT(*) FROM likes as l2 where l2.uid = $1 AND l2.likes = l.uid) = 1;
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
		_id integer,
		uid integer,
		likes integer
	) AS $$
	BEGIN
		RETURN QUERY
		SELECT 
			l._id,
			l.uid,
			l.likes
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

	CREATE OR REPLACE FUNCTION get_viewed_by(user_id integer)
	RETURNS TABLE (
		_id integer,
		username varchar,
		biography varchar
	) AS $$
	BEGIN
		RETURN QUERY
		SELECT 
			u._id,
			u.username,
			ui.biography
		FROM
			userviews as uv
		INNER JOIN Users as u on u._id = uv.uid
		INNER JOIN UserInfo as ui on ui.uid = u._id
		where 
			uv.viewed = $1;
	END;
	$$ LANGUAGE plpgsql;

	CREATE OR REPLACE FUNCTION get_blocks (user_id integer)
	RETURNS TABLE (
		_id integer,
		uid integer,
		blocks integer
	) AS $$
	BEGIN
		RETURN QUERY
		SELECT 
			b._id,
			b.uid,
			b.blocks
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

	CREATE OR REPLACE PROCEDURE update_last_login(uid integer)
	AS $$
	BEGIN
		UPDATE USERS
			SET last_login = now()
		WHERE
			_id = $1;
	END;
	$$ LANGUAGE plpgsql;
	
	CREATE OR REPLACE PROCEDURE update_verification(email varchar, verify varchar)
	AS $$
	DECLARE
		fetched_user int;
	BEGIN
		fetched_user = (SELECT u._id FROM USERS as u WHERE u.email = $1);
		UPDATE Verification
			SET verification_key = $2
		WHERE
			uid = fetched_user;
	END;
	$$ LANGUAGE plpgsql;

	CREATE OR REPLACE PROCEDURE update_password(email varchar, password varchar, verify varchar)
	AS $$
	DECLARE
		fetched_user int;
		verification_key varchar;
	BEGIN
		fetched_user = (SELECT u._id FROM USERS as u WHERE u.email = $1);
		verification_key = (SELECT v.verification_key FROM verification as v WHERE v.uid = fetched_user);
		
		IF (verification_key = verify) THEN
		
			UPDATE Users
				SET password = $2
			WHERE
				email = $1;
				
		END IF;
	END;
	$$ LANGUAGE plpgsql;

	CREATE OR REPLACE FUNCTION get_my_likes (user_id integer)
	RETURNS TABLE (
		_id integer,
		username varchar,
		biography varchar,
		dob TIMESTAMP
	) AS $$
	BEGIN
		RETURN QUERY
		SELECT 
			u._id,
			u.username,
			ui.biography,
			ui.date_of_birth as dob
		FROM
			likes as l
		INNER JOIN Users as u on u._id = l.likes
		INNER JOIN UserInfo as ui on ui.uid = u._id
		where 
			l.uid = $1;
	END;
	$$ LANGUAGE plpgsql;

	CREATE OR REPLACE FUNCTION get_my_blocks (user_id integer)
	RETURNS TABLE (
		_id integer,
		username varchar,
		biography varchar,
		dob TIMESTAMP
	) AS $$
	BEGIN
		RETURN QUERY
		SELECT 
			u._id,
			u.username,
			ui.biography,
			ui.date_of_birth as dob
		FROM
			blocks as b
		INNER JOIN Users as u on u._id = b.blocks
		INNER JOIN UserInfo as ui on ui.uid = u._id
		where 
			b.uid = $1;
	END;
	$$ LANGUAGE plpgsql;

	CREATE OR REPLACE PROCEDURE view_user(uid integer, viewee integer)
	AS $$
	DECLARE
		viewed int;
	BEGIN

		viewed = (SELECT COUNT(*) FROM UserViews as uv WHERE uv.uid = $1 AND uv.viewed = $2);
		
		IF (viewed = 0) THEN
			INSERT INTO UserViews (uid, viewed) VALUES ($1, $2);
		END IF;

	END;
	$$ LANGUAGE plpgsql;

	CREATE OR REPLACE FUNCTION get_users_for_user(uid integer)
	RETURNS TABLE (
		_id integer,
		username character varying,
		email character varying,
		last_login timestamp without time zone,
		sex character varying,
		sexuality character varying,
		age integer,
		fame integer,
		utype character varying,
		biography character varying,
		profile_picture character varying,
		picture_one character varying,
		picture_two character varying,
		picture_three character varying,
		picture_four character varying,
		compatibility float,
		distance float
	) 
	AS $$
	BEGIN
		RETURN QUERY
		SELECT 
			u._id as _id,
			u.username as username,
			u.email as email,
			u.last_login as last_login,
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
			pics.picture_four as picture_four,
			compatibility(u._id, $1) as compatibility,
			distance_between(u._id, $1) as distance
		FROM Users as u
		LEFT JOIN Verification as v on u._id = v.uid
		LEFT JOIN UserInfo as ui on u._id = ui.uid
		LEFT JOIN Pictures as pics on u._id = pics.uid
		where 
			u._id != $1 AND
			match_me_pref($1, u._id) = true
		ORDER BY compatibility DESC;
	END;
	$$ LANGUAGE 'plpgsql' ;


	CREATE OR REPLACE FUNCTION get_users()
	RETURNS TABLE (
		_id integer,
		username character varying,
		email character varying,
		last_login timestamp without time zone,
		sex character varying,
		sexuality character varying,
		age integer,
		fame integer,
		utype character varying,
		biography character varying,
		profile_picture character varying,
		picture_one character varying,
		picture_two character varying,
		picture_three character varying,
		picture_four character varying
	) 
	AS $$
	BEGIN
		RETURN QUERY
		SELECT 
			u._id as _id,
			u.username as username,
			u.email as email,
			u.last_login as last_login,
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
		LEFT JOIN Pictures as pics on u._id = pics.uid;
	END;
	$$ LANGUAGE 'plpgsql' ;

	CREATE OR REPLACE FUNCTION match_me_pref(uid integer, against integer)
	RETURNS BOOLEAN
	AS $$
	DECLARE
		ret boolean;
		mysex text;
		theirsex text;
		
		mysexuality text;
		theirsexuality text;
	BEGIN

		mysex = (SELECT sex FROM UserInfo as ui where ui.uid = $1);
		mysexuality = (SELECT sexuality FROM UserInfo as ui where ui.uid = $1);

		theirsex = (SELECT sex FROM UserInfo as ui where ui.uid = $2);
		theirsexuality = (SELECT sexuality FROM UserInfo as ui where ui.uid = $2);
		
		-- mysexuality mysex -> sexuality sex ||
		-- 1 1 -> 1 1 || 1 2 || 2 2 || 3 1
		-- 1 2 -> 1 1 || 1 2 || 2 1 || 3 2
		
		-- _ 3 -> _ 3
		
		-- 2 1 -> 1 2 || 2 2
		-- 2 2 -> 1 1 || 2 1
		
		-- 3 1 -> 1 1 || 3 1
		-- 3 2 -> 1 2 || 3 2
		
		IF (mysex = '3') AND (theirsex = '3') THEN
			RETURN true;
		END IF;
		IF (mysexuality = '1') AND (mysex = '1') THEN
			IF (theirsexuality = '1') AND (theirsex = '1') THEN
				return true;
			END IF;
			IF (theirsexuality = '1') AND (theirsex = '2') THEN
				return true;
			END IF;
			IF (theirsexuality = '2') AND (theirsex = '2') THEN
				return true;
			END IF;
			IF (theirsexuality = '3') AND (theirsex = '1') THEN
				return true;
			END IF;
		END IF;
		IF (mysexuality = '1') AND (mysex = '2') THEN
			IF (theirsexuality = '1') AND (theirsex = '1') THEN
				return true;
			END IF;
			IF (theirsexuality = '1') AND (theirsex = '2') THEN
				return true;
			END IF;
			IF (theirsexuality = '2') AND (theirsex = '1') THEN
				return true;
			END IF;
			IF (theirsexuality = '3') AND (theirsex = '2') THEN
				return true;
			END IF;
		END IF;
		IF (mysexuality = '2') AND (mysex = '1') THEN
			IF (theirsexuality = '1') AND (theirsex = '2') THEN
				return true;
			END IF;
			IF (theirsexuality = '2') AND (theirsex = '2') THEN
				return true;
			END IF;
		END IF;
		IF (mysexuality = '2') AND (mysex = '2') THEN
			IF (theirsexuality = '1') AND (theirsex = '1') THEN
				return true;
			END IF;
			IF (theirsexuality = '2') AND (theirsex = '1') THEN
				return true;
			END IF;
		END IF;
		IF (mysexuality = '3') AND (mysex = '1') THEN
			IF (theirsexuality = '1') AND (theirsex = '1') THEN
				return true;
			END IF;
			IF (theirsexuality = '3') AND (theirsex = '1') THEN
				return true;
			END IF;
		END IF;
		IF (mysexuality = '3') AND (mysex = '2') THEN
			IF (theirsexuality = '1') AND (theirsex = '2') THEN
				return true;
			END IF;
			IF (theirsexuality = '3') AND (theirsex = '2') THEN
				return true;
			END IF;
		END IF;
		
		return false;
	END;
	$$ LANGUAGE 'plpgsql';

	CREATE OR REPLACE FUNCTION compatibility(uid integer, usearch integer)
	RETURNS FLOAT
	AS $$
	DECLARE
		compat int;
		tot float;
		fetch_my_tags text[];
		fetch_search_tags text[];
		my_tag text;
		search_tag text;
		len1 int;
		len2 int;
		max_val float;
	BEGIN
		compat := 0;
		fetch_my_tags := (SELECT ARRAY(SELECT tag.tag FROM UserTags as ut INNER JOIN Tags as tag on tag._id = ut.tag_id WHERE ut.uid = $1));
		fetch_search_tags := (SELECT ARRAY(SELECT tag.tag FROM UserTags as ut INNER JOIN Tags as tag on tag._id = ut.tag_id WHERE ut.uid = $2));
		
		len1 := (SELECT COUNT(tag.tag) FROM UserTags as ut INNER JOIN Tags as tag on tag._id = ut.tag_id WHERE ut.uid = $1);
		len2 := (SELECT COUNT(tag.tag) FROM UserTags as ut INNER JOIN Tags as tag on tag._id = ut.tag_id WHERE ut.uid = $2);
		
		IF (len1 > len2) THEN
			max_val = len2;
		ELSE
			max_val = len1;
		END IF;
		
		FOREACH my_tag IN ARRAY fetch_my_tags 
		LOOP
			FOREACH search_tag IN ARRAY fetch_search_tags 
			LOOP
				IF (my_tag = search_tag) THEN
					compat = compat + 1;
				END IF;
			END LOOP;
		END LOOP;
		IF (max_val = 0) THEN
			RETURN 0;
		ELSE
			tot = ((compat::float / max_val::float) * 100.0);
			RETURN tot;
		END IF;
	END;
	$$ LANGUAGE 'plpgsql';

	CREATE OR REPLACE FUNCTION distance_between(uid integer, usearch integer)
	RETURNS FLOAT
	AS $$
	DECLARE
		my_loc_long float;
		search_loc_long float;
		my_loc_lat float;
		search_loc_lat float;
		
		loctype varchar;
		
		distance float;
		
		R float;
		dLat float;
		dLong float;
		_a float;
		_c float;
	BEGIN
		
		loctype = (SELECT ui.loctype FROM UserInfo as ui where ui.uid = $1);
		
		R = 6371;
		my_loc_long = (SELECT l.longitude as longitude FROM Location as l WHERE l.uid = $1 AND l.type = loctype);
		search_loc_long = (SELECT l.longitude as longitude FROM Location as l WHERE l.uid = $2 AND l.type = loctype);
		
		my_loc_lat = (SELECT l.latitude as latitude FROM Location as l WHERE l.uid = $1 AND l.type = loctype);
		search_loc_lat = (SELECT l.latitude as latitude FROM Location as l WHERE l.uid = $2 AND l.type = loctype);
		
		dLat = (my_loc_lat - search_loc_lat) * PI()/180.0;
		dLong = (my_loc_long - search_loc_long) * PI()/180.0;
		
		_a = Sin(dLat/2) * Sin(dLat/2) + Cos(my_loc_lat * Pi()/180.0) * Cos(search_loc_lat * Pi()/180) * Sin(dLong/2) * Sin(dLong/2); 
		_c = 2 * atan2(sqrt(_a), sqrt(1 - _a));
		distance = R * _c;
		RETURN distance;
	END;
	$$ LANGUAGE 'plpgsql';
	
	CREATE OR REPLACE PROCEDURE update_location(_uid integer, _type varchar, longitude float, latitude float)
	AS $$
	DECLARE
		exist int;
	BEGIN
		exist = (SELECT COUNT(*) FROM Location as l where l.uid = $1 AND l.type = $2);
		IF (exist = 1) THEN
			UPDATE Location
			SET
				longitude = $3,
				latitude = $4
			WHERE
				uid = $1 AND
				type = $2;
		ELSE
			INSERT INTO Location (uid, type, longitude, latitude) VALUES ($1, $2, $3, $4);
		END IF;
	END;
	$$ LANGUAGE 'plpgsql';

	create or replace procedure add_notification(uid integer, notification varchar)
	AS $$
	BEGIN
		INSERT INTO Notifications (uid, notification, viewed) VALUES($1, $2, false);
	END;
	$$ LANGUAGE 'plpgsql';
	
	create or replace procedure viewed_notification(nid integer)
	AS $$
	BEGIN
		UPDATE Notifications
			SET viewed = true
		WHERE
			uid = $1;
	END;
	$$ LANGUAGE 'plpgsql';

	create or replace function get_notifications(uid integer)
	RETURNS
	TABLE(
		_id int,
		notification varchar,
		viewed boolean
	)
	AS $$
	BEGIN
		RETURN QUERY
		SELECT
			n._id,
			n.notification,
			n.viewed
		FROM Notifications as n
		WHERE 
			n.uid = $1
		ORDER BY _id DESC;
	END;
	$$ LANGUAGE 'plpgsql';

	create or replace function get_new_notifications(uid integer)
	RETURNS
	TABLE(
		_id int,
		notification varchar,
		viewed boolean
	)
	AS $$
	BEGIN
		RETURN QUERY
		SELECT
			n._id,
			n.notification,
			n.viewed
		FROM Notifications as n
		WHERE 
			n.uid = $1 AND
			n.viewed = false;
	END;
	$$ LANGUAGE 'plpgsql';

	create or replace function get_room(id1 integer, id2 integer)
	RETURNS TABLE
	(
		room_name varchar
	)
	AS $$
	DECLARE
		found_room int;
	BEGIN
		RETURN QUERY
			SELECT
				cr.room_name
			FROM chatroom as cr
			WHERE
			(cr.id1 = $1 AND cr.id2 = $2) OR
			(cr.id1 = $2 AND cr.id2 = $1);
	END;
	$$ LANGUAGE 'plpgsql';

	create or replace function get_room(_room_name varchar)
	RETURNS TABLE
	(
		room_name varchar,
		id1 integer,
		id2 integer
	)
	AS $$
	BEGIN
		RETURN QUERY
			SELECT
				cr.room_name,
				cr.id1,
				cr.id2
			FROM chatroom as cr
			WHERE
				cr.room_name = $1;
	END;
	$$ LANGUAGE 'plpgsql';
	
	create or replace function room_login(id1 integer, id2 integer)
	RETURNS varchar
	AS $$
	DECLARE
		return_room varchar;
		found_room int;
	BEGIN
		found_room = ( SELECT COUNT(*) FROM get_room($1, $2) );
		
		IF (found_room = 0) THEN
			INSERT INTO chatroom (room_name, id1, id2) VALUES (CONCAT('room-', CONCAT(id1, CONCAT('-', id2))) , id1, id2);
		END IF;
		return_room = (SELECT room_name FROM get_room($1, $2));
		RETURN return_room;
		
	END;
	$$ LANGUAGE 'plpgsql';

	create or replace function get_room_chats(room_name varchar)
	RETURNS TABLE
	(
		sender integer,
		mtext varchar,
		date TIMESTAMP
	)
	AS $$
	BEGIN
	
		RETURN QUERY
		SELECT
			c.sender,
			c.mtext,
			c.date
		FROM Chats as c
		WHERE
			c.room_name = $1;
	END;
	$$ LANGUAGE 'plpgsql';
	
	create or replace procedure add_chat(room_name varchar, sender integer, mtext varchar)
	AS $$
	BEGIN
		INSERT INTO Chats (room_name, sender, mtext, date) VALUES ($1, $2 , $3, NOW());
	END;
	$$ LANGUAGE 'plpgsql';

	create or replace procedure update_location_type(_uid int, loc_type varchar)
	AS $$
	BEGIN

		UPDATE UserInfo
			SET locType = $2
		WHERE
			uid = $1;

	END;
	$$ LANGUAGE 'plpgsql';

	create or replace procedure update_my_location(_uid int, long float, lat float)
	AS $$
	DECLARE
		locType varchar;
	BEGIN

		locType = (SELECT ui.locType FROM UserInfo as ui where ui.uid = $1);
		call update_location($1, loctype, $2, $3);
		
	END;
	$$ LANGUAGE 'plpgsql';

	`)
}

module.exports = {
	pool,
	createTables,
	createProcs,
	createIndex
};
