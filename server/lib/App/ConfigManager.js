const fs = require( 'fs' );
const ConfigDirectory = process.cwd() + '/config.json';
const ConfigManager = {
	read( done, error )
	{
		fs.readFile( ConfigDirectory, ( err, data ) =>
		{
			if( err )
			{
				error( err );
			}
			done( data );
		} );
	},
	exist( done, error )
	{
		fs.access( ConfigDirectory, ( err ) =>
		{
			if( err )
			{
				error( err );
			}
			done();
		} );
	},

	create( callback )
	{
		let defaultConfig = {
			logs_dir : process.cwd() + '/logs/',
			log_file : 'log.txt',
			error_file : 'error.txt',
			tcp : {
				port : 31337,
				host : '0.0.0.0'
			},
			udp : {
				port : 31337,
				address : '0.0.0.0'
			},
			max_clients : 3
		};
		fs.writeFile( ConfigDirectory, JSON.stringify( defaultConfig ), callback );
	}
};
module.exports = ConfigManager;
