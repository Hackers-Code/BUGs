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

	checkLogSize( path )
	{
		let stats = fs.statSync( path );
		let fileSizeInBytes = stats.size;
		if( fileSizeInBytes >= 1024 * 64 )
		{
			this.logFile.end();
			this.errorFile.end();
			console.error( 'Log file has exceeded the maximum limit: %s bytes', 1024 * 64 );
			process.exit( 1 );
		}
	}

	log( data )
	{
		this.checkLogSize( this.logsDirectory + '/log.txt' );
		this.logFile.write( Logger.formatData( data ) );
	}

	error( data )
	{
		this.checkLogSize( this.logsDirectory + '/error.txt' );
		this.errorFile.write( Logger.formatData( data ) );
	}
}
module.exports = Logger;
