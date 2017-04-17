'use strict';
const fs = require( 'fs' );
const mkdirp = require( 'mkdirp' );
class Logger {
	constructor( projectDirectory, callback )
	{
		this.logsDirectory = projectDirectory + '/logs';
		mkdirp( this.logsDirectory, ( mkdirpError ) =>
		{
			if( !fs.existsSync( projectDirectory ) )
			{
				callback( mkdirpError );
			}
			else
			{
				this.logFile = fs.createWriteStream( this.logsDirectory + '/log.txt' );
				this.errorFile = fs.createWriteStream( this.logsDirectory + '/error.txt' );
				callback();
			}
		} );
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
