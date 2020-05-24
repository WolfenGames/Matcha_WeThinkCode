#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER ${APP_USER} WITH PASSWORD '${APP_USER_PASSWORD}';
    CREATE DATABASE ${APP_DATABASE};
    GRANT ALL PRIVILEGES ON DATABASE ${APP_DATABASE} TO ${APP_USER};
    CREATE TABLE IF NOT EXISTS ${APP_DATABASE}.USERS (
        id INT PRIMARY KEY AUTO_INCREMENT,
        Username varchar(50) NOT NULL,
        Password varchar(50) NOT NULL,
        Email varchar(50) NOT NULL UNIQUE,
        Firstname varchar(50) NOT NULL DEFAULT("Name"),
        Surname varchar(50) NOT NULL DEFAULT("Surnane"),
    );
    INSERT INTO ${APP_DATABASE}.USERS (Username, Password, Email, Firstname, Surname) values (
        'foo',
        'bar',
        'foo@bax',
        'baz',
        'bar'        
    );
EOSQL
