const public_ip = require("public-ip");

function text_truncate(str, length, cb) {
    if (length == null) {
    length = 150;
    }
    if (str.length > length) {
        cb(str.substring(0, length));
    } else {
        cb(str);
    }
};

function getIp(cb){
    public_ip.v4({https: true, timeout: 10000}).then(ip => {
        cb(ip);
    }).catch(err => {
        console.log("Cant get IP => " + err);
        cb(null);
    });
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2, cb) {
	var R = 6371; // Radius of the earth in km
	var dLat = (lat2-lat1) * (Math.PI/180);  // deg2rad below
	var dLon = (lon2-lon1) * (Math.PI/180); 
	var a = 
	  Math.sin(dLat/2) * Math.sin(dLat/2) +
	  Math.cos((lat1) * (Math.PI/180)) * Math.cos((lat2) * (Math.PI/180)) * 
	  Math.sin(dLon/2) * Math.sin(dLon/2)
	  ; 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c; // Distance in km
	cb(d);
  }
  
module.exports = {
    text_truncate: text_truncate,
	getIp: getIp,
	getDistanceFromLatLonInKm: getDistanceFromLatLonInKm
}