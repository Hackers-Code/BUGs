const fs = require( 'fs' );
class Logger {
	constructor( logFile, errorFile )
	{
		this.logFile = logFile;
		this.errorFile = errorFile;
	}

	log( data )
	{
		fs.open( this.logFile, 'a+', ( err, fd ) =>
		{
			if( err )
			{
				return;
			}
			data = Buffer.from( '[' + new Date().getTime() + ']' + data );
			fs.write( fd, data, 0, data.length, 0, () =>
			{
			} );
		} );
	}

	error( data )
	{
		fs.open( this.errorFile, 'a+', ( err, fd ) =>
		{
			if( err )
			{
				return;
			}
			data = Buffer.from( '[' + new Date().getTime() + ']' + data );
			fs.write( fd, data, 0, data.length, 0, () =>
			{
			} );
		} );
	}
}
module.exports = Logger;
