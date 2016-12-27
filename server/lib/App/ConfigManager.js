const fs = require( 'fs' );
class ConfigManager {
	constructor()
	{
		this.path = process.cwd() + '/config.json';
	}

	exist()
	{
		return fs.existsSync( this.path );
	}

	create( callback )
	{
		let defaultConfig = {
			log_file : process.cwd() + '/logs/log.txt',
			error_file : process.cwd() + '/logs/error.txt',
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
		fs.writeFile( this.path, JSON.stringify( defaultConfig ), callback );
	}
}
module.exports = ConfigManager;
