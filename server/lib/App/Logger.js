'use strict';
const fs = require( 'fs' );
class Logger {
	constructor()
	{
		this.logFile = fs.createWriteStream( process.cwd() + '/logs/log.txt' );
		this.errorFile = fs.createWriteStream( process.cwd() + '/logs/error.txt' );
	}

	static formatData( data )
	{
		return `[${new Date().toLocaleString()}] ${data}\n`;
	}

	log( data )
	{
		this.logFile.write( Logger.formatData( data ) );
	}

	error( data )
	{
		this.errorFile.write( Logger.formatData( data ) );
	}
}
module.exports = Logger;
