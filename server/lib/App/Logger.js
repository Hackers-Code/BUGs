const fs = require( 'fs' );
class Logger {
	constructor( config, callback )
	{
		this.logFile = config.log_file;
		this.errorFile = config.error_file;
		this.logsDir = config.logs_dir;
		fs.access( this.logsDir, ( error ) =>
		{
			if( error )
			{
				fs.mkdir( this.logsDir, ( err ) =>
				{
					if( err )
					{
						console.log( 'Logs directory is not accessible and could not create it' );
						return;
					}
					callback();
				} );
			}
			else
			{
				callback();
			}
		} );
	}

	log( data, path )
	{
		if( typeof path === 'undefined' )
		{
			path = this.logFile;
		}
		data = Buffer.from( '[' + new Date( Date.now() ).toLocaleString() + '] ' + data + '\n' );
		fs.appendFile( this.logsDir + path, data, ( err ) =>
		{
			if( err )
			{
				console.log( 'Error occurred while saving data to log file' );
				console.log( `Error: ${err.message}` );
			}
		} );
	}

	error( data )
	{
		this.log( data, this.errorFile );
	}
}
module.exports = Logger;
