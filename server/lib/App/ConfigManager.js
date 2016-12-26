const fs = require( 'fs' );
class ConfigManager {
	constructor()
	{
		this.path = process.cwd + '/config.json';
	}

	exist()
	{
		return fs.existsSync( this.path );
	}

	create()
	{
		let defaultConfig = {
			log_file : process.cwd + '/logs/log.txt',
			error_file : process.cwd + '/logs/error.txt',
			max_clients : 3
		};
		fs.writeFileSync( this.path, JSON.stringify( defaultConfig ) );
	}
}
module.exports = ConfigManager;
