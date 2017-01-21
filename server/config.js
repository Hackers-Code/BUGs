const fs = require( 'fs' );
module.exports = {
	maxClients : 4,
	logFile : fs.createWriteStream( process.cwd() + '/logs/log.txt' ),
	errorFile : fs.createWriteStream( process.cwd() + '/logs/error.txt' ),
	mapsList : fs.createReadStream( process.cwd() + '/resources/maps/list.json' ),
	tickrate : 16,
	TCP_port : 31337,
	UDP_port : 31337
};
