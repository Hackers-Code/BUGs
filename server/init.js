'use strict';
const readline = require( 'readline' );
const rl = readline.createInterface( {
	input : process.stdin,
	output : process.stdout
} );
(function()
{
	const ConfigManager = require( './lib/App/ConfigManager' );
	let config = new ConfigManager();
	if( config.exist() )
	{
		rl.question( 'Config file already exist. Create anyway? Old data will be deleted. Y/N', ( answer ) =>
		{
			if( answer === 'N' )
			{
				console.log( 'Config creating aborted by user.' );
			}
			else if( answer === 'Y' )
			{
				config.create();
			}
		} );
	}
	else
	{
		config.create();
	}
})();
