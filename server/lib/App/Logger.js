const fs = require( 'fs' );
const path = require( 'path' );
class Logger {
	constructor( logFile, errorFile )
	{
		this.logFile = logFile;
		this.errorFile = errorFile;
		if( !fs.existsSync( path.dirname( this.logFile ) ) )
		{
			fs.mkdirSync( path.dirname( this.logFile ) );
		}
		if( !fs.existsSync( path.dirname( this.errorFile ) ) )
		{
			fs.mkdirSync();
		}
	}

	log( data, path )
	{
		if( typeof path === 'undefined' )
		{
			path = this.logFile;
		}
		data = Buffer.from( '[' + new Date( Date.now() ).toLocaleString() + '] ' + data + '\n' );
		fs.appendFileSync( path, data );
	}

	error( data )
	{
		this.log( data, this.errorFile );
	}
}
module.exports = Logger;
