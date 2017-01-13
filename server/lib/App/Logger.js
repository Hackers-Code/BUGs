class Logger {
	constructor( logFile, errorFile )
	{
		this.logFile = logFile;
		this.errorFile = errorFile;
	}

	static formatData( data )
	{
		return Buffer.from( '[' + new Date( Date.now() ).toLocaleString() + '] ' + data + '\n' );
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
