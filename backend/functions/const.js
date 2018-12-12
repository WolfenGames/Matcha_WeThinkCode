const express		= require('express');
const router		= express.Router();
const ListUsers		= require('./userList');
const manageUser	= require('./userManagement');
const FuncUser		= require('./userSave');
const bcrypt		= require('bcrypt');
const verify		= require('./verify');
const login			= require('./login');
const url			= require('url');
const mailer		= require('./sendmail');
const aux			= require('./auxiliary');
const geoip			= require('geoip-lite');
const tags			= require('./tags');
const IS			= require('./image_save');
const match			= require('./match');