const public_ip = require("public-ip");
const manageUser = require("../functions/userManagement");

function text_truncate(str, length) {
	if (length == null) {
		length = 150;
	}
	if (str.length > length) {
		return (str.substring(0, length));
	} else {
		return (str);
	}
}

function getIp(cb) {
	public_ip
		.v4({ https: true, timeout: 100 })
		.then(ip => {
			cb(ip);
		})
		.catch(err => {
			cb("0.0.0.0");
		});
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2, cb) {
	var R = 6371; // Radius of the earth in km
	var dLat = (lat2 - lat1) * (Math.PI / 180); // deg2rad below
	var dLon = (lon2 - lon1) * (Math.PI / 180);
	var a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1 * (Math.PI / 180)) *
			Math.cos(lat2 * (Math.PI / 180)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c; // Distance in km
	cb(d);
}

async function authHandler(req, res, next) {
	if (req.session.user)
	{
		const result = await manageUser.getUserInfo(req.session.user._id)
		console.log(result)
		result.blocks = await manageUser.getBlocks(req.session.user._id)
		result.viewed_by = await manageUser.getViewedBy(req.session.user._id)
		result.likes = await manageUser.getLikes(req.session.user._id)
		result.matches = await manageUser.getMatches(req.session.user._id)
		
		//TODO: Implement
		result.location = [0,0]

		req.session.user = result;
		next();
	}
	else
    	res.redirect('/404');
}

async function authHandlerPost(req, res, next) {
	if (req.session.user)
		next();
	else 
		res.end('{"msg":"Need to be logged in to do this"}');
}

module.exports = {
	text_truncate: text_truncate,
	getIp: getIp,
	getDistanceFromLatLonInKm: getDistanceFromLatLonInKm,
	authHandler,
	authHandlerPost
};
